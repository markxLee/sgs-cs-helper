import { prisma } from '@/lib/db';
import { LoginResult } from '@/generated/prisma/enums';

/**
 * Logs a login attempt to the AuditLog table
 * @param params - Login attempt parameters
 * @param params.adminId - ID of the admin attempting login
 * @param params.result - Result of the login attempt
 * @param params.ip - Optional IP address of the login attempt
 */
export async function logLoginAttempt(params: {
  adminId: string;
  result: LoginResult;
  ip?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.adminId,
        result: params.result,
        ip: params.ip,
      },
    });
  } catch (error) {
    // Log the error but don't throw - we don't want to break the login flow
    console.error('Failed to log login attempt:', error);
  }
}

// Re-export LoginResult type for convenience
export type { LoginResult };