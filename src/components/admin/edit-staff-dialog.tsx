"use client";

import { useState, useTransition } from "react";
import { updateStaffPermissions } from "@/lib/actions/staff";

interface EditStaffDialogProps {
  staff: {
    id: string;
    name: string;
    canUpload: boolean;
    canUpdateStatus: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStaffDialog({
  staff,
  isOpen,
  onClose,
  onSuccess,
}: EditStaffDialogProps) {
  const [canUpload, setCanUpload] = useState(staff.canUpload);
  const [canUpdateStatus, setCanUpdateStatus] = useState(staff.canUpdateStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateStaffPermissions({
        userId: staff.id,
        canUpload,
        canUpdateStatus,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Staff Permissions
          </h3>
          <p className="text-sm text-gray-600 mt-1">{staff.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={canUpload}
                  onChange={(e) => setCanUpload(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Can Upload Files
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={canUpdateStatus}
                  onChange={(e) => setCanUpdateStatus(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Can Update Order Status
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
