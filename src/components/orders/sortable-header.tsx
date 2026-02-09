/**
 * Sortable Table Header Component
 *
 * Clickable table header with sort indicator.
 *
 * @module components/orders/sortable-header
 */

"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  field: string | null;
  direction: SortDirection;
}

interface SortableHeaderProps {
  field: string;
  label: string;
  currentSort: SortConfig;
  onSort: (field: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    onSort(field);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none",
        className
      )}
      onClick={handleClick}
    >
      <span>{label}</span>
      <span className="ml-1">
        {direction === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : direction === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
        )}
      </span>
    </div>
  );
}
