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
  UnchangedOrder,
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
// Registrant Actions
// ============================================================================

/**
 * Fetch all registrant names from the Registrant table
 *
 * Returns a list of all unique registrant names, sorted alphabetically.
 * Used by filter components to populate dropdown options.
 *
 * @returns Array of registrant names sorted A-Z (case-insensitive)
 * @throws Error if user is not authenticated
 *
 * @example
 * const registrants = await fetchRegistrants();
 * // ["Alice Johnson", "Bob Smith", "Carol Williams"]
 */
export async function fetchRegistrants(): Promise<string[]> {
  try {
    // Auth check - require authenticated user
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized. Please log in.");
    }

    // Fetch all registrants sorted by name
    const registrants = await prisma.registrant.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // Map to array of names
    return registrants.map((r) => r.name);
  } catch (error) {
    console.error("fetchRegistrants error:", error);
    throw error;
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Compare 7 uploadable fields between existing DB order and new input.
 * Returns true if ANY field differs → order needs update.
 *
 * Fields NOT compared (preserved on update):
 * - status, completedAt, sampleCount, description (not in CreateOrderInput)
 * - uploadedAt, uploadedById (metadata — always updated)
 */
function hasOrderChanged(
  existing: Order,
  input: CreateOrderInput
): boolean {
  // Date comparisons (timezone-safe via getTime)
  if (existing.registeredDate.getTime() !== new Date(input.registeredDate).getTime()) return true;
  if (existing.receivedDate.getTime() !== new Date(input.receivedDate).getTime()) return true;
  if (existing.requiredDate.getTime() !== new Date(input.requiredDate).getTime()) return true;

  // Number comparison
  if (existing.priority !== input.priority) return true;

  // Nullable string comparisons (normalize undefined → null)
  if ((existing.registeredBy ?? null) !== (input.registeredBy ?? null)) return true;
  if ((existing.checkedBy ?? null) !== (input.checkedBy ?? null)) return true;
  if ((existing.note ?? null) !== (input.note ?? null)) return true;

  return false;
}

// ============================================================================
// Main Action
// ============================================================================

/**
 * Create or update multiple orders in batch (upsert by jobNumber)
 *
 * Features:
 * - Validates each order with Zod
 * - Case-insensitive jobNumber matching (findFirst + mode: insensitive)
 * - 3-way result: created / updated / unchanged
 * - Preserves status and completedAt on update (FR-003)
 * - Batch wrapped in prisma.$transaction for atomicity (NFR-001)
 * - SSE broadcast for created + updated orders only (NFR-003)
 *
 * @param orders - Array of order inputs
 * @returns BatchCreateResult with created, updated, unchanged, and failed arrays
 *
 * @example
 * const result = await createOrders([order1, order2]);
 * console.log(`Created ${result.created.length}, Updated ${result.updated.length}`);
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
        created: [],
        updated: [],
        unchanged: [],
        failed: orders.map((order) => ({
          input: order,
          error: "Invalid order data structure",
        })),
      };
    }

    const validatedOrders = parseResult.data;

    // Process all orders inside a transaction for atomicity (NFR-001)
    const { created, updated, unchanged, failed } =
      await prisma.$transaction(
        async (tx) => {
          // ============================================================
          // FR-003: Upsert unique registrants from orders into Registrant table
          // ============================================================
          const registrantNames = new Set<string>();
          
          for (const order of validatedOrders) {
            if (order.registeredBy && order.registeredBy.trim().length > 0) {
              registrantNames.add(order.registeredBy);
            }
          }
          
          // Upsert each unique registrant (idempotent)
          for (const name of registrantNames) {
            await tx.registrant.upsert({
              where: { name },
              update: {}, // No updates needed, just ensure exists
              create: { name },
            });
          }
          
          // ============================================================
          // Process orders (create/update/unchanged)
          // ============================================================
          const created: Order[] = [];
          const updated: Order[] = [];
          const unchanged: UnchangedOrder[] = [];
          const failed: BatchCreateResult["failed"] = [];

          for (const orderInput of validatedOrders) {
            try {
              // Case-insensitive lookup (FR-004)
              const existing = await tx.order.findFirst({
                where: {
                  jobNumber: {
                    equals: orderInput.jobNumber,
                    mode: "insensitive",
                  },
                },
              });

              if (!existing) {
                // CREATE — new order
                const order = await tx.order.create({
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
              } else if (hasOrderChanged(existing, orderInput)) {
                // UPDATE — data changed, preserve status + completedAt (FR-003)
                const order = await tx.order.update({
                  where: { id: existing.id },
                  data: {
                    registeredDate: new Date(orderInput.registeredDate),
                    registeredBy: orderInput.registeredBy,
                    receivedDate: new Date(orderInput.receivedDate),
                    checkedBy: orderInput.checkedBy,
                    requiredDate: new Date(orderInput.requiredDate),
                    priority: orderInput.priority,
                    note: orderInput.note,
                    // status — NOT updated (preserved)
                    // completedAt — NOT updated (preserved)
                  },
                });
                updated.push(order);
              } else {
                // UNCHANGED — no data changes, no metadata to refresh
                unchanged.push({
                  jobNumber: existing.jobNumber,
                  order: existing,
                  reason: "All fields identical",
                });
              }
            } catch (error) {
              console.error("[createOrders] Error processing order:", error);
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              failed.push({
                input: orderInput,
                error: errorMessage,
              });
            }
          }

          return { created, updated, unchanged, failed };
        },
        { timeout: 10000 }
      );

    // Broadcast SSE events for created + updated orders only (NFR-003)
    const changedOrders = [...created, ...updated];
    if (changedOrders.length > 0) {
      try {
        broadcastBulkUpdate(changedOrders);
      } catch (sseError) {
        // Log SSE error but don't fail the main operation
        console.error(
          "[createOrders] Failed to broadcast SSE events:",
          sseError
        );
      }
    }

    return { created, updated, unchanged, failed };
  } catch (error) {
    // Top-level error (auth, transaction failure, etc.)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      created: [],
      updated: [],
      unchanged: [],
      failed: orders.map((order) => ({
        input: order,
        error: errorMessage,
      })),
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
