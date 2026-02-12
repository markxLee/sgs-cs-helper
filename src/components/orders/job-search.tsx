/**
 * Job Number Search Component
 *
 * Search input for filtering orders by job number.
 * Supports exact and partial matches, case-insensitive.
 *
 * @module components/orders/job-search
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for debouncing a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Component
// ============================================================================

export function JobSearch({
  value,
  onChange,
  placeholder = "Tìm số đơn hàng...",
}: JobSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);

  // Sync debounced value to parent
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative w-[240px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Xóa tìm kiếm</span>
        </Button>
      )}
    </div>
  );
}
