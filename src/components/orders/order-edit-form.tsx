"use client";

/**
 * Order Edit Form Component
 *
 * Modal form for editing parsed order data before submission.
 * Includes validation for required fields.
 *
 * @module components/orders/order-edit-form
 */

import { useState } from "react";
import type { ParsedOrder } from "@/lib/excel/types";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface OrderEditFormProps {
  /** Order data to edit */
  order: ParsedOrder;
  /** Callback when user saves changes */
  onSave: (order: ParsedOrder) => void;
  /** Callback when user cancels edit */
  onCancel: () => void;
  /** Whether form is open */
  isOpen: boolean;
}

interface FormErrors {
  jobNumber?: string;
  registeredDate?: string;
  receivedDate?: string;
  requiredDate?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date for input[type="datetime-local"]
 */
function formatDateForInput(date: Date): string {
  // datetime-local requires YYYY-MM-DDTHH:mm format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse date from input[type="datetime-local"]
 */
function parseDateFromInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// ============================================================================
// OrderEditForm Component
// ============================================================================

export function OrderEditForm({
  order,
  onSave,
  onCancel,
  isOpen,
}: OrderEditFormProps) {
  // Form state - initialize with order
  // Parent should use key={order.jobNumber} to reset form when order changes
  const [formData, setFormData] = useState<ParsedOrder>(order);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.jobNumber.trim()) {
      newErrors.jobNumber = "Job number is required";
    }

    if (!formData.registeredDate) {
      newErrors.registeredDate = "Registered date is required";
    }

    if (!formData.receivedDate) {
      newErrors.receivedDate = "Received date is required";
    }

    if (!formData.requiredDate) {
      newErrors.requiredDate = "Required date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleChange = (
    field: keyof ParsedOrder,
    value: string | number | Date | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle date field changes
  const handleDateChange = (field: keyof ParsedOrder, value: string) => {
    const date = parseDateFromInput(value);
    if (date) {
      handleChange(field, date);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      // Could add confirmation dialog here
    }
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Order</h2>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Job Number */}
          <div>
            <label
              htmlFor="jobNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Job Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jobNumber"
              value={formData.jobNumber}
              onChange={(e) => handleChange("jobNumber", e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
                errors.jobNumber
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              )}
            />
            {errors.jobNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.jobNumber}</p>
            )}
          </div>

          {/* Date Fields Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Registered Date */}
            <div>
              <label
                htmlFor="registeredDate"
                className="block text-sm font-medium text-gray-700"
              >
                Registered <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="registeredDate"
                value={formatDateForInput(formData.registeredDate)}
                onChange={(e) =>
                  handleDateChange("registeredDate", e.target.value)
                }
                className={cn(
                  "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
                  errors.registeredDate
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                )}
              />
              {errors.registeredDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.registeredDate}
                </p>
              )}
            </div>

            {/* Received Date */}
            <div>
              <label
                htmlFor="receivedDate"
                className="block text-sm font-medium text-gray-700"
              >
                Received <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="receivedDate"
                value={formatDateForInput(formData.receivedDate)}
                onChange={(e) =>
                  handleDateChange("receivedDate", e.target.value)
                }
                className={cn(
                  "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
                  errors.receivedDate
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                )}
              />
              {errors.receivedDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.receivedDate}
                </p>
              )}
            </div>

            {/* Required Date */}
            <div>
              <label
                htmlFor="requiredDate"
                className="block text-sm font-medium text-gray-700"
              >
                Required <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="requiredDate"
                value={formatDateForInput(formData.requiredDate)}
                onChange={(e) =>
                  handleDateChange("requiredDate", e.target.value)
                }
                className={cn(
                  "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
                  errors.requiredDate
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                )}
              />
              {errors.requiredDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.requiredDate}
                </p>
              )}
            </div>
          </div>

          {/* People Fields Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Registered By */}
            <div>
              <label
                htmlFor="registeredBy"
                className="block text-sm font-medium text-gray-700"
              >
                Registered By
              </label>
              <input
                type="text"
                id="registeredBy"
                value={formData.registeredBy || ""}
                onChange={(e) =>
                  handleChange("registeredBy", e.target.value || null)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Checked By */}
            <div>
              <label
                htmlFor="checkedBy"
                className="block text-sm font-medium text-gray-700"
              >
                Checked By
              </label>
              <input
                type="text"
                id="checkedBy"
                value={formData.checkedBy || ""}
                onChange={(e) =>
                  handleChange("checkedBy", e.target.value || null)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <input
              type="number"
              id="priority"
              min="0"
              value={formData.priority}
              onChange={(e) =>
                handleChange("priority", parseInt(e.target.value, 10) || 0)
              }
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700"
            >
              Note
            </label>
            <textarea
              id="note"
              rows={3}
              value={formData.note || ""}
              onChange={(e) => handleChange("note", e.target.value || null)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Source File (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source File
            </label>
            <p className="mt-1 text-sm text-gray-500">
              {formData.sourceFileName}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
