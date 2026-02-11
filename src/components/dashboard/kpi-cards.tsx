"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardKpis } from "@/types/dashboard";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface KpiCardsProps {
  kpis: DashboardKpis;
  isLoading?: boolean;
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </CardTitle>
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
        <div className="h-2 w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function KpiCards({ kpis, isLoading = false }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2].map((index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const { onTime, overdue } = kpis;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* On-Time Rate KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {onTime.total > 0 ? `${Math.round(onTime.ratio * 100)}%` : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {onTime.onTime.toLocaleString()} of {onTime.total.toLocaleString()}{" "}
            on time
          </p>
          <Progress
            value={onTime.ratio * 100}
            className="h-1.5 mt-2"
            indicatorClassName="bg-blue-600"
          />
        </CardContent>
      </Card>

      {/* Overdue KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {overdue.overdue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {overdue.total > 0
              ? `${Math.round(overdue.ratio * 100)}% of ${overdue.total.toLocaleString()} orders`
              : "No orders"}
          </p>
          <Progress
            value={overdue.ratio * 100}
            className="h-1.5 mt-2"
            indicatorClassName="bg-red-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}
