/**
 * Public Orders Page
 *
 * Displays all orders with progress bars.
 * No authentication required - public read-only access.
 *
 * Features:
 * - Client-side realtime progress calculation (updates every minute)
 * - SSE subscription for status changes from other users
 *
 * @route /orders
 * @route /orders?tab=completed - Show completed orders
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getOrders } from "@/lib/actions/order";
import { RealtimeOrders } from "@/components/orders/realtime-orders";
import type { OrderData } from "@/hooks/use-realtime-progress";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Orders | SGS CS Helper",
  description: "View all laboratory orders and their progress status",
};

// ============================================================================
// Types
// ============================================================================

interface OrdersPageProps {
  searchParams: Promise<{ tab?: string }>;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const activeTab = params.tab === "completed" ? "completed" : "in-progress";

  // Fetch all orders from database (initial data)
  const orders = await getOrders();

  // Convert to plain data for client component
  const initialOrders: OrderData[] = orders.map((order) => ({
    id: order.id,
    jobNumber: order.jobNumber,
    registeredDate: order.registeredDate,
    receivedDate: order.receivedDate,
    requiredDate: order.requiredDate,
    priority: order.priority,
    status: order.status,
  }));

  // Count for tabs (server-side initial counts)
  const inProgressCount = orders.filter(
    (order) => order.status !== "COMPLETED"
  ).length;
  const completedCount = orders.filter(
    (order) => order.status === "COMPLETED"
  ).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          View all laboratory orders and their progress status
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <Link
          href="/orders"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "in-progress"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          In Progress ({inProgressCount})
        </Link>
        <Link
          href="/orders?tab=completed"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "completed"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Completed ({completedCount})
        </Link>
      </div>

      {/* Realtime orders with client-side progress calculation and SSE */}
      <RealtimeOrders initialOrders={initialOrders} activeTab={activeTab} />
    </div>
  );
}
