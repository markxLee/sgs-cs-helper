"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { QrScanner } from "@/components/orders/qr-scanner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type ScanPhase =
  | "scanning"          // Camera active, waiting for decode
  | "looking-up"        // Decoded, calling lookup API
  | "found"             // Order found, IN_PROGRESS — ready to mark
  | "already-completed" // Order found but already COMPLETED
  | "not-found"         // No order matched
  | "marking"           // Calling mark-done API
  | "done"              // Successfully marked complete
  | "mark-error"        // Mark-done failed — can retry without re-scanning
  | "error";            // Generic error state (lookup/camera)

interface OrderResult {
  id: string;
  jobNumber: string;
  status: string;
  registeredDate: string;
  registeredBy: string | null;
  receivedDate: string;
  requiredDate: string;
  priority: number;
  completedAt: string | null;
}

interface ScannerOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Close the overlay */
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ScannerOverlay({ isOpen, onClose }: ScannerOverlayProps) {
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  // Ref to prevent duplicate lookups from rapid scans
  const lookupInFlight = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Scroll lock + Focus trap (T-007)
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    closeButtonRef.current?.focus();

    // Handle Escape key
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ──────────────────────────────────────────────────────────────────────────
  // Reset helper
  // ──────────────────────────────────────────────────────────────────────────

  const resetToScanning = useCallback(() => {
    setPhase("scanning");
    setOrder(null);
    setErrorMessage("");
    setScannedValue("");
    setShowConfirm(false);
    setIsMarkingDone(false);
    lookupInFlight.current = false;
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Reset state when overlay opens
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      resetToScanning();
    }
  }, [isOpen, resetToScanning]);

  // ──────────────────────────────────────────────────────────────────────────
  // Decode handler — lookup order by job number
  // ──────────────────────────────────────────────────────────────────────────

  const handleDecode = useCallback(
    async (value: string) => {
      // Prevent duplicate lookups (race condition guard — T-006)
      if (lookupInFlight.current || phase !== "scanning") return;
      lookupInFlight.current = true;

      const trimmed = value.trim();
      if (!trimmed) {
        lookupInFlight.current = false;
        return;
      }

      setScannedValue(trimmed);
      setPhase("looking-up");

      try {
        const response = await fetch(
          `/api/orders/lookup?jobNumber=${encodeURIComponent(trimmed)}`
        );
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // Session expired (T-006) — redirect to login
            setPhase("error");
            setErrorMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            return;
          }
          if (response.status === 404) {
            setPhase("not-found");
            return;
          }
          throw new Error(result.error || "Có lỗi xảy ra khi tìm kiếm");
        }

        const orderData = result.data as OrderResult;
        setOrder(orderData);

        if (orderData.status === "COMPLETED") {
          setPhase("already-completed");
        } else {
          setPhase("found");
        }
      } catch (error) {
        setPhase("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Có lỗi xảy ra khi tìm kiếm"
        );
      }
    },
    [phase]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Scanner error handler (T-006: camera permission fallback)
  // ──────────────────────────────────────────────────────────────────────────

  const handleScanError = useCallback((error: unknown) => {
    console.error("Scanner error:", error);
    const message =
      error instanceof Error ? error.message : String(error);

    // Detect camera permission denied
    if (
      message.includes("Permission") ||
      message.includes("NotAllowed") ||
      message.includes("denied")
    ) {
      setPhase("error");
      setErrorMessage(
        "Không có quyền truy cập camera. Vui lòng cho phép quyền camera trong cài đặt trình duyệt."
      );
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Mark done handler
  // ──────────────────────────────────────────────────────────────────────────

  const handleConfirmMarkDone = useCallback(async () => {
    if (!order) return;

    setIsMarkingDone(true);
    setPhase("marking");

    try {
      const response = await fetch(`/api/orders/${order.id}/mark-done`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Có lỗi xảy ra");
      }

      setShowConfirm(false);
      setPhase("done");
    } catch (error) {
      setShowConfirm(false);
      setPhase("mark-error");
      setErrorMessage(
        error instanceof Error ? error.message : "Có lỗi xảy ra"
      );
    } finally {
      setIsMarkingDone(false);
    }
  }, [order]);

  // ──────────────────────────────────────────────────────────────────────────
  // Retry mark-done (MAJ-003)
  // ──────────────────────────────────────────────────────────────────────────

  const handleRetryMarkDone = useCallback(() => {
    if (!order) return;
    setPhase("found");
    setErrorMessage("");
    setShowConfirm(true);
  }, [order]);

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen overlay — z-40 so ConfirmDialog (z-50) sits on top */}
      <div
        className="fixed inset-0 z-40 bg-black/80 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="QR/Barcode Scanner"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60">
          <h2 className="text-white text-lg font-semibold">Scan QR / Barcode</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Đóng scanner"
          >
            <XIcon />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {/* Scanner viewfinder — only active during scanning phase */}
          {(phase === "scanning" || phase === "looking-up") && (
            <div className="w-full max-w-sm">
              <QrScanner
                onDecode={handleDecode}
                onError={handleScanError}
                enabled={phase === "scanning"}
              />
              <p className="text-center text-white/70 text-sm mt-4">
                {phase === "looking-up"
                  ? "Đang tìm kiếm đơn hàng..."
                  : "Hướng camera vào mã QR hoặc barcode"}
              </p>
              {phase === "looking-up" && (
                <div className="flex justify-center mt-2">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          )}

          {/* Result display */}
          {phase !== "scanning" && phase !== "looking-up" && (
            <div className="w-full max-w-sm">
              <ResultCard
                phase={phase}
                order={order}
                scannedValue={scannedValue}
                errorMessage={errorMessage}
                onMarkDone={() => setShowConfirm(true)}
                onRetryMarkDone={handleRetryMarkDone}
                onScanAgain={resetToScanning}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog — sits at z-50 above overlay */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận hoàn thành"
        message={`Bạn có chắc muốn đánh dấu đơn hàng ${order?.jobNumber ?? ""} là hoàn thành?`}
        confirmText={isMarkingDone ? "Đang xử lý..." : "Xác nhận"}
        cancelText="Hủy"
        onConfirm={handleConfirmMarkDone}
        onCancel={() => setShowConfirm(false)}
        isLoading={isMarkingDone}
      />
    </>
  );
}

// ============================================================================
// Result Card — displays outcome based on phase
// ============================================================================

interface ResultCardProps {
  phase: ScanPhase;
  order: OrderResult | null;
  scannedValue: string;
  errorMessage: string;
  onMarkDone: () => void;
  onRetryMarkDone: () => void;
  onScanAgain: () => void;
  onClose: () => void;
}

function ResultCard({
  phase,
  order,
  scannedValue,
  errorMessage,
  onMarkDone,
  onRetryMarkDone,
  onScanAgain,
  onClose,
}: ResultCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Status header */}
      <div
        className={cn(
          "px-5 py-4 text-white font-medium",
          phase === "found" && "bg-blue-600",
          phase === "already-completed" && "bg-amber-500",
          phase === "not-found" && "bg-gray-500",
          phase === "done" && "bg-green-600",
          phase === "marking" && "bg-blue-600",
          (phase === "error" || phase === "mark-error") && "bg-red-600"
        )}
      >
        <div className="flex items-center gap-2">
          <StatusIcon phase={phase} />
          <span>{getStatusTitle(phase)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Scanned value display */}
        <div className="text-sm text-gray-500">
          Mã quét:{" "}
          <span className="font-mono font-semibold text-gray-900">
            {scannedValue}
          </span>
        </div>

        {/* Order details (when found) */}
        {order && (phase === "found" || phase === "already-completed" || phase === "done" || phase === "marking" || phase === "mark-error") && (
          <div className="border rounded-lg p-3 space-y-2 text-sm">
            <DetailRow label="Job Number" value={order.jobNumber} />
            <DetailRow label="Trạng thái" value={formatStatus(order.status)} />
            <DetailRow
              label="Ngày đăng ký"
              value={formatDate(order.registeredDate)}
            />
            {order.registeredBy && (
              <DetailRow label="Người đăng ký" value={order.registeredBy} />
            )}
            <DetailRow
              label="Hạn hoàn thành"
              value={formatDate(order.requiredDate)}
            />
            {order.completedAt && (
              <DetailRow
                label="Hoàn thành lúc"
                value={formatDate(order.completedAt)}
              />
            )}
          </div>
        )}

        {/* Not found message */}
        {phase === "not-found" && (
          <p className="text-sm text-gray-600">
            Không tìm thấy đơn hàng với mã <strong>{scannedValue}</strong>.
            Vui lòng kiểm tra lại mã và thử quét lại.
          </p>
        )}

        {/* Error message */}
        {phase === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        {/* Mark-done error message (with retry context) */}
        {phase === "mark-error" && (
          <p className="text-sm text-red-600">
            Không thể đánh dấu hoàn thành: {errorMessage}
          </p>
        )}

        {/* Done success message */}
        {phase === "done" && (
          <p className="text-sm text-green-700 font-medium">
            ✅ Đơn hàng đã được đánh dấu hoàn thành thành công!
          </p>
        )}

        {/* Marking in progress */}
        {phase === "marking" && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <LoadingSpinner />
            <span>Đang xử lý...</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 py-4 bg-gray-50 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {/* Mark Done button — only for "found" phase */}
        {phase === "found" && (
          <button
            onClick={onMarkDone}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            ✓ Đánh dấu hoàn thành
          </button>
        )}

        {/* Retry mark-done — only for mark-error phase (MAJ-003) */}
        {phase === "mark-error" && (
          <button
            onClick={onRetryMarkDone}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            ↻ Thử lại
          </button>
        )}

        {/* Scan Again — for all terminal phases */}
        {(phase === "found" ||
          phase === "already-completed" ||
          phase === "not-found" ||
          phase === "done" ||
          phase === "error" ||
          phase === "mark-error") && (
          <button
            onClick={onScanAgain}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Quét lại
          </button>
        )}

        {/* Close — always available in terminal phases */}
        {(phase === "done" ||
          phase === "already-completed" ||
          phase === "not-found" ||
          phase === "error" ||
          phase === "mark-error") && (
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper sub-components
// ============================================================================

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function StatusIcon({ phase }: { phase: ScanPhase }) {
  switch (phase) {
    case "found":
      return <span>📦</span>;
    case "already-completed":
      return <span>⚠️</span>;
    case "not-found":
      return <span>❌</span>;
    case "done":
      return <span>✅</span>;
    case "marking":
      return <LoadingSpinner />;
    case "error":
    case "mark-error":
      return <span>🚫</span>;
    default:
      return null;
  }
}

function LoadingSpinner() {
  return (
    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ============================================================================
// Helper functions
// ============================================================================

function getStatusTitle(phase: ScanPhase): string {
  switch (phase) {
    case "found":
      return "Tìm thấy đơn hàng";
    case "already-completed":
      return "Đơn hàng đã hoàn thành";
    case "not-found":
      return "Không tìm thấy";
    case "done":
      return "Hoàn thành thành công!";
    case "marking":
      return "Đang đánh dấu hoàn thành...";
    case "mark-error":
      return "Không thể hoàn thành";
    case "error":
      return "Có lỗi xảy ra";
    default:
      return "";
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "Đang xử lý";
    case "COMPLETED":
      return "Đã hoàn thành";
    default:
      return status;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
