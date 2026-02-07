import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { broadcastOrderUpdate } from "@/lib/sse/broadcaster";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { role, canUpdateStatus } = session.user;

    // Permission check: SUPER_ADMIN and ADMIN always allowed
    // STAFF only allowed if canUpdateStatus is true
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

    const { id: orderId } = await params;

    // Check if order exists and is in progress
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

    if (order.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { success: false, error: "Order is not in progress" },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      select: {
        id: true,
        jobNumber: true,
        registeredDate: true,
        receivedDate: true,
        requiredDate: true,
        priority: true,
        status: true,
        completedAt: true,
      },
    });

    // Broadcast SSE event to all connected clients
    try {
      broadcastOrderUpdate(updatedOrder);
    } catch (sseError) {
      // Log SSE error but don't fail the main operation
      console.error("Failed to broadcast SSE event:", sseError);
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error marking order as done:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}