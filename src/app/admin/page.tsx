import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage users and system settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Staff Management */}
        <Link
          href="/admin/staff"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-600"
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
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Staff Management
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage staff user accounts, permissions, and access codes
              </p>
              <div className="mt-3 flex items-center text-sm text-blue-600 font-medium">
                Go to Staff Management
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Admin Users - Super Admin Only */}
        {isSuperAdmin && (
          <Link
            href="/admin/users"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Admin Users
                  <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    Super Admin Only
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Invite and manage admin users with elevated permissions
                </p>
                <div className="mt-3 flex items-center text-sm text-purple-600 font-medium">
                  Go to Admin Users
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Audit Logs - Super Admin Only */}
        {isSuperAdmin && (
          <Link
            href="/admin/audit-logs"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Audit Logs
                  <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    Super Admin Only
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View login attempts, security events, and system activity logs
                </p>
                <div className="mt-3 flex items-center text-sm text-red-600 font-medium">
                  Go to Audit Logs
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Link
            href="/admin/staff"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium block"
          >
            → Create new staff member
          </Link>
          {isSuperAdmin && (
            <Link
              href="/admin/users"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium block"
            >
              → Invite new admin
            </Link>
          )}
          {isSuperAdmin && (
            <Link
              href="/admin/audit-logs"
              className="text-red-600 hover:text-red-700 text-sm font-medium block"
            >
              → View audit logs
            </Link>
          )}
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-700 text-sm font-medium block"
          >
            → Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
