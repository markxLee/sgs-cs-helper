import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "./password";

/**
 * NextAuth.js configuration for SGS CS Helper
 * 
 * Uses Credentials provider with JWT session strategy.
 * Authenticates against seeded Super Admin user in database.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email (case-insensitive)
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        // User not found - return null (generic error)
        if (!user) {
          return null;
        }

        // User has no password hash (e.g., staff with code only)
        if (!user.passwordHash) {
          return null;
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // Use JWT strategy (stateless, no session table)
  session: {
    strategy: "jwt",
  },

  // Custom pages
  pages: {
    signIn: "/login",
  },

  callbacks: {
    /**
     * JWT callback - called when JWT is created or updated
     * Add custom fields to the token
     */
    async jwt({ token, user }) {
      // On initial sign in, add user data to token
      if (user) {
        token.id = user.id!;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    /**
     * Session callback - called when session is checked
     * Expose token data to client session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.role = token.role;
      }
      return session;
    },
  },
};
