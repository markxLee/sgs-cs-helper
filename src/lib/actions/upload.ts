"use server";

/**
 * Server Actions for file upload operations
 * 
 * @module lib/actions/upload
 * @description Handles Excel file uploads with authentication and validation
 */

import { auth } from "@/lib/auth";
import { validateExcelFile } from "@/lib/upload/validation";
import type { Session } from "next-auth";

// ============================================================================
// Types
// ============================================================================

/** Result from successful file upload */
export interface UploadResult {
  fileName: string;
  fileSize: number;
  // Note: buffer is processed server-side only, not returned to client
}

/** Discriminated union for upload action result */
export type UploadActionResult =
  | { success: true; data: UploadResult }
  | { success: false; error: string };

// ============================================================================
// Auth Helper
// ============================================================================

/**
 * Require upload permission
 * 
 * Authorization rules:
 * - SUPER_ADMIN: Always allowed
 * - ADMIN: Always allowed
 * - STAFF: Only if canUpload === true
 * 
 * @throws Redirects or returns error for unauthorized access
 * @returns Session if authorized
 */
async function requireUploadPermission(): Promise<Session> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized. Please log in.");
  }

  const { role, canUpload } = session.user;

  // SUPER_ADMIN and ADMIN have full access
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return session;
  }

  // STAFF needs canUpload permission
  if (role === "STAFF" && canUpload === true) {
    return session;
  }

  throw new Error("Access denied. You do not have permission to upload files.");
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Upload Excel file
 * 
 * Validates authentication, permissions, and file before processing.
 * Returns the file as a Buffer for further processing by other actions.
 * 
 * @param formData - FormData containing the file under 'file' key
 * @returns UploadActionResult - Success with file data or error message
 * 
 * @example
 * const formData = new FormData();
 * formData.append('file', file);
 * const result = await uploadExcel(formData);
 * if (result.success) {
 *   console.log('Uploaded:', result.data.fileName);
 * }
 */
export async function uploadExcel(
  formData: FormData
): Promise<UploadActionResult> {
  try {
    // 1. Check authentication and authorization
    await requireUploadPermission();

    // 2. Extract file from FormData
    const file = formData.get("file");

    if (!file) {
      return {
        success: false,
        error: "No file provided. Please select a file to upload.",
      };
    }

    if (!(file instanceof File)) {
      return {
        success: false,
        error: "Invalid file format. Please try again.",
      };
    }

    // 3. Validate file
    const validation = validateExcelFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 4. Convert file to Buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: Process buffer here (parse Excel, save to DB, etc.)
    // For now, we just validate and confirm upload
    console.log(`File uploaded: ${file.name} (${file.size} bytes, ${buffer.length} buffer length)`);

    // 5. Return success with file info (no buffer - can't serialize to client)
    return {
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
      },
    };
  } catch (error) {
    console.error("Error uploading file:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
