import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test that auditLog is accessible
    const auditLogCount = await prisma.auditLog.count();
    console.log('AuditLog count:', auditLogCount);

    // Test that failedLoginCount is accessible
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        failedLoginCount: true,
      },
      take: 1,
    });

    return NextResponse.json({
      success: true,
      auditLogCount,
      users,
      message: 'Prisma client working correctly',
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}