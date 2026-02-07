/**
 * File validation utilities for Excel file uploads
 * 
 * @module lib/upload/validation
 * @description Validates Excel files (MIME type, extension, size) for upload
 */

// ============================================================================
// Constants
// ============================================================================

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for Excel files */
export const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
] as const;

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = [".xlsx", ".xls"] as const;

// ============================================================================
// Types
// ============================================================================

/** Result of file validation */
export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/** File-like object interface for validation */
export interface FileInfo {
  name: string;
  type: string;
  size: number;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate an Excel file for upload
 * 
 * Checks:
 * 1. File extension (.xlsx or .xls)
 * 2. MIME type matches Excel formats
 * 3. File size is within limit (10MB)
 * 
 * @param file - File object or file info to validate
 * @returns ValidationResult - { valid: true } or { valid: false, error: string }
 * 
 * @example
 * const result = validateExcelFile(file);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 */
export function validateExcelFile(file: FileInfo): ValidationResult {
  // 1. Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Only Excel files (${ALLOWED_EXTENSIONS.join(", ")}) are allowed.`,
    };
  }

  // 2. Check MIME type
  const hasValidMimeType = ALLOWED_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_MIME_TYPES)[number]
  );

  if (!hasValidMimeType) {
    return {
      valid: false,
      error: `Invalid file format. Please upload a valid Excel file.`,
    };
  }

  // 3. Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}. Please upload a smaller file.`,
    };
  }

  // 4. Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty. Please select a valid Excel file.",
    };
  }

  return { valid: true };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format file size in bytes to human-readable string
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 * 
 * @example
 * formatFileSize(1536000) // "1.5 MB"
 * formatFileSize(512000)  // "500 KB"
 * formatFileSize(1024)    // "1 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  // Use appropriate decimal places
  const decimals = i === 0 ? 0 : size >= 10 ? 1 : 2;

  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Get the file extension from a filename
 * 
 * @param filename - The filename to extract extension from
 * @returns The extension (e.g., ".xlsx") or empty string if none
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}
