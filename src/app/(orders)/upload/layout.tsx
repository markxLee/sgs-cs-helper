import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Upload Layout
 * 
 * Layout for upload pages (/orders/upload/*).
 * Enforces role-based access control with permission check:
 * - Unauthenticated users → redirect to /login
 * - SUPER_ADMIN, ADMIN → always allowed
 * - STAFF with canUpload=true → allowed
 * - STAFF with canUpload=false → redirect to /
 */
export default async function UploadLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const { role, canUpload } = session.user;

  // SUPER_ADMIN and ADMIN have full access
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return <>{children}</>;
  }

  // STAFF needs canUpload permission
  if (role === "STAFF" && canUpload === true) {
    return <>{children}</>;
  }

  // All other cases: redirect to dashboard
  redirect("/");
}
