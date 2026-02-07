/**
 * Realtime Orders Container
 *
 * Client component that:
 * 1. Receives initial orders from server
 * 2. Calculates progress client-side, updates every minute
 * 3. Subscribes to SSE for status changes from other users
 *
 * @module components/orders/realtime-orders
 */

"use client";

import { useState, useMemo } from "react";
import { useRealtimeProgress, type OrderData } from "@/hooks/use-realtime-progress";
import { useOrderSSE } from "@/hooks/use-order-sse";
import { OrdersTable } from "@/components/orders/orders-table";

// ============================================================================
// Types
// ============================================================================

interface RealtimeOrdersProps {
  initialOrders: OrderData[];
  activeTab: "in-progress" | "completed";
}

// ============================================================================
// Component
// ============================================================================

export function RealtimeOrders({ initialOrders, activeTab }: RealtimeOrdersProps) {
  const [isConnected, setIsConnected] = useState(false);

  // Realtime progress calculation
  const {
    orders: ordersWithProgress,
    lastUpdated,
    updateOrder,
    addOrder,
    removeOrder,
    updateOrders,
  } = useRealtimeProgress(initialOrders, 60000); // Update every minute

  // Subscribe to SSE for status changes
  useOrderSSE({
    onUpdate: (order) => {
      updateOrder(order);
    },
    onAdd: (order) => {
      addOrder(order);
    },
    onRemove: (orderId) => {
      removeOrder(orderId);
    },
    onBulkUpdate: (orders) => {
      updateOrders(orders);
    },
    onConnect: () => {
      setIsConnected(true);
    },
    onDisconnect: () => {
      setIsConnected(false);
    },
  });

  // Filter and sort based on active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "completed") {
      return ordersWithProgress
        .filter((order) => order.status === "COMPLETED")
        .sort((a, b) => b.requiredDate.getTime() - a.requiredDate.getTime());
    }
    return ordersWithProgress
      .filter((order) => order.status !== "COMPLETED")
      .sort((a, b) => b.progress.percentage - a.progress.percentage);
  }, [ordersWithProgress, activeTab]);

  // Counts for display
  const inProgressCount = ordersWithProgress.filter(
    (order) => order.status !== "COMPLETED"
  ).length;
  const completedCount = ordersWithProgress.filter(
    (order) => order.status === "COMPLETED"
  ).length;

  return (
    <div>
      {/* Connection status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} order
          {filteredOrders.length !== 1 ? "s" : ""}
          {activeTab === "in-progress"
            ? ` (${inProgressCount} in progress)`
            : ` (${completedCount} completed)`}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnected ? "Live" : "Reconnecting..."}
          <span className="text-gray-400">
            Updated: {formatTime(lastUpdated)}
          </span>
        </div>
      </div>

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function EmptyState({ tab }: { tab: string }) {
  const isCompleted = tab === "completed";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {isCompleted ? "No completed orders" : "No orders in progress"}
      </h2>
      <p className="text-muted-foreground max-w-sm">
        {isCompleted
          ? "Completed orders will appear here."
          : "Orders will appear here once they are uploaded to the system."}
      </p>
    </div>
  );
}
