"use client";

import { useState, useTransition } from "react";
import { createStaff } from "@/lib/actions/staff";

interface FormMessage {
  type: "success" | "error";
  text: string;
  code?: string;
}

export function CreateStaffForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [canUpload, setCanUpload] = useState(true);
  const [canUpdateStatus, setCanUpdateStatus] = useState(true);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // Client-side validation
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }

    if (email.trim() && !isValidEmail(email.trim())) {
      setMessage({ type: "error", text: "Invalid email format" });
      return;
    }

    startTransition(async () => {
      const result = await createStaff({
        name: name.trim(),
        email: email.trim() || undefined,
        canUpload,
        canUpdateStatus,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: `Staff created successfully!`,
          code: result.data.staffCode,
        });
        // Reset form
        setName("");
        setEmail("");
        setCanUpload(true);
        setCanUpdateStatus(true);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff member name"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Permissions
          </label>
          
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating..." : "Create Staff"}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {message.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p
                className={`text-sm font-medium ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
              {message.code && (
                <div className="mt-2 p-2 bg-white rounded border border-green-300">
                  <p className="text-xs text-gray-600 mb-1">Staff Code:</p>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {message.code}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please save this code. The staff member will use it to log in.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
