/**
 * Excel Export Utility
 *
 * Generates an Excel (.xlsx) buffer from completed orders data.
 * Uses dynamic import for ExcelJS to avoid adding ~500KB to initial bundle.
 *
 * @module lib/excel/export
 */

import type { CompletedOrder } from "@/hooks/use-completed-orders";
import { calcActualDuration } from "@/lib/utils/duration";
import { getPriorityDuration } from "@/lib/utils/progress";

// ============================================================================
// Constants
// ============================================================================

const WORKSHEET_NAME = "Completed Orders";

/** Column definitions — 12 columns (9 per FR-003 + 3 duration/variance per user request) */
const COLUMNS = [
  { header: "Job Number", key: "jobNumber", width: 18 },
  { header: "Registered Date", key: "registeredDate", width: 20 },
  { header: "Registered By", key: "registeredBy", width: 18 },
  { header: "Received Date", key: "receivedDate", width: 20 },
  { header: "Required Date", key: "requiredDate", width: 20 },
  { header: "Priority", key: "priority", width: 10 },
  { header: "Expected (min)", key: "expectedMin", width: 16 },
  { header: "Sample Count", key: "sampleCount", width: 14 },
  { header: "Completed At", key: "completedAt", width: 20 },
  { header: "Completed By", key: "completedBy", width: 18 },
  { header: "Actual (min)", key: "actualMin", width: 14 },
  { header: "Variance (min)", key: "varianceMin", width: 16 },
] as const;

const MS_PER_MINUTE = 1000 * 60;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format an ISO date string to DD/MM/YYYY HH:mm in Vietnamese timezone.
 *
 * Pattern reused from completed-orders-table.tsx for consistency.
 * Returns empty string for null/undefined values.
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(dateString));
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Generate an Excel buffer from completed orders.
 *
 * Dynamically imports ExcelJS to keep it out of the initial bundle.
 * Creates a workbook with one worksheet, 12 columns
 * (9 per FR-003 + 3 duration/variance), bold headers,
 * and formatted dates in vi-VN locale.
 *
 * @param orders - Array of completed orders to export
 * @returns ArrayBuffer suitable for creating a Blob
 */
export async function generateExcelBuffer(
  orders: CompletedOrder[]
): Promise<ArrayBuffer> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(WORKSHEET_NAME);

  // Define columns
  worksheet.columns = COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Bold header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };

  // Add data rows
  for (const order of orders) {
    const expectedMin = Math.round(getPriorityDuration(order.priority) * 60);

    const hasActual = order.receivedDate && order.completedAt;
    const actualMs = hasActual
      ? calcActualDuration(
          new Date(order.receivedDate),
          new Date(order.completedAt!)
        )
      : null;
    const actualMin =
      actualMs !== null ? Math.round(actualMs / MS_PER_MINUTE) : null;

    // Variance: negative = early, positive = late
    const varianceMin = actualMin !== null ? actualMin - expectedMin : null;

    worksheet.addRow({
      jobNumber: order.jobNumber,
      registeredDate: formatDate(order.registeredDate),
      registeredBy: order.registeredBy ?? "",
      receivedDate: formatDate(order.receivedDate),
      requiredDate: formatDate(order.requiredDate),
      priority: order.priority,
      expectedMin,
      sampleCount: order.sampleCount,
      completedAt: formatDate(order.completedAt),
      completedBy: order.completedBy?.name ?? "",
      actualMin: actualMin ?? "",
      varianceMin: varianceMin ?? "",
    });
  }

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}
