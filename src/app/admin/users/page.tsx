import { Metadata } from "next";
import { InviteAdminForm } from "@/components/admin/invite-admin-form";
import { AdminList } from "@/components/admin/admin-list";

export const metadata: Metadata = {
  title: "Admin User Management | SGS CS Helper",
  description: "Manage admin users - invite new admins and revoke access",
};

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin User Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Invite new admins and manage existing admin access
          </p>
        </div>

        <div className="space-y-8">
          {/* Invite Form */}
          <section>
            <InviteAdminForm />
          </section>

          {/* Admin List */}
          <section>
            <AdminList />
          </section>
        </div>
      </div>
    </div>
  );
}
