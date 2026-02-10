import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ============================================================================
// Validation
// ============================================================================

const lookupSchema = z.object({
  jobNumber: z
    .string()
    .min(1, "Job number is required")
    .max(50, "Job number too long")
    .transform((v) => v.trim()),
});

// ============================================================================
// GET /api/orders/lookup?jobNumber=xxx
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Permission check: same as mark-done
    const { role, canUpdateStatus } = session.user;
    const isAuthorized =
      role === "SUPER_ADMIN" ||
      role === "ADMIN" ||
      (role === "STAFF" && canUpdateStatus === true);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to look up orders" },
        { status: 403 }
      );
    }

    // Parse and validate query parameter
    const { searchParams } = new URL(request.url);
    const rawJobNumber = searchParams.get("jobNumber");

    const result = lookupSchema.safeParse({ jobNumber: rawJobNumber });
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0]?.message ?? "Invalid job number",
        },
        { status: 400 }
      );
    }

    const { jobNumber } = result.data;

    // Look up order by job number (case-insensitive)
    const order = await prisma.order.findFirst({
      where: {
        jobNumber: {
          equals: jobNumber,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        jobNumber: true,
        status: true,
        registeredDate: true,
        registeredBy: true,
        receivedDate: true,
        requiredDate: true,
        priority: true,
        completedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error looking up order:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
