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
      title="Confirm Order Completion"
      message={`Are you sure you want to mark order ${jobNumber} as complete?`}
      confirmText={isLoading ? "Processing..." : "Confirm Complete"}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={false}
      isLoading={isLoading}
    />
  );
}