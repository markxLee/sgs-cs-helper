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

export type GetAuditLogsParams = z.infer<typeof getAuditLogsSchema>;

export type AuditLogWithUser = {
  id: string;
  timestamp: Date;
  result: "SUCCESS" | "FAILURE";
  ip: string | null;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};

/**
 * Get audit logs with filtering and pagination
 * Only accessible to SUPER_ADMIN users
 */
export async function getAuditLogs(params: GetAuditLogsParams) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "Unauthorized: Only Super Admin can view audit logs",
      };
    }

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

    return {
      success: true,
      data: {
        auditLogs: auditLogs as AuditLogWithUser[],
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
          hasNext: validatedParams.page < totalPages,
          hasPrev: validatedParams.page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of admin users for filter dropdown
 * Only accessible to SUPER_ADMIN users
 */
export async function getAdminUsers() {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        email: "asc",
      },
    });

    return {
      success: true,
      data: admins,
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}