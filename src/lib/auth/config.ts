import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "./password";
import { logLoginAttempt } from "@/lib/utils/audit-log";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Extract IP address from request headers
 * Handles various proxy configurations
 */
function getClientIP(request: Request): string | undefined {
  // Check common headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple (comma-separated)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    return clientIP;
  }

  // Fallback to connection remote address (if available)
  // Note: This might not work in all environments
  return undefined;
}

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
      async authorize(credentials, request) {
        // Standard email/password login
        if (credentials?.email && credentials?.password) {
          const email = credentials.email as string;
          const password = credentials.password as string;
          const clientIP = request ? getClientIP(request) : undefined;
          
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: "insensitive",
              },
            },
          });
          if (!user || !user.passwordHash || user.authMethod !== "CREDENTIALS") {
            return null;
          }
          
          // Log login attempt
          await logLoginAttempt({
            adminId: user.id,
            result: "FAILURE", // Assume failure, update to SUCCESS on success
            ip: clientIP,
          });
          
          // Check role and status for Admin login
          if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
            // Allow ACTIVE or PENDING status, block REVOKED
            if (user.status === "REVOKED") {
              return null; // Will show generic error
            }
            if (user.status !== "ACTIVE" && user.status !== "PENDING") {
              return null; // Unknown status
            }
          } else if (user.role === "STAFF") {
            // Staff must be ACTIVE
            if (user.status !== "ACTIVE") {
              return null;
            }
          } else {
            return null; // Unknown role
          }
          
          const isValidPassword = await verifyPassword(password, user.passwordHash);
          
          if (!isValidPassword) {
            // Increment failed login count
            const newFailedCount = user.failedLoginCount + 1;
            const updateData: Prisma.UserUpdateInput = { failedLoginCount: newFailedCount };
            
            // Lock account after 10 failed attempts
            if (newFailedCount >= 10) {
              updateData.status = "REVOKED";
            }
            
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
            
            return null;
          }
          
          // Successful login - reset failed login count
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0 },
          });
          
          // Update audit log to SUCCESS
          await logLoginAttempt({
            adminId: user.id,
            result: "SUCCESS",
            ip: clientIP,
          });
          
          // Update PENDING Admin status to ACTIVE on first login
          if ((user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "PENDING") {
            await prisma.user.update({
              where: { id: user.id },
              data: { status: "ACTIVE" },
            });
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status === "PENDING" ? "ACTIVE" : user.status, // Return ACTIVE even if just updated
            canUpload: user.canUpload,
            canUpdateStatus: user.canUpdateStatus,
            staffCode: user.staffCode,
          };
        }
        // Staff code login
        if (credentials?.staffCode) {
          const staffCode = credentials.staffCode as string;
          const clientIP = request ? getClientIP(request) : undefined;
          
          const user = await prisma.user.findFirst({
            where: {
              staffCode: staffCode,
              role: "STAFF",
              status: "ACTIVE",
            },
          });
          
          if (!user) {
            // Log failed staff login attempt
            // Since we don't have user ID for failed attempts, we'll need to handle this differently
            // For now, we'll skip logging failed staff attempts as they don't have identifiable users
            return null;
          }
          
          // Log successful staff login
          await logLoginAttempt({
            adminId: user.id,
            result: "SUCCESS",
            ip: clientIP,
          });
          
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
