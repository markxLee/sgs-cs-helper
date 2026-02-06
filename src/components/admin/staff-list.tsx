"use client";

import { useState, useTransition } from "react";
import { EditStaffDialog } from "./edit-staff-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { updateStaffStatus, regenerateStaffCode } from "@/lib/actions/staff";

interface StaffUser {
  id: string;
  name: string;
  email: string | null;
  staffCode: string;
  canUpload: boolean;
  canUpdateStatus: boolean;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  createdAt: Date;
}

interface StaffListProps {
  initialData: StaffUser[];
}

export function StaffList({ initialData }: StaffListProps) {
  const [staff] = useState(initialData);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (userId: string, userName: string, newStatus: string) => {
    if (newStatus === "REVOKED") {
      setConfirmDialog({
        isOpen: true,
        title: "Revoke Access",
        message: `Are you sure you want to revoke access for ${userName}? They will no longer be able to log in.`,
        danger: true,
        onConfirm: () => {
          performStatusChange(userId, newStatus as "ACTIVE" | "PENDING" | "REVOKED");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      performStatusChange(userId, newStatus as "ACTIVE" | "PENDING" | "REVOKED");
    }
  };

  const performStatusChange = (userId: string, status: "ACTIVE" | "PENDING" | "REVOKED") => {
    startTransition(async () => {
      const result = await updateStaffStatus({ userId, status });
      if (result.success) {
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  const handleRegenerateCode = (userId: string, staffName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Regenerate Staff Code",
      message: `Regenerate code for ${staffName}? The old code will become invalid immediately.`,
      danger: false,
      onConfirm: () => {
        performRegenerateCode(userId, staffName);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const performRegenerateCode = (userId: string, staffName: string) => {
    startTransition(async () => {
      const result = await regenerateStaffCode({ userId });
      if (result.success) {
        alert(`New code for ${staffName}: ${result.data.newCode}\n\nPlease save this code.`);
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No staff users yet</p>
        <p className="text-xs text-gray-400">
          Create your first staff member using the form above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Can Upload
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Can Update Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.email || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {user.staffCode}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PermissionBadge allowed={user.canUpload} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PermissionBadge allowed={user.canUpdateStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, user.name, e.target.value)}
                    disabled={isPending}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleRegenerateCode(user.id, user.name)}
                    disabled={isPending}
                    className="text-orange-600 hover:text-orange-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Regenerate Code
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingStaff(user)}
                    disabled={isPending}
                    className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Edit Permissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingStaff && (
        <EditStaffDialog
          key={editingStaff.id}
          staff={editingStaff}
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          onSuccess={() => {
            setEditingStaff(null);
            window.location.reload();
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        danger={confirmDialog.danger}
      />
    </>
  );
}

// Helper Components
function PermissionBadge({ allowed }: { allowed: boolean }) {
  if (allowed) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Yes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      No
    </span>
  );
}
