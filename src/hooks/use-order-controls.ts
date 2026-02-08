/**
 * Hook for managing order filter, sort, and search state
 *
 * Provides unified state management for:
 * - Filtering by registeredBy and date range
 * - Sorting by multiple fields
 * - Searching by job number
 *
 * @module hooks/use-order-controls
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import type { OrderFilters } from "@/components/orders/order-filters";
import type { SortConfig } from "@/components/orders/sortable-header";

// ============================================================================
// Types
// ============================================================================

export interface OrderControlsState {
  filters: OrderFilters;
  sort: SortConfig;
  search: string;
}

interface OrderWithDateFields {
  registeredBy: string | null;
  registeredDate: Date;
  requiredDate: Date;
  jobNumber: string;
  priority: number;
  progress: {
    percentage: number;
  };
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: OrderFilters = {
  registeredBy: "",
  requiredDateFrom: "",
  requiredDateTo: "",
};

const initialSort: SortConfig = {
  field: null,
  direction: null,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing order controls state
 *
 * @returns State and handlers for filters, sort, and search
 */
export function useOrderControls() {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [search, setSearch] = useState("");

  // Handle sort toggle
  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        // Toggle direction: null -> asc -> desc -> null
        if (prev.direction === null) return { field, direction: "asc" };
        if (prev.direction === "asc") return { field, direction: "desc" };
        return { field: null, direction: null };
      }
      // New field, start with asc
      return { field, direction: "asc" };
    });
  }, []);

  // Reset all controls
  const resetControls = useCallback(() => {
    setFilters(initialFilters);
    setSort(initialSort);
    setSearch("");
  }, []);

  // Check if any controls are active
  const hasActiveControls = useMemo(() => {
    return (
      filters.registeredBy !== "" ||
      filters.requiredDateFrom !== "" ||
      filters.requiredDateTo !== "" ||
      sort.field !== null ||
      search !== ""
    );
  }, [filters, sort, search]);

  // Process orders: filter -> search -> sort
  const processOrders = useCallback(
    <T extends OrderWithDateFields>(orders: T[]): T[] => {
      let result = [...orders];

      // Apply filters
      if (filters.registeredBy) {
        result = result.filter(
          (order) => order.registeredBy === filters.registeredBy
        );
      }

      if (filters.requiredDateFrom) {
        const fromDate = new Date(filters.requiredDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        result = result.filter(
          (order) => new Date(order.requiredDate) >= fromDate
        );
      }

      if (filters.requiredDateTo) {
        const toDate = new Date(filters.requiredDateTo);
        toDate.setHours(23, 59, 59, 999);
        result = result.filter(
          (order) => new Date(order.requiredDate) <= toDate
        );
      }

      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter((order) =>
          order.jobNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply sort
      if (sort.field && sort.direction) {
        result.sort((a, b) => {
          let comparison = 0;

          switch (sort.field) {
            case "registeredBy":
              const aVal = a.registeredBy || "Unknown";
              const bVal = b.registeredBy || "Unknown";
              comparison = aVal.localeCompare(bVal);
              break;
            case "registeredDate":
              comparison = new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
              break;
            case "requiredDate":
              comparison = new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime();
              break;
            case "priority":
              comparison = a.priority - b.priority;
              break;
            case "progress":
              comparison = a.progress.percentage - b.progress.percentage;
              break;
          }

          return sort.direction === "desc" ? -comparison : comparison;
        });
      }

      return result;
    },
    [filters, sort, search]
  );

  return {
    // State
    filters,
    sort,
    search,
    hasActiveControls,

    // Setters
    setFilters,
    setSearch,
    handleSort,
    resetControls,

    // Processor
    processOrders,
  };
}
