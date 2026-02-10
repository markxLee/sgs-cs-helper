"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Dynamic import — SSR disabled (camera requires browser APIs)
// ============================================================================

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => <QrScannerSkeleton />,
  }
);

// ============================================================================
// Types
// ============================================================================

interface QrScannerProps {
  /** Called when a barcode/QR code is successfully decoded */
  onDecode: (value: string) => void;
  /** Called when a scanner error occurs */
  onError?: (error: unknown) => void;
  /** Whether the scanner is actively scanning */
  enabled?: boolean;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function QrScannerSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Skeleton className="aspect-square w-full max-w-[300px] rounded-lg" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function QrScanner({ onDecode, onError, enabled = true }: QrScannerProps) {
  if (!enabled) {
    return <QrScannerSkeleton />;
  }

  return (
    <div className="relative w-full max-w-[300px] mx-auto overflow-hidden rounded-lg">
      <Scanner
        onScan={(result) => {
          if (result?.[0]?.rawValue) {
            onDecode(result[0].rawValue);
          }
        }}
        onError={(error) => {
          onError?.(error);
        }}
        constraints={{
          facingMode: "environment",
        }}
        formats={[
          "qr_code",
          "code_128",
          "code_39",
          "ean_13",
          "ean_8",
          "upc_a",
          "upc_e",
        ]}
        sound={false}
        components={{
          finder: true,
        }}
        styles={{
          container: {
            width: "100%",
            aspectRatio: "1",
          },
          video: {
            objectFit: "cover" as const,
          },
        }}
      />
    </div>
  );
}
