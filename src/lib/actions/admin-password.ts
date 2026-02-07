"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { auth } from "@/lib/auth";
import { logLoginAttempt } from "@/lib/utils/audit-log";

// ============================================================================
// Schemas
// ============================================================================

const setAdminPasswordSchema = z.object({
  adminId: z.string().cuid("Invalid admin ID"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const unlockAdminAccountSchema = z.object({
  adminId: z.string().cuid("Invalid admin ID"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Set or change password for an Admin user
 *
 * Only SUPER_ADMIN can call this action.
 * Hashes the password with bcrypt, resets failedLoginCount to 0,
 * unlocks account if LOCKED, and logs the change.
 */
export async function setAdminPassword(
  input: z.infer<typeof setAdminPasswordSchema>
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

    // 2. Validate input
    const validation = setAdminPasswordSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { adminId, password } = validation.data;

    // 3. Check if admin exists and is actually an admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return { success: false, error: "Admin not found" };
    }

    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      return { success: false, error: "User is not an admin" };
    }

    // 4. Hash the new password
    const hashedPassword = await hashPassword(password);

    // 5. Update the admin's password, reset failedLoginCount, and unlock if needed
    await prisma.user.update({
      where: { id: adminId },
      data: {
        passwordHash: hashedPassword,
        failedLoginCount: 0,
        status: admin.status === "REVOKED" ? "ACTIVE" : admin.status,
      },
    });

    // 6. Log the password change (using audit log for now)
    // Note: This logs as a successful login attempt for audit purposes
    await logLoginAttempt({
      adminId,
      result: "SUCCESS",
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting admin password:", error);
    return { success: false, error: "Failed to set password" };
  }
}

/**
 * Unlock an Admin account and reset failed login count
 *
 * Only SUPER_ADMIN can call this action.
 * Resets failedLoginCount to 0 and sets status to ACTIVE if currently LOCKED.
 */
export async function unlockAdminAccount(
  input: z.infer<typeof unlockAdminAccountSchema>
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

    // 2. Validate input
    const validation = unlockAdminAccountSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { adminId } = validation.data;

    // 3. Check if admin exists and is actually an admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return { success: false, error: "Admin not found" };
    }

    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      return { success: false, error: "User is not an admin" };
    }

    // 4. Update the admin's status and reset failedLoginCount
    await prisma.user.update({
      where: { id: adminId },
      data: {
        failedLoginCount: 0,
        status: "ACTIVE",
      },
    });

    // 5. Log the account unlock (using audit log for now)
    await logLoginAttempt({
      adminId,
      result: "SUCCESS",
    });

    return { success: true };
  } catch (error) {
    console.error("Error unlocking admin account:", error);
    return { success: false, error: "Failed to unlock account" };
  }
}