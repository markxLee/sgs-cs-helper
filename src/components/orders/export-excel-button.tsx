/**
 * Export Excel Button Component
 *
 * Renders an "Export Excel" button with progress indicator.
 * Only visible to users with export permission (Admin/Super Admin).
 *
 * @module components/orders/export-excel-button
 */

"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useExportExcel,
  type ExportExcelParams,
} from "@/hooks/use-export-excel";
import { Download } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ExportExcelButtonProps extends ExportExcelParams {
  /** Whether the current user has permission to export */
  canExport: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ExportExcelButton({
  canExport,
  search,
  registeredBy,
  dateFrom,
  dateTo,
  sortField,
  sortDir,
}: ExportExcelButtonProps) {
  const { exportExcel, isExporting, progress } = useExportExcel({
    search,
    registeredBy,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  });

  // FR-001: Only Admin/Super Admin can see this button
  if (!canExport) return null;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={isExporting}
        onClick={exportExcel}
        aria-label="Export completed orders to Excel"
      >
        <Download className="mr-1 h-4 w-4" />
        {isExporting ? "Exporting..." : "Export Excel"}
      </Button>
      {isExporting && <Progress value={progress} className="h-2 w-full" />}
    </div>
  );
}
