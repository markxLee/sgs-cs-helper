/**
 * Realtime Orders Container
 *
 * Client component that:
 * 1. Receives initial orders from server
 * 2. Calculates progress client-side, updates every minute
 * 3. Subscribes to SSE for status changes from other users
 * 4. Provides filtering, sorting, and search controls
 *
 * @module components/orders/realtime-orders
 */

"use client";

import { useState, useMemo } from "react";
import { useRealtimeProgress, type OrderData } from "@/hooks/use-realtime-progress";
import { useOrderSSE } from "@/hooks/use-order-sse";
import { useOrderControls } from "@/hooks/use-order-controls";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrderFiltersComponent } from "@/components/orders/order-filters";
import { JobSearch } from "@/components/orders/job-search";

// ============================================================================
// Types
// ============================================================================

interface RealtimeOrdersProps {
  initialOrders: OrderData[];
  activeTab: "in-progress" | "completed";
  /** Whether current user can mark orders as done */
  canMarkDone?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function RealtimeOrders({ initialOrders, activeTab, canMarkDone = false }: RealtimeOrdersProps) {
  const [isConnected, setIsConnected] = useState(false);

  // Order controls: filtering, sorting, search
  const {
    filters,
    sort,
    search,
    hasActiveControls,
    setFilters,
    handleSort,
    setSearch,
    resetControls,
    processOrders,
  } = useOrderControls();

  // Realtime progress calculation
  const {
    orders: ordersWithProgress,
    lastUpdated,
    updateOrder,
    addOrder,
    addOrders,
    removeOrder,
    refetchOrders,
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
      // Bulk update from upload: add new orders to list
      addOrders(orders);
    },
    onConnect: () => {
      setIsConnected(true);
    },
    onDisconnect: () => {
      setIsConnected(false);
    },
    // Polling fallback: refetch data after reconnect
    onReconnectRefresh: () => {
      refetchOrders();
    },
  });

  // Filter and sort based on active tab, then apply user controls
  const filteredOrders = useMemo(() => {
    let result: typeof ordersWithProgress;
    
    if (activeTab === "completed") {
      result = ordersWithProgress
        .filter((order) => order.status === "COMPLETED")
        .sort((a, b) => b.requiredDate.getTime() - a.requiredDate.getTime());
    } else {
      result = ordersWithProgress
        .filter((order) => order.status !== "COMPLETED")
        .sort((a, b) => b.progress.percentage - a.progress.percentage);
    }
    
    // Apply user controls (filter, sort, search) for in-progress tab
    if (activeTab === "in-progress") {
      result = processOrders(result);
    }
    
    return result;
  }, [ordersWithProgress, activeTab, processOrders]);

  // Extract unique registrants for filter dropdown
  const registrants = useMemo(() => {
    const uniqueRegistrants = new Set<string>();
    ordersWithProgress.forEach((order) => {
      if (order.registeredBy) {
        uniqueRegistrants.add(order.registeredBy);
      }
    });
    return Array.from(uniqueRegistrants).sort();
  }, [ordersWithProgress]);

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

      {/* Filter & Search Controls (only for in-progress tab) */}
      {activeTab === "in-progress" && (
        <div className="space-y-4 mb-6">
          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Job Search */}
            <div className="flex-1 max-w-sm">
              <JobSearch
                value={search}
                onChange={setSearch}
                placeholder="Search Job Number..."
              />
            </div>
            
            {/* Filters */}
            <div className="flex-1">
              <OrderFiltersComponent
                filters={filters}
                registrants={registrants}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
          
          {/* Active filters indicator */}
          {hasActiveControls && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtering/Sorting active</span>
              <button
                onClick={resetControls}
                className="text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <EmptyState tab={activeTab} hasFilters={hasActiveControls} />
      ) : (
        <OrdersTable
          orders={filteredOrders}
          canMarkDone={canMarkDone}
          sortConfig={activeTab === "in-progress" ? sort : undefined}
          onSort={activeTab === "in-progress" ? handleSort : undefined}
        />
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

function EmptyState({ tab, hasFilters = false }: { tab: string; hasFilters?: boolean }) {
  const isCompleted = tab === "completed";

  // Show different message when filters are active
  if (hasFilters) {
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          No orders found
        </h2>
        <p className="text-muted-foreground max-w-sm">
          No orders match the current filters. Try adjusting filter criteria.
        </p>
      </div>
    );
  }

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
