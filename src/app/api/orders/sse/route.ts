/**
 * SSE Endpoint for Order Updates
 *
 * Server-Sent Events endpoint that broadcasts order changes to all connected clients.
 * Uses a simple in-memory pub/sub system.
 *
 * @route GET /api/orders/sse
 */

import { NextRequest } from "next/server";

// ============================================================================
// Types
// ============================================================================

export type SSEEventType = "update" | "add" | "remove" | "bulk" | "heartbeat";

export interface SSEOrderEvent {
  type: SSEEventType;
  data: unknown;
}

// ============================================================================
// Global State for SSE Connections
// ============================================================================

// Store connected clients
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Broadcast an event to all connected clients
 */
export function broadcastOrderEvent(event: SSEOrderEvent): void {
  const message = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  clients.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch {
      // Client disconnected, remove from set
      clients.delete(controller);
    }
  });
}

/**
 * Get connected client count (for monitoring)
 */
export function getConnectedClientCount(): number {
  return clients.size;
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  // Check if client accepts event-stream
  const accept = request.headers.get("accept");
  if (!accept?.includes("text/event-stream")) {
    return new Response("This endpoint requires text/event-stream", {
      status: 406,
    });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Add this client to the set
      clients.add(controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      const connectMessage = `data: ${JSON.stringify({ type: "connected", data: { clientCount: clients.size } })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Setup heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: "heartbeat", data: { timestamp: Date.now() } })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          // Client disconnected
          clearInterval(heartbeatInterval);
          clients.delete(controller);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        clients.delete(controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },

    cancel(controller) {
      clients.delete(controller);
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// Disable body parsing for SSE
export const dynamic = "force-dynamic";
