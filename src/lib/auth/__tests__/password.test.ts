import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("Password Utility", () => {
  const testPassword = "securepassword123";
  const wrongPassword = "wrongpassword123";

  describe("hashPassword", () => {
    // TC-001: hashPassword returns hash string
    it("TC-001: should return a non-empty hash string different from input", async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).not.toBe(testPassword);
    });

    it("should return different hashes for same password (due to salt)", async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);
    });

    it("should return bcrypt formatted hash (starts with $2)", async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("verifyPassword", () => {
    // TC-002: verifyPassword returns true for correct password
    it("TC-002: should return true for correct password", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword(testPassword, hash);

      expect(result).toBe(true);
    });

    // TC-003: verifyPassword returns false for wrong password
    it("TC-003: should return false for wrong password", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it("should return false for empty password against valid hash", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword("", hash);

      expect(result).toBe(false);
    });
  });
});
