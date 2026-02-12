/**
 * Completed Orders Container Component
 *
 * Client component that wires up the useCompletedOrders hook
 * with search, filter, sort controls and the CompletedOrdersTable.
 *
 * @module components/orders/completed-orders
 */

"use client";

import { CompletedOrdersTable } from "@/components/orders/completed-orders-table";
import { ExportExcelButton } from "@/components/orders/export-excel-button";
import { JobSearch } from "@/components/orders/job-search";
import {
  OrderFiltersComponent,
  type OrderFilters,
} from "@/components/orders/order-filters";
import { useCompletedOrders } from "@/hooks/use-completed-orders";
import { fetchRegistrants } from "@/lib/actions/order";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface CompletedOrdersProps {
  /** Whether current user can undo completed orders */
  canUndo: boolean;
  /** Whether current user can export to Excel (Admin/Super Admin only) */
  canExport: boolean;
  /** Current active tab — used to control fetch timing */
  activeTab: string;
}

// ============================================================================
// Component
// ============================================================================

export function CompletedOrders({
  canUndo,
  canExport,
  activeTab,
}: CompletedOrdersProps) {
  const {
    orders,
    total,
    page,
    totalPages,
    isLoading,
    search,
    registeredBy,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
    setPage,
    setSearch,
    setFilters,
    setSortConfig,
    refetch,
  } = useCompletedOrders(activeTab);

  // ---------------------------------------------------------------------------
  // Registrants from dedicated lookup table (authoritative source)
  // ---------------------------------------------------------------------------

  const [registrants, setRegistrants] = useState<string[]>([]);
  const [isLoadingRegistrants, setIsLoadingRegistrants] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingRegistrants(true);
    fetchRegistrants()
      .then((data) => {
        if (!cancelled) setRegistrants(data);
      })
      .catch((err) => {
        console.error("Failed to fetch registrants:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRegistrants(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle filter changes from OrderFiltersComponent.
   *
   * Uses the combined `setFilters` method to update all filter dimensions
   * in a single fetch, avoiding race conditions from sequential setter calls
   * where the second fetch would spread stale `paramsRef.current` values.
   */
  const handleFiltersChange = useCallback(
    (filters: OrderFilters) => {
      setFilters({
        registeredBy: filters.registeredBy,
        dateFrom: filters.requiredDateFrom,
        dateTo: filters.requiredDateTo,
      });
    },
    [setFilters]
  );

  /** Handle sort toggle — cycles asc ↔ desc, or sets new field to asc */
  const handleSort = useCallback(
    (field: string) => {
      const newDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
      setSortConfig(field, newDir);
    },
    [sortField, sortDir, setSortConfig]
  );

  /** Handle undo success — refetch, reset to page 1 if page becomes empty */
  const handleUndoSuccess = useCallback(() => {
    // If this was the last item on the page, go back to page 1
    if (orders.length <= 1 && page > 1) {
      setPage(1);
    } else {
      refetch();
    }
  }, [orders.length, page, setPage, refetch]);

  // Build current filter state for OrderFiltersComponent
  const currentFilters: OrderFilters = {
    registeredBy,
    requiredDateFrom: dateFrom,
    requiredDateTo: dateTo,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Controls: Search + Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <JobSearch value={search} onChange={setSearch} />
        <OrderFiltersComponent
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          registrants={registrants}
          isLoading={isLoadingRegistrants}
        />
        <ExportExcelButton
          canExport={canExport}
          search={search}
          registeredBy={registeredBy}
          dateFrom={dateFrom}
          dateTo={dateTo}
          sortField={sortField}
          sortDir={sortDir}
        />
      </div>

      {/* Total count */}
      {!isLoading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {total} completed order{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Table */}
      <CompletedOrdersTable
        orders={orders}
        canUndo={canUndo}
        isLoading={isLoading}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onUndoSuccess={handleUndoSuccess}
      />
    </div>
  );
}
