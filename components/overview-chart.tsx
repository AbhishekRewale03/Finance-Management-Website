"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { Transaction } from "@/services/transaction.service";
import { useCurrency } from "@/app/context/currency-context";

export function OverviewChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { symbol, rate } = useCurrency();

  // 🔥 Group by month (YEAR SAFE)
  const monthlyMap: Record<
    string,
    { month: string; income: number; expenses: number; date: Date }
  > = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        month: date.toLocaleString("default", { month: "short" }),
        income: 0,
        expenses: 0,
        date,
      };
    }

    if (t.type === "income") {
      monthlyMap[key].income += t.amount;
    } else {
      monthlyMap[key].expenses += t.amount;
    }
  });

  const data = Object.values(monthlyMap)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => ({
      ...item,
      income: item.income * rate, // ✅ convert
      expenses: item.expenses * rate, // ✅ convert
    }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} barGap={6}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(156,163,175,0.2)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) => `${symbol}${value}`}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value: number) => `${symbol}${value.toFixed(2)}`}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 10 }}
          />

          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />

          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
