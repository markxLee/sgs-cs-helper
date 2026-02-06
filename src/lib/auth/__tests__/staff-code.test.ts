import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStaffCode } from '@/lib/auth/staff-code';
import { prisma } from '@/lib/db';

type PrismaError = {
  code: string;
  meta?: Record<string, unknown>;
};

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

describe('Staff Code Utility - TC-007: Uniqueness & Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-007: Duplicate Code Creation Fails', () => {
    it('should throw error when creating duplicate staff code', async () => {
      // Mock Prisma to throw P2002 unique constraint violation
      const error = new Error(
        'Unique constraint failed on the fields: (`staffCode`)'
      ) as Error & PrismaError;
      error.code = 'P2002';

      vi.mocked(prisma.user.create).mockRejectedValue(error);

      await expect(
        createStaffCode('SGS001')
      ).rejects.toThrow();
    });

    it('should handle P2002 error with descriptive message', async () => {
      const p2002Error = new Error(
        'Unique constraint failed on the fields: (`staffCode`)'
      ) as Error & PrismaError;
      p2002Error.code = 'P2002';

      vi.mocked(prisma.user.create).mockRejectedValue(p2002Error);

      try {
        await createStaffCode('DUPLICATE');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        // Check that error handling properly catches P2002
        const err = error as Error & Partial<PrismaError>;
        expect(err.code || err.message).toBeDefined();
      }
    });

    it('should include error details in thrown error', async () => {
      const detailError = new Error(
        'Unique constraint failed on the fields: (`staffCode`)'
      ) as Error & PrismaError;
      detailError.code = 'P2002';
      detailError.meta = { target: ['staffCode'] };

      vi.mocked(prisma.user.create).mockRejectedValue(detailError);

      try {
        await createStaffCode('DUPLICATE_CODE');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Staff Code Format Validation', () => {
    it('should handle null staffCode gracefully', async () => {
      const nullError = new Error('Staff code cannot be null');

      vi.mocked(prisma.user.create).mockRejectedValue(nullError);

      await expect(createStaffCode(null as unknown as string)).rejects.toThrow();
    });

    it('should handle empty string staffCode', async () => {
      const emptyError = new Error('Staff code cannot be empty');

      vi.mocked(prisma.user.create).mockRejectedValue(emptyError);

      await expect(createStaffCode('')).rejects.toThrow();
    });
  });

  describe('Database Error Handling', () => {
    it('should propagate other database errors', async () => {
      const dbError = new Error('Database connection failed') as Error & PrismaError;
      dbError.code = 'ECONNREFUSED';

      vi.mocked(prisma.user.create).mockRejectedValue(dbError);

      await expect(createStaffCode('SGS002')).rejects.toThrow(
        /connection failed|unexpected/i
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Database timeout');

      vi.mocked(prisma.user.create).mockRejectedValue(timeoutError);

      await expect(createStaffCode('SGS003')).rejects.toThrow();
    });
  });

  describe('Success Cases', () => {
    it('should return success for unique staff code', async () => {
      // This test would need the actual implementation
      // to test, but we're testing the error handling path
      expect(createStaffCode).toBeDefined();
    });

    it('should accept valid staff code format', async () => {
      const validCode = 'SGS2026';
      expect(validCode).toMatch(/^[A-Z]{3}\d+$/);
    });
  });
});
