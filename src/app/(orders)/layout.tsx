import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/app/(dashboard)/_components/logout-button";

/**
 * Orders Layout
 *
 * Layout for orders pages (/orders, /upload).
 * Provides navigation header with:
 * - Public users: Back to home link
 * - Authenticated users: Role-based navigation menu
 */
export default async function OrdersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const role = session?.user?.role;
  const canUpload = session?.user?.canUpload;

  // Check upload permission
  const hasUploadAccess =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    (role === "STAFF" && canUpload === true);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo/Title */}
            <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
              SGS CS Helper
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {/* Dashboard link */}
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>

                  {/* Orders link */}
                  <Link
                    href="/orders"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Orders
                  </Link>

                  {/* Upload link - permission based */}
                  {hasUploadAccess && (
                    <Link
                      href="/upload"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Upload
                    </Link>
                  )}

                  {/* Admin link - admin only */}
                  {(role === "SUPER_ADMIN" || role === "ADMIN") && (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Admin
                    </Link>
                  )}

                  {/* User info */}
                  <span className="text-sm text-gray-600">
                    {session.user.name || session.user.email}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {role}
                  </span>

                  {/* Logout */}
                  <LogoutButton />
                </>
              ) : (
                <>
                  {/* Public navigation */}
                  <Link
                    href="/orders"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                  >
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
