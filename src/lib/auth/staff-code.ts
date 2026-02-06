import { prisma } from "@/lib/db";

type PrismaError = {
  code?: string;
  message?: string;
};

export async function createStaffCode(code: string) {
  try {
    const user = await prisma.user.create({
      data: { staffCode: code, role: "STAFF" },
    });
    return user;
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      // Unique constraint failed
      throw new Error("Staff code already exists");
    }
    throw error;
  }
}
