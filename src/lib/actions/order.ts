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

const createSampleSchema = z.object({
  section: z.string().nullable(),
  sampleId: z.string().min(1),
  description: z.string().nullable(),
  analyte: z.string().nullable(),
  method: z.string().nullable(),
  lod: z.string().nullable(),
  loq: z.string().nullable(),
  unit: z.string().nullable(),
  requiredDate: z.string().nullable(),
});

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
  sampleCount: z.number().int().min(0).default(0),
  samples: z.array(createSampleSchema).default([]),
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
 * Optimized flow:
 * 1. Auth + Zod validation
 * 2. Upsert registrants (outside transaction — idempotent, no rollback needed)
 * 3. Batch lookup existing orders by jobNumber array (1 query)
 * 4. Categorize: new / changed / unchanged
 * 5. Transaction: createManyAndReturn for new, batch update promises for changed
 * 6. SSE broadcast for created + updated
 *
 * @param orders - Array of order inputs
 * @returns BatchCreateResult with created, updated, unchanged, and failed arrays
 */
export async function createOrders(
  orders: CreateOrderInput[]
): Promise<BatchCreateResult> {
  try {
    // 1. Auth check
    const session = await requireUploadPermission();
    const userId = session.user.id;

    // 2. Validate array structure
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

    // 3. Upsert registrants OUTSIDE transaction (idempotent, safe to retry)
    const registrantNames = [
      ...new Set(
        validatedOrders
          .map((o) => o.registeredBy?.trim())
          .filter((name): name is string => !!name && name.length > 0)
      ),
    ];

    if (registrantNames.length > 0) {
      await prisma.registrant.createMany({
        data: registrantNames.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    // 4. Deduplicate input by jobNumber (case-insensitive, keep last occurrence)
    const deduped = new Map<string, CreateOrderInput>();
    for (const order of validatedOrders) {
      deduped.set(order.jobNumber.toLowerCase(), order);
    }
    const uniqueOrders = [...deduped.values()];

    // 5. Batch lookup existing orders — 1 query instead of N
    const jobNumbers = uniqueOrders.map((o) => o.jobNumber);
    const existingOrders = await prisma.order.findMany({
      where: {
        jobNumber: { in: jobNumbers, mode: "insensitive" },
      },
    });

    // Build lookup map (lowercase key for case-insensitive matching)
    const existingMap = new Map<string, Order>(
      existingOrders.map((o) => [o.jobNumber.toLowerCase(), o])
    );

    // 6. Categorize orders
    const toCreate: CreateOrderInput[] = [];
    const toUpdate: { existing: Order; input: CreateOrderInput }[] = [];
    const unchanged: UnchangedOrder[] = [];
    const failed: BatchCreateResult["failed"] = [];

    for (const input of uniqueOrders) {
      const existing = existingMap.get(input.jobNumber.toLowerCase());

      if (!existing) {
        toCreate.push(input);
      } else if (hasOrderChanged(existing, input)) {
        toUpdate.push({ existing, input });
      } else {
        unchanged.push({
          jobNumber: existing.jobNumber,
          order: existing,
          reason: "All fields identical",
        });
      }
    }

    // 7. Execute writes in transaction (only actual DB mutations)
    let created: Order[] = [];
    let updated: Order[] = [];

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        // Batch create — 1 query for all new orders
        let txCreated: Order[] = [];
        if (toCreate.length > 0) {
          txCreated = await tx.order.createManyAndReturn({
            data: toCreate.map((input) => ({
              jobNumber: input.jobNumber,
              registeredDate: new Date(input.registeredDate),
              registeredBy: input.registeredBy,
              receivedDate: new Date(input.receivedDate),
              checkedBy: input.checkedBy,
              requiredDate: new Date(input.requiredDate),
              priority: input.priority,
              note: input.note,
              sampleCount: input.sampleCount ?? 0,
              uploadedById: userId,
            })),
          });

          // Create samples for new orders
          for (const created of txCreated) {
            const matchingInput = toCreate.find(
              (i) => i.jobNumber.toLowerCase() === created.jobNumber.toLowerCase()
            );
            if (matchingInput?.samples && matchingInput.samples.length > 0) {
              await tx.orderSample.createMany({
                data: matchingInput.samples.map((s) => ({
                  orderId: created.id,
                  section: s.section,
                  sampleId: s.sampleId,
                  description: s.description,
                  analyte: s.analyte,
                  method: s.method,
                  lod: s.lod,
                  loq: s.loq,
                  unit: s.unit,
                  requiredDate: s.requiredDate,
                })),
              });
            }
          }
        }

        // Batch update — parallel promises in 1 transaction round-trip
        let txUpdated: Order[] = [];
        if (toUpdate.length > 0) {
          txUpdated = await Promise.all(
            toUpdate.map(async ({ existing, input }) => {
              const updatedOrder = await tx.order.update({
                where: { id: existing.id },
                data: {
                  registeredDate: new Date(input.registeredDate),
                  registeredBy: input.registeredBy,
                  receivedDate: new Date(input.receivedDate),
                  checkedBy: input.checkedBy,
                  requiredDate: new Date(input.requiredDate),
                  priority: input.priority,
                  note: input.note,
                  sampleCount: input.sampleCount ?? 0,
                },
              });

              // Delete old samples + create new (upsert strategy)
              await tx.orderSample.deleteMany({
                where: { orderId: existing.id },
              });
              if (input.samples && input.samples.length > 0) {
                await tx.orderSample.createMany({
                  data: input.samples.map((s) => ({
                    orderId: existing.id,
                    section: s.section,
                    sampleId: s.sampleId,
                    description: s.description,
                    analyte: s.analyte,
                    method: s.method,
                    lod: s.lod,
                    loq: s.loq,
                    unit: s.unit,
                    requiredDate: s.requiredDate,
                  })),
                });
              }

              return updatedOrder;
            })
          );
        }

        // For unchanged orders: still replace samples + update sampleCount
        if (unchanged.length > 0) {
          await Promise.all(
            unchanged.map(async (uo) => {
              const matchingInput = uniqueOrders.find(
                (i) => i.jobNumber.toLowerCase() === uo.jobNumber.toLowerCase()
              );
              if (!matchingInput) return;

              // Update sampleCount
              await tx.order.update({
                where: { id: uo.order.id },
                data: { sampleCount: matchingInput.sampleCount ?? 0 },
              });

              // Delete old samples + create new
              await tx.orderSample.deleteMany({
                where: { orderId: uo.order.id },
              });
              if (matchingInput.samples && matchingInput.samples.length > 0) {
                await tx.orderSample.createMany({
                  data: matchingInput.samples.map((s) => ({
                    orderId: uo.order.id,
                    section: s.section,
                    sampleId: s.sampleId,
                    description: s.description,
                    analyte: s.analyte,
                    method: s.method,
                    lod: s.lod,
                    loq: s.loq,
                    unit: s.unit,
                    requiredDate: s.requiredDate,
                  })),
                });
              }
            })
          );
        }

        return { created: txCreated, updated: txUpdated };
      }, { timeout: 10000 });

      created = txResult.created;
      updated = txResult.updated;
    } catch (txError) {
      // Transaction failed — summarize which jobNumbers were affected
      const affectedJobs = [
        ...toCreate.map((o) => o.jobNumber),
        ...toUpdate.map((o) => o.input.jobNumber),
      ];
      const summary =
        txError instanceof Error ? txError.message : "Transaction failed";
      // Extract short reason (e.g. "Unique constraint failed on jobNumber")
      const shortReason = summary.includes("Unique constraint")
        ? "Trùng jobNumber trong DB"
        : summary.slice(0, 100);

      for (const jobNumber of affectedJobs) {
        const matchedInput = uniqueOrders.find(
          (o) => o.jobNumber.toLowerCase() === jobNumber.toLowerCase()
        );
        if (matchedInput) {
          failed.push({
            input: matchedInput,
            error: shortReason,
          });
        }
      }
    }

    // 8. SSE broadcast for created + updated only
    const changedOrders = [...created, ...updated];
    if (changedOrders.length > 0) {
      try {
        broadcastBulkUpdate(changedOrders);
      } catch (sseError) {
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
