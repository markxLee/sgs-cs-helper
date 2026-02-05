"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ============================================================================
// Schemas
// ============================================================================

const inviteAdminSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    authMethod: z.enum(["CREDENTIALS", "GOOGLE"]),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  })
  .refine((data) => data.authMethod !== "CREDENTIALS" || data.password, {
    message: "Password is required for Email/Password authentication",
    path: ["password"],
  });

// ============================================================================
// Actions
// ============================================================================

/**
 * Invite a new Admin user
 * 
 * Creates a new user with role=ADMIN and status=PENDING.
 * For CREDENTIALS auth, hashes the provided password.
 * For GOOGLE auth, no password is stored.
 */
export async function inviteAdmin(
  input: z.infer<typeof inviteAdminSchema>
): Promise<{ success: true; data: { email: string } } | { success: false; error: string }> {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access denied. Super Admin only." };
    }

    // 2. Validate input
    const validation = inviteAdminSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const { email, authMethod, password } = validation.data;

    // 3. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    // 4. Hash password if CREDENTIALS auth
    let passwordHash: string | null = null;
    if (authMethod === "CREDENTIALS" && password) {
      passwordHash = await hashPassword(password);
    }

    // 5. Create Admin user
    await prisma.user.create({
      data: {
        email,
        role: "ADMIN",
        status: "PENDING",
        authMethod,
        passwordHash,
      },
    });

    // 6. Revalidate admin users page
    revalidatePath("/admin/users");

    return { success: true, data: { email } };
  } catch (error) {
    console.error("Error inviting admin:", error);
    return { success: false, error: "Failed to invite admin" };
  }
}

/**
 * Get all Admin users
 * 
 * Returns all users with role=ADMIN, sorted by creation date (newest first).
 */
export async function getAdmins(): Promise<
  | { success: true; data: Array<{
      id: string;
      email: string;
      name: string | null;
      status: "PENDING" | "ACTIVE" | "REVOKED";
      authMethod: "CREDENTIALS" | "GOOGLE";
      createdAt: Date;
    }> }
  | { success: false; error: string }
> {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access denied. Super Admin only." };
    }

    // 2. Query all ADMIN users
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        email: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        authMethod: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter and map to ensure email is not null (TypeScript safety)
    const safeAdmins = admins
      .filter((admin): admin is typeof admin & { email: string } => admin.email !== null)
      .map((admin) => ({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        status: admin.status as "PENDING" | "ACTIVE" | "REVOKED",
        authMethod: admin.authMethod as "CREDENTIALS" | "GOOGLE",
        createdAt: admin.createdAt,
      }));

    return { success: true, data: safeAdmins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { success: false, error: "Failed to fetch admins" };
  }
}

/**
 * Revoke an Admin user's access
 * 
 * Sets the user's status to REVOKED (soft delete).
 * Prevents Super Admin from revoking themselves.
 */
export async function revokeAdmin(
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access denied. Super Admin only." };
    }

    // 2. Prevent self-revoke
    if (session.user.id === userId) {
      return { success: false, error: "Cannot revoke your own access" };
    }

    // 3. Check if user exists and is an Admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role !== "ADMIN") {
      return { success: false, error: "Can only revoke Admin users" };
    }

    if (user.status === "REVOKED") {
      return { success: false, error: "User already revoked" };
    }

    // 4. Revoke access
    await prisma.user.update({
      where: { id: userId },
      data: { status: "REVOKED" },
    });

    // 5. Revalidate admin users page
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error revoking admin:", error);
    return { success: false, error: "Failed to revoke admin" };
  }
}
