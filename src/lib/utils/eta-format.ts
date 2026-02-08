/**
 * ETA Formatting Utilities
 *
 * Formats priority duration into human-readable ETA strings.
 *
 * @module lib/utils/eta-format
 */

import { getPriorityDuration } from "@/lib/utils/progress";

/**
 * Format ETA based on priority
 *
 * @param priority - Order priority (0 = highest)
 * @returns Formatted ETA string like "ETA: 1h", "ETA: 15m"
 *
 * @example
 * formatETA(0) // "ETA: 15m"
 * formatETA(1) // "ETA: 1h"
 * formatETA(2) // "ETA: 2.5h"
 */
export function formatETA(priority: number): string {
  const duration = getPriorityDuration(priority);

  if (duration < 1) {
    const minutes = Math.round(duration * 60);
    return `ETA: ${minutes}m`;
  }

  // Format hours - show decimal only if not whole number
  if (Number.isInteger(duration)) {
    return `ETA: ${duration}h`;
  }

  return `ETA: ${duration}h`;
}

/**
 * Get ETA description for a priority
 *
 * @param priority - Order priority
 * @returns Human-readable duration description
 */
export function getETADescription(priority: number): string {
  const duration = getPriorityDuration(priority);

  if (duration < 1) {
    const minutes = Math.round(duration * 60);
    return `${minutes} minutes`;
  }

  if (Number.isInteger(duration)) {
    return `${duration} hours`;
  }

  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  return `${hours}h ${minutes}m`;
}
