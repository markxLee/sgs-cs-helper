/**
 * Orders Table Component
 *
 * Displays orders in a table format with columns:
 * - Job Number
 * - Registered Date
 * - Required Date
 * - Priority
 * - Status
 * - Progress
 *
 * @module components/orders/orders-table
 */

import { MarkDoneModal } from "@/components/orders/MarkDoneModal";
import { OrderProgressBar } from "@/components/orders/order-progress-bar";
import {
  SortableHeader,
  type SortConfig,
} from "@/components/orders/sortable-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import type { ProgressInfo } from "@/lib/utils/progress";
import { getPriorityDuration } from "@/lib/utils/progress";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface OrderWithProgress {
  id: string;
  jobNumber: string;
  registeredDate: Date;
  registeredBy: string | null;
  receivedDate: Date;
  requiredDate: Date;
  priority: number;
  sampleCount: number;
  status: OrderStatus;
  progress: ProgressInfo;
}

interface OrdersTableProps {
  orders: OrderWithProgress[];
  activeTab?: "in-progress" | "completed";
  /** Whether current user can mark orders as done */
  canMarkDone?: boolean;
  /** Sort configuration for sortable headers */
  sortConfig?: SortConfig;
  /** Callback when a sortable header is clicked */
  onSort?: (key: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format date in Vietnamese locale and timezone
 * @example formatDate(new Date()) // "07/02/2026 14:30"
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/**
 * Get priority display label
 */
function getPriorityLabel(priority: number, etaHours: number): string {
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

/**
 * Get status display label
 */
// function getStatusLabel(status: OrderStatus): string {
//   switch (status) {
//     case "IN_PROGRESS":
//       return "In Progress";
//     case "COMPLETED":
//       return "Completed";
//     case "OVERDUE":
//       return "Overdue";
//     default:
//       return status;
//   }
// }

/**
 * Get status badge color class
 */
// function getStatusClass(status: OrderStatus): string {
//   switch (status) {
//     case "IN_PROGRESS":
//       return "bg-blue-100 text-blue-800";
//     case "COMPLETED":
//       return "bg-green-100 text-green-800";
//     case "OVERDUE":
//       return "bg-red-100 text-red-800";
//     default:
//       return "bg-gray-100 text-gray-800";
//   }
// }

/**
 * Format remaining time in a human-readable way
 */
function formatRemainingTime(
  remainingHours: number,
  isOverdue: boolean
): string {
  if (isOverdue) {
    const overdueHours = Math.abs(remainingHours);
    if (overdueHours < 1) {
      const minutes = Math.round(overdueHours * 60);
      return `Trễ ${minutes}p`;
    }
    const hours = Math.floor(overdueHours);
    const minutes = Math.round((overdueHours - hours) * 60);
    if (minutes === 0) {
      return `Trễ ${hours}g`;
    }
    return `Trễ ${hours}g ${minutes}p`;
  }

  if (remainingHours <= 0) {
    return "Hết giờ";
  }

  if (remainingHours < 1) {
    const minutes = Math.round(remainingHours * 60);
    return `Còn ${minutes}p`;
  }

  const hours = Math.floor(remainingHours);
  const minutes = Math.round((remainingHours - hours) * 60);
  if (minutes === 0) {
    return `Còn ${hours}g`;
  }
  return `Còn ${hours}g ${minutes}p`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Table displaying orders with progress bars
 *
 * @exampleactiveTab="in-progress" />
 */
export function OrdersTable({
  orders,
  activeTab = "in-progress",
  canMarkDone = false,
  sortConfig,
  onSort,
}: OrdersTableProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    order: OrderWithProgress | null;
  }>({ isOpen: false, order: null });
  const [isLoading, setIsLoading] = useState(false);

  // Handle mark done API call
  const handleMarkDone = useCallback(async () => {
    if (!modalState.order) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/orders/${modalState.order.id}/mark-done`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Có lỗi xảy ra");
      }

      // Success - close modal, SSE will handle UI update
      setModalState({ isOpen: false, order: null });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  }, [modalState.order]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "completed") {
      return order.status === "COMPLETED";
    }
    return order.status !== "COMPLETED";
  });
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Số đơn hàng</TableHead>
            <TableHead className="w-[140px]">CS</TableHead>
            <TableHead className="w-[100px]">Tổng mẫu</TableHead>
            <TableHead
              className={cn(
                "w-[180px]",
                sortConfig && onSort && "hover:bg-muted/50 transition-colors"
              )}
            >
              {sortConfig && onSort ? (
                <SortableHeader
                  label="Tiến độ"
                  field="progress"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                "Tiến độ"
              )}
            </TableHead>
            <TableHead className="w-[120px]">Thời gian còn lại</TableHead>
            <TableHead className="w-[160px]">Ngày nhận mẫu</TableHead>
            <TableHead
              className={cn(
                "w-[160px]",
                sortConfig && onSort && "hover:bg-muted/50 transition-colors"
              )}
            >
              {sortConfig && onSort ? (
                <SortableHeader
                  label="Ngày trả kết quả"
                  field="requiredDate"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                "Ngày trả kết quả"
              )}
            </TableHead>
            <TableHead
              className={cn(
                "w-[100px]",
                sortConfig && onSort && "hover:bg-muted/50 transition-colors"
              )}
            >
              {sortConfig && onSort ? (
                <SortableHeader
                  label="Độ ưu tiên"
                  field="priority"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                "Độ ưu tiên"
              )}
            </TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.jobNumber}</TableCell>
              <TableCell className="max-w-[140px]">
                <span
                  className="truncate block"
                  title={order.registeredBy || "Unknown"}
                >
                  {order.registeredBy || "Unknown"}
                </span>
              </TableCell>
              <TableCell className="text-center">{order.sampleCount}</TableCell>
              <TableCell>
                <OrderProgressBar
                  percentage={order.progress.percentage}
                  color={order.progress.color}
                  isOverdue={order.progress.isOverdue}
                />
              </TableCell>
              <TableCell>
                <span
                  className={`text-sm font-medium ${order.progress.isOverdue ? "text-red-600" : order.progress.remainingHours < 0.5 ? "text-orange-600" : "text-gray-700"}`}
                >
                  {formatRemainingTime(
                    order.progress.remainingHours,
                    order.progress.isOverdue
                  )}
                </span>
              </TableCell>
              <TableCell>{formatDate(order.receivedDate)}</TableCell>
              <TableCell>{formatDate(order.requiredDate)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityClass(order.priority)}`}
                >
                  {getPriorityLabel(
                    order.priority,
                    getPriorityDuration(order.priority)
                  )}
                </span>
              </TableCell>
              <TableCell>
                {order.status === "IN_PROGRESS" && canMarkDone && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setModalState({ isOpen: true, order });
                    }}
                    aria-label={`Đánh dấu hoàn thành đơn ${order.jobNumber}`}
                  >
                    Hoàn thành
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {modalState.order && (
        <MarkDoneModal
          isOpen={modalState.isOpen}
          jobNumber={modalState.order.jobNumber}
          isLoading={isLoading}
          onConfirm={handleMarkDone}
          onCancel={() => {
            if (!isLoading) {
              setModalState({ isOpen: false, order: null });
            }
          }}
        />
      )}
    </div>
  );
}
