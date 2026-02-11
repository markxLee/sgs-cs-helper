"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StackedUserData } from "@/types/dashboard";

interface UserBreakdownTableProps {
  data: StackedUserData[];
  isLoading?: boolean;
}

function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User Name</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">On-Time</TableHead>
          <TableHead className="text-right">Overdue</TableHead>
          <TableHead className="text-right">On-Time %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </TableCell>
            <TableCell className="text-right">
              <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Update #1: Uses StackedUserData with on-time/overdue breakdown
 */
export function UserBreakdownTable({
  data,
  isLoading = false,
}: UserBreakdownTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Sort data by total completed descending
  const sortedData = data.slice().sort((a, b) => b.total - a.total);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User Name</TableHead>
          <TableHead className="text-right">Total Completed</TableHead>
          <TableHead className="text-right">On-Time</TableHead>
          <TableHead className="text-right">Overdue</TableHead>
          <TableHead className="text-right">On-Time Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              No completed orders in this period
            </TableCell>
          </TableRow>
        ) : (
          sortedData.map((user) => {
            const onTimePercent =
              user.total > 0 ? (user.onTime / user.total) * 100 : 0;
            return (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.userName}</TableCell>
                <TableCell className="text-right">
                  {user.total.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {user.onTime.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {user.overdue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {onTimePercent.toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
