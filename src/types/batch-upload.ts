/**
 * Types for batch upload processing
 *
 * Defines types for splitting order submissions into batches
 * and tracking progress.
 *
 * @module types/batch-upload
 */

import type { BatchCreateResult, CreateOrderInput } from "@/lib/excel/types";

// ============================================================================
// Progress Types
// ============================================================================

/** Progress info emitted after each batch completes */
export interface BatchProgressInfo {
  /** Current batch number (1-based) */
  current: number;
  /** Total number of batches */
  total: number;
  /** Result of the just-completed batch (null if batch threw) */
  batchResult: BatchCreateResult | null;
  /** Error message if this batch failed */
  error?: string;
}

// ============================================================================
// Result Types
// ============================================================================

/** Aggregated result from all batches */
export interface BatchUploadResult {
  /** All successfully created orders across batches */
  created: BatchCreateResult["created"];
  /** All updated orders across batches */
  updated: BatchCreateResult["updated"];
  /** All unchanged orders across batches */
  unchanged: BatchCreateResult["unchanged"];
  /** All failed orders across batches (includes batch-level failures) */
  failed: BatchCreateResult["failed"];
  /** Total number of batches processed */
  totalBatches: number;
  /** Number of batches that completed without throwing */
  successfulBatches: number;
  /** Number of batches that threw an error */
  failedBatches: number;
}

// ============================================================================
// Options Types
// ============================================================================

/** Options for submitOrdersInBatches */
export interface BatchSubmitOptions {
  /** Number of orders per batch (default: 10) */
  batchSize?: number;
  /** Callback invoked after each batch completes */
  onBatchProgress?: (info: BatchProgressInfo) => void;
  /** Server action to call for each batch (injectable for testing) */
  serverAction?: (orders: CreateOrderInput[]) => Promise<BatchCreateResult>;
}
