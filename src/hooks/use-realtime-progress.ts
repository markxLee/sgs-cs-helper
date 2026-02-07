/**
 * Hook for realtime progress calculation
 *
 * Updates progress every minute without server calls.
 * Progress is calculated client-side based on receivedDate and priority.
 *
 * @module hooks/use-realtime-progress
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { calculateOrderProgress, type ProgressInfo } from "@/lib/utils/progress";
import type { OrderStatus } from "@/generated/prisma/client";

// ============================================================================
// Types
// ============================================================================

export interface OrderData {
  id: string;
  jobNumber: string;
  registeredDate: Date;
  receivedDate: Date;
  requiredDate: Date;
  priority: number;
  status: OrderStatus;
}

export interface OrderWithProgress extends OrderData {
  progress: ProgressInfo;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that calculates and updates order progress in realtime
 *
 * @param initialOrders - Initial orders from server
 * @param updateInterval - How often to recalculate progress (ms), default 60000 (1 minute)
 * @returns Orders with calculated progress, automatically updated
 *
 * @example
 * const { orders, lastUpdated } = useRealtimeProgress(serverOrders);
 */
export function useRealtimeProgress(
  initialOrders: OrderData[],
  updateInterval: number = 60000
) {
  // Store orders data (will be updated via SSE)
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);

  // Tick counter to trigger recalculation
  const [tick, setTick] = useState(0);

  // Calculate progress - derived from orders and tick
  const { ordersWithProgress, lastUpdated } = useMemo(() => {
    const now = new Date();
    const calculated = orders.map((order) => ({
      ...order,
      progress: calculateOrderProgress(order.receivedDate, order.priority, now),
    }));
    return {
      ordersWithProgress: calculated,
      lastUpdated: now,
    };
    // tick is intentionally in deps to trigger recalculation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, tick]);

  // Periodic tick to trigger recalculation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Update orders when SSE pushes new data
  const updateOrders = useCallback((newOrders: OrderData[]) => {
    setOrders(newOrders);
  }, []);

  // Update single order (for SSE partial updates)
  const updateOrder = useCallback((updatedOrder: OrderData) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  }, []);

  // Add new order
  const addOrder = useCallback((newOrder: OrderData) => {
    setOrders((prev) => [...prev, newOrder]);
  }, []);

  // Remove order
  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  return {
    orders: ordersWithProgress,
    lastUpdated,
    updateOrders,
    updateOrder,
    addOrder,
    removeOrder,
  };
}
