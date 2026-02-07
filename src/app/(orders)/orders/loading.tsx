/**
 * Loading skeleton for Orders page
 *
 * Displays while the orders data is being fetched.
 * Uses Next.js loading.tsx convention for automatic loading UI.
 *
 * @route /orders (loading state)
 */

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ============================================================================
// Loading Component
// ============================================================================

export default function OrdersLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Count skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Job Number</TableHead>
              <TableHead className="w-[160px]">Registered Date</TableHead>
              <TableHead className="w-[160px]">Received Date</TableHead>
              <TableHead className="w-[160px]">Required Date</TableHead>
              <TableHead className="w-[120px]">Priority</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[180px]">Progress</TableHead>
              <TableHead className="w-[120px]">Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Generate 5 skeleton rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
