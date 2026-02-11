"use client";

import type { StackedUserData } from "@/types/dashboard";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CompletionBarChartProps {
  data: StackedUserData[];
}

/**
 * Update #1: Stacked bar chart showing on-time vs overdue per user
 */
export function CompletionBarChart({ data }: CompletionBarChartProps) {
  // Sort data by total completed descending and take top 10 for readability
  const chartData = data
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((user) => ({
      name: user.userName,
      onTime: user.onTime,
      overdue: user.overdue,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis type="number" domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="name" width={100} fontSize={12} />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "onTime" ? "On Time" : "Overdue",
            ]}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend
            formatter={(value) => (value === "onTime" ? "On Time" : "Overdue")}
          />
          {/* Stacked bars: on-time (green) + overdue (red) */}
          <Bar
            dataKey="onTime"
            stackId="stack"
            fill="hsl(142, 76%, 36%)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="overdue"
            stackId="stack"
            fill="hsl(0, 84%, 60%)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
