"use client";

import { useState, useTransition } from "react";
import { setAdminPassword, unlockAdminAccount } from "@/lib/actions/admin-password";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  adminId: string;
  adminEmail: string;
  currentStatus: "PENDING" | "ACTIVE" | "REVOKED";
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePasswordDialog({
  isOpen,
  adminId,
  adminEmail,
  currentStatus,
  onClose,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await setAdminPassword({
        adminId,
        password,
      });

      if (result.success) {
        setSuccess("Password changed successfully");
        setPassword("");
        setConfirmPassword("");
        onSuccess();
        // Close dialog after a brief delay to show success message
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error);
      }
    });
  };

  const handleUnlock = async () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await unlockAdminAccount({ adminId });

      if (result.success) {
        setSuccess("Account unlocked successfully");
        onSuccess();
        // Close dialog after a brief delay to show success message
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error);
      }
    });
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Manage Admin Account
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">{adminEmail}</span>
            {currentStatus === "REVOKED" && (
              <span className="text-red-600 ml-1">(Account Locked)</span>
            )}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
                required
                disabled={isPending}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
                required
                disabled={isPending}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isPending || !password || !confirmPassword}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Changing..." : "Change Password"}
              </button>

              {currentStatus === "REVOKED" && (
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Unlocking..." : "Unlock"}
                </button>
              )}
            </div>
          </form>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}