import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { broadcastOrderUpdate } from "@/lib/sse/broadcaster";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ------------------------------------------------------------------
    // 1. Auth check
    // ------------------------------------------------------------------
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------------
    // 2. Permission check (same as mark-done)
    // ------------------------------------------------------------------
    const { role, canUpdateStatus } = session.user;

    const isAuthorized =
      role === "SUPER_ADMIN" ||
      role === "ADMIN" ||
      (role === "STAFF" && canUpdateStatus === true);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to update order status" },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------------
    // 3. Verify order exists and is COMPLETED
    // ------------------------------------------------------------------
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, jobNumber: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Order is not completed" },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------
    // 4. Revert status to IN_PROGRESS + clear completedAt
    // ------------------------------------------------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "IN_PROGRESS",
        completedAt: null,
      },
      select: {
        id: true,
        jobNumber: true,
        registeredDate: true,
        registeredBy: true,
        receivedDate: true,
        requiredDate: true,
        priority: true,
        status: true,
        completedAt: true,
      },
    });

    // ------------------------------------------------------------------
    // 5. Broadcast SSE so In-Progress tab picks up the order
    // ------------------------------------------------------------------
    try {
      broadcastOrderUpdate(updatedOrder);
    } catch (sseError) {
      console.error("Failed to broadcast SSE event:", sseError);
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error undoing order completion:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
