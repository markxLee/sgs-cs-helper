import { describe, it, expect } from "vitest";
import type { Role } from "@/generated/prisma/client";
import { authConfig } from "../config";

// Type the authorize function  
type AuthorizeFunction = (
  credentials: Record<string, unknown> | undefined,
  req: Request
) => Promise<{ id: string; email: string; name: string; role: string } | null>;

// Extract authorize from the credentials provider (cast through unknown for type safety)
const credentialsProvider = authConfig.providers[0] as unknown as { authorize: AuthorizeFunction };
const authorize = credentialsProvider.authorize;

describe("NextAuth Configuration", () => {
  describe("authConfig", () => {
    it("should use JWT session strategy", () => {
      expect(authConfig.session?.strategy).toBe("jwt");
    });

    it("should have custom signIn page at /login", () => {
      expect(authConfig.pages?.signIn).toBe("/login");
    });

    it("should have one Credentials provider", () => {
      expect(authConfig.providers).toHaveLength(1);
    });
    
    it("should have authorize function defined", () => {
      const provider = authConfig.providers[0] as unknown as {
        authorize: AuthorizeFunction;
      };
      expect(provider.authorize).toBeDefined();
      expect(typeof provider.authorize).toBe("function");
    });
  });

  describe("authorize() input validation", () => {
    // These tests verify the authorize function's input validation
    // They work without mocks because they test early return conditions
    
    it("should return null for null credentials", async () => {
      const result = await authorize(
        null as unknown as Record<string, unknown>,
        {} as Request
      );
      expect(result).toBeNull();
    });

    it("should return null for undefined credentials", async () => {
      const result = await authorize(
        undefined,
        {} as Request
      );
      expect(result).toBeNull();
    });

    it("should return null for missing email", async () => {
      const result = await authorize(
        { password: "test123" },
        {} as Request
      );
      expect(result).toBeNull();
    });

    it("should return null for missing password", async () => {
      const result = await authorize(
        { email: "test@example.com" },
        {} as Request
      );
      expect(result).toBeNull();
    });

    it("should return null for empty email", async () => {
      const result = await authorize(
        { email: "", password: "test123" },
        {} as Request
      );
      expect(result).toBeNull();
    });

    it("should return null for empty password", async () => {
      const result = await authorize(
        { email: "test@example.com", password: "" },
        {} as Request
      );
      expect(result).toBeNull();
    });
  });

  describe("callbacks", () => {
    describe("jwt callback", () => {
      it("should add user data to token on sign in", async () => {
        const jwtCallback = authConfig.callbacks?.jwt;
        expect(jwtCallback).toBeDefined();
        
        const token = { sub: "123", id: "", role: "SUPER_ADMIN" as Role };
        const user = {
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN" as Role,
        };

        const result = await jwtCallback!(
          { token, user, account: null, trigger: "signIn" }
        );

        expect(result).toMatchObject({
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN",
        });
      });

      it("should return token unchanged if no user", async () => {
        const jwtCallback = authConfig.callbacks?.jwt;
        expect(jwtCallback).toBeDefined();
        
        const token = { sub: "123", id: "existing-id", role: "SUPER_ADMIN" as Role };

        const result = await jwtCallback!(
          // @ts-expect-error - testing undefined user case
          { token, user: undefined, account: null, trigger: "update" }
        );

        expect(result).toMatchObject({
          sub: "123",
          id: "existing-id",
          role: "SUPER_ADMIN",
        });
      });
      
      it("should preserve existing token properties", async () => {
        const jwtCallback = authConfig.callbacks?.jwt;
        expect(jwtCallback).toBeDefined();
        
        const token = { sub: "123", id: "", role: "SUPER_ADMIN" as Role, customField: "value" };
        const user = {
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN" as Role,
        };

        const result = await jwtCallback!(
          { token, user, account: null, trigger: "signIn" }
        );

        expect(result).toMatchObject({
          sub: "123",
          customField: "value",
          id: "user-123",
        });
      });
    });

    describe("session callback", () => {
      it("should expose token data in session", async () => {
        const sessionCallback = authConfig.callbacks?.session;
        expect(sessionCallback).toBeDefined();
        
        const session = {
          user: { id: "", name: "", email: "", role: "SUPER_ADMIN" as Role },
          expires: "2026-12-31",
        };
        const token = {
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN" as Role,
          sub: "123",
        };

        const result = await sessionCallback!(
          // @ts-expect-error - test mock doesn't need full type
          { session, token, trigger: "update", newSession: undefined }
        );

        expect(result.user).toMatchObject({
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN",
        });
      });
      
      it("should preserve session expires", async () => {
        const sessionCallback = authConfig.callbacks?.session;
        expect(sessionCallback).toBeDefined();
        
        const session = {
          user: { id: "", name: "", email: "", role: "SUPER_ADMIN" as Role },
          expires: "2026-12-31",
        };
        const token = {
          id: "user-123",
          email: "admin@test.com",
          name: "Super Admin",
          role: "SUPER_ADMIN" as Role,
          sub: "123",
        };

        const result = await sessionCallback!(
          // @ts-expect-error - test mock doesn't need full type
          { session, token, trigger: "update", newSession: undefined }
        );

        expect(result.expires).toBe("2026-12-31");
      });
    });
  });
});
