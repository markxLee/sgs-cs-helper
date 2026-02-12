/**
 * Public Orders Page
 *
 * Displays orders split across two tabs:
 * - In Progress: Realtime SSE-powered progress tracking
 * - Completed: Server-side paginated list with undo capability
 *
 * @route /orders
 * @route /orders?tab=completed - Show completed orders
 */

import { CompletedOrders } from "@/components/orders/completed-orders";
import { OrdersHeader } from "@/components/orders/orders-header";
import { RealtimeOrders } from "@/components/orders/realtime-orders";
import type { OrderData } from "@/hooks/use-realtime-progress";
import { getOrders } from "@/lib/actions/order";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";

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

  // Get current session for permission check
  const session = await auth();

  // Compute canMarkDone: SUPER_ADMIN/ADMIN always, STAFF if canUpdateStatus
  const canMarkDone = session?.user
    ? session.user.role === "SUPER_ADMIN" ||
      session.user.role === "ADMIN" ||
      (session.user.role === "STAFF" && session.user.canUpdateStatus === true)
    : false;

  // canUndo uses the same permission as canMarkDone
  const canUndo = canMarkDone;

  // canExport: only ADMIN and SUPER_ADMIN (STAFF excluded)
  const canExport = session?.user
    ? session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
    : false;

  // Fetch in-progress orders only when on that tab (completed tab fetches client-side)
  let initialOrders: OrderData[] = [];
  let inProgressCount = 0;

  if (activeTab === "in-progress") {
    const orders = await getOrders();
    initialOrders = orders.map((order) => ({
      id: order.id,
      jobNumber: order.jobNumber,
      registeredDate: order.registeredDate,
      registeredBy: order.registeredBy,
      receivedDate: order.receivedDate,
      requiredDate: order.requiredDate,
      priority: order.priority,
      sampleCount: order.sampleCount,
      status: order.status,
    }));
    inProgressCount = initialOrders.length;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <OrdersHeader canScan={canMarkDone} />

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
          Đang xử lý
          {activeTab === "in-progress" ? ` (${inProgressCount})` : ""}
        </Link>
        <Link
          href="/orders?tab=completed"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "completed"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Đã hoàn thành
        </Link>
      </div>

      {/* Tab content */}
      {activeTab === "completed" ? (
        <CompletedOrders
          canUndo={canUndo}
          canExport={canExport}
          activeTab={activeTab}
        />
      ) : (
        <RealtimeOrders
          initialOrders={initialOrders}
          activeTab={activeTab}
          canMarkDone={canMarkDone}
        />
      )}
    </div>
  );
}
