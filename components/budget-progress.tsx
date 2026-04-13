"use client";

import { useState } from "react";
import { useCurrency } from "@/app/context/currency-context";
import { deleteBudget, updateBudget } from "@/services/budget.service";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Transaction } from "@/types";

interface BudgetProgressProps {
  userId: string;
  transactions: Transaction[];
  txLoading: boolean;
  budgets: {
    id?: string;
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  }[];
}

export function BudgetProgress({
  budgets,
  userId,
  transactions,
  txLoading,
}: BudgetProgressProps) {
  const { symbol, rate } = useCurrency();
  const { toast } = useToast();

  const [editTarget, setEditTarget] = useState<{
    id: string;
    category: string;
    allocated: number;
  } | null>(null);

  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);

    return (
      txDate >= startOfMonth && txDate <= endOfMonth && t.type === "expense"
    );
  });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    category: string;
  } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ✅ DELETE
  const handleDelete = async (id: string, category: string) => {
    if (!userId) return;

    if (budgets.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "At least one category is required",
        variant: "destructive",
      });
      return;
    }

    if (txLoading) {
      toast({
        title: "Please wait",
        description: "Transactions are still loading",
      });
      return;
    }

    const hasTransactions = transactions.some(
      (t) => t.categoryId === id && t.type === "expense",
    );

    if (hasTransactions) {
      toast({
        title: "Cannot delete",
        description: "This category has transactions",
        variant: "destructive",
      });
      return;
    }

    setLoadingDelete(true);

    try {
      await deleteBudget(userId, id);

      toast({
        title: "Budget Deleted ",
        description: `${category} removed successfully.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Error ",
        description: "Failed to delete budget.",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(false);
      setDeleteTarget(null);
    }
  };

  // ✅ UPDATE
  const handleUpdate = async () => {
    if (!userId || !editTarget) return;

    if (!editName || editAmount <= 0) {
      toast({
        title: "Invalid input",
        description: "Enter valid name and amount",
        variant: "destructive",
      });
      return;
    }

    setLoadingEdit(true);

    try {
      await updateBudget(userId, editTarget.id, {
        category: editName,
        allocated: editAmount,
      });

      toast({
        title: "Updated ",
        description: "Budget updated successfully",
        variant: "success",
      });

      setEditTarget(null);
    } catch {
      toast({
        title: "Error ",
        description: "Update failed",
        variant: "destructive",
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const formatAmount = (amount: number) => {
    const value = amount * rate;

    return symbol === "₹"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(value)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
  };

  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const spent = monthlyTransactions
          .filter((t) => t.categoryId === b.id)
          .reduce((sum, t) => sum + t.amount, 0);

        const remaining = b.allocated - spent;

        const percentUsed = b.allocated > 0 ? (spent / b.allocated) * 100 : 0;

        return (
          <div key={b.id} className="p-4 border rounded-lg budgetGoal-hover">
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="font-medium">{b.category}</span>

              <div className="flex items-center gap-3">
                <span className="text-sm hidden sm:inline">
                  {formatAmount(spent)} / {formatAmount(b.allocated)}
                </span>

                {/* EDIT */}
                <button
                  className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950"
                  onClick={() => {
                    setEditTarget({
                      id: b.id!,
                      category: b.category,
                      allocated: b.allocated,
                    });
                    setEditName(b.category);
                    setEditAmount(b.allocated);
                  }}
                >
                  <PencilIcon className="h-4 w-4 text-blue-500" />
                </button>

                {/* DELETE */}
                <Dialog
                  open={!!deleteTarget && deleteTarget.id === b.id}
                  onOpenChange={(open) => !open && setDeleteTarget(null)}
                >
                  <DialogTrigger asChild>
                    <button
                      className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-950"
                      onClick={() =>
                        setDeleteTarget({ id: b.id!, category: b.category })
                      }
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Budget</DialogTitle>
                    </DialogHeader>

                    <p>Delete "{b.category}" budget?</p>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="destructive"
                        disabled={txLoading || loadingDelete}
                        onClick={() => handleDelete(b.id!, b.category)}
                      >
                        {loadingDelete ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 h-2 rounded mt-2 dark:bg-secondary">
              <div
                className="h-2 rounded bg-emerald-600"
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-600 flex justify-between mt-1 dark:text-gray-400">
              <span>{percentUsed.toFixed(0)}% used</span>
              <span>{formatAmount(remaining)} left</span>
            </div>
          </div>
        );
      })}

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div>
              <Label>Allocated Amount</Label>
              <Input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>

            <Button onClick={handleUpdate} disabled={loadingEdit}>
              {loadingEdit ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
