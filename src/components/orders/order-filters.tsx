/**
 * Order Filters Component — Multi-Select Registered By
 *
 * Client-side filter controls for orders table.
 * Uses Popover + Command pattern for multi-select registrant filter,
 * plus date range inputs.
 *
 * @module components/orders/order-filters
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface OrderFilters {
  registeredBy: string[];
  requiredDateFrom: string;
  requiredDateTo: string;
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  /** List of all registrant names from Registrant table */
  registrants: string[];
  /** Whether registrants are being loaded */
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function OrderFiltersComponent({
  filters,
  onFiltersChange,
  registrants,
  isLoading = false,
}: OrderFiltersProps) {
  const [open, setOpen] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.registeredBy.length > 0 ||
      filters.requiredDateFrom !== "" ||
      filters.requiredDateTo !== ""
    );
  }, [filters]);

  // ---- Handlers ----

  /** Toggle a registrant in the selection */
  const handleToggleRegistrant = (name: string) => {
    const isSelected = filters.registeredBy.includes(name);
    const next = isSelected
      ? filters.registeredBy.filter((n) => n !== name)
      : [...filters.registeredBy, name];

    onFiltersChange({ ...filters, registeredBy: next });
  };

  /** Remove a single registrant badge */
  const handleRemoveRegistrant = (name: string) => {
    onFiltersChange({
      ...filters,
      registeredBy: filters.registeredBy.filter((n) => n !== name),
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, requiredDateFrom: e.target.value });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, requiredDateTo: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      registeredBy: [],
      requiredDateFrom: "",
      requiredDateTo: "",
    });
  };

  // ---- Trigger label ----

  const triggerLabel = useMemo(() => {
    const count = filters.registeredBy.length;
    if (count === 0) return "CS";
    if (count === 1) return filters.registeredBy[0];
    return `${count} đã chọn`;
  }, [filters.registeredBy]);

  // ---- Render ----

  return (
    <>
      {/* Registered By Multi-Select Filter */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">CS</Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Chọn CS để lọc"
              className="w-[200px] justify-between font-normal"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải…
                </span>
              ) : (
                <span className="truncate">{triggerLabel}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Tìm CS..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy CS.</CommandEmpty>
                <CommandGroup>
                  {registrants.map((name) => {
                    const isSelected = filters.registeredBy.includes(name);
                    return (
                      <CommandItem
                        key={name}
                        value={name}
                        onSelect={() => handleToggleRegistrant(name)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Required Date From */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateFrom" className="text-sm font-medium">
          Hạn từ ngày
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
          Đến ngày
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
          Xóa bộ lọc
        </Button>
      )}

      {/* Selected registrant badges — full-width row below filter controls */}
      {filters.registeredBy.length > 0 && (
        <div className="basis-full flex flex-wrap gap-1">
          {filters.registeredBy.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="text-xs px-1.5 py-0"
            >
              {name}
              <button
                type="button"
                aria-label={`Xóa ${name}`}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleRemoveRegistrant(name)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
