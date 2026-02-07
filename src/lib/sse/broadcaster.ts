/**
 * SSE Event Broadcaster
 *
 * Helper module to broadcast order events to all connected SSE clients.
 * Import and use this in server actions when orders are modified.
 *
 * @module lib/sse/broadcaster
 */

import { broadcastOrderEvent } from "@/app/api/orders/sse/route";
import type { Order } from "@/generated/prisma/client";

// ============================================================================
// Types
// ============================================================================

type OrderData = Pick<
  Order,
  | "id"
  | "jobNumber"
  | "registeredDate"
  | "receivedDate"
  | "requiredDate"
  | "priority"
  | "status"
>;

// ============================================================================
// Broadcast Functions
// ============================================================================

/**
 * Broadcast when an order status is updated
 */
export function broadcastOrderUpdate(order: OrderData): void {
  broadcastOrderEvent({
    type: "update",
    data: {
      id: order.id,
      jobNumber: order.jobNumber,
      registeredDate: order.registeredDate.toISOString(),
      receivedDate: order.receivedDate.toISOString(),
      requiredDate: order.requiredDate.toISOString(),
      priority: order.priority,
      status: order.status,
    },
  });
}

/**
 * Broadcast when a new order is added
 */
export function broadcastOrderAdd(order: OrderData): void {
  broadcastOrderEvent({
    type: "add",
    data: {
      id: order.id,
      jobNumber: order.jobNumber,
      registeredDate: order.registeredDate.toISOString(),
      receivedDate: order.receivedDate.toISOString(),
      requiredDate: order.requiredDate.toISOString(),
      priority: order.priority,
      status: order.status,
    },
  });
}

/**
 * Broadcast when an order is removed
 */
export function broadcastOrderRemove(orderId: string): void {
  broadcastOrderEvent({
    type: "remove",
    data: orderId,
  });
}

/**
 * Broadcast bulk update (e.g., after Excel upload)
 */
export function broadcastBulkUpdate(orders: OrderData[]): void {
  broadcastOrderEvent({
    type: "bulk",
    data: orders.map((order) => ({
      id: order.id,
      jobNumber: order.jobNumber,
      registeredDate: order.registeredDate.toISOString(),
      receivedDate: order.receivedDate.toISOString(),
      requiredDate: order.requiredDate.toISOString(),
      priority: order.priority,
      status: order.status,
    })),
  });
}
