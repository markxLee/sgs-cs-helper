/**
 * Duration utility functions for completion tracking.
 *
 * Uses the same lunch-break deduction logic as the progress bar
 * (see {@link getLunchBreakDeduction} in progress.ts).
 * Used by CompletedOrdersTable to display actual duration and overdue indicators.
 */

import { getLunchBreakDeduction } from "./progress";

// ============================================================================
// Constants
// ============================================================================

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 1000 * 60;

// ============================================================================
// Public API
// ============================================================================

/**
 * Format milliseconds into "Xh Ym" string.
 *
 * @example formatDuration(8_100_000) // "2h 15m"
 * @example formatDuration(1_800_000) // "0h 30m"
 * @example formatDuration(172_800_000) // "48h 0m"
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / MS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Calculate actual working duration in milliseconds.
 *
 * Deducts lunch break (12:00–13:00) from the raw elapsed time, identical
 * to the progress-bar calculation.
 *
 * Formula: `(completedAt − receivedDate) − lunchDeduction`
 *
 * @returns Working duration in ms (floored to 0)
 */
export function calcActualDuration(
  receivedDate: Date,
  completedAt: Date
): number {
  const rawMs = completedAt.getTime() - receivedDate.getTime();
  const lunchDeductionHours = getLunchBreakDeduction(receivedDate, completedAt);
  const lunchDeductionMs = lunchDeductionHours * MS_PER_HOUR;
  return Math.max(0, rawMs - lunchDeductionMs);
}

/**
 * Calculate overdue duration in milliseconds.
 *
 * Returns the number of ms past the required date, or `null` if on-time/early.
 * Edge case: completedAt === requiredDate → on-time (returns null) per EC-004.
 */
export function calcOverdueDuration(
  requiredDate: Date,
  completedAt: Date
): number | null {
  const diff = completedAt.getTime() - requiredDate.getTime();
  return diff > 0 ? diff : null;
}

/**
 * Check whether an order was completed after the required date.
 *
 * `completedAt === requiredDate` is considered on-time (returns false) per EC-004.
 */
export function isOverdue(requiredDate: Date, completedAt: Date): boolean {
  return completedAt.getTime() > requiredDate.getTime();
}
