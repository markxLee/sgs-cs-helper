"use client";

import type { StackedTrendData } from "@/types/dashboard";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CompletionTrendChartProps {
  data: StackedTrendData[];
}

/**
 * Update #1: Stacked column chart showing on-time vs overdue over time
 * Converted from LineChart to stacked BarChart
 */
export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  // Format dates for display
  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="displayDate"
            fontSize={12}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value, name) => [
              value,
              name === "onTime" ? "On Time" : "Overdue",
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend
            formatter={(value) => (value === "onTime" ? "On Time" : "Overdue")}
          />
          {/* Stacked columns: on-time (green) + overdue (red) */}
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
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
