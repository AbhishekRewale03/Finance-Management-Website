"use client";

import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { seedTransactions } from "@/scripts/seedData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { OverviewChart } from "@/components/overview-chart";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { TransactionsList } from "@/components/transactions-list";
import { BudgetProgress } from "@/components/budget-progress";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { useCurrency } from "@/app/context/currency-context";
import { useToast } from "@/hooks/use-toast";
import { UserSettings } from "@/services/settings.service";
import { DotLoader } from "./DotLoader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";

export function DashboardPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const { symbol, rate } = useCurrency();

  const { toast } = useToast();
  const [alertedCategories, setAlertedCategories] = useState<string[]>([]);

  const { user, loading: authLoading } = useAuth();

  const router = useRouter();

  const formatAmount = (amount: number) => {
    const value = amount * rate;

    if (symbol === "₹") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // or dynamic
    }).format(value);
  };

  const [settings, setSettings] = useState<UserSettings>({
    theme: "dark", // default theme
    animations: true, // default animations on
    currency: "inr", // default currency
    numberFormat: "indian",
    budgetAlerts: true,
    paymentReminders: true,
  });

  // 🔥 Real-time data
  const { budgets, loading: budgetsLoading } = useBudgets(user?.uid);
  const { transactions, loading: txLoading } = useTransactions(user?.uid);

  const [addingMockData, setAddingMockData] = useState(false);

  const handleAddMockData = async () => {
    if (!user) return;

    try {
      setAddingMockData(true);

      await seedTransactions(user.uid);

      toast({
        title: "Mock data added",
        description: "Your dashboard now shows demo transactions",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Failed to add mock data",
        variant: "destructive",
      });
    } finally {
      setAddingMockData(false);
    }
  };

  // 🔥 Calculations
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // 🔥 Budget stats
  const computedBudgets = budgets.map((b) => {
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

  const goals = useGoals(user?.uid);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const calcStats = (tx: any[]) => {
    const income = tx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = tx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return { income, expenses, balance, savingsRate };
  };

  const currentStats = calcStats(currentMonthTx);
  const lastStats = calcStats(lastMonthTx);

  const getChangeText = (current: number, last: number, isPercent = false) => {
    const diff = current - last;

    if (last === 0) return "No previous data";

    const percent = (diff / last) * 100;
    const sign = diff >= 0 ? "+" : "-";

    if (isPercent) {
      return `${sign}${Math.abs(percent).toFixed(1)}% from last month`;
    }

    return `${sign}${formatAmount(Math.abs(diff)).replace(symbol, "")} from last month`;
  };

  useEffect(() => {
    // ✅ Check user settings first
    if (!settings?.budgetAlerts) return;

    computedBudgets.forEach((b) => {
      // 🚨 Exceeded
      if (b.percentUsed >= 100 && !alertedCategories.includes(b.category)) {
        toast({
          title: "Budget Exceeded ",
          description: `${b.category} budget exceeded`,
          variant: "destructive",
        });

        setAlertedCategories((prev) => [...prev, b.category]);
      }

      // ⚠️ Warning
      else if (
        b.percentUsed >= 80 &&
        b.percentUsed < 100 &&
        !alertedCategories.includes(b.category + "_warn")
      ) {
        toast({
          title: "Budget Warning ",
          description: `${b.category} is at ${b.percentUsed.toFixed(0)}%`,
          variant: "warning", // ✅ your new variant
        });

        setAlertedCategories((prev) => [...prev, b.category + "_warn"]);
      }
    });
  }, [computedBudgets, settings, alertedCategories]);

  useEffect(() => {
    setAlertedCategories([]);
  }, [budgets.length]);

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

  if (txLoading || budgetsLoading || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  return (
    <div className="flex flex-col px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Finance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your finances and track your spending
          </p>
        </div>

        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>

        {/* <Button
  onClick={handleAddMockData}
  disabled={addingMockData}
  className="w-full sm:w-auto"
>
  {addingMockData ? "Adding..." : "Add Demo Data"}
</Button> */}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between !pb-2 !pl-6 !pr-6 !pt-6">
            <CardTitle className="!text-sm font-medium">
              Total Balance
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="!pl-6 !pr-6 !pb-6 ">
            <div className="text-2xl font-bold">
              {formatAmount(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getChangeText(currentStats.balance, lastStats.balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between !pb-2 !pl-6 !pr-6 !pt-6">
            <CardTitle className="!text-sm font-medium">Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="!pl-6 !pr-6 !pb-6 ">
            <div className="text-2xl font-bold">{formatAmount(income)}</div>
            <p className="text-xs text-muted-foreground">
              {getChangeText(currentStats.income, lastStats.income)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between !pb-2 !pl-6 !pr-6 !pt-6">
            <CardTitle className="!text-sm font-medium">Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="!pl-6 !pr-6 !pb-6 ">
            <div className="text-2xl font-bold">{formatAmount(expenses)}</div>
            <p className="text-xs text-muted-foreground">
              {getChangeText(currentStats.expenses, lastStats.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between !pb-2 !pl-6 !pr-6 !pt-6">
            <CardTitle className="!text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="!pl-6 !pr-6 !pb-6 ">
            <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {getChangeText(
                currentStats.savingsRate,
                lastStats.savingsRate,
                true,
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heading */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
          Overview
        </h2>

        {/* First Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>
                Your income and expenses for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OverviewChart transactions={transactions} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                Where your money is going this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesByCategoryChart
                transactions={getCurrentMonthTransactions(transactions)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsList
                transactions={transactions.slice(0, 5)}
                userId={user.uid}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetProgress
                budgets={computedBudgets
                  .filter((b) => b.allocated > 0)
                  .sort((a, b) => b.allocated - a.allocated)
                  .slice(0, 5)}
                userId={user.uid}
                transactions={transactions}
                txLoading={txLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        userId={user.uid}
      />
    </div>
  );
}

export const getCurrentMonthTransactions = (transactions: Transaction[]) => {
  const now = new Date();

  return transactions.filter((t: Transaction) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
};
