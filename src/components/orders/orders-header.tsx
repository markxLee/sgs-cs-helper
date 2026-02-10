"use client";

import { useState } from "react";
import { ScanButton } from "@/components/orders/scan-button";
import { ScannerOverlay } from "@/components/orders/scanner-overlay";

// ============================================================================
// Types
// ============================================================================

interface OrdersHeaderProps {
  /** Whether the current user has permission to scan & mark done */
  canScan: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function OrdersHeader({ canScan }: OrdersHeaderProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            View all laboratory orders and their progress status
          </p>
        </div>

        {canScan && (
          <div className="flex flex-col items-end gap-1">
            <ScanButton onClick={() => setIsScannerOpen(true)} />
            <p className="text-xs text-muted-foreground">
              Use camera to scan QR/barcode
            </p>
          </div>
        )}
      </div>

      {canScan && (
        <ScannerOverlay
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </>
  );
}
