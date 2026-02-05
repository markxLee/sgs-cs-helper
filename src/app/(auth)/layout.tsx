import { ReactNode } from "react";

/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (login, etc.)
 * Centers content on the page with a simple design.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}
