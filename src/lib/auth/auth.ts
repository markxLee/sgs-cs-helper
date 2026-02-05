import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * NextAuth.js instance exports
 * 
 * - handlers: GET/POST handlers for API route
 * - signIn: Server-side sign in function
 * - signOut: Server-side sign out function
 * - auth: Get current session (for Server Components/API routes)
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
