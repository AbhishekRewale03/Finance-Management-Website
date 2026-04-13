"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Transaction } from "@/services/transaction.service";
import { useCurrency } from "@/app/context/currency-context";

export function TrendsChart({ transactions }: { transactions: Transaction[] }) {
  const { symbol, rate } = useCurrency();

  const dataMap: Record<
    string,
    { month: string; expense: number; date: Date }
  > = {};

  transactions.forEach((t) => {
    if (t.type !== "expense") return;

    const date = new Date(t.date);

    // ✅ YEAR SAFE KEY
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!dataMap[key]) {
      dataMap[key] = {
        month: date.toLocaleString("default", { month: "short" }),
        expense: 0,
        date,
      };
    }

    // ✅ APPLY CURRENCY RATE
    dataMap[key].expense += t.amount * rate;
  });

  // ✅ SORT PROPERLY
  const data = Object.values(dataMap).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        No trend data available
      </p>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) => `${symbol}${value}`}
            tick={{ fontSize: 12 }}
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

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
