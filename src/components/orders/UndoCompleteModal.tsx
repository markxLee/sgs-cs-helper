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
      title="Confirm Undo Completion"
      message={`Are you sure you want to undo order ${jobNumber} back to In Progress?`}
      confirmText={isLoading ? "Processing..." : "Undo Complete"}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={false}
      isLoading={isLoading}
    />
  );
}
