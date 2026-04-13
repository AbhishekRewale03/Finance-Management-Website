"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Goal,
  addFundsToGoal,
  deleteGoal,
  updateGoal,
} from "@/services/goal.service";
import { addTransaction } from "@/services/transaction.service";
import { useCurrency } from "@/app/context/currency-context";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon, Trash2, PlusIcon } from "lucide-react";

export function SavingsGoals({
  goals,
  userId,
}: {
  goals: Goal[];
  userId: string;
}) {
  const { symbol, rate } = useCurrency();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editDate, setEditDate] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // ===============================
  // ➕ ADD FUNDS
  // ===============================
  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !amount) return;

    const value = Number(amount);

    try {
      setLoading(true);

      await addFundsToGoal(userId, selectedGoal.id!, value);

      await addTransaction(userId, {
        type: "expense",
        amount: value,
        description: `Added to goal: ${selectedGoal.name}`,
        categoryId: "goals",
        categoryName: "Goals",
        date: new Date(),
        createdAt: new Date(),
      });

      toast({
        title: "Funds Added ",
        description: `${formatAmount(value)} added to "${selectedGoal.name}"`,
        variant: "success",
      });

      setOpen(false);
      setAmount("");
      setSelectedGoal(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error ",
        description: "Failed to add funds. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🗑️ DELETE GOAL
  // ===============================
  const handleDelete = async (goal: Goal) => {
    if (!goal?.id) return;

    try {
      setLoadingDelete(true);

      await deleteGoal(userId, goal.id);

      toast({
        title: "Goal Deleted ",
        description: `"${goal.name}" has been removed successfully.`,
        variant: "destructive",
      });

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error ",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  // ===============================
  // ✏️ EDIT GOAL
  // ===============================
  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal) return;

    try {
      setLoadingEdit(true);

      await updateGoal(userId, editGoal.id!, {
        name: editName,
        targetAmount: Number(editTarget),
        targetDate: new Date(editDate),
      });

      toast({
        title: "Goal Updated ",
        description: `"${editName}" updated successfully`,
        variant: "success",
      });

      setEditOpen(false);
      setEditGoal(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error ",
        description: "Failed to update goal",
        variant: "destructive",
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  // ===============================
  // 💰 FORMAT
  // ===============================
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
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {goals.map((goal) => {
        const percent =
          goal.targetAmount > 0
            ? (goal.currentAmount / goal.targetAmount) * 100
            : 0;

        return (
          <div
            key={goal.id}
            className="p-4 border rounded-lg budgetGoal-hover space-y-3"
          >
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-1 sm:gap-3">
              {/* LEFT */}
              <div>
                <h4 className="font-medium text-sm sm:text-base">
                  {goal.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Target:{" "}
                  {new Date(goal.targetDate).toLocaleDateString("en-GB")}
                </p>
              </div>

              {/* RIGHT BUTTONS */}
              <div className="flex items-center sm:gap-3 ">
                {/* Add Funds */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 px-2 md:px-3"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setOpen(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">Add Funds</span>
                </Button>
                {/* Edit */}
                <Button
                  className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditGoal(goal);
                    setEditName(goal.name);
                    setEditTarget(String(goal.targetAmount));
                    setEditDate(
                      new Date(goal.targetDate).toLocaleDateString("en-CA"),
                    );
                    setEditOpen(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4 text-blue-500" />
                </Button>

                {/* Delete */}
                <Dialog
                  open={!!deleteTarget && deleteTarget.id === goal.id}
                  onOpenChange={(open) => !open && setDeleteTarget(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-950"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(goal)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Goal</DialogTitle>
                    </DialogHeader>
                    <p>
                      Are you sure you want to delete the goal "{goal.name}"?
                    </p>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(goal)}
                      >
                        {loadingDelete ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ✅ Progress (UNCHANGED as you said) */}
            <Progress value={percent} />

            {/* Values */}
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium">
                {formatAmount(goal.currentAmount)}
              </span>
              <span className="text-muted-foreground">
                {formatAmount(goal.targetAmount)} goal
              </span>
            </div>
          </div>
        );
      })}

      {/* ➕ Add Funds Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddFunds} className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✏️ Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditGoal} className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Target Amount</Label>
              <Input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loadingEdit}>
                {loadingEdit ? "Updating..." : "Update Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
