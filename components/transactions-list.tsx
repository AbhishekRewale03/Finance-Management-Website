"use client";

import { useState, useMemo, useEffect } from "react";
import { Transaction, deleteTransaction } from "@/services/transaction.service";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Trash2Icon, PencilIcon } from "lucide-react";
import { useCurrency } from "@/app/context/currency-context";
import { useToast } from "@/hooks/use-toast";
import { DotLoader } from "./DotLoader";
import { useAuth } from "@/hooks/useAuth";

interface TransactionsListProps {
  transactions: Transaction[];
  userId: string;
  limit?: number;
  showAll?: boolean;
  onEdit?: (t: Transaction) => void;
}

export function TransactionsList({
  transactions,
  userId,
  limit,
  showAll = false,
  onEdit,
}: TransactionsListProps) {
  const { symbol, rate } = useCurrency();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // ✅ NEW: Delete state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const [loadingDelete, setLoadingDelete] = useState(false);

  // ✅ Filtering
  const filtered = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          (t.description?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (t.categoryName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      )
      .filter((t) =>
        filterType === "all"
          ? true
          : filterType === "income"
            ? t.type === "income"
            : t.type === "expense",
      );
  }, [transactions, searchTerm, filterType]);

  const finalData = limit ? filtered.slice(0, limit) : filtered;

  const { user } = useAuth();
  const isRestrictedUser = user?.email === "abhishek@gmail.com";

  // ✅ DELETE HANDLER
  const handleDelete = async () => {
    if (!deleteTarget) return;

    

    if (isRestrictedUser) {
      toast({
        title: "Restricted Action",
        description: "Deleting transactions is disabled for this account",
        variant: "destructive",
      });
      return;
    }

    setLoadingDelete(true);

    try {
      await deleteTransaction(userId, deleteTarget.id);

      toast({
        title: "Transaction deleted ",
        description: `${deleteTarget.description} removed successfully`,
        variant: "destructive",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(false);
      setDeleteTarget(null);
    }
  };

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

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    // when transactions come (even empty), mark as loaded
    setHasLoadedOnce(true);
  }, [finalData]);

  return (
    <div className="space-y-4">
      {/* 🔍 Search + Filter */}
      {showAll && (
        <div className="flex  gap-3 ">
          {/* 📱 Mobile */}
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:hidden"
          />

          {/* 💻 Desktop */}
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full hidden sm:block"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 🔄 LOADING */}
      {!hasLoadedOnce ? (
        <div className="flex justify-center py-10">
          <DotLoader size={10} />
        </div>
      ) : (
        finalData.map((t) => {
          return (
            <div
              key={t.id}
              className="flex  justify-between items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {/* LEFT */}
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">
                  {t.description}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate ">
                  {new Date(t.date).toLocaleDateString("en-GB")}{" "}
                  <span className="hidden sm:inline">• {t.categoryName}</span>
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                {/* AMOUNT */}
                <div className="text-right flex items-center gap-2 sm:gap-3">
                  <p
                    className={`text-sm sm:text-base font-semibold ${
                      t.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {t.type === "income" ? "+" : "-"}
                    </span>
                    {formatAmount(t.amount)}
                  </p>

                  <Badge
                    className="hidden sm:inline-flex"
                    variant={t.type === "income" ? "outline" : "secondary"}
                  >
                    {t.type}
                  </Badge>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <PencilIcon className="h-4 w-4 text-blue-500" />
                    </button>
                  )}

                  {/* DELETE */}
                  <Dialog
                    open={!!deleteTarget && deleteTarget.id === t.id}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: t.id!,
                            description: t.description || "Transaction",
                          })
                        }
                        className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                      </DialogHeader>

                      <p>
                        Are you sure you want to delete "
                        {deleteTarget?.description}"?
                      </p>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteTarget(null)}
                          disabled={loadingDelete}
                        >
                          Cancel
                        </Button>

                        <Button
                          variant="destructive"
                          
                          onClick={handleDelete}
                          disabled={loadingDelete}
                        >
                          {loadingDelete ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
