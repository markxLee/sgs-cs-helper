/**
 * Order Progress Bar Component
 *
 * Visual progress indicator with color-coded urgency levels:
 * - White (⬜): 0-40% - Comfortable
 * - Green (🟢): 41-65% - On track
 * - Yellow (🟡): 66-80% - Getting urgent
 * - Red (🔴): >80% or overdue - Critical
 *
 * @module components/orders/order-progress-bar
 */

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProgressColor } from "@/lib/utils/progress";

// ============================================================================
// Types
// ============================================================================

interface OrderProgressBarProps {
  /** Progress percentage (can exceed 100 if overdue) */
  percentage: number;
  /** Color indicator based on urgency */
  color: ProgressColor;
  /** Whether order has exceeded its duration */
  isOverdue: boolean;
}

// ============================================================================
// Color Mapping
// ============================================================================

const colorClasses: Record<ProgressColor, string> = {
  white: "[&>div]:bg-gray-300",
  green: "[&>div]:bg-green-500",
  yellow: "[&>div]:bg-yellow-500",
  red: "[&>div]:bg-red-500",
};

const textColorClasses: Record<ProgressColor, string> = {
  white: "text-gray-600",
  green: "text-green-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
};

// ============================================================================
// Component
// ============================================================================

/**
 * Progress bar showing order completion status
 *
 * @example
 * <OrderProgressBar percentage={65} color="green" isOverdue={false} />
 * <OrderProgressBar percentage={120} color="red" isOverdue={true} />
 */
export function OrderProgressBar({
  percentage,
  color,
  isOverdue,
}: OrderProgressBarProps) {
  // Cap display percentage at 100 for the bar, but show actual % in text
  const displayPercentage = Math.min(percentage, 100);
  const displayText = isOverdue ? `${percentage}%` : `${percentage}%`;

  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Order progress: ${percentage}%${isOverdue ? " (overdue)" : ""}`}
    >
      <Progress
        value={displayPercentage}
        className={cn("h-2 w-24 bg-gray-100", colorClasses[color])}
      />
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          textColorClasses[color],
          isOverdue && "font-bold"
        )}
      >
        {displayText}
      </span>
    </div>
  );
}
