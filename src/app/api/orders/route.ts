/**
 * GET /api/orders - Fetch IN_PROGRESS orders
 *
 * Used for polling fallback when SSE events are missed
 * (e.g., after reconnect or in multi-instance environments)
 * 
 * Note: Only returns IN_PROGRESS orders.
 * Completed orders will have a separate endpoint.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "IN_PROGRESS",
      },
      select: {
        id: true,
        jobNumber: true,
        registeredDate: true,
        receivedDate: true,
        requiredDate: true,
        registeredBy: true,
        priority: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
