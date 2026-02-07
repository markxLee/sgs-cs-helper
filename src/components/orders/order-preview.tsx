"use client";

/**
 * Order Preview List Component
 *
 * Displays parsed orders in an expandable list format.
 * Each item shows summary info with ability to expand for details.
 *
 * @module components/orders/order-preview
 */

import { useState } from "react";
import type { ParseResult, ParsedOrder } from "@/lib/excel/types";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface PreviewItemData {
  id: string;
  result: ParseResult;
}

interface OrderPreviewListProps {
  /** List of parse results to display */
  results: PreviewItemData[];
  /** Callback when user clicks Edit on an item */
  onEdit: (id: string, order: ParsedOrder) => void;
  /** Callback when user clicks Remove on an item */
  onRemove: (id: string) => void;
  /** Whether list is disabled (during submission) */
  disabled?: boolean;
}

interface OrderPreviewItemProps {
  item: PreviewItemData;
  onEdit: (id: string, order: ParsedOrder) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date for display with full date and time
 */
function formatDate(date: Date): string {
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// OrderPreviewItem Component
// ============================================================================

function OrderPreviewItem({
  item,
  onEdit,
  onRemove,
  disabled = false,
}: OrderPreviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id, result } = item;
  const isSuccess = result.success;

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-colors",
        isSuccess
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      )}
    >
      {/* Summary Header */}
      <div
        className="p-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Status Icon + Main Info */}
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess ? (
                <svg
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* File Name */}
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  isSuccess ? "text-green-800" : "text-red-800"
                )}
              >
                {result.fileName}
              </p>

              {/* Success: Show job number and dates */}
              {isSuccess && (
                <div className="mt-1 text-xs text-green-700 space-y-0.5">
                  <p>
                    <span className="font-medium">Job:</span>{" "}
                    {result.data.jobNumber}
                  </p>
                  <p>
                    <span className="font-medium">Received:</span>{" "}
                    {formatDate(result.data.receivedDate)}
                    {" → "}
                    <span className="font-medium">Required:</span>{" "}
                    {formatDate(result.data.requiredDate)}
                  </p>
                </div>
              )}

              {/* Error: Show error message */}
              {!isSuccess && (
                <p className="mt-1 text-xs text-red-700">
                  {result.error.message}
                </p>
              )}
            </div>
          </div>

          {/* Expand/Collapse Arrow */}
          <button
            type="button"
            className={cn(
              "flex-shrink-0 p-1 rounded transition-colors",
              isSuccess
                ? "text-green-600 hover:bg-green-100"
                : "text-red-600 hover:bg-red-100"
            )}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          className={cn(
            "px-3 pb-3 border-t",
            isSuccess ? "border-green-200" : "border-red-200"
          )}
        >
          {isSuccess ? (
            <ExpandedDetails order={result.data} />
          ) : (
            <ExpandedError error={result.error} />
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            {isSuccess && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id, result.data);
                }}
                disabled={disabled}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              disabled={disabled}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Expanded Details Component
// ============================================================================

function ExpandedDetails({ order }: { order: ParsedOrder }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
      <div>
        <span className="font-medium text-gray-600">Job Number:</span>
        <p className="text-gray-900">{order.jobNumber}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Priority:</span>
        <p className="text-gray-900">{order.priority}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Registered Date:</span>
        <p className="text-gray-900">{formatDate(order.registeredDate)}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Registered By:</span>
        <p className="text-gray-900">{order.registeredBy || "-"}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Received Date:</span>
        <p className="text-gray-900">{formatDate(order.receivedDate)}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Checked By:</span>
        <p className="text-gray-900">{order.checkedBy || "-"}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Required Date:</span>
        <p className="text-gray-900">{formatDate(order.requiredDate)}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Source File:</span>
        <p className="text-gray-900 truncate">{order.sourceFileName}</p>
      </div>
      {order.note && (
        <div className="col-span-2">
          <span className="font-medium text-gray-600">Note:</span>
          <p className="text-gray-900">{order.note}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Expanded Error Component
// ============================================================================

function ExpandedError({ error }: { error: { field: string; message: string; row?: number; column?: number } }) {
  return (
    <div className="mt-3 text-xs space-y-1">
      <p>
        <span className="font-medium text-gray-600">Field:</span>{" "}
        <span className="text-red-700">{error.field}</span>
      </p>
      {error.row !== undefined && (
        <p>
          <span className="font-medium text-gray-600">Location:</span>{" "}
          <span className="text-red-700">
            Row {error.row + 1}
            {error.column !== undefined && `, Column ${error.column + 1}`}
          </span>
        </p>
      )}
      <p>
        <span className="font-medium text-gray-600">Error:</span>{" "}
        <span className="text-red-700">{error.message}</span>
      </p>
    </div>
  );
}

// ============================================================================
// OrderPreviewList Component
// ============================================================================

export function OrderPreviewList({
  results,
  onEdit,
  onRemove,
  disabled = false,
}: OrderPreviewListProps) {
  const successCount = results.filter((r) => r.result.success).length;
  const errorCount = results.length - successCount;

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header with counts */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Parsed Orders ({results.length})
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {successCount > 0 && (
            <span className="text-green-600">
              ✓ {successCount} valid
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-red-600">
              ✗ {errorCount} errors
            </span>
          )}
        </div>
      </div>

      {/* List of items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((item) => (
          <OrderPreviewItem
            key={item.id}
            item={item}
            onEdit={onEdit}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { PreviewItemData, OrderPreviewListProps };
