"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/app/context/currency-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { OverviewChart } from "@/components/overview-chart";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { TrendsChart } from "@/components/TrendsChart";
import { DotLoader } from "./DotLoader";
import { useRouter } from "next/navigation";

export function ReportsPage() {
  const [period, setPeriod] = useState("6months");

  const { user, loading: authLoading } = useAuth();
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const isDataReady = transactions.length > 0;

  const router = useRouter();

  // 🔥 Currency
  const { symbol, rate, currency } = useCurrency();

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

  // 🔥 FILTER
  const now = new Date();

  const filtered = transactions.filter((t) => {
    const date = new Date(t.date);

    const diffMonths =
      (now.getFullYear() - date.getFullYear()) * 12 +
      (now.getMonth() - date.getMonth());

    if (period === "1month") return diffMonths === 0; // current month only
    if (period === "3months") return diffMonths < 3;
    if (period === "6months") return diffMonths < 6;
    if (period === "1year") return diffMonths < 12;

    return true;
  });

  // 🔥 KPI CALCULATIONS
  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // 🔥 CONVERT
  const convertedIncome = totalIncome * rate;
  const convertedExpense = totalExpense * rate;

  // 🔥 FORMAT (INR no decimal, USD/EUR with decimal)
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Analyze your financial data
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">This Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {transactions.length === 0 && (
        <div className="text-center text-muted-foreground text-sm sm:text-lg">
          No transactions yet. Add one to see reports.
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <p className="text-lg sm:text-xl font-bold text-emerald-600">
              {formatAmount(convertedIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Total Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <p className="text-lg sm:text-xl font-bold text-red-500">
              {formatAmount(convertedExpense)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <p className="text-lg sm:text-xl font-bold text-blue-500">
              {savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="income-expense" className="space-y-3 sm:space-y-4">
        <TabsList className="flex w-full gap-1 sm:gap-2">
          <TabsTrigger
            value="income-expense"
            className="flex-1 min-w-0 text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Income & Expense
          </TabsTrigger>

          <TabsTrigger
            value="categories"
            className="flex-1 min-w-0 text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Categories
          </TabsTrigger>

          <TabsTrigger
            value="trends"
            className="flex-1 min-w-0 text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Trends
          </TabsTrigger>
        </TabsList>

        {/* BAR CHART */}
        <TabsContent value="income-expense">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense</CardTitle>
              <CardDescription>Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <OverviewChart transactions={filtered} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* DONUT */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ExpensesByCategoryChart transactions={filtered} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🔥 LINE CHART */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <TrendsChart transactions={filtered} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
