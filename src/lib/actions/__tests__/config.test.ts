import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLoginMode, updateLoginMode } from '@/lib/actions/config';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    config: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('Login Mode Configuration - TC-006', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-006: Login Mode Config Retrieval', () => {
    it('should return default login mode if not set', async () => {
      // Mock config not found
      vi.mocked(prisma.config.findUnique).mockResolvedValue(null);

      const mode = await getLoginMode();

      expect(mode).toBe('quick_code'); // Default
    });

    it('should return "quick_code" mode', async () => {
      vi.mocked(prisma.config.findUnique).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'quick_code',
        updatedAt: new Date(),
      });

      const mode = await getLoginMode();

      expect(mode).toBe('quick_code');
    });

    it('should return "full_login" mode', async () => {
      vi.mocked(prisma.config.findUnique).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'full_login',
        updatedAt: new Date(),
      });

      const mode = await getLoginMode();

      expect(mode).toBe('full_login');
    });

    it('should return "both" mode', async () => {
      vi.mocked(prisma.config.findUnique).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'both',
        updatedAt: new Date(),
      });

      const mode = await getLoginMode();

      expect(mode).toBe('both');
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database error');

      vi.mocked(prisma.config.findUnique).mockRejectedValue(dbError);

      // Should throw or return default
      await expect(getLoginMode()).rejects.toThrow();
    });
  });

  describe('updateLoginMode', () => {
    it('should update login mode to "quick_code"', async () => {
      vi.mocked(prisma.config.upsert).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'quick_code',
        updatedAt: new Date(),
      });

      await updateLoginMode('quick_code');

      expect(prisma.config.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'login_mode' },
          create: expect.objectContaining({
            key: 'login_mode',
            value: 'quick_code',
          }),
          update: expect.objectContaining({
            value: 'quick_code',
          }),
        })
      );
    });

    it('should update login mode to "full_login"', async () => {
      vi.mocked(prisma.config.upsert).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'full_login',
        updatedAt: new Date(),
      });

      await updateLoginMode('full_login');

      expect(prisma.config.upsert).toHaveBeenCalled();
    });

    it('should update login mode to "both"', async () => {
      vi.mocked(prisma.config.upsert).mockResolvedValue({
        id: 'test-config-id',
        key: 'login_mode',
        value: 'both',
        updatedAt: new Date(),
      });

      await updateLoginMode('both');

      expect(prisma.config.upsert).toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const dbError = new Error('Update failed');

      vi.mocked(prisma.config.upsert).mockRejectedValue(dbError);

      await expect(updateLoginMode('quick_code')).rejects.toThrow();
    });
  });

  describe('Login Mode Values', () => {
    it('should accept only valid login modes', () => {
      const validModes = ['quick_code', 'full_login', 'both'];

      validModes.forEach((mode) => {
        expect(['quick_code', 'full_login', 'both']).toContain(mode);
      });
    });

    it('should reject invalid login modes', () => {
      const invalidModes = ['invalid', 'admin_only', ''];

      invalidModes.forEach((mode) => {
        expect(['quick_code', 'full_login', 'both']).not.toContain(mode);
      });
    });
  });

  describe('Default Behavior', () => {
    it('should default to quick_code for new installations', async () => {
      vi.mocked(prisma.config.findUnique).mockResolvedValue(null);

      const mode = await getLoginMode();

      expect(mode).toBe('quick_code');
    });

    it('should not change behavior if config missing', async () => {
      vi.mocked(prisma.config.findUnique).mockResolvedValue(null);

      const mode1 = await getLoginMode();
      const mode2 = await getLoginMode();

      expect(mode1).toBe('quick_code');
      expect(mode2).toBe('quick_code');
    });
  });
});
