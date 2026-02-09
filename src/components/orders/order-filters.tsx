/**
 * Order Filters Component
 *
 * Client-side filter controls for orders table.
 * Filters by Registered By and Required Date range.
 *
 * @module components/orders/order-filters
 */

"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface OrderFilters {
  registeredBy: string;
  requiredDateFrom: string;
  requiredDateTo: string;
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  /** List of unique registrant names for dropdown */
  registrants: string[];
}

// ============================================================================
// Component
// ============================================================================

export function OrderFiltersComponent({
  filters,
  onFiltersChange,
  registrants,
}: OrderFiltersProps) {
  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.registeredBy !== "" ||
      filters.requiredDateFrom !== "" ||
      filters.requiredDateTo !== ""
    );
  }, [filters]);

  // Handle filter changes
  const handleRegisteredByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      registeredBy: value === "all" ? "" : value,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      requiredDateFrom: e.target.value,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      requiredDateTo: e.target.value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      registeredBy: "",
      requiredDateFrom: "",
      requiredDateTo: "",
    });
  };

  return (
    <>
      {/* Registered By Filter */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registeredBy" className="text-sm font-medium">
          Registered By
        </Label>
        <Select
          value={filters.registeredBy || "all"}
          onValueChange={handleRegisteredByChange}
        >
          <SelectTrigger id="registeredBy" className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {registrants.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Required Date From */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateFrom" className="text-sm font-medium">
          Due Date From
        </Label>
        <Input
          id="dateFrom"
          type="date"
          value={filters.requiredDateFrom}
          onChange={handleDateFromChange}
          className="w-[160px]"
        />
      </div>

      {/* Required Date To */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateTo" className="text-sm font-medium">
          To Date
        </Label>
        <Input
          id="dateTo"
          type="date"
          value={filters.requiredDateTo}
          onChange={handleDateToChange}
          className="w-[160px]"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-10"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </>
  );
}
