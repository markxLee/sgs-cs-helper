"use client";

import { getDashboardMetrics } from "@/app/actions/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  DashboardFilters as DashboardFiltersType,
  DashboardMetrics,
  DashboardUser,
} from "@/types/dashboard";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import {
  CompletionBarChart,
  CompletionTrendChart,
  OnTimeRatioPieChart,
} from "./charts";
import { DashboardFilters } from "./dashboard-filters";
import { KpiCards } from "./kpi-cards";
import { UserBreakdownTable } from "./user-breakdown-table";

interface PerformanceDashboardProps {
  initialData: DashboardMetrics;
  initialUsers: DashboardUser[];
}

/**
 * Get default filters for this month
 * Update #1: Uses new filter structure
 */
function getDefaultFilters(): DashboardFiltersType {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return {
    scope: "all-team",
    userId: undefined,
    startDate: monthStart,
    endDate: monthEnd,
  };
}

export function PerformanceDashboard({
  initialData,
  initialUsers,
}: PerformanceDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialData);
  const [filters, setFilters] =
    useState<DashboardFiltersType>(getDefaultFilters());
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters);
    setError(null);

    startTransition(async () => {
      try {
        const result = await getDashboardMetrics(newFilters);

        if (result.success) {
          setMetrics(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Dashboard filter error:", err);
        setError("Failed to load metrics. Please try again.");
      }
    });
  };

  const handleRetry = () => {
    handleFilterChange(filters);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <DashboardFilters
        filters={filters}
        users={initialUsers}
        onFilterChange={handleFilterChange}
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isPending}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isPending ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards (Update #1: uses kpis instead of kpi) */}
      <KpiCards kpis={metrics.kpis} isLoading={isPending} />

      {/* Charts Grid (Update #1: stacked charts + pie) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Orders per User</h3>
          <div className="border rounded-lg p-4">
            {isPending ? (
              <div className="flex h-[300px] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <CompletionBarChart data={metrics.completionPerUser} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">On-Time vs Overdue</h3>
          <div className="border rounded-lg p-4 relative">
            {isPending ? (
              <div className="flex h-[300px] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <OnTimeRatioPieChart
                data={{
                  onTime: metrics.kpis.onTime.onTime,
                  overdue: metrics.kpis.overdue.overdue,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart (Full Width, Update #1: stacked columns) */}
      {metrics.completionTrend.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Completion Trend</h3>
          <div className="border rounded-lg p-4">
            {isPending ? (
              <div className="flex h-[300px] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <CompletionTrendChart data={metrics.completionTrend} />
            )}
          </div>
        </div>
      )}

      {/* User Breakdown Table (Update #1: uses completionPerUser) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">User Performance Breakdown</h3>
        <div className="border rounded-lg">
          <UserBreakdownTable
            data={metrics.completionPerUser}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  );
}
