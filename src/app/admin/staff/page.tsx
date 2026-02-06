import { CreateStaffForm } from "@/components/admin/create-staff-form";
import { StaffList } from "@/components/admin/staff-list";
import { getStaff } from "@/lib/actions/staff";

export default async function StaffManagementPage() {
  const result = await getStaff();
  const staff = result.success ? result.data : [];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Staff Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage staff user accounts and permissions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Create New Staff
        </h2>
        <CreateStaffForm />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Staff Users
        </h2>
        <StaffList initialData={staff} />
      </div>
    </div>
  );
}
