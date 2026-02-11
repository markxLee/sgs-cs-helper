/**
 * Hook for realtime progress calculation
 *
 * Updates progress every minute without server calls.
 * Progress is calculated client-side based on receivedDate and priority.
 *
 * Includes periodic polling fallback (3 minutes) to catch missed SSE events
 * in multi-instance deployments.
 *
 * @module hooks/use-realtime-progress
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { calculateOrderProgress, type ProgressInfo } from "@/lib/utils/progress";
import type { OrderStatus } from "@/generated/prisma/client";

// ============================================================================
// Constants
// ============================================================================

/** Polling interval for fallback data refresh (1 minute) */
const POLL_INTERVAL = 30 * 1000;

// ============================================================================
// Types
// ============================================================================

export interface OrderData {
  id: string;
  jobNumber: string;
  registeredDate: Date;
  registeredBy: string | null;
  receivedDate: Date;
  requiredDate: Date;
  priority: number;
  sampleCount: number;
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
  
  // Track last fetch time to avoid double-fetching
  const lastFetchRef = useRef<number>(Date.now());

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

  // Refetch orders from server (polling fallback)
  const refetchOrders = useCallback(async () => {
    try {
      console.log("[Realtime] Fetching latest orders from server");
      const response = await fetch("/api/orders");
      if (response.ok) {
        const freshOrders = await response.json();
        // Parse date strings to Date objects
        const parsedOrders = freshOrders.map((o: Record<string, unknown>) => ({
          ...o,
          registeredDate: new Date(o.registeredDate as string),
          receivedDate: new Date(o.receivedDate as string),
          requiredDate: new Date(o.requiredDate as string),
        }));
        setOrders(parsedOrders);
        lastFetchRef.current = Date.now();
        console.log("[Realtime] Orders refreshed:", parsedOrders.length);
      }
    } catch (error) {
      console.error("[Realtime] Failed to fetch orders:", error);
    }
  }, []);

  // Periodic polling as fallback for missed SSE events (3 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      // Only poll if no recent fetch (avoid double-fetch after reconnect)
      if (timeSinceLastFetch > POLL_INTERVAL - 10000) {
        refetchOrders();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [refetchOrders]);

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

  // Add multiple new orders (for bulk upload)
  const addOrders = useCallback((newOrders: OrderData[]) => {
    setOrders((prev) => {
      // Filter out duplicates by id
      const existingIds = new Set(prev.map((o) => o.id));
      const uniqueNewOrders = newOrders.filter((o) => !existingIds.has(o.id));
      return [...prev, ...uniqueNewOrders];
    });
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
    addOrders,
    removeOrder,
    refetchOrders,
  };
}
