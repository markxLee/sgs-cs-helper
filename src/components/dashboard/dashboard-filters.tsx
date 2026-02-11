"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DashboardFilters, DashboardUser } from "@/types/dashboard";
import { differenceInDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

interface DashboardFiltersProps {
  filters: DashboardFilters;
  users: DashboardUser[];
  onFilterChange: (filters: DashboardFilters) => void;
}

const TIME_RANGE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "thisweek" },
  { label: "This Month", value: "thismonth" },
  { label: "Custom", value: "custom" },
] as const;

// Simplified scope options (Update #1 - removed "Group")
const SCOPE_OPTIONS = [
  { label: "All Team", value: "all-team" as const },
  { label: "Individual", value: "individual" as const },
] as const;

export function DashboardFilters({
  filters,
  users,
  onFilterChange,
}: DashboardFiltersProps) {
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [timePreset, setTimePreset] = useState<string>("thisweek");
  // Local state for pending date range (only applied on confirm)
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>({
    from: filters.startDate,
    to: filters.endDate,
  });

  // Sync pending range when filters change externally
  useEffect(() => {
    setPendingRange({ from: filters.startDate, to: filters.endDate });
  }, [filters.startDate, filters.endDate]);

  // Initialize pending range when custom date picker opens
  useEffect(() => {
    if (customDateOpen) {
      setPendingRange({ from: filters.startDate, to: filters.endDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateOpen]);

  const handleScopeChange = (scope: DashboardFilters["scope"]) => {
    onFilterChange({
      ...filters,
      scope,
      userId: scope === "all-team" ? undefined : filters.userId,
    });
  };

  const handleUserSelection = (userId: string) => {
    onFilterChange({
      ...filters,
      userId,
    });
  };

  const handleTimeRangeChange = (preset: string) => {
    setTimePreset(preset);
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (preset) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisweek":
        startDate = new Date(now);
        const dayOfWeek = startDate.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diffToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thismonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        // Don't change dates, just enable custom picker
        return;
      default:
        return;
    }

    onFilterChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  // Update pending range only (no query triggered)
  const handleCustomDateChange = (range: DateRange | undefined) => {
    setPendingRange(range);
  };

  // Apply the pending date range (triggers query)
  const applyCustomDateRange = () => {
    const from = pendingRange?.from;
    const to = pendingRange?.to;

    if (!from || !to) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Validate start <= end
    if (from > to) {
      toast.error("Start date must be before end date");
      return;
    }

    // Validate max 1 year range
    const diffDays = differenceInDays(to, from);
    if (diffDays > 365) {
      toast.warning("Maximum range is 1 year. Please select a shorter range.");
      return;
    }

    const startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    onFilterChange({
      ...filters,
      startDate,
      endDate,
    });
    setCustomDateOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 p-4 border rounded-lg bg-card">
      {/* Scope Selector (Update #1 - simplified, only 2 options) */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-foreground/80 whitespace-nowrap">
          Scope:
        </label>
        <Select value={filters.scope} onValueChange={handleScopeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCOPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User Picker (Update #1 - simplified, single select only) */}
      {filters.scope === "individual" && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground/80 whitespace-nowrap">
            User:
          </label>
          <Select
            value={filters.userId || ""}
            onValueChange={handleUserSelection}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-foreground/80 whitespace-nowrap">
          Period:
        </label>
        <Select value={timePreset} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Date Range Picker (Update #1 - improved with auto-select) */}
        {timePreset === "custom" && (
          <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-60 justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {filters.startDate && filters.endDate ? (
                  <>
                    {format(filters.startDate, "MMM dd")} -{" "}
                    {format(filters.endDate, "MMM dd, yyyy")}
                  </>
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={
                  pendingRange?.from || filters.startDate || new Date()
                }
                selected={pendingRange}
                onSelect={handleCustomDateChange}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
              <div className="flex items-center justify-between p-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {pendingRange?.from && pendingRange?.to
                    ? `${format(pendingRange.from, "MMM dd")} - ${format(pendingRange.to, "MMM dd, yyyy")}`
                    : "Select start and end dates"}
                </p>
                <Button
                  size="sm"
                  onClick={applyCustomDateRange}
                  disabled={!pendingRange?.from || !pendingRange?.to}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
