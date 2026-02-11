import { z } from "zod";

// Dashboard scope options (simplified - removed "group")
export type DashboardScope = "all-team" | "individual";

// Dashboard filter options
export interface DashboardFilters {
  scope: DashboardScope;
  userId?: string; // Single user ID (cuid string) for individual scope
  startDate: Date;
  endDate: Date;
}

// KPI types (Update #1.1 - simplified)
export interface KpiTotalCompleted {
  count: number; // Total completed orders in the period
}

export interface KpiOnTime {
  onTime: number;
  total: number;
  ratio: number; // 0-1
}

export interface KpiAvgDuration {
  avgMs: number;
  avgHours: number;
  avgEfficiency: number; // Average % of time used vs allowed (< 1 = faster, > 1 = slower/overdue)
  trend: number; // -1 to 1, negative = faster (improvement)
}

export interface KpiOverdue {
  overdue: number;
  total: number;
  ratio: number; // 0-1
}

// Updated KPI metrics (Update #1.1)
export interface DashboardKpis {
  totalCompleted: KpiTotalCompleted;
  onTime: KpiOnTime;
  avgDuration: KpiAvgDuration;
  overdue: KpiOverdue;
}

// Stacked chart data types (Update #1)
export interface StackedUserData {
  userId: string;
  userName: string;
  onTime: number;
  overdue: number;
  total: number;
}

export interface StackedTrendData {
  date: string;
  onTime: number;
  overdue: number;
  total: number;
}

// On-time vs overdue for pie chart
export interface OnTimeVsOverdue {
  onTime: number;
  overdue: number;
}

// Complete dashboard metrics response (Updated for Update #1)
export interface DashboardMetrics {
  kpis: DashboardKpis;
  completionPerUser: StackedUserData[];
  completionTrend: StackedTrendData[];
}

// User info for dropdowns
export interface DashboardUser {
  id: string;
  name: string;
  role: string;
}

// Zod schema for dashboard filters validation (Updated - removed group)
export const dashboardFiltersSchema = z
  .object({
    scope: z.enum(["all-team", "individual"]),
    userId: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(
    (data) => {
      // When scope is "individual", userId is required
      if (data.scope === "individual") {
        return data.userId !== undefined;
      }
      return true;
    },
    {
      message: "userId is required for individual scope",
    }
  )
  .refine(
    (data) => {
      // Validate that startDate is not after endDate
      return data.startDate <= data.endDate;
    },
    {
      message: "startDate must not be after endDate",
    }
  )
  .refine(
    (data) => {
      // Validate max 1 year range
      const diffMs = data.endDate.getTime() - data.startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= 365;
    },
    {
      message: "Date range must not exceed 1 year",
    }
  );
