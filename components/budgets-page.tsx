"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { addBudget, getBudgets } from "@/services/budget.service";
import { getUserSettings, UserSettings } from "@/services/settings.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { BudgetProgress } from "@/components/budget-progress";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DotLoader } from "./DotLoader";
import { useRouter } from "next/navigation";

const DEFAULT_BUDGETS = [
  { category: "Other", amount: 2000 },
  { category: "Food", amount: 5000 },
  { category: "Transport", amount: 2000 },
  { category: "Shopping", amount: 3000 },
  { category: "Bills", amount: 4000 },
  { category: "Health", amount: 2000 },
  { category: "Entertainment", amount: 2500 },
];

const seedDefaultBudgets = async (userId: string) => {
  try {
    // 🔥 STEP 1: fetch existing budgets
    const existing = await getBudgets(userId); // 👈 ADD THIS

    // 🚨 STEP 2: stop if already exists
    if (existing.length > 0) return;

    // ✅ STEP 3: seed only if empty
    await Promise.all(
      DEFAULT_BUDGETS.map((b) =>
        addBudget(userId, {
          userId,
          category: b.category,
          allocated: b.amount,
          createdAt: new Date(),
        }),
      ),
    );
  } catch (err) {
    console.error("Seeding failed:", err);
  }
};

export function BudgetsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const router = useRouter();

  const { budgets, loading: budgetsLoading } = useBudgets(user?.uid);

  const [seeding, setSeeding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!user || budgetsLoading || seeding || hasChecked) return;

    setHasChecked(true);

    if (budgets.length === 0) {
      setSeeding(true);

      const run = async () => {
        try {
          await seedDefaultBudgets(user.uid);
        } finally {
          setSeeding(false);
        }
      };

      run();
    }
  }, [user, budgets, budgetsLoading, seeding, hasChecked]);

  const { transactions, loading: txLoading } = useTransactions(user?.uid);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [alertedCategories, setAlertedCategories] = useState<string[]>([]);

  // ===============================
  // 🔥 LOAD SETTINGS
  // ===============================
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const data = await getUserSettings(user.uid);
      setSettings(data);
    };

    load();
  }, [user]);

  // ===============================
  // 🔥 COMPUTE BUDGETS
  // ===============================
  const computedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.categoryName === b.category && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = b.allocated - spent;
      const percentUsed = b.allocated > 0 ? (spent / b.allocated) * 100 : 0;

      return {
        ...b,
        spent,
        remaining,
        percentUsed,
      };
    });
  }, [budgets, transactions]);

  // ===============================
  // 🔥 ALERT SYSTEM
  // ===============================
  const ALERT_COOLDOWN_HOURS = 12;

  useEffect(() => {
    if (!settings?.budgetAlerts) return;

    const now = Date.now();

    computedBudgets.forEach((b) => {
      const warningKey = `budgetAlert_warn_${b.category}`;
      const exceededKey = `budgetAlert_exceeded_${b.category}`;

      const lastWarn = Number(localStorage.getItem(warningKey)) || 0;
      const lastExceeded = Number(localStorage.getItem(exceededKey)) || 0;

      const warnHours = (now - lastWarn) / (1000 * 60 * 60);
      const exceededHours = (now - lastExceeded) / (1000 * 60 * 60);

      // 🚨 Exceeded (priority)
      if (b.percentUsed >= 100 && exceededHours >= ALERT_COOLDOWN_HOURS) {
        toast({
          title: "Budget Exceeded ",
          description: `${b.category} budget exceeded`,
          variant: "destructive",
        });

        localStorage.setItem(exceededKey, now.toString());
        return; // stop further checks
      }

      // ⚠️ Warning
      if (
        b.percentUsed >= 80 &&
        b.percentUsed < 100 &&
        warnHours >= ALERT_COOLDOWN_HOURS
      ) {
        toast({
          title: "Budget Warning ",
          description: `${b.category} is at ${b.percentUsed.toFixed(0)}%`,
          variant: "warning",
        });

        localStorage.setItem(warningKey, now.toString());
      }
    });
  }, [computedBudgets, settings]);

  // Reset alerts when budgets change
  useEffect(() => {
    setAlertedCategories([]);
  }, [budgets.length, transactions]);

  // ===============================
  // ➕ ADD BUDGET
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ Validation
    if (!user || !category || !amount) {
      toast({
        title: "Missing fields",
        description: "Please enter category and amount",
        variant: "destructive",
      });
      return;
    }

    // ❌ Duplicate check
    const exists = budgets.some(
      (b) => b.category.toLowerCase() === category.toLowerCase(),
    );

    if (exists) {
      toast({
        title: "Budget exists",
        description: "This category already has a budget",
        variant: "destructive",
      });
      return;
    }

    try {
      await addBudget(user.uid, {
        userId: user.uid,
        category,
        allocated: Number(amount),
        createdAt: new Date(),
      });

      // ✅ Success
      toast({
        title: "Budget created",
        description: `${category} budget added successfully`,
        variant: "success",
      });

      setCategory("");
      setAmount("");
      setOpen(false);
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive",
      });
    }
  };

  // ===============================
  // UI STATES
  // ===============================

  // ✅ Better loading UI

  const [minLoaderDone, setMinLoaderDone] = useState(false);

  // Minimum loader timer (1s)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderDone(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || budgetsLoading || txLoading || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Set and track your monthly spending limits
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="w-fit  sm:w-auto text-sm sm:text-base px-2 sm:px-4"
        >
          <PlusIcon className="  h-4 w-4" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Budget</span>
        </Button>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budgets</CardTitle>
          <CardDescription className="hidden sm:block">
            Track your spending against category budgets
          </CardDescription>
        </CardHeader>

        <CardContent>
          <BudgetProgress
            budgets={computedBudgets}
            userId={user.uid}
            transactions={transactions}
            txLoading={txLoading}
          />
        </CardContent>
      </Card>

      {budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <h2 className="text-lg font-semibold">No budgets yet</h2>
          <p className="text-muted-foreground text-sm">
            Create your first budget to start tracking your spending
          </p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Food, Rent, Travel..."
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
