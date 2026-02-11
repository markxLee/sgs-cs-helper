"use client";

import type { OnTimeVsOverdue } from "@/types/dashboard";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface OnTimeRatioPieChartProps {
  data: OnTimeVsOverdue;
}

const COLORS = {
  onTime: "hsl(142, 76%, 36%)", // Green
  overdue: "hsl(0, 84%, 60%)", // Red
};

export function OnTimeRatioPieChart({ data }: OnTimeRatioPieChartProps) {
  const total = data.onTime + data.overdue;

  if (total === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No completed orders to display
      </div>
    );
  }

  const pieData = [
    {
      name: "On Time",
      value: data.onTime,
      percentage: ((data.onTime / total) * 100).toFixed(1),
    },
    {
      name: "Overdue",
      value: data.overdue,
      percentage: ((data.overdue / total) * 100).toFixed(1),
    },
  ];

  const centerPercentage = ((data.onTime / total) * 100).toFixed(1);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === "On Time" ? COLORS.onTime : COLORS.overdue}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} orders (${
                pieData.find((d) => d.name === name)?.percentage || "0"
              }%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: { color?: string }) => (
              <span style={{ color: entry.color }}>
                {value} ({pieData.find((d) => d.name === value)?.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {centerPercentage}%
          </div>
          <div className="text-sm text-muted-foreground">On Time</div>
        </div>
      </div>
    </div>
  );
}
