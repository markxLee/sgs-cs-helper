import { describe, it, expect } from 'vitest';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';

/**
 * TC-005: Session Includes Permissions
 * 
 * These tests verify that the NextAuth type extensions properly
 * include canUpload, canUpdateStatus, and staffCode in Session, User, and JWT types
 */

describe('NextAuth Type Extensions - TC-005', () => {
  describe('Session Type', () => {
    it('should include canUpload in session user', () => {
      const session: Session = {
        user: {
          id: 'test-id',
          email: 'test@sgs.com',
          name: 'Test User',
          image: null,
          role: 'STAFF',
          status: 'ACTIVE',
          canUpload: true,
          canUpdateStatus: true,
          staffCode: 'SGS001',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(session.user.canUpload).toBe(true);
      expect(typeof session.user.canUpload).toBe('boolean');
    });

    it('should include canUpdateStatus in session user', () => {
      const session: Session = {
        user: {
          id: 'test-id',
          email: 'test@sgs.com',
          name: 'Test User',
          image: null,
          role: 'STAFF',
          status: 'ACTIVE',
          canUpload: false,
          canUpdateStatus: true,
          staffCode: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(session.user.canUpdateStatus).toBe(true);
      expect(typeof session.user.canUpdateStatus).toBe('boolean');
    });

    it('should include staffCode in session user', () => {
      const session: Session = {
        user: {
          id: 'test-id',
          email: 'test@sgs.com',
          name: 'Test User',
          image: null,
          role: 'STAFF',
          status: 'ACTIVE',
          canUpload: true,
          canUpdateStatus: true,
          staffCode: 'SGS001',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(session.user.staffCode).toBe('SGS001');
      expect(typeof session.user.staffCode).toBe('string');
    });

    it('should allow staffCode to be null for email/password users', () => {
      const session: Session = {
        user: {
          id: 'admin-id',
          email: 'admin@sgs.com',
          name: 'Admin User',
          image: null,
          role: 'ADMIN',
          status: 'ACTIVE',
          canUpload: true,
          canUpdateStatus: true,
          staffCode: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(session.user.staffCode).toBeNull();
    });

    it('should have all required session properties', () => {
      const session: Session = {
        user: {
          id: 'test-id',
          email: 'test@sgs.com',
          name: 'Test User',
          image: null,
          role: 'STAFF',
          status: 'ACTIVE',
          canUpload: true,
          canUpdateStatus: false,
          staffCode: 'SGS002',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Verify all properties exist
      expect(session.user).toHaveProperty('id');
      expect(session.user).toHaveProperty('email');
      expect(session.user).toHaveProperty('name');
      expect(session.user).toHaveProperty('image');
      expect(session.user).toHaveProperty('canUpload');
      expect(session.user).toHaveProperty('canUpdateStatus');
      expect(session.user).toHaveProperty('staffCode');
      expect(session).toHaveProperty('expires');
    });
  });

  describe('User Type', () => {
    it('should include canUpload in user', () => {
      const user: User = {
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        image: null,
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      expect(user.canUpload).toBe(true);
      expect(typeof user.canUpload).toBe('boolean');
    });

    it('should include canUpdateStatus in user', () => {
      const user: User = {
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        image: null,
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: false,
        canUpdateStatus: true,
        staffCode: null,
      };

      expect(user.canUpdateStatus).toBe(true);
    });

    it('should include staffCode in user', () => {
      const user: User = {
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        image: null,
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      expect(user.staffCode).toBe('SGS001');
    });

    it('should allow staffCode to be null', () => {
      const user: User = {
        id: 'admin-id',
        email: 'admin@sgs.com',
        name: 'Admin User',
        image: null,
        role: 'ADMIN',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: null,
      };

      expect(user.staffCode).toBeNull();
    });
  });

  describe('JWT Type', () => {
    it('should include canUpload in JWT token', () => {
      const token: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      expect(token.canUpload).toBe(true);
      expect(typeof token.canUpload).toBe('boolean');
    });

    it('should include canUpdateStatus in JWT token', () => {
      const token: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: false,
        canUpdateStatus: true,
        staffCode: null,
      };

      expect(token.canUpdateStatus).toBe(true);
    });

    it('should include staffCode in JWT token', () => {
      const token: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      expect(token.staffCode).toBe('SGS001');
    });

    it('should allow staffCode to be null in JWT', () => {
      const token: JWT = {
        sub: 'admin-id',
        id: 'admin-id',
        email: 'admin@sgs.com',
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: null,
      };

      expect(token.staffCode).toBeNull();
    });

    it('should have standard JWT properties', () => {
      const token: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      // Standard JWT properties
      expect(token.sub).toBeDefined();
      // Extended properties
      expect(token.canUpload).toBeDefined();
      expect(token.canUpdateStatus).toBeDefined();
      expect(token.staffCode).toBeDefined();
    });
  });

  describe('Type Compatibility', () => {
    it('should allow converting User to Session user', () => {
      const user: User = {
        id: 'test-id',
        email: 'test@sgs.com',
        name: 'Test User',
        image: null,
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      const session: Session = {
        user: {
          ...user,
          id: user.id!,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(session.user).toBe(user);
      expect(session.user.canUpload).toBe(true);
    });

    it('should allow converting JWT to User', () => {
      const token: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      };

      const user: User = {
        id: token.id,
        email: token.email || '',
        name: token.name || null,
        image: null,
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: token.canUpload,
        canUpdateStatus: token.canUpdateStatus,
        staffCode: token.staffCode,
      };

      expect(user.id).toBe(token.id);
      expect(user.canUpload).toBe(token.canUpload);
    });

    it('should maintain permission state through session lifecycle', () => {
      // Simulates JWT → Session conversion
      const jwtToken: JWT = {
        sub: 'user-id',
        id: 'user-id',
        email: 'test@sgs.com',
        name: 'Test User',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: false,
        staffCode: 'SGS001',
      };

      const sessionUser = {
        id: jwtToken.id,
        email: jwtToken.email || '',
        name: jwtToken.name || null,
        image: null,
        canUpload: jwtToken.canUpload,
        canUpdateStatus: jwtToken.canUpdateStatus,
        staffCode: jwtToken.staffCode,
      };

      // Verify permissions preserved
      expect(sessionUser.canUpload).toBe(true);
      expect(sessionUser.canUpdateStatus).toBe(false);
      expect(sessionUser.staffCode).toBe('SGS001');
    });
  });
});
