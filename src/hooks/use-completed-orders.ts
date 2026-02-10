/**
 * Hook for managing completed orders data fetching
 *
 * Handles server-side pagination, search (debounced), filter, sort,
 * 5-minute polling, refetch on tab switch, and manual refetch after undo.
 *
 * All filtering/sorting is server-side — no client-side data manipulation.
 *
 * @module hooks/use-completed-orders
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Types
// ============================================================================

export interface CompletedOrder {
  id: string;
  jobNumber: string;
  registeredDate: string;
  registeredBy: string | null;
  receivedDate: string;
  requiredDate: string;
  priority: number;
  status: string;
  completedAt: string | null;
  completedById: string | null;
  completedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface CompletedOrdersResponse {
  orders: CompletedOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CompletedOrdersState {
  orders: CompletedOrder[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  registeredBy: string;
  dateFrom: string;
  dateTo: string;
  sortField: string;
  sortDir: "asc" | "desc";
}

export interface UseCompletedOrdersReturn extends CompletedOrdersState {
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setRegisteredBy: (value: string) => void;
  setDateRange: (from: string, to: string) => void;
  setSortConfig: (field: string, dir: "asc" | "desc") => void;
  refetch: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for fetching and managing completed orders
 *
 * @param activeTab - Current active tab; fetches only when "completed"
 * @returns State + setters for pagination, search, filter, sort, and manual refetch
 *
 * @example
 * const { orders, isLoading, page, totalPages, setPage, setSearch, refetch } =
 *   useCompletedOrders("completed");
 */
export function useCompletedOrders(
  activeTab: string
): UseCompletedOrdersReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter / search / sort state
  const [search, setSearchState] = useState("");
  const [registeredBy, setRegisteredByState] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("completedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedRef = useRef(false);

  // Store current params in ref so polling always uses latest values
  const paramsRef = useRef({
    page,
    search,
    registeredBy,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  });

  // Keep paramsRef in sync
  useEffect(() => {
    paramsRef.current = {
      page,
      search,
      registeredBy,
      dateFrom,
      dateTo,
      sortField,
      sortDir,
    };
  }, [page, search, registeredBy, dateFrom, dateTo, sortField, sortDir]);

  // ---------------------------------------------------------------------------
  // Core fetch function
  // ---------------------------------------------------------------------------
  const fetchOrders = useCallback(
    async (params?: {
      page?: number;
      search?: string;
      registeredBy?: string;
      dateFrom?: string;
      dateTo?: string;
      sortField?: string;
      sortDir?: string;
    }) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Use provided params or fall back to ref (for polling)
      const p = params ?? paramsRef.current;

      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(p.page ?? 1));
      queryParams.set("limit", String(DEFAULT_LIMIT));

      if (p.search) queryParams.set("search", p.search);
      if (p.registeredBy) queryParams.set("registeredBy", p.registeredBy);
      if (p.dateFrom) queryParams.set("dateFrom", p.dateFrom);
      if (p.dateTo) queryParams.set("dateTo", p.dateTo);
      if (p.sortField) queryParams.set("sortField", p.sortField);
      if (p.sortDir) queryParams.set("sortDir", p.sortDir);

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/orders/completed?${queryParams.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: CompletedOrdersResponse = await response.json();

        // Only apply if this request wasn't aborted
        if (!controller.signal.aborted) {
          setOrders(data.orders);
          setTotal(data.total);
          setPageState(data.page);
          setTotalPages(data.totalPages);
        }
      } catch (error: unknown) {
        // Ignore abort errors — they're expected when cancelling stale requests
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch completed orders:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Setters that trigger fetch
  // ---------------------------------------------------------------------------

  /** Change page — immediate fetch */
  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      void fetchOrders({ ...paramsRef.current, page: newPage });
    },
    [fetchOrders]
  );

  /** Change search — debounced fetch, reset to page 1 */
  const setSearch = useCallback(
    (newSearch: string) => {
      setSearchState(newSearch);

      // Clear previous debounce
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setPageState(1);
        void fetchOrders({ ...paramsRef.current, search: newSearch, page: 1 });
      }, SEARCH_DEBOUNCE_MS);
    },
    [fetchOrders]
  );

  /** Change registeredBy filter — immediate fetch, reset to page 1 */
  const setRegisteredBy = useCallback(
    (value: string) => {
      setRegisteredByState(value);
      setPageState(1);
      void fetchOrders({ ...paramsRef.current, registeredBy: value, page: 1 });
    },
    [fetchOrders]
  );

  /** Change date range filter — immediate fetch, reset to page 1 */
  const setDateRange = useCallback(
    (from: string, to: string) => {
      setDateFrom(from);
      setDateTo(to);
      setPageState(1);
      void fetchOrders({
        ...paramsRef.current,
        dateFrom: from,
        dateTo: to,
        page: 1,
      });
    },
    [fetchOrders]
  );

  /** Change sort config — immediate fetch, reset to page 1 */
  const setSortConfig = useCallback(
    (field: string, dir: "asc" | "desc") => {
      setSortField(field);
      setSortDir(dir);
      setPageState(1);
      void fetchOrders({
        ...paramsRef.current,
        sortField: field,
        sortDir: dir,
        page: 1,
      });
    },
    [fetchOrders]
  );

  /** Manual refetch with current params (e.g. after undo) */
  const refetch = useCallback(() => {
    void fetchOrders();
  }, [fetchOrders]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Fetch on tab switch to "completed"
   *
   * Also handles initial fetch when the tab is already "completed" on mount.
   */
  useEffect(() => {
    if (activeTab === "completed") {
      hasFetchedRef.current = true;
      void fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  /**
   * Polling: refetch every 5 minutes while on completed tab
   */
  useEffect(() => {
    if (activeTab !== "completed") return;

    const intervalId = setInterval(() => {
      void fetchOrders();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeTab, fetchOrders]);

  /**
   * Cleanup: abort in-flight request and clear debounce on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    // Data
    orders,
    total,
    page,
    totalPages,
    isLoading,

    // Current filter/sort state
    search,
    registeredBy,
    dateFrom,
    dateTo,
    sortField,
    sortDir,

    // Setters
    setPage,
    setSearch,
    setRegisteredBy,
    setDateRange,
    setSortConfig,
    refetch,
  };
}
