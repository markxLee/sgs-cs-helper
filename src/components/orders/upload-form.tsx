"use client";

/**
 * Upload Form Component
 *
 * Client component for selecting, parsing, and uploading Excel files.
 * Features:
 * - Multiple file selection
 * - Client-side Excel parsing with xlsx.js
 * - Preview of parsed orders with edit capability
 * - Batch submission to server
 * - Per-order success/error result display
 *
 * @module components/orders/upload-form
 */

import { useState, useRef, useCallback } from "react";
import { parseExcelFiles } from "@/lib/excel/parser";
import { toCreateOrderInput } from "@/lib/excel/types";
import type { ParsedOrder } from "@/lib/excel/types";
import { formatFileSize, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from "@/lib/upload/validation";
import { submitOrdersInBatches } from "@/lib/upload/batch-upload";
import type { BatchProgressInfo } from "@/types/batch-upload";
import { OrderPreviewList, type PreviewItemData } from "./order-preview";
import { OrderEditForm } from "./order-edit-form";

// ============================================================================
// Types
// ============================================================================

type FormStep = "select" | "parsing" | "preview" | "submitting" | "results";

interface CreatedOrderInfo {
  jobNumber: string;
}

interface UpdatedOrderInfo {
  jobNumber: string;
}

interface UnchangedOrderInfo {
  jobNumber: string;
}

interface FailedOrderInfo {
  jobNumber: string;
  error: string;
}

interface SubmitResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  createdOrders: CreatedOrderInfo[];
  updatedOrders: UpdatedOrderInfo[];
  unchangedOrders: UnchangedOrderInfo[];
  failedOrders: FailedOrderInfo[];
}

// ============================================================================
// Main Component
// ============================================================================

