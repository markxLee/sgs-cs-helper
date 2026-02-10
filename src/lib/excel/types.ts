/**
 * Type definitions for Excel parsing
 *
 * @module lib/excel/types
 * @description Types for client-side Excel parsing, preview UI, and server submission
 */

import type { Order } from "@/generated/prisma/client";

// ============================================================================
// Parsed Data Types (Client-side)
// ============================================================================

/**
 * Parsed order data from Excel file
 * All dates are JavaScript Date objects (converted from Excel serial)
 */
export interface ParsedOrder {
  /** Job number extracted from Row 0 or Row 1 */
  jobNumber: string;

  /** Registration date from Row 2, Col 1 */
  registeredDate: Date;

  /** Person who registered from Row 2, Col 3 (optional) */
  registeredBy: string | null;

  /** Date sample was received from Row 2, Col 5 - REQUIRED for processing time calculation */
  receivedDate: Date;

  /** Person who checked from Row 2, Col 7 (optional) */
  checkedBy: string | null;

  /** Required completion date from Row 2, Col 9 */
  requiredDate: Date;

  /** Priority level from Row 2, Col 11 */
  priority: number;

  /** Note from Row 3 (optional) */
  note: string | null;

  /** Source file name for tracking origin */
  sourceFileName: string;
}

// ============================================================================
// Parse Error Types
// ============================================================================

/**
 * Parse error information with location details
 */
export interface ParseError {
  /** Field that caused the error */
  field: string;

  /** Human-readable error message */
  message: string;

  /** Row number where error occurred (0-indexed) */
  row?: number;

  /** Column number where error occurred (0-indexed) */
  column?: number;
}

// ============================================================================
// Parse Result Types (Discriminated Union)
// ============================================================================

/**
 * Successful parse result
 */
export interface ParseResultSuccess {
  success: true;
  data: ParsedOrder;
  fileName: string;
}

/**
 * Failed parse result
 */
export interface ParseResultError {
  success: false;
  error: ParseError;
  fileName: string;
}

/**
 * Discriminated union for single file parse result
 */
export type ParseResult = ParseResultSuccess | ParseResultError;

// ============================================================================
// Server Submission Types
// ============================================================================

/**
 * Input for creating a single order on the server
 * Dates are ISO strings for JSON serialization
 */
export interface CreateOrderInput {
  /** Job number */
  jobNumber: string;

  /** Registration date as ISO string */
  registeredDate: string;

  /** Person who registered (optional) */
  registeredBy?: string;

  /** Date sample was received as ISO string - REQUIRED */
  receivedDate: string;

  /** Person who checked (optional) */
  checkedBy?: string;

  /** Required completion date as ISO string */
  requiredDate: string;

  /** Priority level */
  priority: number;

  /** Note (optional) */
  note?: string;

  /** Source file name for tracking */
  sourceFileName: string;
}

// ============================================================================
// Server Response Types
// ============================================================================

// Removed legacy FailedOrder and BatchCreateResult interface (pre-upsert)
  
/**
 * Represents an order that was unchanged during upsert, with a reason.
 */
export type UnchangedOrder = {
  /**
   * The job number of the order (primary key for upsert logic)
   */
  jobNumber: string;
  /**
   * The original order data (as returned from DB)
   */
  order: Order;
  /**
   * Reason why this order was unchanged (e.g., 'identical data')
   */
  reason: string;
};

/**
 * Batch result for createOrders upsert: 3-way + failed.
 */
export type BatchCreateResult = {
  created: Order[];
  updated: Order[];
  unchanged: UnchangedOrder[];
  failed: {
    input: CreateOrderInput;
    error: string;
  }[];
};


// ============================================================================
// UI State Types
// ============================================================================

/**
 * Preview item for UI display
 * Extends ParseResult with edit state
 */
export interface PreviewItem {
  /** Unique ID for React key */
  id: string;

  /** Parse result (success or error) */
  result: ParseResult;

  /** Whether item is expanded in UI */
  isExpanded: boolean;

  /** Whether item is being edited */
  isEditing: boolean;
}

/**
 * Submit status for tracking batch submission
 */
export type SubmitStatus = "idle" | "submitting" | "success" | "error";

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Convert ParsedOrder to CreateOrderInput (client → server)
 */
export function toCreateOrderInput(order: ParsedOrder): CreateOrderInput {
  return {
    jobNumber: order.jobNumber,
    registeredDate: order.registeredDate.toISOString(),
    registeredBy: order.registeredBy ?? undefined,
    receivedDate: order.receivedDate.toISOString(),
    checkedBy: order.checkedBy ?? undefined,
    requiredDate: order.requiredDate.toISOString(),
    priority: order.priority,
    note: order.note ?? undefined,
    sourceFileName: order.sourceFileName,
  };
}
