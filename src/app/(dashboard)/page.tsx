import {
  getDashboardMetrics,
  getDashboardUsers,
} from "@/app/actions/dashboard";
import { PerformanceDashboard } from "@/components/dashboard/performance-dashboard";
import { auth } from "@/lib/auth";
import type { DashboardMetrics, DashboardUser } from "@/types/dashboard";
import { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "./_components/logout-button";

export const metadata: Metadata = {
  title: "Dashboard | SGS CS Helper",
  description: "SGS CS Helper Dashboard",
};

/**
 * Get default dashboard filters for this month
 * Update #1: Uses new filter structure with startDate/endDate and scope="all-team"
 */
function getDefaultDashboardFilters() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return {
    scope: "all-team" as const,
    userId: undefined,
    startDate: monthStart,
    endDate: monthEnd,
  };
}

/**
 * Get empty metrics for error fallback
 * Update #1.1: Uses new KPI structure with totalCompleted and avgEfficiency
 */
function getEmptyMetrics() {
  return {
    kpis: {
      totalCompleted: { count: 0 },
      onTime: { onTime: 0, total: 0, ratio: 0 },
      avgDuration: { avgMs: 0, avgHours: 0, avgEfficiency: 0, trend: 0 },
      overdue: { overdue: 0, total: 0, ratio: 0 },
    },
    completionPerUser: [],
    completionTrend: [],
  };
}

/**
 * Dashboard Page - Server Component
 *
 * Displays welcome message with user info and logout button.
 * For Admin/Super Admin, also displays performance dashboard.
 */
export default async function DashboardPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";
  const isStaff = session?.user?.role === "STAFF";
  const canUpload = session?.user?.canUpload === true;
  // Upload access is determined inline in the JSX below:
  // ADMIN/SUPER_ADMIN always, STAFF with canUpload=true

  // Fetch initial dashboard data for Admin/Super Admin
  let initialMetrics: DashboardMetrics | null = null;
  let initialUsers: DashboardUser[] = [];

  if (isAdmin || isSuperAdmin) {
    try {
      const defaultFilters = getDefaultDashboardFilters();

      const [metricsResult, usersResult] = await Promise.all([
        getDashboardMetrics(defaultFilters),
        getDashboardUsers(),
      ]);

      if (metricsResult.success && usersResult.success) {
        initialMetrics = metricsResult.data;
        initialUsers = usersResult.data;
      } else {
        console.error("Failed to fetch initial dashboard data:", {
          metrics: metricsResult.success ? "OK" : metricsResult.error,
          users: usersResult.success ? "OK" : usersResult.error,
        });
        // Set empty defaults to prevent crashes (Update #1: new structure)
        initialMetrics = getEmptyMetrics();
        initialUsers = [];
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty defaults to prevent crashes (Update #1: new structure)
      initialMetrics = getEmptyMetrics();
      initialUsers = [];
    }
  }

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

      {/* Quick Actions - Admin & Super Admin */}
      {(isAdmin || isSuperAdmin) && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Admin Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              View Orders
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              Upload Excel
            </Link>
            <Link
              href="/admin/staff"
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
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
              Manage Staff
            </Link>
            {isSuperAdmin && (
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
            )}
          </div>
        </div>
      )}

      {/* Performance Dashboard - Admin & Super Admin */}
      {(isAdmin || isSuperAdmin) && initialMetrics && initialUsers && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance Dashboard
          </h3>
          <PerformanceDashboard
            initialData={initialMetrics}
            initialUsers={initialUsers}
          />
        </div>
      )}

      {/* Quick Actions - Staff with upload permission */}
      {isStaff && canUpload && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              View Orders
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              Upload Excel
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions - Staff without upload permission (view only) */}
      {isStaff && !canUpload && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              View Orders
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
