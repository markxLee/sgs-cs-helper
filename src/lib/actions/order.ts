"use server";

/**
 * Server Actions for order operations
 *
 * @module lib/actions/order
 * @description Handles batch order creation with Zod validation
 */

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";
import type {
  CreateOrderInput,
  BatchCreateResult,
  FailedOrder,
} from "@/lib/excel/types";
import type { Order } from "@/generated/prisma/client";
import { broadcastBulkUpdate } from "@/lib/sse/broadcaster";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for validating a single order input
 */
const createOrderSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
  registeredDate: z.string().datetime({ message: "Invalid registration date" }),
  registeredBy: z.string().optional(),
  receivedDate: z.string().datetime({ message: "Invalid received date" }),
  checkedBy: z.string().optional(),
  requiredDate: z.string().datetime({ message: "Invalid required date" }),
  priority: z.number().int().min(0, "Priority must be non-negative"),
  note: z.string().optional(),
  sourceFileName: z.string().min(1, "Source file name is required"),
});

/**
 * Schema for validating array of orders
 */
const createOrdersSchema = z
  .array(createOrderSchema)
  .min(1, "At least one order is required");

// ============================================================================
// Auth Helper
// ============================================================================

/**
 * Require upload permission for order creation
 *
 * @throws Error for unauthorized access
 * @returns Session if authorized
 */
async function requireUploadPermission(): Promise<Session> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized. Please log in.");
  }

  const { role, canUpload } = session.user;

  // SUPER_ADMIN and ADMIN have full access
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return session;
  }

  // STAFF needs canUpload permission
  if (role === "STAFF" && canUpload === true) {
    return session;
  }

  throw new Error("You do not have permission to create orders.");
}

// ============================================================================
// Main Action
// ============================================================================

/**
 * Create multiple orders in batch
 *
 * Features:
 * - Validates each order with Zod
 * - Handles partial failures (some succeed, some fail)
 * - Returns detailed results for each order
 *
 * @param orders - Array of order inputs
 * @returns BatchCreateResult with created and failed orders
 *
 * @example
 * const result = await createOrders([order1, order2]);
 * if (result.success) {
 *   console.log(`Created ${result.created.length} orders`);
 * }
 */
export async function createOrders(
  orders: CreateOrderInput[]
): Promise<BatchCreateResult> {
  try {
    // Auth check
    const session = await requireUploadPermission();
    const userId = session.user.id;

    // Validate array structure
    const parseResult = createOrdersSchema.safeParse(orders);
    if (!parseResult.success) {
      return {
        success: false,
        created: [],
        failed: orders.map((order) => ({
          order,
          error: "Invalid order data structure",
        })),
        message: parseResult.error.message,
      };
    }

    const validatedOrders = parseResult.data;
    const created: Order[] = [];
    const failed: FailedOrder[] = [];

    // Process each order individually for better error handling
    for (const orderInput of validatedOrders) {
      try {
        // Check for duplicate job number
        const existing = await prisma.order.findUnique({
          where: { jobNumber: orderInput.jobNumber },
        });

        if (existing) {
          failed.push({
            order: orderInput,
            error: `Duplicate job number: ${orderInput.jobNumber} already exists`,
          });
          continue;
        }

        // Create the order
        console.log("[createOrders] Creating order:", JSON.stringify(orderInput, null, 2));
        const order = await prisma.order.create({
          data: {
            jobNumber: orderInput.jobNumber,
            registeredDate: new Date(orderInput.registeredDate),
            registeredBy: orderInput.registeredBy,
            receivedDate: new Date(orderInput.receivedDate),
            checkedBy: orderInput.checkedBy,
            requiredDate: new Date(orderInput.requiredDate),
            priority: orderInput.priority,
            note: orderInput.note,
            uploadedById: userId,
          },
        });

        created.push(order);
      } catch (error) {
        console.error("[createOrders] Error creating order:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        failed.push({
          order: orderInput,
          error: message,
        });
      }
    }

    // Build result
    const allSuccess = failed.length === 0;
    const message = allSuccess
      ? `Successfully created ${created.length} order(s)`
      : `Created ${created.length} order(s), ${failed.length} failed`;

    // Broadcast SSE events for created orders
    if (created.length > 0) {
      try {
        broadcastBulkUpdate(created);
      } catch (sseError) {
        // Log SSE error but don't fail the main operation
        console.error("[createOrders] Failed to broadcast SSE events:", sseError);
      }
    }

    return {
      success: allSuccess,
      created,
      failed,
      message,
    };
  } catch (error) {
    // Top-level error (auth, etc.)
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      created: [],
      failed: orders.map((order) => ({
        order,
        error: message,
      })),
      message,
    };
  }
}

// ============================================================================
// Public Read Actions
// ============================================================================

/**
 * Fetch IN_PROGRESS orders for the orders page
 *
 * This function is used by the /orders page (In Progress tab).
 * No authentication required - read-only access.
 * 
 * Note: Only returns IN_PROGRESS orders.
 * Completed orders will have a separate function.
 *
 * @returns Array of IN_PROGRESS orders sorted by requiredDate ascending
 *
 * @example
 * const orders = await getOrders();
 * // Returns IN_PROGRESS orders sorted by requiredDate (earliest first)
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "IN_PROGRESS",
      },
      orderBy: {
        requiredDate: "asc",
      },
    });

    return orders;
  } catch (error) {
    console.error("[getOrders] Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Note: Zod schemas are NOT exported from "use server" files
// They must stay internal to this module
