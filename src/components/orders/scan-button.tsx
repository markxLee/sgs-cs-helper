"use client";

import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ScanButtonProps {
  /** Click handler to open the scanner */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ScanButton({ onClick, className }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Mở camera để quét mã QR hoặc barcode đánh dấu hoàn thành"
      aria-label="Mở camera để quét mã QR/Barcode đánh dấu hoàn thành đơn hàng"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium",
        "text-white bg-indigo-600 hover:bg-indigo-700",
        "rounded-lg shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        className
      )}
    >
      <ScanIcon />
      <span>Camera Scan</span>
    </button>
  );
}

// ============================================================================
// Icon
// ============================================================================

function ScanIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Scan frame corners */}
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      {/* Scan line */}
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
