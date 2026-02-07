import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";

/**
 * Admin Layout
 * 
 * Layout for Super Admin-only pages (/admin/*).
 * Enforces role-based access control:
 * - Unauthenticated users → redirect to /login
 * - Non-SUPER_ADMIN users → redirect to /
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to dashboard if not Admin or Super Admin
  const allowedRoles: string[] = ["ADMIN", "SUPER_ADMIN"];
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Home
                </Link>
                <Link
                  href="/admin/staff"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Staff
                </Link>
                {session.user.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin/users"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Admins
                  </Link>
                )}
                {session.user.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin/audit-logs"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Audit Logs
                  </Link>
                )}
                <span className="text-gray-300">|</span>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/orders"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Orders
                </Link>
                <Link
                  href="/upload"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Upload
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {session.user.role}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
