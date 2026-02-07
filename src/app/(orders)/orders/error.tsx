/**
 * Error boundary for Orders page
 *
 * Displays when an error occurs during data fetching or rendering.
 * Uses Next.js error.tsx convention for automatic error handling.
 *
 * @route /orders (error state)
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

interface OrdersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================================
// Error Component
// ============================================================================

export default function OrdersError({ error, reset }: OrdersErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("[OrdersError] Error loading orders:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          We couldn&apos;t load the orders. Please try again.
        </p>
        <Button onClick={reset} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
