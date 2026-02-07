import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

const getAuditLogsSchema = z.object({
  adminId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  result: z.enum(["SUCCESS", "FAILURE"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Only Super Admin can view audit logs" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const adminIdParam = searchParams.get("adminId");
    const resultParam = searchParams.get("result");
    const params = {
      adminId: (adminIdParam && adminIdParam !== "") ? adminIdParam : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      result: (resultParam && resultParam !== "") ? (resultParam as "SUCCESS" | "FAILURE") : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    // Validate input
    const validatedParams = getAuditLogsSchema.parse(params);

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    if (validatedParams.adminId) {
      where.userId = validatedParams.adminId;
    }

    if (validatedParams.result) {
      where.result = validatedParams.result;
    }

    if (validatedParams.startDate || validatedParams.endDate) {
      where.timestamp = {};
      if (validatedParams.startDate) {
        where.timestamp.gte = new Date(validatedParams.startDate);
      }
      if (validatedParams.endDate) {
        // Set end date to end of day
        const endDate = new Date(validatedParams.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.timestamp.lte = endDate;
      }
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    // Get audit logs with user info
    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip: (validatedParams.page - 1) * validatedParams.limit,
      take: validatedParams.limit,
    });

    const totalPages = Math.ceil(total / validatedParams.limit);

    return NextResponse.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
          hasNext: validatedParams.page < totalPages,
          hasPrev: validatedParams.page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}