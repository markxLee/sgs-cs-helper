"use client";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface UndoCompleteModalProps {
  isOpen: boolean;
  jobNumber: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UndoCompleteModal({
  isOpen,
  jobNumber,
  isLoading = false,
  onConfirm,
  onCancel,
}: UndoCompleteModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Xác nhận hoàn tác"
      message={`Bạn có chắc muốn hoàn tác đơn ${jobNumber} về trạng thái đang xử lý?`}
      confirmText={isLoading ? "Đang xử lý..." : "Hoàn tác"}
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={false}
      isLoading={isLoading}
    />
  );
}
