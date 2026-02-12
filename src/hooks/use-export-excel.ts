/**
 * Hook for exporting completed orders to Excel
 *
 * Manages the entire export flow:
 * 1. Batch fetch data via existing paginated API
 * 2. Track progress across batches
 * 3. Generate Excel buffer via generateExcelBuffer()
 * 4. Trigger browser download
 * 5. Handle errors with Sonner toast
 * 6. Support abort on unmount
 *
 * @module hooks/use-export-excel
 */

"use client";

import type { CompletedOrder } from "@/hooks/use-completed-orders";
import { generateExcelBuffer } from "@/lib/excel/export";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Constants
// ============================================================================

/**
 * Number of orders to fetch per batch page.
 * 150 balances round-trip count vs Vercel serverless timeout/payload limits.
 */
const EXPORT_BATCH_SIZE = 150;

// ============================================================================
// Types
// ============================================================================

export interface ExportExcelParams {
  search: string;
  registeredBy: string[];
  dateFrom: string;
  dateTo: string;
  sortField: string;
  sortDir: "asc" | "desc";
}

export interface UseExportExcelReturn {
  exportExcel: () => void;
  isExporting: boolean;
  progress: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build the API URL for a batch page fetch.
 */
function buildFetchUrl(params: ExportExcelParams, page: number): string {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(EXPORT_BATCH_SIZE));

  if (params.search) query.set("search", params.search);
  if (params.registeredBy.length > 0) {
    query.set("registeredBy", params.registeredBy.join(","));
  }
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.sortField) query.set("sortField", params.sortField);
  if (params.sortDir) query.set("sortDir", params.sortDir);

  return `/api/orders/completed?${query.toString()}`;
}

/**
 * Trigger a browser download from an ArrayBuffer.
 * Creates a temporary <a> element, clicks it, then cleans up.
 */
function triggerDownload(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook for exporting completed orders to Excel.
 *
 * Fetches all matching orders in sequential batches, generates an Excel file
 * client-side, and triggers a download. Progress is tracked as a percentage.
 *
 * @param params - Current search/filter/sort state to respect during export
 * @returns exportExcel function, isExporting flag, and progress (0-100)
 */
export function useExportExcel(
  params: ExportExcelParams
): UseExportExcelReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isExportingRef = useRef(false);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const exportExcel = useCallback(async () => {
    // Prevent double-click
    if (isExportingRef.current) return;

    isExportingRef.current = true;
    setIsExporting(true);
    setProgress(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // --- Fetch page 1 to get total count and first batch ---
      const firstResponse = await fetch(buildFetchUrl(params, 1), {
        signal: controller.signal,
      });

      if (!firstResponse.ok) {
        throw new Error(`HTTP ${firstResponse.status}`);
      }

      const firstData = (await firstResponse.json()) as {
        orders: CompletedOrder[];
        total: number;
        page: number;
        totalPages: number;
      };

      // EC-001: No matching orders
      if (firstData.total === 0) {
        toast.info("No orders to export");
        return;
      }

      const allOrders: CompletedOrder[] = [...firstData.orders];
      const totalPages = firstData.totalPages;

      // Update progress after first page
      setProgress(Math.round((1 / totalPages) * 100));

      // --- Fetch remaining pages sequentially ---
      for (let page = 2; page <= totalPages; page++) {
        if (controller.signal.aborted) return;

        const response = await fetch(buildFetchUrl(params, page), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          orders: CompletedOrder[];
        };

        allOrders.push(...data.orders);
        setProgress(Math.round((page / totalPages) * 100));
      }

      // --- Generate Excel buffer ---
      let buffer: ArrayBuffer;
      try {
        buffer = await generateExcelBuffer(allOrders);
      } catch (genError: unknown) {
        console.error("Excel generation failed:", genError);
        toast.error("Failed to generate Excel file.");
        return;
      }

      // --- Trigger download ---
      const filename = `completed-orders-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      triggerDownload(buffer, filename);
    } catch (error: unknown) {
      // Ignore abort errors (expected on unmount / navigation)
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  }, [params]);

  return { exportExcel, isExporting, progress };
}
