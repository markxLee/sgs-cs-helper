import { auth } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "./_components/logout-button";

export const metadata: Metadata = {
  title: "Dashboard | SGS CS Helper",
  description: "SGS CS Helper Dashboard",
};

/**
 * Dashboard Page - Server Component
 * 
 * Displays welcome message with user info and logout button.
 * This is a placeholder - full dashboard features in later user stories.
 */
export default async function DashboardPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name || "User"}!
        </h2>
        <p className="mt-1 text-gray-600">
          You are logged in as <strong>{session?.user?.role}</strong>
        </p>
      </div>

      {/* Quick Actions - Super Admin Only */}
      {isSuperAdmin && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Admin Actions
          </h3>
          <div className="flex gap-4">
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              Manage Admin Users
            </Link>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Account Information
        </h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {session?.user?.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {session?.user?.role}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
              {session?.user?.id}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 pt-6 border-t">
        <LogoutButton />
      </div>
    </div>
  );
}
