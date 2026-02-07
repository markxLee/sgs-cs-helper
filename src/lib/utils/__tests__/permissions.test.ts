/**
 * Permission Utility Tests
 *
 * Tests for permission check logic used in Mark Done feature.
 *
 * @module lib/utils/__tests__/permissions.test
 */

import { describe, it, expect } from "vitest";
import type { Role } from "@/generated/prisma/client";

// ============================================================================
// Permission Logic (extracted for testing)
// ============================================================================

/**
 * Check if user can mark orders as done
 *
 * Logic:
 * - SUPER_ADMIN: always allowed
 * - ADMIN: always allowed
 * - STAFF: only if canUpdateStatus is true
 * - Others/unauthenticated: not allowed
 */
function canMarkOrderDone(user: {
  role: Role;
  canUpdateStatus: boolean;
} | null | undefined): boolean {
  if (!user) return false;

  const { role, canUpdateStatus } = user;

  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    (role === "STAFF" && canUpdateStatus === true)
  );
}

// ============================================================================
// Tests
// ============================================================================

describe("Permission Utils", () => {
  describe("canMarkOrderDone", () => {
    // TC-007-1: Button visible for SUPER_ADMIN
    it("should return true for SUPER_ADMIN", () => {
      const user = { role: "SUPER_ADMIN" as Role, canUpdateStatus: false };
      expect(canMarkOrderDone(user)).toBe(true);
    });

    // TC-007-2: Button visible for ADMIN
    it("should return true for ADMIN", () => {
      const user = { role: "ADMIN" as Role, canUpdateStatus: false };
      expect(canMarkOrderDone(user)).toBe(true);
    });

    // TC-007-3: Button visible for STAFF with canUpdateStatus=true
    it("should return true for STAFF with canUpdateStatus=true", () => {
      const user = { role: "STAFF" as Role, canUpdateStatus: true };
      expect(canMarkOrderDone(user)).toBe(true);
    });

    // TC-007-4: Button hidden for STAFF with canUpdateStatus=false
    it("should return false for STAFF with canUpdateStatus=false", () => {
      const user = { role: "STAFF" as Role, canUpdateStatus: false };
      expect(canMarkOrderDone(user)).toBe(false);
    });

    // TC-007-5: Button hidden for unauthenticated user
    it("should return false for null user", () => {
      expect(canMarkOrderDone(null)).toBe(false);
    });

    it("should return false for undefined user", () => {
      expect(canMarkOrderDone(undefined)).toBe(false);
    });

    // Edge case: SUPER_ADMIN with canUpdateStatus=true (should still work)
    it("should return true for SUPER_ADMIN regardless of canUpdateStatus", () => {
      const user = { role: "SUPER_ADMIN" as Role, canUpdateStatus: true };
      expect(canMarkOrderDone(user)).toBe(true);
    });

    // Edge case: ADMIN with canUpdateStatus=true (should still work)
    it("should return true for ADMIN regardless of canUpdateStatus", () => {
      const user = { role: "ADMIN" as Role, canUpdateStatus: true };
      expect(canMarkOrderDone(user)).toBe(true);
    });
  });
});
