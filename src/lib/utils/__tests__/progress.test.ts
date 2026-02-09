import { describe, it, expect } from "vitest";

import {
  calculateOrderProgress,
  getLunchBreakDeduction,
  getPriorityDuration,
  getProgressColor,
} from "@/lib/utils/progress";

// ============================================================================
// getPriorityDuration
// ============================================================================

describe("getPriorityDuration", () => {
  it("should return 0.25h for P0 (emergency)", () => {
    expect(getPriorityDuration(0)).toBe(0.25);
  });

  it("should return 1h for P1 (urgent)", () => {
    expect(getPriorityDuration(1)).toBe(1);
  });

  it("should return 2.5h for P2 (normal)", () => {
    expect(getPriorityDuration(2)).toBe(2.5);
  });

  it("should return 3h for P3+ (default)", () => {
    expect(getPriorityDuration(3)).toBe(3);
    expect(getPriorityDuration(5)).toBe(3);
    expect(getPriorityDuration(99)).toBe(3);
  });

  it("should treat negative priorities as P0", () => {
    expect(getPriorityDuration(-1)).toBe(0.25);
  });
});

// ============================================================================
// getProgressColor
// ============================================================================

describe("getProgressColor", () => {
  it("should return white for 0-40%", () => {
    expect(getProgressColor(0)).toBe("white");
    expect(getProgressColor(40)).toBe("white");
  });

  it("should return green for 41-65%", () => {
    expect(getProgressColor(41)).toBe("green");
    expect(getProgressColor(65)).toBe("green");
  });

  it("should return yellow for 66-80%", () => {
    expect(getProgressColor(66)).toBe("yellow");
    expect(getProgressColor(80)).toBe("yellow");
  });

  it("should return red for >80%", () => {
    expect(getProgressColor(81)).toBe("red");
    expect(getProgressColor(120)).toBe("red");
  });
});

// ============================================================================
// getLunchBreakDeduction
// ============================================================================

describe("getLunchBreakDeduction", () => {
  // Helper to create date on a fixed day
  const d = (hour: number, minute = 0): Date =>
    new Date(2026, 1, 9, hour, minute, 0); // Feb 9, 2026

  describe("Case 1: received before lunch, now after lunch", () => {
    it("should deduct 1 hour", () => {
      // Arrange
      const received = d(10, 0); // 10:00
      const now = d(14, 0); // 14:00

      // Act
      const deduction = getLunchBreakDeduction(received, now);

      // Assert
      expect(deduction).toBe(1);
    });

    it("should deduct 1 hour when received at 11:59", () => {
      const deduction = getLunchBreakDeduction(d(11, 59), d(15, 0));
      expect(deduction).toBe(1);
    });

    it("should deduct 1 hour when now is exactly 13:00", () => {
      const deduction = getLunchBreakDeduction(d(9, 0), d(13, 0));
      expect(deduction).toBe(1);
    });
  });

  describe("Case 2: received before lunch, now during lunch", () => {
    it("should deduct partial time (now at 12:30 → 0.5h)", () => {
      const deduction = getLunchBreakDeduction(d(10, 0), d(12, 30));
      expect(deduction).toBe(0.5);
    });

    it("should deduct 0 when now is exactly 12:00", () => {
      const deduction = getLunchBreakDeduction(d(10, 0), d(12, 0));
      expect(deduction).toBe(0);
    });

    it("should deduct partial time (now at 12:45 → 0.75h)", () => {
      const deduction = getLunchBreakDeduction(d(11, 0), d(12, 45));
      expect(deduction).toBe(0.75);
    });
  });

  describe("Case 3: received during lunch, now after lunch", () => {
    it("should deduct remaining lunch (received 12:03, now 14:00 → ~0.95h)", () => {
      // Arrange — the user's exact scenario
      const received = d(12, 3); // 12:03
      const now = d(14, 0); // 14:00

      // Act
      const deduction = getLunchBreakDeduction(received, now);

      // Assert — 13:00 - 12:05 = 0.95h
      expect(deduction).toBe(0.95);
    });

    it("should deduct 1h when received exactly at 12:00", () => {
      const deduction = getLunchBreakDeduction(d(12, 0), d(14, 0));
      expect(deduction).toBe(1);
    });

    it("should deduct 0.5h when received at 12:30", () => {
      const deduction = getLunchBreakDeduction(d(12, 30), d(15, 0));
      expect(deduction).toBe(0.5);
    });

    it("should deduct ~0.08h when received at 12:55", () => {
      const deduction = getLunchBreakDeduction(d(12, 55), d(14, 0));
      // 13 - 12.9167 ≈ 0.08 (rounded to 2 decimals)
      expect(deduction).toBeCloseTo(0.08, 2);
    });
  });

  describe("Case 4: both received and now during lunch", () => {
    it("should deduct entire elapsed time", () => {
      // Arrange
      const received = d(12, 0); // 12:00
      const now = d(12, 30); // 12:30

      // Act
      const deduction = getLunchBreakDeduction(received, now);

      // Assert — all 30 min is lunch = 0.5h
      expect(deduction).toBe(0.5);
    });

    it("should deduct 0 when received and now are the same time", () => {
      const deduction = getLunchBreakDeduction(d(12, 15), d(12, 15));
      expect(deduction).toBe(0);
    });
  });

  describe("Case 5: no deduction scenarios", () => {
    it("should return 0 when received after lunch", () => {
      const deduction = getLunchBreakDeduction(d(13, 30), d(15, 0));
      expect(deduction).toBe(0);
    });

    it("should return 0 when both before lunch", () => {
      const deduction = getLunchBreakDeduction(d(9, 0), d(11, 0));
      expect(deduction).toBe(0);
    });

    it("should return 0 when received exactly at 13:00", () => {
      const deduction = getLunchBreakDeduction(d(13, 0), d(15, 0));
      expect(deduction).toBe(0);
    });
  });

  describe("multi-day orders", () => {
    it("should deduct 1h for multi-day order (received before lunch day 1, now after lunch day 2)", () => {
      const received = new Date(2026, 1, 8, 10, 0); // Feb 8, 10:00
      const now = new Date(2026, 1, 9, 14, 0); // Feb 9, 14:00
      const deduction = getLunchBreakDeduction(received, now);
      expect(deduction).toBe(1);
    });
  });
});

