"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { Transaction } from "@/services/transaction.service";
import { useCurrency } from "@/app/context/currency-context";

const COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#6B7280", // Gray
];

// 🔥 Unique color mapping (NO repeat until colors)
const getCategoryColorsMap = (categories: string[]) => {
  const sorted = [...categories].sort(); // stability
  const map: Record<string, string> = {};

  sorted.forEach((cat, index) => {
    map[cat] = COLORS[index % COLORS.length];
  });

  return map;
};

export function ExpensesByCategoryChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { symbol, rate } = useCurrency();

  // 🔥 Group category data
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.categoryName] =
        (categoryMap[t.categoryName] || 0) + t.amount;
    });

  // ✅ Convert currency
  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: value * rate,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        No expense data available
      </p>
    );
  }

  const categoryNames = Object.keys(categoryMap).sort();

  const colorMap: Record<string, string> = {};

  categoryNames.forEach((name, index) => {
    colorMap[name] = COLORS[index % COLORS.length];
  });

  return (
    <div className="relative h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* 🔥 DONUT */}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={5}
            cornerRadius={10}
            isAnimationActive
            animationDuration={800}
            labelLine={false}
            label={({ cx, cy }) => {
              return (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={cx}
                    dy="-0.2em"
                    className="fill-gray-900 dark:fill-white text-md font-semibold"
                  >
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(total)}
                  </tspan>
                  <tspan
                    x={cx}
                    dy="1.2em"
                    className="fill-gray-500 text-sm mt-1"
                  >
                    Total
                  </tspan>
                </text>
              );
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorMap[entry.name]} />
            ))}
          </Pie>

          {/* 🔥 TOOLTIP */}
          <Tooltip
            formatter={(value: number, name: string) => {
              const percent = ((value / total) * 100).toFixed(1);
              return [`${symbol}${value.toFixed(2)} (${percent}%)`, name];
            }}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />

          {/* 🔥 LEGEND */}
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
