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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderProgressBar } from "@/components/orders/order-progress-bar";
import type { ProgressInfo } from "@/lib/utils/progress";
import type { OrderStatus } from "@/generated/prisma/client";

// ============================================================================
// Types
// ============================================================================

export interface OrderWithProgress {
  id: string;
  jobNumber: string;
  registeredDate: Date;
  receivedDate: Date;
  requiredDate: Date;
  priority: number;
  status: OrderStatus;
  progress: ProgressInfo;
}

interface OrdersTableProps {
  orders: OrderWithProgress[];
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
function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 0:
      return "P0 - Emergency";
    case 1:
      return "P1 - Urgent";
    case 2:
      return "P2 - Normal";
    default:
      return `P${priority} - Low`;
  }
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
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "OVERDUE":
      return "Overdue";
    default:
      return status;
  }
}

/**
 * Get status badge color class
 */
function getStatusClass(status: OrderStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "OVERDUE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Format remaining time in a human-readable way
 */
function formatRemainingTime(remainingHours: number, isOverdue: boolean): string {
  if (isOverdue) {
    const overdueHours = Math.abs(remainingHours);
    if (overdueHours < 1) {
      const minutes = Math.round(overdueHours * 60);
      return `Quá ${minutes} phút`;
    }
    const hours = Math.floor(overdueHours);
    const minutes = Math.round((overdueHours - hours) * 60);
    if (minutes === 0) {
      return `Quá ${hours}h`;
    }
    return `Quá ${hours}h ${minutes}m`;
  }

  if (remainingHours <= 0) {
    return "Hết giờ";
  }

  if (remainingHours < 1) {
    const minutes = Math.round(remainingHours * 60);
    return `Còn ${minutes} phút`;
  }

  const hours = Math.floor(remainingHours);
  const minutes = Math.round((remainingHours - hours) * 60);
  if (minutes === 0) {
    return `Còn ${hours}h`;
  }
  return `Còn ${hours}h ${minutes}m`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Table displaying orders with progress bars
 *
 * @example
 * <OrdersTable orders={ordersWithProgress} />
 */
export function OrdersTable({ orders }: OrdersTableProps) {
  return (
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
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.jobNumber}</TableCell>
              <TableCell>{formatDate(order.registeredDate)}</TableCell>
              <TableCell>{formatDate(order.receivedDate)}</TableCell>
              <TableCell>{formatDate(order.requiredDate)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityClass(order.priority)}`}
                >
                  {getPriorityLabel(order.priority)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </TableCell>
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
                  {formatRemainingTime(order.progress.remainingHours, order.progress.isOverdue)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
