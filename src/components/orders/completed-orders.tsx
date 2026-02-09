/**
 * Completed Orders Container Component
 *
 * Client component that wires up the useCompletedOrders hook
 * with search, filter, sort controls and the CompletedOrdersTable.
 *
 * @module components/orders/completed-orders
 */

"use client";

import { useCallback, useMemo } from "react";
import { useCompletedOrders } from "@/hooks/use-completed-orders";
import { CompletedOrdersTable } from "@/components/orders/completed-orders-table";
import { JobSearch } from "@/components/orders/job-search";
import {
  OrderFiltersComponent,
  type OrderFilters,
} from "@/components/orders/order-filters";

// ============================================================================
// Types
// ============================================================================

interface CompletedOrdersProps {
  /** Whether current user can undo completed orders */
  canUndo: boolean;
  /** Current active tab — used to control fetch timing */
  activeTab: string;
}

// ============================================================================
// Component
// ============================================================================

export function CompletedOrders({ canUndo, activeTab }: CompletedOrdersProps) {
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
    setRegisteredBy,
    setDateRange,
    setSortConfig,
    refetch,
  } = useCompletedOrders(activeTab);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  /**
   * Extract unique registrant names from current orders for filter dropdown.
   *
   * Known limitation: only registrants present on the current page (max 50)
   * are shown. Registrants whose completed orders are all on other pages
   * won't appear. A dedicated /api/orders/completed/registrants endpoint
   * would solve this but is out of scope for now.
   */
  const registrants = useMemo(() => {
    const names = new Set<string>();
    for (const order of orders) {
      if (order.registeredBy) {
        names.add(order.registeredBy);
      }
    }
    return Array.from(names).sort();
  }, [orders]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle filter changes from OrderFiltersComponent.
   *
   * We delegate to the hook's individual setters. When both change at once
   * (e.g. "Clear Filters"), the first fetch is immediately aborted by the
   * second via AbortController, so no stale data is applied.
   */
  const handleFiltersChange = useCallback(
    (filters: OrderFilters) => {
      setRegisteredBy(filters.registeredBy);
      setDateRange(filters.requiredDateFrom, filters.requiredDateTo);
    },
    [setRegisteredBy, setDateRange]
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
