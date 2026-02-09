/**
 * Progress calculation utilities for order tracking
 *
 * @module lib/utils/progress
 * @description Calculates order progress based on priority duration and lunch break exclusion
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Progress bar color based on percentage thresholds
 * - white: 0-40%
 * - green: 41-65%
 * - yellow: 66-80%
 * - red: >80% or overdue
 */
export type ProgressColor = "white" | "green" | "yellow" | "red";

/**
 * Result of progress calculation
 */
export interface ProgressInfo {
  /** Progress percentage (can exceed 100 if overdue) */
  percentage: number;
  /** Color based on percentage thresholds */
  color: ProgressColor;
  /** Whether order has exceeded its duration */
  isOverdue: boolean;
  /** Hours elapsed (excluding lunch if applicable) */
  elapsedHours: number;
  /** Total allowed hours based on priority */
  totalHours: number;
  /** Hours remaining until deadline (negative if overdue) */
  remainingHours: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Priority to duration mapping (in hours)
 * - P0 (Emergency): 15 minutes = 0.25 hours
 * - P1 (Urgent): 1 hour
 * - P2 (Normal): 2.5 hours
 * - P3+ (Low): 3 hours
 */
const PRIORITY_DURATION_MAP: Record<number, number> = {
  0: 0.25, // P0: 15 minutes
  1: 1, // P1: 1 hour
  2: 2.5, // P2: 2.5 hours
};

/** Default duration for P3 and above (in hours) */
const DEFAULT_DURATION = 3;

/** Lunch break start hour (12:00) */
const LUNCH_START_HOUR = 12;

/** Lunch break end hour (13:00) */
const LUNCH_END_HOUR = 13;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the allowed duration in hours based on order priority
 *
 * @param priority - Order priority (0 = highest)
 * @returns Duration in hours
 *
 * @example
 * getPriorityDuration(0) // 0.25 (15 minutes)
 * getPriorityDuration(1) // 1 (1 hour)
 * getPriorityDuration(2) // 2.5 (2.5 hours)
 * getPriorityDuration(3) // 3 (3 hours - default)
 */
export function getPriorityDuration(priority: number): number {
  // Handle negative priorities as P0
  if (priority < 0) {
    return PRIORITY_DURATION_MAP[0];
  }

  return PRIORITY_DURATION_MAP[priority] ?? DEFAULT_DURATION;
}

/**
 * Calculate lunch break deduction in hours
 *
 * Handles three scenarios:
 * 1. Received before 12:00, now after 13:00 → deduct 1 hour
 * 2. Received before 12:00, now during lunch (12:00–13:00) → deduct (now - 12:00)
 * 3. Received during lunch (12:00–13:00), now after 13:00 → deduct (13:00 - received)
 * 4. Both received and now during lunch → deduct entire elapsed (all lunch time)
 * 5. Received after 13:00 → no deduction
 *
 * @param receivedDate - When the order was received
 * @param now - Current time (defaults to now)
 * @returns Hours to deduct (0 to 1)
 *
 * @example
 * // Order at 10:00, now is 14:00 → deduct 1 hour
 * getLunchBreakDeduction(new Date('2026-02-07T10:00:00'), new Date('2026-02-07T14:00:00')) // 1
 *
 * // Order at 12:03, now is 14:00 → deduct 0.95 hours (57 min of lunch)
 * getLunchBreakDeduction(new Date('2026-02-07T12:03:00'), new Date('2026-02-07T14:00:00')) // 0.95
 *
 * // Order at 13:30, now is 15:00 → no deduction (started after lunch)
 * getLunchBreakDeduction(new Date('2026-02-07T13:30:00'), new Date('2026-02-07T15:00:00')) // 0
 */
export function getLunchBreakDeduction(
  receivedDate: Date,
  now: Date = new Date()
): number {
  const receivedHour = receivedDate.getHours();
  const receivedMinutes = receivedDate.getMinutes();
  const nowHour = now.getHours();
  const nowMinutes = now.getMinutes();

  // Convert to decimal hours for precise comparison
  const receivedDecimal = receivedHour + receivedMinutes / 60;
  const nowDecimal = nowHour + nowMinutes / 60;

  // Classify positions relative to lunch break
  const receivedBeforeLunch = receivedDecimal < LUNCH_START_HOUR;
  const receivedDuringLunch =
    receivedDecimal >= LUNCH_START_HOUR && receivedDecimal < LUNCH_END_HOUR;
  const nowAfterLunch = nowDecimal >= LUNCH_END_HOUR;
  const nowDuringLunch =
    nowDecimal >= LUNCH_START_HOUR && nowDecimal < LUNCH_END_HOUR;

  // Only apply lunch deduction if lunch period is relevant
  const sameDay =
    receivedDate.toDateString() === now.toDateString() ||
    // If multi-day, always assume lunch break happened
    receivedDate.getTime() < now.getTime();

  if (!sameDay) {
    return 0;
  }

  // Case 1: Received before lunch, now after lunch → full 1 hour deduction
  if (receivedBeforeLunch && nowAfterLunch) {
    return 1;
  }

  // Case 2: Received before lunch, now during lunch → partial deduction
  if (receivedBeforeLunch && nowDuringLunch) {
    return Math.round((nowDecimal - LUNCH_START_HOUR) * 100) / 100;
  }

  // Case 3: Received during lunch, now after lunch → deduct remaining lunch
  if (receivedDuringLunch && nowAfterLunch) {
    return Math.round((LUNCH_END_HOUR - receivedDecimal) * 100) / 100;
  }

  // Case 4: Both during lunch → deduct entire elapsed (all non-working time)
  if (receivedDuringLunch && nowDuringLunch) {
    return Math.round((nowDecimal - receivedDecimal) * 100) / 100;
  }

  // Case 5: Received after lunch or now before lunch → no deduction
  return 0;
}

/**
 * Get progress bar color based on percentage thresholds
 *
 * @param percentage - Progress percentage
 * @returns Color: white (0-40%), green (41-65%), yellow (66-80%), red (>80%)
 */
export function getProgressColor(percentage: number): ProgressColor {
  if (percentage <= 40) {
    return "white";
  }
  if (percentage <= 65) {
    return "green";
  }
  if (percentage <= 80) {
    return "yellow";
  }
  return "red";
}

/**
 * Calculate order progress including percentage, color, and timing info
 *
 * @param receivedDate - When the order was received
 * @param priority - Order priority (0 = highest)
 * @param now - Current time (defaults to now, useful for testing)
 * @returns ProgressInfo with all calculated values
 *
 * @example
 * const progress = calculateOrderProgress(
 *   new Date('2026-02-07T09:00:00'),
 *   2, // P2 = 2.5 hours
 *   new Date('2026-02-07T10:30:00')
 * );
 * // { percentage: 60, color: 'green', isOverdue: false, elapsedHours: 1.5, totalHours: 2.5 }
 */
export function calculateOrderProgress(
  receivedDate: Date,
  priority: number,
  now: Date = new Date()
): ProgressInfo {
  // Get total allowed duration based on priority
  const totalHours = getPriorityDuration(priority);

  // Calculate raw elapsed time in hours
  const elapsedMs = now.getTime() - receivedDate.getTime();

  // Handle future dates (order not yet started)
  if (elapsedMs <= 0) {
    return {
      percentage: 0,
      color: "white",
      isOverdue: false,
      elapsedHours: 0,
      totalHours,
      remainingHours: totalHours,
    };
  }

  const rawElapsedHours = elapsedMs / (1000 * 60 * 60);

  // Deduct lunch break if applicable
  const lunchDeduction = getLunchBreakDeduction(receivedDate, now);
  const elapsedHours = Math.max(0, rawElapsedHours - lunchDeduction);

  // Calculate percentage
  const percentage = Math.round((elapsedHours / totalHours) * 100);

  // Determine color and overdue status
  const isOverdue = percentage > 100;
  const color = getProgressColor(percentage);

  // Calculate remaining hours
  const remainingHours = Math.round((totalHours - elapsedHours) * 100) / 100;

  return {
    percentage,
    color,
    isOverdue,
    elapsedHours: Math.round(elapsedHours * 100) / 100, // Round to 2 decimal places
    totalHours,
    remainingHours,
  };
}
