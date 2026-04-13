"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/services/transaction.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TransactionsList } from "@/components/transactions-list";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";

import { PlusIcon } from "lucide-react";
import { DotLoader } from "./DotLoader";
import { useRouter } from "next/navigation";

export function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const isDataReady = transactions.length > 0;

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

  if (authLoading || txLoading || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  // ✅ OPEN ADD
  const handleAdd = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  // ✅ OPEN EDIT
  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setDialogOpen(true);
  };

  // ✅ CLOSE DIALOG
  const handleClose = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View and manage all your financial transactions
          </p>
        </div>

        <Button
          onClick={handleAdd}
          className="w-fit  sm:w-auto text-sm sm:text-base px-2 sm:px-4"
        >
          <PlusIcon className="mr-2 h-4 w-4" />

          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription className="hidden sm:block">
            A complete history of your financial activities
          </CardDescription>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <h2 className="text-lg font-semibold">No transactions yet</h2>
              <p className="text-muted-foreground text-sm">
                Start by adding your first transaction
              </p>
            </div>
          ) : (
            <TransactionsList
              transactions={transactions}
              userId={user.uid}
              showAll
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      {/* 🔥 SINGLE DIALOG (ADD + EDIT) */}
      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={handleClose}
        userId={user.uid}
        editData={editingTransaction}
      />
    </div>
  );
}
