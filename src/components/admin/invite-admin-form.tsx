"use client";

import { useState, useTransition } from "react";
import { inviteAdmin } from "@/lib/actions/admin";

type AuthMethod = "GOOGLE" | "CREDENTIALS";

interface FormMessage {
  type: "success" | "error";
  text: string;
}

export function InviteAdminForm() {
  const [email, setEmail] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("GOOGLE");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // Client-side validation
    if (!email.trim()) {
      setMessage({ type: "error", text: "Email is required" });
      return;
    }

    if (authMethod === "CREDENTIALS" && (!password || password.length < 8)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    startTransition(async () => {
      const result = await inviteAdmin({
        email: email.trim(),
        authMethod,
        password: authMethod === "CREDENTIALS" ? password : undefined,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: `Admin invited successfully: ${result.data.email}`,
        });
        // Reset form
        setEmail("");
        setPassword("");
        setAuthMethod("GOOGLE");
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Invite New Admin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Auth Method Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authentication Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="authMethod"
                value="GOOGLE"
                checked={authMethod === "GOOGLE"}
                onChange={() => setAuthMethod("GOOGLE")}
                disabled={isPending}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Google OAuth
                <span className="text-gray-500 ml-1">
                  (User signs in with Google)
                </span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="authMethod"
                value="CREDENTIALS"
                checked={authMethod === "CREDENTIALS"}
                onChange={() => setAuthMethod("CREDENTIALS")}
                disabled={isPending}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Email/Password
                <span className="text-gray-500 ml-1">
                  (Set initial password)
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Conditional Password Field */}
        {authMethod === "CREDENTIALS" && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Initial Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              The admin will use this password for their first login.
            </p>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Inviting...
            </>
          ) : (
            "Invite Admin"
          )}
        </button>
      </form>
    </div>
  );
}
