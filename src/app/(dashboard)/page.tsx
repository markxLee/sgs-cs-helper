import { auth } from "@/lib/auth";
import { Metadata } from "next";
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