// ============================================================================
// calculateOrderProgress
// ============================================================================

describe("calculateOrderProgress", () => {
  describe("basic progress calculation", () => {
    it("should return 0% for future orders", () => {
      // Arrange
      const received = new Date(2026, 1, 10, 9, 0); // tomorrow
      const now = new Date(2026, 1, 9, 14, 0); // today

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert
      expect(result).toStrictEqual({
        percentage: 0,
        color: "white",
        isOverdue: false,
        elapsedHours: 0,
        totalHours: 2.5,
        remainingHours: 2.5,
      });
    });

    it("should calculate 60% for P2 after 1.5h (no lunch)", () => {
      // Arrange
      const received = new Date(2026, 1, 9, 8, 0); // 08:00
      const now = new Date(2026, 1, 9, 9, 30); // 09:30

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — 1.5h / 2.5h = 60%
      expect(result.percentage).toBe(60);
      expect(result.color).toBe("green");
      expect(result.isOverdue).toBe(false);
      expect(result.elapsedHours).toBe(1.5);
    });

    it("should show overdue when percentage > 100", () => {
      // Arrange — P1 (1h), elapsed 1.5h
      const received = new Date(2026, 1, 9, 8, 0); // 08:00
      const now = new Date(2026, 1, 9, 9, 30); // 09:30

      // Act
      const result = calculateOrderProgress(received, 1, now);

      // Assert — 1.5h / 1h = 150%
      expect(result.percentage).toBe(150);
      expect(result.color).toBe("red");
      expect(result.isOverdue).toBe(true);
    });
  });

  describe("lunch break deduction in progress", () => {
    it("should deduct 1h lunch for order spanning full lunch (before → after)", () => {
      // Arrange — P2 (2.5h), received 10:00, now 14:00
      const received = new Date(2026, 1, 9, 10, 0);
      const now = new Date(2026, 1, 9, 14, 0);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — raw 4h - 1h lunch = 3h effective, 3/2.5 = 120%
      expect(result.percentage).toBe(120);
      expect(result.isOverdue).toBe(true);
      expect(result.elapsedHours).toBe(3);
    });

    it("should deduct partial lunch for order received at 12:03 (user's bug scenario)", () => {
      // Arrange — the exact scenario: 12:03, P2 (2.5h), check at 15:00
      const received = new Date(2026, 1, 9, 12, 3); // 12:03
      const now = new Date(2026, 1, 9, 15, 0); // 15:00

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert
      // Raw elapsed: 15:00 - 12:03 = 2.95h
      // Lunch deduction: 13:00 - 12.05 = 0.95h
      // Effective: 2.95 - 0.95 = 2.0h
      // Percentage: 2.0 / 2.5 = 80%
      expect(result.percentage).toBe(80);
      expect(result.color).toBe("yellow");
      expect(result.isOverdue).toBe(false);
      expect(result.elapsedHours).toBe(2);
    });

    it("should calculate correct deadline for order at 12:03 P2 → 15:33", () => {
      // Arrange — received 12:03, P2 (2.5h)
      // Effective start: 13:00 (after lunch ends)
      // Deadline: 13:00 + 2.5h = 15:30
      // At 15:33 → should be slightly overdue
      const received = new Date(2026, 1, 9, 12, 3);
      const now = new Date(2026, 1, 9, 15, 33);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert
      // Raw elapsed: 3.5h, lunch deduction: 0.95h, effective: 2.55h
      // Percentage: 2.55 / 2.5 = 102%
      expect(result.percentage).toBe(102);
      expect(result.isOverdue).toBe(true);
    });

    it("should not be overdue at 15:00 for order at 12:03 P2", () => {
      // Arrange
      const received = new Date(2026, 1, 9, 12, 3);
      const now = new Date(2026, 1, 9, 15, 0);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — effective 2.0h / 2.5h = 80%, NOT overdue
      expect(result.isOverdue).toBe(false);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it("should deduct partial lunch when now is during lunch", () => {
      // Arrange — received 11:00, now 12:30
      const received = new Date(2026, 1, 9, 11, 0);
      const now = new Date(2026, 1, 9, 12, 30);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — raw 1.5h - 0.5h lunch = 1.0h effective
      // 1.0 / 2.5 = 40%
      expect(result.percentage).toBe(40);
      expect(result.elapsedHours).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle received exactly at 12:00", () => {
      // Arrange — received at noon, now 14:00
      const received = new Date(2026, 1, 9, 12, 0);
      const now = new Date(2026, 1, 9, 14, 0);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — raw 2h - 1h lunch = 1h effective, 1/2.5 = 40%
      expect(result.percentage).toBe(40);
      expect(result.elapsedHours).toBe(1);
    });

    it("should handle received exactly at 13:00 (no deduction)", () => {
      // Arrange
      const received = new Date(2026, 1, 9, 13, 0);
      const now = new Date(2026, 1, 9, 14, 0);

      // Act
      const result = calculateOrderProgress(received, 2, now);

      // Assert — 1h / 2.5h = 40%, no lunch deduction
      expect(result.percentage).toBe(40);
      expect(result.elapsedHours).toBe(1);
    });
  });
});
