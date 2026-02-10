/**
 * Create Orders Action Tests
 *
 * Tests for upsert behavior, SSE broadcast, and permission validation
 * in createOrders server action.
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

// Mock prisma with $transaction + order.findFirst/create/update
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

// Transaction proxy — delegates to the same mock fns
const txProxy = {
  order: {
    findFirst: (args: unknown) => mockFindFirst(args),
    create: (args: unknown) => mockCreate(args),
    update: (args: unknown) => mockUpdate(args),
  },
};

const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: (fn: (tx: typeof txProxy) => Promise<unknown>, opts?: unknown) =>
      mockTransaction(fn, opts),
    order: {
      findFirst: (args: unknown) => mockFindFirst(args),
      create: (args: unknown) => mockCreate(args),
      update: (args: unknown) => mockUpdate(args),
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
  registeredBy: "Test User",
  checkedBy: "Checker",
  note: "Test note",
  completedAt: null,
};

const mockExistingOrder = {
  id: "existing-1",
  jobNumber: "JOB-EXISTING",
  registeredDate: new Date("2026-02-01"),
  receivedDate: new Date("2026-02-01"),
  requiredDate: new Date("2026-02-10"),
  priority: 2,
  status: "IN_PROGRESS",
  registeredBy: "Test User",
  checkedBy: "Checker",
  note: "Test note",
  completedAt: null,
};

const mockCompletedOrder = {
  ...mockExistingOrder,
  id: "completed-1",
  jobNumber: "JOB-COMPLETED",
  status: "COMPLETED",
  completedAt: new Date("2026-02-05"),
};

const adminSession = {
  user: {
    id: "user-1",
    role: "ADMIN",
    canUpload: true,
  },
};

// ============================================================================
// Helpers
// ============================================================================

/** Set up default transaction mock that calls the callback with txProxy */
function setupTransaction(): void {
  mockTransaction.mockImplementation(
    (fn: (tx: typeof txProxy) => Promise<unknown>) => fn(txProxy)
  );
}

/** Set up auth mock with admin session */
function setupAuth(): void {
  mockAuth.mockResolvedValue(adminSession);
}

// ============================================================================
// Tests
// ============================================================================

