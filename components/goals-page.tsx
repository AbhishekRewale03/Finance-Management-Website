"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { addGoal } from "@/services/goal.service";
import { getUserSettings, UserSettings } from "@/services/settings.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SavingsGoals } from "@/components/savings-goals";
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

export function GoalsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { goals, loading: goalsLoading } = useGoals(user?.uid);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const router = useRouter();

  // ===============================
  // 🔥 LOAD USER SETTINGS
  // ===============================
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const data = await getUserSettings(user.uid);
      setSettings(data);
    };

    loadSettings();
  }, [user]);

  // ===============================
  // 🔥 GOAL REMINDERS / ALERTS
  // ===============================

  const GOAL_REMINDER_COOLDOWN_HOURS = 12;

  useEffect(() => {
    if (!settings?.paymentReminders) return;

    const today = new Date();
    const now = Date.now();

    goals.forEach((g) => {
      const target = new Date(g.targetDate);
      const daysLeft = Math.ceil(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft <= 0 || g.currentAmount >= g.targetAmount) return; // skip completed

      // Decide reminder frequency
      let shouldRemind = false;
      if (daysLeft > 365 && today.getDate() % 90 === 0) shouldRemind = true;
      else if (daysLeft > 180 && daysLeft <= 365 && today.getDate() % 60 === 0)
        shouldRemind = true;
      else if (daysLeft > 90 && daysLeft <= 180 && today.getDate() % 30 === 0)
        shouldRemind = true;
      else if (daysLeft > 30 && daysLeft <= 90 && today.getDate() % 10 === 0)
        shouldRemind = true;
      else if (daysLeft > 7 && daysLeft <= 30 && today.getDate() % 5 === 0)
        shouldRemind = true;
      else if (daysLeft <= 7) shouldRemind = true;

      if (!shouldRemind) return;

      // Check cooldown
      const lastReminderRaw = localStorage.getItem(`goalReminder_${g.id}`);
      const lastReminderTime = lastReminderRaw ? parseInt(lastReminderRaw) : 0;
      const hoursSinceLastReminder =
        (now - lastReminderTime) / (1000 * 60 * 60);

      const hoursLeft = GOAL_REMINDER_COOLDOWN_HOURS - hoursSinceLastReminder;

      if (hoursSinceLastReminder >= GOAL_REMINDER_COOLDOWN_HOURS) {
        toast({
          title: "Goal Reminder ",
          description: `"${g.name}" is due in ${daysLeft} day(s)! Save ₹${g.targetAmount - g.currentAmount}`,
          variant: "warning",
        });

        // Update last reminder time
        localStorage.setItem(`goalReminder_${g.id}`, now.toString());
      }
    });
  }, [goals, settings]);

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

  if (authLoading || goalsLoading || !user || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ Validation
    if (!name || !targetAmount || !targetDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (Number(targetAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Target amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      await addGoal(user.uid, {
        name,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        targetDate: new Date(targetDate),
        createdAt: new Date(),
      });

      // ✅ Success toast
      toast({
        title: "Goal Added ",
        description: `"${name}" has been added successfully.`,
        variant: "success",
      });

      // Reset form
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error ",
        description: "Failed to add goal. Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Set and track your financial goals
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="w-fit  sm:w-auto text-sm sm:text-base px-2 sm:px-4"
        >
          <PlusIcon className="  h-4 w-4" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Goal</span>
        </Button>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Your Goals</CardTitle>
          <CardDescription className="hidden sm:block">
            Track progress towards your financial goals
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <SavingsGoals goals={goals} userId={user.uid} />
        </CardContent>
      </Card>

      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] text-center px-4">
          <h2 className="text-base sm:text-lg font-semibold">No goals yet</h2>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Start by creating your first savings goal
          </p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add Goal</DialogTitle>

            {/* ✅ Fix accessibility warning */}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="min-w-0">
              <Label className="text-sm sm:text-base">Goal Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Buy iPhone"
                required
                className="w-full text-sm sm:text-base"
              />
            </div>

            <div className="min-w-0">
              <Label className="text-sm sm:text-base">Target Amount</Label>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full text-sm sm:text-base"
              />
            </div>

            <div className="min-w-0">
              <Label className="text-sm sm:text-base">Current Amount</Label>
              <Input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="Optional"
                className="w-full text-sm sm:text-base"
              />
            </div>

            <div className="min-w-0">
              <Label className="text-sm sm:text-base">Target Date</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full text-sm sm:text-base"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {saving ? "Saving..." : "Save Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
