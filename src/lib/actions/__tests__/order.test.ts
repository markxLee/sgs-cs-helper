/**
 * Create Orders Action Tests
 *
 * Tests for SSE broadcast functionality in createOrders action.
 *
 * @module lib/actions/__tests__/order.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
const mockCreate = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    order: {
      findUnique: () => mockFindUnique(),
      create: (args: { data: unknown }) => mockCreate(args),
    },
  },
}));

// Mock SSE broadcaster
const mockBroadcastBulkUpdate = vi.fn();
vi.mock("@/lib/sse/broadcaster", () => ({
  broadcastBulkUpdate: (orders: unknown) => mockBroadcastBulkUpdate(orders),
}));

// ============================================================================
// Test Data
// ============================================================================

const validOrderInput = {
  jobNumber: "JOB-001",
  registeredDate: "2026-02-01T00:00:00.000Z",
  registeredBy: "Test User",
  receivedDate: "2026-02-01T00:00:00.000Z",
  checkedBy: "Checker",
  requiredDate: "2026-02-10T00:00:00.000Z",
  priority: 2,
  note: "Test note",
  sourceFileName: "test.xlsx",
};

const mockCreatedOrder = {
  id: "order-1",
  jobNumber: "JOB-001",
  registeredDate: new Date("2026-02-01"),
  receivedDate: new Date("2026-02-01"),
  requiredDate: new Date("2026-02-10"),
  priority: 2,
  status: "IN_PROGRESS",
};

// ============================================================================
// Tests
// ============================================================================

describe("createOrders Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to ensure fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("SSE Broadcast", () => {
    // TC-009-1: SSE event sent after upload
    it("should broadcast SSE event after successful order creation", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpload: true,
        },
      });
      mockFindUnique.mockResolvedValue(null); // No duplicate
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.created).toHaveLength(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledWith([mockCreatedOrder]);
    });

    // TC-009-4: Batch upload emits multiple events
    it("should broadcast SSE event with all created orders for batch upload", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpload: true,
        },
      });
      mockFindUnique.mockResolvedValue(null); // No duplicates
      
      const order1 = { ...mockCreatedOrder, id: "order-1", jobNumber: "JOB-001" };
      const order2 = { ...mockCreatedOrder, id: "order-2", jobNumber: "JOB-002" };
      mockCreate
        .mockResolvedValueOnce(order1)
        .mockResolvedValueOnce(order2);

      const orderInputs = [
        { ...validOrderInput, jobNumber: "JOB-001" },
        { ...validOrderInput, jobNumber: "JOB-002" },
      ];

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders(orderInputs);

      // Assert
      expect(result.created).toHaveLength(2);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledWith([order1, order2]);
    });

    // TC-009-3: SSE failure doesn't block upload
    it("should not fail upload if SSE broadcast fails", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpload: true,
        },
      });
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);
      mockBroadcastBulkUpdate.mockImplementation(() => {
        throw new Error("SSE broadcast failed");
      });

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert - Upload should still succeed
      expect(result.success).toBe(true);
      expect(result.created).toHaveLength(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    // Edge case: SSE not called when no orders created
    it("should not broadcast SSE when no orders are created", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpload: true,
        },
      });
      // All orders are duplicates
      mockFindUnique.mockResolvedValue({ id: "existing-order" });

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.created).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(mockBroadcastBulkUpdate).not.toHaveBeenCalled();
    });

    // Edge case: Partial success - only broadcast created orders
    it("should only broadcast successfully created orders in partial success", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          canUpload: true,
        },
      });
      
      // First order is duplicate, second creates successfully
      mockFindUnique
        .mockResolvedValueOnce({ id: "existing-order" })
        .mockResolvedValueOnce(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);

      const orderInputs = [
        { ...validOrderInput, jobNumber: "JOB-EXISTING" },
        { ...validOrderInput, jobNumber: "JOB-NEW" },
      ];

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders(orderInputs);

      // Assert
      expect(result.created).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledWith([mockCreatedOrder]);
    });
  });

  describe("Permission Validation", () => {
    it("should reject unauthenticated users", async () => {
      // Arrange
      mockAuth.mockResolvedValue(null);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.success).toBe(false);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("Unauthorized");
    });

    it("should reject STAFF without canUpload permission", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "STAFF",
          canUpload: false,
        },
      });

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.success).toBe(false);
      expect(result.failed[0].error).toContain("permission");
    });
  });
});
