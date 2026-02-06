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
        staffCode: { label: "Staff Code", type: "text" },
      },
      async authorize(credentials) {
        // Standard email/password login
        if (credentials?.email && credentials?.password) {
          const email = credentials.email as string;
          const password = credentials.password as string;
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: "insensitive",
              },
            },
          });
          if (!user || !user.passwordHash || user.authMethod !== "CREDENTIALS" || user.status !== "ACTIVE") {
            return null;
          }
          const isValidPassword = await verifyPassword(password, user.passwordHash);
          if (!isValidPassword) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            canUpload: user.canUpload,
            canUpdateStatus: user.canUpdateStatus,
            staffCode: user.staffCode,
          };
        }
        // Staff code login
        if (credentials?.staffCode) {
          const staffCode = credentials.staffCode as string;
          const user = await prisma.user.findFirst({
            where: {
              staffCode: staffCode,
              role: "STAFF",
              status: "ACTIVE",
            },
          });
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            staffCode: user.staffCode,
            canUpload: user.canUpload,
            canUpdateStatus: user.canUpdateStatus,
          };
        }
        return null;
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
        token.status = user.status;
        token.canUpload = user.canUpload;
        token.canUpdateStatus = user.canUpdateStatus;
        token.staffCode = user.staffCode;
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
        session.user.status = token.status;
        session.user.canUpload = token.canUpload ?? false;
        session.user.canUpdateStatus = token.canUpdateStatus ?? false;
        session.user.staffCode = token.staffCode ?? null;
      }
      return session;
    },
  },
};
