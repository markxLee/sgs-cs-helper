import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const DEFAULT_SORT_FIELD = "completedAt";
const DEFAULT_SORT_DIR = "desc";

/** Allowed sort fields to prevent arbitrary column access */
const ALLOWED_SORT_FIELDS = new Set([
  "completedAt",
  "registeredDate",
  "requiredDate",
  "completedBy",
]);

/** Fields returned to client */
const ORDER_SELECT = {
  id: true,
  jobNumber: true,
  registeredDate: true,
  registeredBy: true,
  receivedDate: true,
  requiredDate: true,
  priority: true,
  status: true,
  completedAt: true,
  completedById: true,
  completedBy: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.OrderSelect;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse a positive integer from a query param string.
 * Returns `fallback` when the value is missing, non-numeric, or ≤ 0.
 */
function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// ============================================================================
// GET /api/orders/completed
// ============================================================================

/**
 * Paginated Completed Orders API
 *
 * Returns completed orders with server-side pagination, search, filter, sort.
 *
 * Query params:
 * - page      (default 1)
 * - limit     (default 50)
 * - search    (partial match on jobNumber, case-insensitive)
 * - registeredBy (exact match filter)
 * - dateFrom  (ISO date, requiredDate >= dateFrom)
 * - dateTo    (ISO date, requiredDate <= dateTo)
 * - sortField (completedAt | registeredDate | requiredDate)
 * - sortDir   (asc | desc)
 *
 * @route GET /api/orders/completed
 */
export async function GET(request: NextRequest) {
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
    // 2. Parse query params
    // ------------------------------------------------------------------
    const { searchParams } = request.nextUrl;

    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
    const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
    const search = searchParams.get("search")?.trim() || undefined;
    const registeredBy = searchParams.get("registeredBy")?.trim() || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const completedById =
      searchParams.get("completedById")?.trim() || undefined;

    const rawSortField = searchParams.get("sortField") || DEFAULT_SORT_FIELD;
    const sortField = ALLOWED_SORT_FIELDS.has(rawSortField)
      ? rawSortField
      : DEFAULT_SORT_FIELD;

    const rawSortDir = searchParams.get("sortDir");
    const sortDir: "asc" | "desc" =
      rawSortDir === "asc" ? "asc" : DEFAULT_SORT_DIR;

    // ------------------------------------------------------------------
    // 3. Build Prisma where clause
    // ------------------------------------------------------------------
    const where: Prisma.OrderWhereInput = {
      status: "COMPLETED",
    };

    // Search: partial match on jobNumber (case-insensitive)
    if (search) {
      where.jobNumber = { contains: search, mode: "insensitive" };
    }

    // Filter: exact match on registeredBy
    if (registeredBy) {
      where.registeredBy = registeredBy;
    }

    // Filter: exact match on completedById
    if (completedById) {
      where.completedById = completedById;
    }

    // Filter: date range on requiredDate
    if (dateFrom || dateTo) {
      where.requiredDate = {};
      if (dateFrom) {
        where.requiredDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.requiredDate.lte = new Date(dateTo);
      }
    }

    // ------------------------------------------------------------------
    // 4. Fetch data + count in parallel
    // ------------------------------------------------------------------
    const skip = (page - 1) * limit;

    const orderBy =
      sortField === "completedBy"
        ? { completedBy: { name: sortDir } }
        : { [sortField]: sortDir };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: orderBy as Prisma.OrderOrderByWithRelationInput,
        skip,
        take: limit,
        select: ORDER_SELECT,
      }),
      prisma.order.count({ where }),
    ]);

    // ------------------------------------------------------------------
    // 5. Return paginated response
    // ------------------------------------------------------------------
    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
