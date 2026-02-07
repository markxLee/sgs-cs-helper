/**
 * Hook for Server-Sent Events subscription
 *
 * Subscribes to SSE endpoint and handles order updates in realtime.
 *
 * @module hooks/use-order-sse
 */

"use client";

import { useEffect, useCallback, useRef } from "react";
import type { OrderData } from "./use-realtime-progress";

// ============================================================================
// Types
// ============================================================================

export type SSEEventType = "update" | "add" | "remove" | "bulk";

export interface SSEOrderEvent {
  type: SSEEventType;
  data: OrderData | OrderData[] | string; // string for remove (orderId)
}

interface UseOrderSSEOptions {
  onUpdate?: (order: OrderData) => void;
  onAdd?: (order: OrderData) => void;
  onRemove?: (orderId: string) => void;
  onBulkUpdate?: (orders: OrderData[]) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  /** Called after reconnect to refetch latest data (polling fallback) */
  onReconnectRefresh?: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that subscribes to Server-Sent Events for order updates
 *
 * @param options - Callbacks for different event types
 * @returns Connection status and manual reconnect function
 *
 * @example
 * useOrderSSE({
 *   onUpdate: (order) => updateOrder(order),
 *   onAdd: (order) => addOrder(order),
 * });
 */
export function useOrderSSE(options: UseOrderSSEOptions) {
  const {
    onUpdate,
    onAdd,
    onRemove,
    onBulkUpdate,
    onError,
    onConnect,
    onDisconnect,
    onReconnectRefresh,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const hasConnectedOnce = useRef(false);

  // Store callbacks in refs to avoid recreating connect function
  const callbacksRef = useRef({
    onUpdate,
    onAdd,
    onRemove,
    onBulkUpdate,
    onError,
    onConnect,
    onDisconnect,
    onReconnectRefresh,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onUpdate,
      onAdd,
      onRemove,
      onBulkUpdate,
      onError,
      onConnect,
      onDisconnect,
      onReconnectRefresh,
    };
  }, [onUpdate, onAdd, onRemove, onBulkUpdate, onError, onConnect, onDisconnect, onReconnectRefresh]);

  // Parse date fields from JSON
  const parseOrderDates = useCallback((order: unknown): OrderData => {
    const o = order as {
      id: string;
      jobNumber: string;
      registeredDate: string;
      receivedDate: string;
      requiredDate: string;
      priority: number;
      status: string;
    };
    return {
      id: o.id,
      jobNumber: o.jobNumber,
      registeredDate: new Date(o.registeredDate),
      receivedDate: new Date(o.receivedDate),
      requiredDate: new Date(o.requiredDate),
      priority: o.priority,
      status: o.status,
    } as OrderData;
  }, []);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    // Don't connect if already connected
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    // Close existing connection
    disconnect();

    const eventSource = new EventSource("/api/orders/sse");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      reconnectAttempts.current = 0;
      callbacksRef.current.onConnect?.();
      
      // Trigger refetch after reconnect (not on first connect)
      if (hasConnectedOnce.current) {
        console.log("[SSE] Reconnected - triggering data refresh");
        callbacksRef.current.onReconnectRefresh?.();
      }
      hasConnectedOnce.current = true;
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed: SSEOrderEvent = JSON.parse(event.data);
        const callbacks = callbacksRef.current;
        console.log("Received SSE event:", parsed);
        switch (parsed.type) {
          case "update":
            if (parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
              callbacks.onUpdate?.(parseOrderDates(parsed.data));
            }
            break;

          case "add":
            if (parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
              callbacks.onAdd?.(parseOrderDates(parsed.data));
            }
            break;

          case "remove":
            if (typeof parsed.data === "string") {
              callbacks.onRemove?.(parsed.data);
            }
            break;

          case "bulk":
            if (Array.isArray(parsed.data)) {
              callbacks.onBulkUpdate?.(parsed.data.map((o) => parseOrderDates(o)));
            }
            break;
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      callbacksRef.current.onError?.(error);
      callbacksRef.current.onDisconnect?.();

      // Attempt to reconnect with exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;

      // Schedule reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        // Reconnect by creating new EventSource
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        const newEventSource = new EventSource("/api/orders/sse");
        eventSourceRef.current = newEventSource;

        newEventSource.onopen = () => {
          reconnectAttempts.current = 0;
          callbacksRef.current.onConnect?.();
          
          // Trigger refetch after reconnect
          console.log("[SSE] Reconnected - triggering data refresh");
          callbacksRef.current.onReconnectRefresh?.();
        };

        newEventSource.onmessage = eventSource.onmessage;
        newEventSource.onerror = eventSource.onerror;
      }, backoffMs);
    };
  }, [disconnect, parseOrderDates]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    reconnect: connect,
    disconnect,
  };
}
