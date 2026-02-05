import { Role } from "@/generated/prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * NextAuth.js Type Extensions
 * 
 * Extends the default NextAuth types to include custom user properties:
 * - id: User's database ID
 * - role: User's role (SUPER_ADMIN, ADMIN, STAFF)
 */

declare module "next-auth" {
  /**
   * Extended Session interface
   * Adds id and role to the user object in session
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  /**
   * Extended User interface
   * Adds role to the user object returned from authorize()
   */
  interface User extends DefaultUser {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface
   * Adds id and role to the JWT token
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
