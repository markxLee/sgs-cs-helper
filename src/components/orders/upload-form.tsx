"use client";

/**
 * Upload Form Component
 * 
 * Client component for selecting and uploading Excel files.
 * Features:
 * - Multiple file selection and upload
 * - File list display with individual remove buttons
 * - Loading state during upload with progress
 * - Per-file success/error result display
 * - Form reset after upload completion
 */

import { useState, useTransition, useRef } from "react";
import { uploadExcel } from "@/lib/actions/upload";
import { formatFileSize, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from "@/lib/upload/validation";

interface UploadResult {
  fileName: string;
  success: boolean;
  message: string;
}

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // Convert FileList to array and append to existing files
    const newFiles = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...newFiles]);
    setUploadResults([]); // Clear previous results when new files added
    
    // Reset input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadResults([]);

    if (files.length === 0) {
      setUploadResults([{ fileName: "", success: false, message: "Please select at least one file to upload." }]);
      return;
    }

    startTransition(async () => {
      const results: UploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentUploadIndex(i);
        
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadExcel(formData);

        if (result.success) {
          results.push({
            fileName: file.name,
            success: true,
            message: `Uploaded successfully (${formatFileSize(result.data.fileSize)})`,
          });
        } else {
          results.push({
            fileName: file.name,
            success: false,
            message: result.error,
          });
        }
      }
      
      setUploadResults(results);
      setCurrentUploadIndex(-1);
      // Reset files after upload
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    setUploadResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isPending}
            multiple
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            aria-describedby="file-description"
          />
          <p id="file-description" className="mt-1 text-xs text-gray-500">
            Accepted formats: {ALLOWED_EXTENSIONS.join(", ")} (Max: {formatFileSize(MAX_FILE_SIZE)} per file)
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Selected Files ({files.length})
              </span>
              {!isPending && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={`p-3 bg-gray-50 border border-gray-200 rounded-md ${
                    isPending && currentUploadIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                >
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
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {!isPending && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
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
                    )}
                    {isPending && currentUploadIndex === index && (
                      <svg
                        className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0"
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || files.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Uploading {currentUploadIndex + 1} of {files.length}...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Upload {files.length > 1 ? `${files.length} Files` : "File"}
            </>
          )}
        </button>
      </form>

      {/* Upload Results Display */}
      {uploadResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Upload Results
            </span>
            <button
              type="button"
              onClick={() => setUploadResults([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
                role="alert"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {result.success ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    {result.fileName && (
                      <p
                        className={`text-sm font-medium truncate ${
                          result.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {result.fileName}
                      </p>
                    )}
                    <p
                      className={`text-sm ${
                        result.success ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
