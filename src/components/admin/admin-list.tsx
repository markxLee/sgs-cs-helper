"use client";

import { useEffect, useState, useTransition } from "react";
import { getAdmins, revokeAdmin } from "@/lib/actions/admin";

type UserStatus = "PENDING" | "ACTIVE" | "REVOKED";
type AuthMethod = "GOOGLE" | "CREDENTIALS";

interface Admin {
  id: string;
  email: string;
  authMethod: AuthMethod;
  status: UserStatus;
  createdAt: Date;
}

interface ConfirmDialog {
  isOpen: boolean;
  adminId: string;
  adminEmail: string;
}

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REVOKED: {
    label: "Revoked",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const authMethodLabels: Record<AuthMethod, string> = {
  GOOGLE: "Google OAuth",
  CREDENTIALS: "Email/Password",
};

export function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    adminId: "",
    adminEmail: "",
  });
  const [isPending, startTransition] = useTransition();

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAdmins();
    if (result.success) {
      setAdmins(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmins();
  }, []);

  const handleRevokeClick = (adminId: string, adminEmail: string) => {
    setConfirmDialog({ isOpen: true, adminId, adminEmail });
  };

  const handleConfirmRevoke = () => {
    startTransition(async () => {
      const result = await revokeAdmin(confirmDialog.adminId);
      if (result.success) {
        // Update local state
        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id === confirmDialog.adminId
              ? { ...admin, status: "REVOKED" as UserStatus }
              : admin
          )
        );
      } else {
        setError(result.error);
      }
      setConfirmDialog({ isOpen: false, adminId: "", adminEmail: "" });
    });
  };

  const handleCancelRevoke = () => {
    setConfirmDialog({ isOpen: false, adminId: "", adminEmail: "" });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-center">
          <p className="font-medium">Error loading admins</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAdmins}
            className="mt-4 px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
          <button
            onClick={fetchAdmins}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No admin users found.</p>
            <p className="text-sm mt-1">
              Use the form above to invite new admins.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => {
                  const status = statusConfig[admin.status];
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {authMethodLabels[admin.authMethod]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {admin.status !== "REVOKED" ? (
                          <button
                            onClick={() =>
                              handleRevokeClick(admin.id, admin.email)
                            }
                            disabled={isPending}
                            className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-gray-400">Revoked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCancelRevoke}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Revoke Admin Access
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to revoke admin access for{" "}
                <span className="font-medium">{confirmDialog.adminEmail}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelRevoke}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Revoking..." : "Revoke Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
