"use client";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface MarkDoneModalProps {
  isOpen: boolean;
  jobNumber: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MarkDoneModal({
  isOpen,
  jobNumber,
  isLoading = false,
  onConfirm,
  onCancel,
}: MarkDoneModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Xác nhận hoàn thành đơn hàng"
      message={`Bạn có chắc chắn muốn đánh dấu đơn hàng ${jobNumber} là đã hoàn thành?`}
      confirmText={isLoading ? "Đang xử lý..." : "Xác nhận hoàn thành"}
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={false}
      isLoading={isLoading}
    />
  );
}