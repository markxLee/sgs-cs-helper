"use server";

import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcActualDuration } from "@/lib/utils/duration";
import { getPriorityDuration } from "@/lib/utils/progress";
import {
  type DashboardFilters,
  type DashboardMetrics,
  type DashboardUser,
  type StackedTrendData,
  type StackedUserData,
  dashboardFiltersSchema,
} from "@/types/dashboard";

const MS_PER_HOUR = 1000 * 60 * 60;

/**
 * Check if user has admin role (ADMIN or SUPER_ADMIN)
 */
async function requireAdminRole() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("Access denied. Admin or Super Admin role required.");
  }
  return session;
}

/**
 * Get dashboard performance metrics with filtering
 * Server Action for performance dashboard data aggregation
 */
export async function getDashboardMetrics(
  filters: DashboardFilters
): Promise<
  { success: true; data: DashboardMetrics } | { success: false; error: string }
> {
  try {
    // 1. Authentication check
    await requireAdminRole();

    // 2. Input validation
    const validatedFilters = dashboardFiltersSchema.parse(filters);

    // 3. Build Prisma query
    const whereClause: Prisma.OrderWhereInput = {
      status: "COMPLETED",
      completedAt: {
        gte: validatedFilters.startDate,
        lte: validatedFilters.endDate,
      },
    };

    // Apply scope filter (Update #1 - simplified, only all-team or individual)
    if (validatedFilters.scope === "individual" && validatedFilters.userId) {
      whereClause.completedById = validatedFilters.userId;
    }
    // For "all-team" scope, no additional filter needed

    // 4. Query completed orders with relationships
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        completedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // 5. Aggregate data in JavaScript
    const metrics = aggregateOrderMetrics(orders, validatedFilters);

    return {
      success: true,
      data: metrics,
    };
  } catch (error: unknown) {
    console.error("getDashboardMetrics error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard metrics",
    };
  }
}

/**
 * Get list of active users for dashboard filters
 */
export async function getDashboardUsers(): Promise<
  { success: true; data: DashboardUser[] } | { success: false; error: string }
