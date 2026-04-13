"use client";

import type React from "react";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  addTransaction,
  updateTransaction,
  Transaction,
} from "@/services/transaction.service";

import { useBudgets } from "@/hooks/useBudgets";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/app/context/currency-context";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  editData?: Transaction | null;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  userId,
  editData,
}: AddTransactionDialogProps) {
  const isEdit = !!editData;

  const { toast } = useToast();
  const { symbol, rate } = useCurrency();

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense",
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const { budgets, loading: budgetsLoading } = useBudgets(userId);

  // ✅ PREFILL / RESET
  useEffect(() => {
    if (!open) return;

    if (editData) {
      setTransactionType(editData.type);
      setAmount(rate ? String(editData.amount * rate) : "");
      setDescription(editData.description);
      setCategory(editData.categoryId);
      setDate(new Date(editData.date).toISOString().split("T")[0]);
    } else {
      setTransactionType("expense");
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [editData, open, rate]);

  // ✅ SUBMIT
  // ===============================
  // ➕ ADD / UPDATE TRANSACTION
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ Validation
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (transactionType === "expense" && !category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!rate) {
      toast({
        title: "Currency error",
        description: "Invalid currency rate",
        variant: "destructive",
      });
      return;
    }

    // ✅ Convert to base currency (INR) before saving
    const enteredAmount = Number(amount);

    // ⚠️ IMPORTANT: divide by rate (not multiply)
    const baseAmount = Number((enteredAmount / rate).toFixed(2));

    const selectedBudget = budgets.find((b) => b.id === category);

    const payload = {
      type: transactionType,
      amount: baseAmount,
      description,

      categoryId: transactionType === "expense" ? category : "income",
      categoryName:
        transactionType === "expense"
          ? selectedBudget?.category || ""
          : "Income",

      date: new Date(date),
    };

    try {
      setLoading(true);

      if (isEdit && editData?.id) {
        // ✏️ UPDATE
        await updateTransaction(userId, editData.id, payload);

        toast({
          title: "Transaction updated",
          description: "Changes saved successfully",
          variant: "success",
        });
      } else {
        // ➕ CREATE
        await addTransaction(userId, {
          ...payload,
          createdAt: new Date(),
        });

        toast({
          title: "Transaction added",
          description: `${category} transaction created`,
          variant: "success",
        });
      }

      // ✅ Reset form (same pattern as budgets page)
      setAmount("");
      setDescription("");
      setCategory("");
      setTransactionType("expense");
      setDate(new Date().toISOString().split("T")[0]);

      // ✅ Close dialog safely (no delay UX issue)
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    } catch (err) {
      console.error("Transaction error:", err);

      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your transaction details"
              : "Enter transaction details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* TYPE */}
            <RadioGroup
              value={transactionType}
              onValueChange={(val) =>
                setTransactionType(val as "income" | "expense")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
            </RadioGroup>

            {/* AMOUNT */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Amount</Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {symbol}
                </span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* CATEGORY */}
            {transactionType === "expense" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Category</Label>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    {budgets.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No categories
                      </SelectItem>
                    ) : (
                      budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id!}>
                          {b.category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* DATE */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                  ? "Update"
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
