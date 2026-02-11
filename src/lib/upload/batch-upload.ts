/**
 * Batch upload utilities
 *
 * Splits order arrays into chunks and submits them sequentially
 * via the createOrders server action, collecting aggregated results.
 *
 * @module lib/upload/batch-upload
 */

import { createOrders } from "@/lib/actions/order";
import type { BatchCreateResult, CreateOrderInput } from "@/lib/excel/types";
import type {
  BatchProgressInfo,
  BatchSubmitOptions,
  BatchUploadResult,
} from "@/types/batch-upload";

// ============================================================================
// Constants
// ============================================================================

/** Default number of orders per batch */
export const DEFAULT_BATCH_SIZE = 10;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Split an array into chunks of a given size.
 *
 * @param array - The array to split
 * @param size - Maximum number of items per chunk (must be greater than 0)
 * @returns Array of chunks. Returns [] for empty input.
 *
 * @example
 * chunkArray([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
 * chunkArray([], 5)          // []
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (array.length === 0 || size <= 0) return [];

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// Main Batch Submission
// ============================================================================

/**
 * Submit orders in sequential batches.
 *
 * Splits the orders array into chunks, calls the server action for each
 * chunk sequentially, and aggregates results. If a batch throws an error,
 * the error is captured and processing continues with the next batch.
 *
 * @param orders - All orders to submit
 * @param options - Batch size, progress callback, and optional server action override
 * @returns Aggregated result from all batches
 */
export async function submitOrdersInBatches(
  orders: CreateOrderInput[],
  options: BatchSubmitOptions = {},
): Promise<BatchUploadResult> {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    onBatchProgress,
    serverAction = createOrders,
  } = options;

  // Handle empty input
  if (orders.length === 0) {
    return createEmptyResult();
  }

  // Guard against invalid batch size
  const safeBatchSize = Math.max(1, Math.floor(batchSize));

  const chunks = chunkArray(orders, safeBatchSize);
  const result: BatchUploadResult = createEmptyResult();
  result.totalBatches = chunks.length;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let batchResult: BatchCreateResult | null = null;
    let error: string | undefined;

    try {
      batchResult = await serverAction(chunk);
      result.successfulBatches++;

      // Merge results
      result.created = [...result.created, ...batchResult.created];
      result.updated = [...result.updated, ...batchResult.updated];
      result.unchanged = [...result.unchanged, ...batchResult.unchanged];
      result.failed = [...result.failed, ...batchResult.failed];
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown batch error";
      result.failedBatches++;

      // Add all orders in this chunk as failed
      const failedItems = chunk.map((input) => ({
        input,
        error: error ?? "Unknown batch error",
      }));
      result.failed = [...result.failed, ...failedItems];
    }

    // Report progress
    const progressInfo: BatchProgressInfo = {
      current: i + 1,
      total: chunks.length,
      batchResult,
      error,
    };
    onBatchProgress?.(progressInfo);
  }

  return result;
}

// ============================================================================
// Helpers
// ============================================================================

/** Create an empty BatchUploadResult */
function createEmptyResult(): BatchUploadResult {
  return {
    created: [],
    updated: [],
    unchanged: [],
    failed: [],
    totalBatches: 0,
    successfulBatches: 0,
    failedBatches: 0,
  };
}