> {
  try {
    // Authentication check
    await requireAdminRole();

    // Query active STAFF and ADMIN users
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: {
          in: ["STAFF", "ADMIN"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Handle users with null names
    const formattedUsers: DashboardUser[] = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown User",
      role: user.role,
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error: unknown) {
    console.error("getDashboardUsers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

/**
 * Aggregate order metrics from raw order data
 * Update #1: Returns ratio-based KPIs and stacked chart data
 */
function aggregateOrderMetrics(
  orders: Array<{
    id: string;
    receivedDate: Date;
    completedAt: Date | null;
    priority: number;
    completedById: string | null;
    completedBy: { id: string; name: string | null } | null;
  }>,
  filters: DashboardFilters
): DashboardMetrics {
  const userMetricsMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      onTime: number;
      overdue: number;
      totalProcessingTime: number;
    }
  >();
  let totalOnTime = 0;
  let totalOverdue = 0;
  let totalProcessingTime = 0;
  let totalEfficiencyRatio = 0; // Sum of (actual/expected) for averaging

  // Process each completed order
  for (const order of orders) {
    if (!order.completedAt) continue;

    // Calculate actual duration and expected duration
    const actualDurationMs = calcActualDuration(
      order.receivedDate,
      order.completedAt
    );
    const expectedDurationHours = getPriorityDuration(order.priority);
    const expectedDurationMs = expectedDurationHours * MS_PER_HOUR;

    // Determine if on-time or overdue
    const isOnTime = actualDurationMs <= expectedDurationMs;

    if (isOnTime) {
      totalOnTime++;
    } else {
      totalOverdue++;
    }

    totalProcessingTime += actualDurationMs;

    // Calculate efficiency ratio for this order (actual / expected)
    // < 1 means faster than allowed, > 1 means slower/overdue
    if (expectedDurationMs > 0) {
      totalEfficiencyRatio += actualDurationMs / expectedDurationMs;
    }

    // Aggregate per-user metrics (exclude orders without completedBy - EC-008)
    if (order.completedById && order.completedBy) {
      const userId = order.completedById;
      const userName = order.completedBy.name || "Unknown User";

      if (!userMetricsMap.has(userId)) {
        userMetricsMap.set(userId, {
          userId,
          userName,
          onTime: 0,
          overdue: 0,
          totalProcessingTime: 0,
        });
      }

      const userMetrics = userMetricsMap.get(userId)!;
      if (isOnTime) {
        userMetrics.onTime++;
      } else {
        userMetrics.overdue++;
      }
      userMetrics.totalProcessingTime += actualDurationMs;
    }
  }

  // Calculate KPI metrics (Update #1.1 - simplified totalCompleted, added avgEfficiency)
  const totalCompletedCount = orders.length;
  const avgProcessingTime =
    totalCompletedCount > 0 ? totalProcessingTime / totalCompletedCount : 0;
  const avgEfficiency =
    totalCompletedCount > 0 ? totalEfficiencyRatio / totalCompletedCount : 0;

  // Build KPIs
  const kpis = {
    totalCompleted: {
      count: totalCompletedCount,
    },
    onTime: {
      onTime: totalOnTime,
      total: totalCompletedCount,
      ratio: totalCompletedCount > 0 ? totalOnTime / totalCompletedCount : 0,
    },
    avgDuration: {
      avgMs: avgProcessingTime,
      avgHours: avgProcessingTime / MS_PER_HOUR,
      avgEfficiency: avgEfficiency, // < 1 = faster than allowed, > 1 = slower/overdue
      trend: 0, // Will be calculated vs previous period in future
    },
    overdue: {
      overdue: totalOverdue,
      total: totalCompletedCount,
      ratio: totalCompletedCount > 0 ? totalOverdue / totalCompletedCount : 0,
    },
  };

  // Convert per-user metrics to stacked format (Update #1)
  const completionPerUser: StackedUserData[] = Array.from(
    userMetricsMap.values()
  )
    .map((user) => ({
      userId: user.userId,
      userName: user.userName,
      onTime: user.onTime,
      overdue: user.overdue,
      total: user.onTime + user.overdue,
    }))
    .sort((a, b) => b.total - a.total); // Sort by total completed descending

  // Generate stacked trend data (Update #1)
  const completionTrend = generateStackedTrendData(orders, filters);

  return {
    kpis,
    completionPerUser,
    completionTrend,
  };
}

/**
 * Generate stacked trend data points (daily for ≤30 days, weekly for >30 days)
 * Update #1: Returns stacked format with on-time/overdue breakdown
 */
function generateStackedTrendData(
  orders: Array<{
    completedAt: Date | null;
    receivedDate: Date;
    priority: number;
  }>,
  filters: DashboardFilters
): StackedTrendData[] {
  const startDate = filters.startDate;
  const endDate = filters.endDate;
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isDaily = daysDiff <= 30;
  const trendMap = new Map<string, { onTime: number; overdue: number }>();

  // Process orders and group by time period
  for (const order of orders) {
    if (!order.completedAt) continue;

    const completedDate = new Date(order.completedAt);
    let periodKey: string;

    if (isDaily) {
      // Group by day
      periodKey = completedDate.toISOString().split("T")[0]; // YYYY-MM-DD
    } else {
      // Group by week (week starting Monday)
      const monday = new Date(completedDate);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      monday.setDate(diff);
      periodKey = monday.toISOString().split("T")[0]; // Week starting date
    }

    if (!trendMap.has(periodKey)) {
      trendMap.set(periodKey, { onTime: 0, overdue: 0 });
    }

    const point = trendMap.get(periodKey)!;

    // Determine if on-time or overdue
    const actualDurationMs = calcActualDuration(
      order.receivedDate,
      order.completedAt
    );
    const expectedDurationHours = getPriorityDuration(order.priority);
    const expectedDurationMs = expectedDurationHours * MS_PER_HOUR;

    if (actualDurationMs <= expectedDurationMs) {
      point.onTime++;
    } else {
      point.overdue++;
    }
  }

  // Convert to sorted array with stacked format
  return Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      onTime: data.onTime,
      overdue: data.overdue,
      total: data.onTime + data.overdue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
