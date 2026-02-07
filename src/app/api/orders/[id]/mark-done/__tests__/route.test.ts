/**
 * Mark Done API Route Tests
 *
 * Integration tests for POST /api/orders/[id]/mark-done
 * Tests permission validation for different user roles.
 *
 * @module app/api/orders/[id]/mark-done/__tests__/route.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ============================================================================
// Mocks
// ============================================================================

// Mock auth module
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

// Mock prisma
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    order: {
      findUnique: () => mockFindUnique(),
      update: () => mockUpdate(),
    },
  },
}));

// Mock SSE broadcaster
const mockBroadcastOrderUpdate = vi.fn();
vi.mock("@/lib/sse/broadcaster", () => ({
  broadcastOrderUpdate: (order: unknown) => mockBroadcastOrderUpdate(order),
}));

// ============================================================================
// Test Helpers
// ============================================================================

// Helper to create mock request
function createMockRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/orders/test-id/mark-done", {
    method: "POST",
  });
}

// Helper to create mock params
function createMockParams(id: string = "test-order-id") {
  return Promise.resolve({ id });
}

// Mock order data
const mockInProgressOrder = {
  id: "test-order-id",
  jobNumber: "JOB-001",
  status: "IN_PROGRESS",
};

const mockUpdatedOrder = {
  id: "test-order-id",
  jobNumber: "JOB-001",
  registeredDate: new Date("2026-02-01"),
  receivedDate: new Date("2026-02-01"),
  requiredDate: new Date("2026-02-10"),
  priority: 2,
  status: "COMPLETED",
  completedAt: new Date(),
};

// ============================================================================
// Tests
// ============================================================================

describe("POST /api/orders/[id]/mark-done", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Permission Validation", () => {
    // TC-008-4: Unauthenticated request receives 403
    it("should return 403 for unauthenticated user", async () => {
      // Arrange
      mockAuth.mockResolvedValue(null);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    // TC-008-1: Unauthorized STAFF receives 403
    it("should return 403 for STAFF without canUpdateStatus permission", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "STAFF",
          canUpdateStatus: false,
        },
      });

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("permission");
    });

    // TC-008-2: Authorized SUPER_ADMIN can mark done
    it("should return 200 for SUPER_ADMIN", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN",
          canUpdateStatus: false, // Should still work
        },
      });
      mockFindUnique.mockResolvedValue(mockInProgressOrder);
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("COMPLETED");
    });

    // TC-008-3: Authorized STAFF with permission can mark done
    it("should return 200 for STAFF with canUpdateStatus=true", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "STAFF",
          canUpdateStatus: true,
        },
      });
      mockFindUnique.mockResolvedValue(mockInProgressOrder);
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    // Additional: ADMIN can mark done
    it("should return 200 for ADMIN", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpdateStatus: false,
        },
      });
      mockFindUnique.mockResolvedValue(mockInProgressOrder);
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("SSE Broadcast", () => {
    it("should broadcast SSE event after successful mark done", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN",
          canUpdateStatus: false,
        },
      });
      mockFindUnique.mockResolvedValue(mockInProgressOrder);
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      await POST(request, { params: createMockParams() });

      // Assert
      expect(mockBroadcastOrderUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastOrderUpdate).toHaveBeenCalledWith(mockUpdatedOrder);
    });

    it("should not fail request if SSE broadcast fails", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN",
          canUpdateStatus: false,
        },
      });
      mockFindUnique.mockResolvedValue(mockInProgressOrder);
      mockUpdate.mockResolvedValue(mockUpdatedOrder);
      mockBroadcastOrderUpdate.mockImplementation(() => {
        throw new Error("SSE broadcast failed");
      });

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert - Request should still succeed
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("Order Validation", () => {
    it("should return 404 for non-existent order", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN",
          canUpdateStatus: false,
        },
      });
      mockFindUnique.mockResolvedValue(null);

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain("not found");
    });

    it("should return 400 for already completed order", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN",
          canUpdateStatus: false,
        },
      });
      mockFindUnique.mockResolvedValue({
        ...mockInProgressOrder,
        status: "COMPLETED",
      });

      // Act
      const { POST } = await import("../route");
      const request = createMockRequest();
      const response = await POST(request, { params: createMockParams() });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("not in progress");
    });
  });
});