export function UploadForm() {
  // File selection state
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing & preview state
  const [step, setStep] = useState<FormStep>("select");
  const [previewItems, setPreviewItems] = useState<PreviewItemData[]>([]);

  // Edit state
  const [editingItem, setEditingItem] = useState<{
    id: string;
    order: ParsedOrder;
  } | null>(null);

  // Submit result state
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Batch progress state
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    totalOrders: number;
    processedOrders: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
    batchErrors: number;
  } | null>(null);

  // ============================================================================
  // File Selection Handlers
  // ============================================================================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Convert FileList to array and append to existing files
    const newFiles = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...newFiles]);

    // Reset input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset preview if adding more files
    if (step === "preview") {
      setStep("select");
      setPreviewItems([]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setPreviewItems([]);
    setStep("select");
    setSubmitResult(null);
    setBatchProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================================
  // Parse Handlers
  // ============================================================================

  const handleParse = useCallback(async () => {
    if (files.length === 0) return;

    setStep("parsing");

    try {
      const results = await parseExcelFiles(files);
      // Convert to PreviewItemData with unique IDs
      const items: PreviewItemData[] = results.map((result, index) => ({
        id: `${result.fileName}-${index}-${Date.now()}`,
        result,
        isExpanded: false,
        isEditing: false,
      }));

      setPreviewItems(items);
      setStep("preview");
    } catch (error) {
      console.error("Parse error:", error);
      setStep("select");
    }
  }, [files]);

  // ============================================================================
  // Preview Handlers
  // ============================================================================

  const handleEdit = (id: string, order: ParsedOrder) => {
    setEditingItem({ id, order });
  };

  const handleSaveEdit = (updatedOrder: ParsedOrder) => {
    if (!editingItem) return;

    setPreviewItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              result: {
                success: true,
                data: updatedOrder,
                fileName: updatedOrder.sourceFileName,
              },
            }
          : item
      )
    );

    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleRemoveItem = (id: string) => {
    setPreviewItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ============================================================================
  // Submit Handlers
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    // Filter only successful parses
    const validOrders = previewItems
      .filter((item) => item.result.success)
      .map((item) => (item.result as { success: true; data: ParsedOrder }).data);

    if (validOrders.length === 0) {
      setSubmitResult({
        success: false,
        message: "No valid orders to submit",
        created: 0,
        updated: 0,
        unchanged: 0,
        failed: 0,
        createdOrders: [],
        updatedOrders: [],
        unchangedOrders: [],
        failedOrders: [],
      });
      return;
    }

    setStep("submitting");
    setBatchProgress(null);

    try {
      // Convert to server format
      const orderInputs = validOrders.map(toCreateOrderInput);

      // Submit in batches with progress tracking
      const totalOrders = orderInputs.length;
      let processedOrders = 0;
      let createdSoFar = 0;
      let updatedSoFar = 0;
      let unchangedSoFar = 0;
      let failedSoFar = 0;
      let batchErrorsSoFar = 0;

      const handleBatchProgress = (info: BatchProgressInfo) => {
        if (info.batchResult) {
          processedOrders += info.batchResult.created.length
            + info.batchResult.updated.length
            + info.batchResult.unchanged.length
            + info.batchResult.failed.length;
          createdSoFar += info.batchResult.created.length;
          updatedSoFar += info.batchResult.updated.length;
          unchangedSoFar += info.batchResult.unchanged.length;
          failedSoFar += info.batchResult.failed.length;
        } else {
          batchErrorsSoFar++;
        }
        setBatchProgress({
          current: info.current,
          total: info.total,
          totalOrders,
          processedOrders,
          created: createdSoFar,
          updated: updatedSoFar,
          unchanged: unchangedSoFar,
          failed: failedSoFar,
          batchErrors: batchErrorsSoFar,
        });
      };

      const batchResult = await submitOrdersInBatches(orderInputs, {
        onBatchProgress: handleBatchProgress,
      });

      const success =
        batchResult.failed.length === 0 && batchResult.failedBatches === 0;
      const parts: string[] = [];
      if (batchResult.created.length > 0)
        parts.push(`Created ${batchResult.created.length}`);
      if (batchResult.updated.length > 0)
        parts.push(`Updated ${batchResult.updated.length}`);
      if (batchResult.unchanged.length > 0)
        parts.push(`Unchanged ${batchResult.unchanged.length}`);
      if (batchResult.failed.length > 0)
        parts.push(`Failed ${batchResult.failed.length}`);
      const message = parts.join(", ");

      setSubmitResult({
        success,
        message,
        created: batchResult.created.length,
        updated: batchResult.updated.length,
        unchanged: batchResult.unchanged.length,
        failed: batchResult.failed.length,
        createdOrders: batchResult.created.map((o) => ({
          jobNumber: o.jobNumber,
        })),
        updatedOrders: batchResult.updated.map((o) => ({
          jobNumber: o.jobNumber,
        })),
        unchangedOrders: batchResult.unchanged.map((o) => ({
          jobNumber: o.jobNumber,
        })),
        failedOrders: batchResult.failed.map((f) => ({
          jobNumber: f.input.jobNumber,
          error: f.error,
        })),
      });

      setStep("results");
      setBatchProgress(null);

      // Clear files on success
      if (success) {
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        created: 0,
        updated: 0,
        unchanged: 0,
        failed: validOrders.length,
        createdOrders: [],
        updatedOrders: [],
        unchangedOrders: [],
        failedOrders: validOrders.map((o) => ({
          jobNumber: o.jobNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        })),
      });
      setStep("results");
      setBatchProgress(null);
    }
  }, [previewItems]);

  const handleStartOver = () => {
    handleClearAll();
  };

  // ============================================================================
  // Computed Values
  // ============================================================================

  const validOrderCount = previewItems.filter((item) => item.result.success).length;
  const errorCount = previewItems.length - validOrderCount;
  const isParsing = step === "parsing";
  const isSubmitting = step === "submitting";
  const isDisabled = isParsing || isSubmitting;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="w-full max-w-lg">
      {/* File Selection Section */}
      {(step === "select" || step === "preview") && (
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Excel Files <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="file"
              name="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileChange}
              disabled={isDisabled}
              multiple
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-describedby="file-description"
            />
            <p id="file-description" className="mt-1 text-xs text-gray-500">
              Accepted formats: {ALLOWED_EXTENSIONS.join(", ")} (Max:{" "}
              {formatFileSize(MAX_FILE_SIZE)} per file)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && step === "select" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Selected Files ({files.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isDisabled}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <FileItem
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => handleRemoveFile(index)}
                    disabled={isDisabled}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Parse Button */}
          {files.length > 0 && step === "select" && (
            <button
              type="button"
              onClick={handleParse}
              disabled={isDisabled}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              Parse {files.length} File{files.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Parsing State */}
      {step === "parsing" && (
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Parsing Excel files...</p>
        </div>
      )}

      {/* Preview Section */}
      {step === "preview" && previewItems.length > 0 && (
        <div className="space-y-4">
          <OrderPreviewList
            results={previewItems}
            onEdit={handleEdit}
            onRemove={handleRemoveItem}
            disabled={isDisabled}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isDisabled}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isDisabled || validOrderCount === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Submit {validOrderCount} Order{validOrderCount > 1 ? "s" : ""}
              {errorCount > 0 && (
                <span className="text-xs opacity-75">
                  ({errorCount} skipped)
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Submitting State */}
      {step === "submitting" && (
        <div className="py-6 space-y-5">
          {/* Header with spinner */}
          <div className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-green-600 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-700 font-semibold text-lg">
              {batchProgress
                ? `Đang xử lý batch ${batchProgress.current}/${batchProgress.total}...`
                : "Đang chuẩn bị xử lý..."}
            </p>
          </div>

          {/* Progress bar */}
          {batchProgress && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {batchProgress.processedOrders}/{batchProgress.totalOrders} orders
                </span>
                <span>
                  {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Real-time stats */}
          {batchProgress && batchProgress.processedOrders > 0 && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {batchProgress.created > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-700">
                    {batchProgress.created}
                  </p>
                  <p className="text-xs text-green-600">Tạo mới</p>
                </div>
              )}
              {batchProgress.updated > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-700">
                    {batchProgress.updated}
                  </p>
                  <p className="text-xs text-blue-600">Cập nhật</p>
                </div>
              )}
              {batchProgress.unchanged > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-700">
                    {batchProgress.unchanged}
                  </p>
                  <p className="text-xs text-gray-600">Không đổi</p>
                </div>
              )}
              {batchProgress.failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-lg font-bold text-red-700">
                    {batchProgress.failed}
                  </p>
                  <p className="text-xs text-red-600">Lỗi</p>
                </div>
              )}
            </div>
          )}

          {/* Batch status dots */}
          {batchProgress && batchProgress.total > 1 && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {Array.from({ length: batchProgress.total }, (_, i) => {
                const batchIndex = i + 1;
                const isCompleted = batchIndex <= batchProgress.current;
                const isCurrent = batchIndex === batchProgress.current + 1;
                return (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-green-300 animate-pulse"
                          : "bg-gray-300"
                    }`}
                    title={`Batch ${batchIndex}`}
                  />
                );
              })}
            </div>
          )}

          {/* Error warning */}
          {batchProgress && batchProgress.batchErrors > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <svg
                className="h-4 w-4 text-amber-500 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-700">
                {batchProgress.batchErrors} batch bị lỗi — các batch còn lại vẫn tiếp tục xử lý
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {step === "results" && submitResult && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              submitResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {submitResult.success ? (
                <svg
                  className="h-6 w-6 text-green-600 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-red-600 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div>
                <h3
                  className={`font-medium ${
                    submitResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {submitResult.success ? "Success!" : "Error"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    submitResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {submitResult.message}
                </p>
                {(submitResult.created > 0 || submitResult.updated > 0 || submitResult.unchanged > 0 || submitResult.failed > 0) && (
                  <p
                    className={`text-xs mt-2 ${
                      submitResult.success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Created: {submitResult.created} | Updated:{" "}
                    {submitResult.updated} | Unchanged:{" "}
                    {submitResult.unchanged} | Failed:{" "}
                    {submitResult.failed}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detail: Successfully created orders */}
          {submitResult.createdOrders.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Đã tạo thành công ({submitResult.createdOrders.length} order)
              </h4>
              <div className="flex flex-wrap gap-2">
                {submitResult.createdOrders.map((order, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {order.jobNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detail: Updated orders */}
          {submitResult.updatedOrders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
                Đã cập nhật ({submitResult.updatedOrders.length} order)
              </h4>
              <div className="flex flex-wrap gap-2">
                {submitResult.updatedOrders.map((order, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {order.jobNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detail: Unchanged orders */}
          {submitResult.unchangedOrders.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                Không thay đổi ({submitResult.unchangedOrders.length} order)
              </h4>
              <div className="flex flex-wrap gap-2">
                {submitResult.unchangedOrders.map((order, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {order.jobNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detail: Failed orders */}
          {submitResult.failedOrders.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Không tạo được ({submitResult.failedOrders.length} order)
              </h4>
              <ul className="space-y-1">
                {submitResult.failedOrders.map((order, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    <span className="font-medium">{order.jobNumber}</span>
                    <span className="mx-1">—</span>
                    <span className="text-red-600">{order.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartOver}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload More Files
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <OrderEditForm
          key={editingItem.id}
          order={editingItem.order}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isOpen={true}
        />
      )}
    </div>
  );
}

// ============================================================================
// FileItem Component
// ============================================================================

function FileItem({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="h-5 w-5 text-green-600 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 disabled:opacity-50"
          aria-label={`Remove ${file.name}`}
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
    </div>
  );
}
