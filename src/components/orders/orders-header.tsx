"use client";

import ConfirmDialog from "@/components/common/confirm-dialog";
import { ScanButton } from "@/components/orders/scan-button";
import { ScannerOverlay } from "@/components/orders/scanner-overlay";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface OrdersHeaderProps {
  /** Whether the current user has permission to scan & mark done */
  canScan: boolean;
}

interface OrderData {
  id: string;
  jobNumber: string;
  status: string;
  priority?: string;
  receivedAt?: string;
}

interface FeedbackMessage {
  type: "success" | "error" | "info";
  text: string;
}

// ============================================================================
// Component
// ============================================================================

export function OrdersHeader({ canScan }: OrdersHeaderProps) {
  const [scanPopupOpen, setScanPopupOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null); // CRIT-002: Store order from lookup
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [feedbackMessage, setFeedbackMessage] =
    useState<FeedbackMessage | null>(null); // MAJ-001
  const [cooldown, setCooldown] = useState(false); // MAJ-002

  // MAJ-001: Auto-dismiss feedback message after 3s
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // CRIT-002: Lookup order by barcode
  const handleBarcodeScan = useCallback(
    async (code: string) => {
      if (cooldown) return; // MAJ-002: Ignore during cooldown

      setScanPopupOpen(false);
      setLookingUp(true);
      setFeedbackMessage(null);

      try {
        const res = await fetch(
          `/api/orders/lookup?jobNumber=${encodeURIComponent(code)}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            // Not found
            setFeedbackMessage({
              type: "error",
              text: `Không tìm thấy đơn hàng: ${code}`,
            });
          } else {
            setFeedbackMessage({
              type: "error",
              text: "Tra cứu đơn hàng thất bại",
            });
          }
          return;
        }

        const orderData: OrderData = await res.json();

        if (orderData.status === "COMPLETED") {
          // Already completed
          setFeedbackMessage({
            type: "info",
            text: `Đơn hàng ${orderData.jobNumber} đã hoàn thành`,
          });
          return;
        }

        // Found + IN_PROGRESS: show confirmation dialog
        setOrder(orderData);
        setDialogOpen(true);
      } catch (e) {
        setFeedbackMessage({ type: "error", text: (e as Error).message });
      } finally {
        setLookingUp(false);
      }
    },
    [cooldown]
  );

  // MAJ-005: Disable scanner when camera overlay is open
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    active: scanPopupOpen && !cameraOpen, // MAJ-005: Add camera conflict check
  });

  // CRIT-001: Use order.id for mark-done API
  const handleConfirm = async () => {
    if (!order) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/mark-done`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Đánh dấu hoàn thành thất bại");
      }

      // Success
      setDialogOpen(false);
      setOrder(null);
      setFeedbackMessage({
        type: "success",
        text: `Đơn hàng ${order.jobNumber} đã đánh dấu hoàn thành!`,
      });

      // MAJ-002: Cooldown before accepting next scan
      setCooldown(true);
      setTimeout(() => setCooldown(false), 500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setOrder(null);
    setError(null);
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
          <p className="text-muted-foreground mt-2">
            Xem tất cả đơn hàng và tiến độ xử lý
          </p>
        </div>

        {canScan && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <ScanButton onClick={() => setCameraOpen(true)} />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setScanPopupOpen(true)}
              >
                Quét bằng thiết bị
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sử dụng camera hoặc máy quét mã vạch USB/Bluetooth
            </p>
          </div>
        )}
      </div>

      {/* Popup for device scan activation */}
      {scanPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">
              Quét mã vạch (Thiết bị)
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Vui lòng quét mã vạch bằng máy quét USB/Bluetooth.
            </p>
            <button
              className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setScanPopupOpen(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Camera scan overlay */}
      {canScan && cameraOpen && (
        <ScannerOverlay
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
        />
      )}
      {/* Loading indicator for lookup */}
      {lookingUp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <p className="text-sm text-gray-600">Đang tra cứu đơn hàng...</p>
          </div>
        </div>
      )}

      {/* MAJ-001: Feedback message (auto-dismiss) */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            feedbackMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : feedbackMessage.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          <p className="text-sm font-medium">{feedbackMessage.text}</p>
        </div>
      )}

      {/* ConfirmDialog for order mark-done */}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="Xác nhận hoàn thành đơn hàng"
        message={
          error
            ? `Lỗi: ${error}`
            : order
              ? `Đánh dấu đơn hàng ${order.jobNumber} hoàn thành?${order.priority ? ` (Độ ưu tiên: ${order.priority})` : ""}`
              : "Xác nhận"
        }
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        danger={!!error}
      />
    </>
  );
}
