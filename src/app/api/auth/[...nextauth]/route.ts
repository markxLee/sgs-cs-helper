import { handlers } from "@/lib/auth";

/**
 * NextAuth.js API Route Handler
 * 
 * Handles all /api/auth/* routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/credentials
 * - /api/auth/session
 * - /api/auth/providers
 * - etc.
 */
export const { GET, POST } = handlers;
