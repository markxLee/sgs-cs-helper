/**
 * Sortable Table Header Component
 *
 * Clickable table header with sort indicator.
 *
 * @module components/orders/sortable-header
 */

"use client";

import { TableHead } from "@/components/ui/table";
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
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
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
    </TableHead>
  );
}