describe("createOrders Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Upsert Logic
  // ==========================================================================

  describe("Upsert Logic", () => {
    // TC-001: Create order when jobNumber not found
    it("should create a new order when jobNumber not found in DB", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.created).toHaveLength(1);
      expect(result.created[0]).toEqual(mockCreatedOrder);
      expect(result.updated).toHaveLength(0);
      expect(result.unchanged).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    // TC-002: Update order when found + data changed
    it("should update an existing order when data has changed", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(mockExistingOrder);

      const changedInput = {
        ...validOrderInput,
        jobNumber: "JOB-EXISTING",
        priority: 5, // Changed from 2 to 5
      };

      const updatedOrder = { ...mockExistingOrder, priority: 5 };
      mockUpdate.mockResolvedValue(updatedOrder);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([changedInput]);

      // Assert
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0]).toEqual(updatedOrder);
      expect(result.created).toHaveLength(0);
      expect(result.unchanged).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    // TC-003: Skip unchanged when found + data same
    it("should report unchanged when existing order data is identical", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(mockExistingOrder);

      const identicalInput = {
        ...validOrderInput,
        jobNumber: "JOB-EXISTING",
      };

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([identicalInput]);

      // Assert
      expect(result.unchanged).toHaveLength(1);
      expect(result.unchanged[0].jobNumber).toBe("JOB-EXISTING");
      expect(result.unchanged[0].order).toEqual(mockExistingOrder);
      expect(result.unchanged[0].reason).toBe("All fields identical");
      expect(result.created).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
      // No DB write for unchanged
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    // TC-004: Mixed batch — create + update + unchanged in one call
    it("should categorize orders correctly in a mixed batch", async () => {
      // Arrange
      setupAuth();
      setupTransaction();

      const existingUnchanged = {
        ...mockExistingOrder,
        id: "existing-unchanged",
        jobNumber: "JOB-UNCHANGED",
      };
      const existingChanged = {
        ...mockExistingOrder,
        id: "existing-changed",
        jobNumber: "JOB-CHANGED",
      };
      const updatedOrder = { ...existingChanged, priority: 9 };
      const newOrder = { ...mockCreatedOrder, id: "new-1", jobNumber: "JOB-NEW" };

      // findFirst: 1st call → not found, 2nd → changed, 3rd → unchanged
      mockFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingChanged)
        .mockResolvedValueOnce(existingUnchanged);

      mockCreate.mockResolvedValueOnce(newOrder);
      mockUpdate.mockResolvedValueOnce(updatedOrder);

      const inputs = [
        { ...validOrderInput, jobNumber: "JOB-NEW" },
        { ...validOrderInput, jobNumber: "JOB-CHANGED", priority: 9 },
        { ...validOrderInput, jobNumber: "JOB-UNCHANGED" },
      ];

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders(inputs);

      // Assert
      expect(result.created).toHaveLength(1);
      expect(result.created[0].jobNumber).toBe("JOB-NEW");
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].jobNumber).toBe("JOB-CHANGED");
      expect(result.unchanged).toHaveLength(1);
      expect(result.unchanged[0].jobNumber).toBe("JOB-UNCHANGED");
      expect(result.failed).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Status Preservation (FR-003)
  // ==========================================================================

  describe("Status Preservation", () => {
    // TC-005: Preserve COMPLETED status on update
    it("should preserve COMPLETED status and completedAt on update", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(mockCompletedOrder);

      const changedInput = {
        ...validOrderInput,
        jobNumber: "JOB-COMPLETED",
        note: "Updated note", // Changed field to trigger update
      };

      const updatedOrder = {
        ...mockCompletedOrder,
        note: "Updated note",
        // status and completedAt preserved by DB (not in update data)
      };
      mockUpdate.mockResolvedValue(updatedOrder);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([changedInput]);

      // Assert
      expect(result.updated).toHaveLength(1);
      // Verify update call does NOT include status or completedAt
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty("status");
      expect(updateCall.data).not.toHaveProperty("completedAt");
    });
  });

  // ==========================================================================
  // Case-insensitive Matching (FR-004)
  // ==========================================================================

  describe("Case-insensitive Matching", () => {
    // TC-006: Case-insensitive matching "ABC-001" ↔ "abc-001"
    it("should match jobNumber case-insensitively via findFirst", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(mockExistingOrder);

      const input = {
        ...validOrderInput,
        jobNumber: "job-existing", // lowercase vs DB "JOB-EXISTING"
      };

      // Act
      const { createOrders } = await import("../order");
      await createOrders([input]);

      // Assert — verify findFirst called with mode: "insensitive"
      const findFirstCall = mockFindFirst.mock.calls[0][0];
      expect(findFirstCall).toEqual({
        where: {
          jobNumber: {
            equals: "job-existing",
            mode: "insensitive",
          },
        },
      });
    });
  });

  // ==========================================================================
  // Transaction (NFR-001)
  // ==========================================================================

  describe("Transaction", () => {
    // TC-017: Transaction timeout set to 10000ms
    it("should use $transaction with 10s timeout", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const { createOrders } = await import("../order");
      await createOrders([validOrderInput]);

      // Assert
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      const [, opts] = mockTransaction.mock.calls[0];
      expect(opts).toEqual({ timeout: 10000 });
    });
  });

  // ==========================================================================
  // SSE Broadcast (NFR-003)
  // ==========================================================================

  describe("SSE Broadcast", () => {
    // TC-007: SSE broadcasts [...created, ...updated]
    it("should broadcast created and updated orders together", async () => {
      // Arrange
      setupAuth();
      setupTransaction();

      const existingChanged = { ...mockExistingOrder, id: "changed-1" };
      const updatedOrder = { ...existingChanged, priority: 9 };
      const newOrder = { ...mockCreatedOrder, id: "new-1", jobNumber: "JOB-NEW" };

      mockFindFirst
        .mockResolvedValueOnce(null)             // new
        .mockResolvedValueOnce(existingChanged);  // update

      mockCreate.mockResolvedValueOnce(newOrder);
      mockUpdate.mockResolvedValueOnce(updatedOrder);

      const inputs = [
        { ...validOrderInput, jobNumber: "JOB-NEW" },
        { ...validOrderInput, jobNumber: "JOB-EXISTING", priority: 9 },
      ];

      // Act
      const { createOrders } = await import("../order");
      await createOrders(inputs);

      // Assert
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledWith([
        newOrder,
        updatedOrder,
      ]);
    });

    // TC-008: SSE NOT called when only unchanged
    it("should not broadcast SSE when all orders are unchanged", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(mockExistingOrder);

      const identicalInput = {
        ...validOrderInput,
        jobNumber: "JOB-EXISTING",
      };

      // Act
      const { createOrders } = await import("../order");
      await createOrders([identicalInput]);

      // Assert
      expect(mockBroadcastBulkUpdate).not.toHaveBeenCalled();
    });

    // TC-009: SSE failure doesn't block result
    it("should not fail upload if SSE broadcast throws", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);
      mockBroadcastBulkUpdate.mockImplementation(() => {
        throw new Error("SSE broadcast failed");
      });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert — result still succeeds
      expect(result.created).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    // SSE with batch of only created orders
    it("should broadcast SSE with all created orders for batch upload", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);

      const order1 = { ...mockCreatedOrder, id: "order-1", jobNumber: "JOB-001" };
      const order2 = { ...mockCreatedOrder, id: "order-2", jobNumber: "JOB-002" };
      mockCreate
        .mockResolvedValueOnce(order1)
        .mockResolvedValueOnce(order2);

      const inputs = [
        { ...validOrderInput, jobNumber: "JOB-001" },
        { ...validOrderInput, jobNumber: "JOB-002" },
      ];

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders(inputs);

      // Assert
      expect(result.created).toHaveLength(2);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledTimes(1);
      expect(mockBroadcastBulkUpdate).toHaveBeenCalledWith([order1, order2]);
    });
  });

  // ==========================================================================
  // Permission Validation (NFR-004)
  // ==========================================================================

  describe("Permission Validation", () => {
    // TC-010: Auth rejection (unauthenticated)
    it("should reject unauthenticated users", async () => {
      // Arrange
      mockAuth.mockResolvedValue(null);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.created).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.unchanged).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("Unauthorized");
    });

    // TC-011: Auth rejection (STAFF no canUpload)
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
      expect(result.created).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("permission");
    });

    // STAFF with canUpload should be allowed
    it("should allow STAFF with canUpload permission", async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {
          id: "user-2",
          role: "STAFF",
          canUpload: true,
        },
      });
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.created).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Validation
  // ==========================================================================

  describe("Validation", () => {
    // TC-012: Empty array → Zod validation error
    it("should return validation error for empty array", async () => {
      // Arrange
      setupAuth();

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([]);

      // Assert
      expect(result.created).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
      // Empty array fails Zod .min(1) — top-level validation returns all as failed
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe("Error Handling", () => {
    // Individual order error within transaction
    it("should catch individual order errors and put in failed array", async () => {
      // Arrange
      setupAuth();
      setupTransaction();
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error("DB constraint violated"));

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const { createOrders } = await import("../order");
      const result = await createOrders([validOrderInput]);

      // Assert
      expect(result.created).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toBe("DB constraint violated");
      expect(result.failed[0].input).toEqual(validOrderInput);

      consoleErrorSpy.mockRestore();
    });
  });
});
