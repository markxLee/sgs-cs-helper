import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        email: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}