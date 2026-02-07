import { Metadata } from "next";
import { UploadForm } from "@/components/orders/upload-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upload Excel File | SGS CS Helper",
  description: "Upload Excel files for order tracking",
};

/**
 * Upload Page - Server Component
 * 
 * Page for uploading Excel files.
 * Access controlled by layout.tsx:
 * - SUPER_ADMIN, ADMIN: Always allowed
 * - STAFF with canUpload=true: Allowed
 */
export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Upload Excel File
            </h1>
            <p className="mt-1 text-gray-600">
              Upload an Excel file (.xlsx or .xls) to import order data.
            </p>
          </div>

          <UploadForm />

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Tips for successful upload:
            </h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Use Excel format (.xlsx or .xls)</li>
              <li>Maximum file size: 10 MB</li>
              <li>Ensure data is in the expected format</li>
              <li>You can upload multiple files sequentially</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
