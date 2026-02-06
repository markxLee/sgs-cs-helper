"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateUniqueStaffCode } from "@/lib/utils/staff-code";

// ============================================================================
// Schemas
// ============================================================================

const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  canUpload: z.boolean().default(true),
  canUpdateStatus: z.boolean().default(true),
});

const updateStaffPermissionsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  canUpload: z.boolean(),
  canUpdateStatus: z.boolean(),
});

const updateStaffStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["ACTIVE", "PENDING", "REVOKED"]),
});

const regenerateStaffCodeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// ============================================================================
// Auth Helper
// ============================================================================

async function requireAdminRole() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("Access denied. Admin or Super Admin only.");
  }
  return session;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Create a new Staff user
 * 
 * Generates a unique staff code and creates user with role=STAFF.
 * Only ADMIN and SUPER_ADMIN can create staff users.
 */
export async function createStaff(input: {
  name: string;
  email?: string;
  canUpload?: boolean;
  canUpdateStatus?: boolean;
}): Promise<
  | { success: true; data: { staffCode: string; userId: string } }
  | { success: false; error: string }
> {
  try {
    // 1. Check authentication and authorization
    await requireAdminRole();

    // 2. Validate input
    const validation = createStaffSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const { name, email, canUpload, canUpdateStatus } = validation.data;

    // 3. Check if email already exists (if provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return { success: false, error: "Email already exists" };
      }
    }

    // 4. Generate unique staff code
    const staffCode = await generateUniqueStaffCode(prisma);

    // 5. Create Staff user
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        role: "STAFF",
        status: "ACTIVE",
        authMethod: "CREDENTIALS",
        staffCode,
        canUpload: canUpload ?? true,
        canUpdateStatus: canUpdateStatus ?? true,
      },
    });

    // 6. Revalidate staff page
    revalidatePath("/admin/staff");

    return { success: true, data: { staffCode, userId: user.id } };
  } catch (error) {
    console.error("Error creating staff:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create staff user" };
  }
}

/**
 * Get all Staff users
 * 
 * Returns all users with role=STAFF, sorted by creation date (newest first).
 * Only ADMIN and SUPER_ADMIN can view staff users.
 */
export async function getStaff(): Promise<
  | {
      success: true;
      data: Array<{
        id: string;
        name: string;
        email: string | null;
        staffCode: string;
        canUpload: boolean;
        canUpdateStatus: boolean;
        status: "PENDING" | "ACTIVE" | "REVOKED";
        createdAt: Date;
      }>;
    }
  | { success: false; error: string }
> {
  try {
    // 1. Check authentication and authorization
    await requireAdminRole();

    // 2. Query all STAFF users
    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffCode: true,
        canUpload: true,
        canUpdateStatus: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter users with staffCode (required for staff)
    const validStaff = staff
      .filter((user): user is typeof user & { staffCode: string; name: string } => 
        user.staffCode !== null && user.name !== null
      )
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        staffCode: user.staffCode,
        canUpload: user.canUpload,
        canUpdateStatus: user.canUpdateStatus,
        status: user.status as "PENDING" | "ACTIVE" | "REVOKED",
        createdAt: user.createdAt,
      }));

    return { success: true, data: validStaff };
  } catch (error) {
    console.error("Error fetching staff:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch staff users" };
  }
}

/**
 * Update staff user permissions
 * 
 * Updates canUpload and canUpdateStatus flags for a staff user.
 * Only ADMIN and SUPER_ADMIN can update permissions.
 */
export async function updateStaffPermissions(input: {
  userId: string;
  canUpload: boolean;
  canUpdateStatus: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // 1. Check authentication and authorization
    await requireAdminRole();

    // 2. Validate input
    const validation = updateStaffPermissionsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const { userId, canUpload, canUpdateStatus } = validation.data;

    // 3. Verify user exists and is STAFF
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role !== "STAFF") {
      return { success: false, error: "User is not a staff member" };
    }

    // 4. Update permissions
    await prisma.user.update({
      where: { id: userId },
      data: {
        canUpload,
        canUpdateStatus,
      },
    });

    // 5. Revalidate staff page
    revalidatePath("/admin/staff");

    return { success: true };
  } catch (error) {
    console.error("Error updating staff permissions:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update permissions" };
  }
}

/**
 * Update staff user status
 * 
 * Changes user status (ACTIVE, PENDING, REVOKED).
 * Only ADMIN and SUPER_ADMIN can update status.
 */
export async function updateStaffStatus(input: {
  userId: string;
  status: "ACTIVE" | "PENDING" | "REVOKED";
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // 1. Check authentication and authorization
    await requireAdminRole();

    // 2. Validate input
    const validation = updateStaffStatusSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const { userId, status } = validation.data;

    // 3. Verify user exists and is STAFF
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role !== "STAFF") {
      return { success: false, error: "User is not a staff member" };
    }

    // 4. Update status
    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // 5. Revalidate staff page
    revalidatePath("/admin/staff");

    return { success: true };
  } catch (error) {
    console.error("Error updating staff status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Regenerate staff code for a user
 * 
 * Generates a new unique staff code and updates the user.
 * The old code becomes invalid immediately.
 * Only ADMIN and SUPER_ADMIN can regenerate codes.
 */
export async function regenerateStaffCode(input: {
  userId: string;
}): Promise<
  | { success: true; data: { newCode: string } }
  | { success: false; error: string }
> {
  try {
    // 1. Check authentication and authorization
    await requireAdminRole();

    // 2. Validate input
    const validation = regenerateStaffCodeSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const { userId } = validation.data;

    // 3. Verify user exists and is STAFF
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, staffCode: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role !== "STAFF") {
      return { success: false, error: "User is not a staff member" };
    }

    // 4. Generate new unique code
    const newCode = await generateUniqueStaffCode(prisma);

    // 5. Update user with new code
    await prisma.user.update({
      where: { id: userId },
      data: { staffCode: newCode },
    });

    // 6. Revalidate staff page
    revalidatePath("/admin/staff");

    return { success: true, data: { newCode } };
  } catch (error) {
    console.error("Error regenerating staff code:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to regenerate code" };
  }
}
