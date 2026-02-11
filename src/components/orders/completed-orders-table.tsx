/**
 * Completed Orders Table Component
 *
 * Displays completed orders with sortable columns, pagination,
 * and undo action. No progress bar or time-left columns.
 *
 * Columns: Job Number, Registered Date, Registered By, Required Date,
 *          Priority, Completed At, Action (Undo)
 *
 * @module components/orders/completed-orders-table
 */

"use client";

import {
  SortableHeader,
  type SortConfig,
} from "@/components/orders/sortable-header";
import { UndoCompleteModal } from "@/components/orders/UndoCompleteModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CompletedOrder } from "@/hooks/use-completed-orders";
import { cn } from "@/lib/utils";
import { calcActualDuration, formatDuration } from "@/lib/utils/duration";
import { getPriorityDuration } from "@/lib/utils/progress";
import { ChevronLeft, ChevronRight, PackageOpen, Undo2 } from "lucide-react";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface CompletedOrdersTableProps {
  orders: CompletedOrder[];
  canUndo: boolean;
  isLoading: boolean;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUndoSuccess: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format date string in Vietnamese locale and timezone
 */
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(dateString));
}

/**
 * Get priority display label
 */
function getPriorityLabel(priority: number): string {
  const etaHours = getPriorityDuration(priority);
  return `${priority} - (${etaHours}h)`;
}

/**
 * Get priority badge color class
 */
function getPriorityClass(priority: number): string {
  switch (priority) {
    case 0:
      return "bg-red-100 text-red-800";
    case 1:
      return "bg-orange-100 text-orange-800";
    case 2:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ============================================================================
// Skeleton Row
// ============================================================================

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Component
// ============================================================================

export function CompletedOrdersTable({
  orders,
  canUndo,
  isLoading,
  sortField,
  sortDir,
  onSort,
  page,
  totalPages,
  onPageChange,
  onUndoSuccess,
}: CompletedOrdersTableProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    order: CompletedOrder | null;
  }>({ isOpen: false, order: null });
  const [isUndoLoading, setIsUndoLoading] = useState(false);

  // Build SortConfig for SortableHeader
  const sortConfig: SortConfig = {
    field: sortField,
    direction: sortDir,
  };

  // Handle undo API call
  const handleUndo = useCallback(async () => {
    if (!modalState.order) return;

    setIsUndoLoading(true);
    try {
      const response = await fetch(
        `/api/orders/${modalState.order.id}/undo-complete`,
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An error occurred");
      }

      // Success — close modal and notify parent
      setModalState({ isOpen: false, order: null });
      onUndoSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsUndoLoading(false);
    }
  }, [modalState.order, onUndoSuccess]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Job Number</TableHead>
              <TableHead
                className={cn(
                  "w-[160px]",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <SortableHeader
                  label="Registered Date"
                  field="registeredDate"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="w-[140px]">Registered By</TableHead>
              <TableHead
                className={cn(
                  "w-[160px]",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <SortableHeader
                  label="Required Date"
                  field="requiredDate"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[100px]">Total Samples</TableHead>
              <TableHead
                className={cn(
                  "w-[170px]",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <SortableHeader
                  label="Completed At"
                  field="completedAt"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead
                className={cn(
                  "w-[160px]",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <SortableHeader
                  label="Completed By"
                  field="completedBy"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="w-[150px]">Actual Duration</TableHead>
              {canUndo && <TableHead className="w-[100px]">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading skeleton */}
            {isLoading && orders.length === 0 && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {/* Empty state */}
            {!isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canUndo ? 10 : 9}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PackageOpen className="h-8 w-8" />
                    <p>No completed orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={isLoading ? "opacity-50" : ""}
              >
                <TableCell className="font-medium">{order.jobNumber}</TableCell>
                <TableCell>{formatDate(order.registeredDate)}</TableCell>
                <TableCell className="max-w-[140px]">
                  <span
                    className="truncate block"
                    title={order.registeredBy || "Unknown"}
                  >
                    {order.registeredBy || "Unknown"}
                  </span>
                </TableCell>
                <TableCell>{formatDate(order.requiredDate)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityClass(order.priority)}`}
                  >
                    {getPriorityLabel(order.priority)}
                  </span>
                </TableCell>
                <TableCell className="text-center">{order.sampleCount}</TableCell>
                <TableCell>
                  {order.completedAt ? (
                    <span className="text-green-700 font-medium">
                      {formatDate(order.completedAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[160px]">
                  {order.completedBy ? (
                    <span
                      className="truncate block"
                      title={
                        order.completedBy.email
                          ? `${order.completedBy.name} (${order.completedBy.email})`
                          : order.completedBy.name
                      }
                    >
                      {order.completedBy.name}
                      {order.completedBy.email
                        ? ` (${order.completedBy.email})`
                        : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.completedAt ? (
                    (() => {
                      const receivedDate = new Date(order.receivedDate);
                      const completedAt = new Date(order.completedAt!);
                      const actualMs = calcActualDuration(
                        receivedDate,
                        completedAt
                      );

                      // Compare actual duration against priority-based duration
                      // (same logic as progress bar: P0=0.25h, P1=1h, P2=2.5h, P3+=3h)
                      const MS_PER_HOUR = 1000 * 60 * 60;
                      const priorityDurationHours = getPriorityDuration(
                        order.priority
                      );
                      const priorityDurationMs =
                        priorityDurationHours * MS_PER_HOUR;
                      const isCompletedOverdue = actualMs > priorityDurationMs;
                      const isCompletedEarly = actualMs < priorityDurationMs;
                      const overdueDurationMs = isCompletedOverdue
                        ? actualMs - priorityDurationMs
                        : null;
                      const earlyDurationMs = isCompletedEarly
                        ? priorityDurationMs - actualMs
                        : null;

                      return (
                        <div
                          className={
                            isCompletedOverdue
                              ? "text-purple-600"
                              : "text-green-600"
                          }
                        >
                          <span className="font-medium">
                            {formatDuration(actualMs)}
                          </span>
                          {overdueDurationMs != null && (
                            <span className="block text-xs text-purple-500">
                              Overdue: {formatDuration(overdueDurationMs)}
                            </span>
                          )}
                          {earlyDurationMs != null && (
                            <span className="block text-xs text-green-500">
                              Early: {formatDuration(earlyDurationMs)}
                            </span>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                {canUndo && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModalState({ isOpen: true, order })}
                      aria-label={`Undo completion of order ${order.jobNumber}`}
                    >
                      <Undo2 className="h-4 w-4 mr-1" />
                      Undo
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Undo confirmation modal */}
      {modalState.order && (
        <UndoCompleteModal
          isOpen={modalState.isOpen}
          jobNumber={modalState.order.jobNumber}
          isLoading={isUndoLoading}
          onConfirm={handleUndo}
          onCancel={() => {
            if (!isUndoLoading) {
              setModalState({ isOpen: false, order: null });
            }
          }}
        />
      )}
    </div>
  );
}
