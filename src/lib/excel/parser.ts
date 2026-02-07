/**
 * Excel parser for order data extraction
 *
 * @module lib/excel/parser
 * @description Client-side Excel parsing using xlsx.js
 *
 * Excel structure expected:
 * - Row 0-1: Job number (pattern: *XXX* or "SGS Job Number : XXX")
 * - Row 2: Order metadata (dates, people, priority)
 * - Row 3: Note
 *
 * Column mapping (Row 2):
 * - Col 1: registeredDate (Excel serial)
 * - Col 3: registeredBy (string)
 * - Col 5: receivedDate (Excel serial) - REQUIRED
 * - Col 7: checkedBy (string)
 * - Col 9: requiredDate (Excel serial)
 * - Col 11: priority (integer)
 */

import * as XLSX from "xlsx";
import type { ParseResult, ParsedOrder, ParseError } from "./types";
import { parseExcelDateCell } from "./date-utils";

// ============================================================================
// Constants
// ============================================================================

/** Column indices for Row 2 data (0-indexed) */
const COLUMN_MAP = {
  registeredDate: 1,
  registeredBy: 3,
  receivedDate: 5,
  checkedBy: 7,
  requiredDate: 9,
  priority: 11,
} as const;

/** Row indices */
const ROW_MAP = {
  jobNumberPrimary: 0,
  jobNumberFallback: 1,
  metadata: 2,
  note: 3,
} as const;

/** Job number patterns */
const JOB_NUMBER_PATTERNS = [
  // Pattern: *XXX* (asterisk-wrapped)
  /\*([A-Z0-9]+-[A-Z0-9-]+)\*/i,
  // Pattern: SGS Job Number : XXX
  /SGS\s*Job\s*Number\s*:\s*([A-Z0-9]+-[A-Z0-9-]+)/i,
  // Pattern: Just the job number format (e.g., SGS-2026-001)
  /\b([A-Z]{2,4}-\d{4}-\d+)\b/i,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract job number from a row
 */
function extractJobNumber(row: unknown[]): string | null {
  if (!row || row.length === 0) return null;

  // Check each cell in the row
  for (const cell of row) {
    if (typeof cell !== "string") continue;

    // Try each pattern
    for (const pattern of JOB_NUMBER_PATTERNS) {
      const match = cell.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }
  }

  return null;
}

/**
 * Get cell value safely
 */
function getCellValue(row: unknown[], colIndex: number): unknown {
  if (!row || colIndex >= row.length) return undefined;
  return row[colIndex];
}

/**
 * Get string value from cell
 */
function getStringValue(row: unknown[], colIndex: number): string | null {
  const value = getCellValue(row, colIndex);
  if (value === undefined || value === null || value === "") return null;
  return String(value).trim();
}

/**
 * Get integer value from cell
 */
function getIntValue(row: unknown[], colIndex: number): number {
  const value = getCellValue(row, colIndex);
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Extract note from Row 3
 * Note may be in a merged cell, so check all cells
 */
function extractNote(row: unknown[]): string | null {
  if (!row || row.length === 0) return null;

  // Find first non-empty cell
  for (const cell of row) {
    if (cell !== undefined && cell !== null && cell !== "") {
      const note = String(cell).trim();
      if (note.length > 0) return note;
    }
  }

  return null;
}

// ============================================================================
// Main Parser Functions
// ============================================================================

/**
 * Parse a single Excel file and extract order data
 *
 * @param file - File object from file input
 * @returns Promise resolving to ParseResult
 *
 * @example
 * const result = await parseExcelFile(file);
 * if (result.success) {
 *   console.log(result.data.jobNumber);
 * } else {
 *   console.error(result.error.message);
 * }
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const fileName = file.name;

  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Parse with xlsx
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return createError("file", "No sheets found in Excel file", fileName);
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return createError("file", "Could not read sheet data", fileName);
    }

    // Convert to 2D array (rows × columns)
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    if (!data || data.length < 3) {
      return createError(
        "file",
        "File does not contain enough rows (minimum 3 rows required)",
        fileName
      );
    }

    // Extract job number from Row 0 or Row 1
    let jobNumber = extractJobNumber(data[ROW_MAP.jobNumberPrimary]);
    if (!jobNumber) {
      jobNumber = extractJobNumber(data[ROW_MAP.jobNumberFallback]);
    }

    if (!jobNumber) {
      return createError(
        "jobNumber",
        "Job number not found in Row 1 or Row 2. Expected format: *XXX* or SGS Job Number : XXX",
        fileName,
        ROW_MAP.jobNumberPrimary
      );
    }

    // Get Row 2 (metadata row)
    const metadataRow = data[ROW_MAP.metadata];
    if (!metadataRow || metadataRow.length === 0) {
      return createError(
        "metadata",
        "Row 3 (metadata) is empty or missing",
        fileName,
        ROW_MAP.metadata
      );
    }

    // Extract dates
    const registeredDateValue = getCellValue(
      metadataRow,
      COLUMN_MAP.registeredDate
    );
    const receivedDateValue = getCellValue(
      metadataRow,
      COLUMN_MAP.receivedDate
    );
    console.log("Received Date Value:", receivedDateValue, "Type:", typeof receivedDateValue, "isDate:", receivedDateValue instanceof Date);
    if (typeof receivedDateValue === "number") {
      console.log("Serial number:", receivedDateValue);
    }
    const requiredDateValue = getCellValue(
      metadataRow,
      COLUMN_MAP.requiredDate
    );

    // Parse registeredDate
    const registeredDate = parseExcelDateCell(registeredDateValue);
    if (!registeredDate) {
      return createError(
        "registeredDate",
        "Invalid or missing registration date in Row 3, Col 2",
        fileName,
        ROW_MAP.metadata,
        COLUMN_MAP.registeredDate
      );
    }

    // Parse receivedDate (REQUIRED)
    const receivedDate = parseExcelDateCell(receivedDateValue);
    if (!receivedDate) {
      return createError(
        "receivedDate",
        "Invalid or missing received date in Row 3, Col 6. This field is required.",
        fileName,
        ROW_MAP.metadata,
        COLUMN_MAP.receivedDate
      );
    }

    // Parse requiredDate
    const requiredDate = parseExcelDateCell(requiredDateValue);
    if (!requiredDate) {
      return createError(
        "requiredDate",
        "Invalid or missing required date in Row 3, Col 10",
        fileName,
        ROW_MAP.metadata,
        COLUMN_MAP.requiredDate
      );
    }

    // Extract string fields
    const registeredBy = getStringValue(metadataRow, COLUMN_MAP.registeredBy);
    const checkedBy = getStringValue(metadataRow, COLUMN_MAP.checkedBy);
    const priority = getIntValue(metadataRow, COLUMN_MAP.priority);

    // Extract note from Row 3
    const noteRow = data[ROW_MAP.note];
    const note = noteRow ? extractNote(noteRow) : null;

    // Build ParsedOrder
    const order: ParsedOrder = {
      jobNumber,
      registeredDate,
      registeredBy,
      receivedDate,
      checkedBy,
      requiredDate,
      priority,
      note,
      sourceFileName: fileName,
    };
    console.log("Parsed order:", order);
    return {
      success: true,
      data: order,
      fileName,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error parsing file";
    return createError("file", message, fileName);
  }
}

/**
 * Parse multiple Excel files in parallel
 *
 * @param files - Array of File objects
 * @returns Promise resolving to array of ParseResults
 *
 * @example
 * const results = await parseExcelFiles(files);
 * const successful = results.filter(r => r.success);
 * const failed = results.filter(r => !r.success);
 */
export async function parseExcelFiles(files: File[]): Promise<ParseResult[]> {
  // Parse all files in parallel
  return Promise.all(files.map((file) => parseExcelFile(file)));
}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Create a ParseResult error
 */
function createError(
  field: string,
  message: string,
  fileName: string,
  row?: number,
  column?: number
): ParseResult {
  const error: ParseError = {
    field,
    message,
    row,
    column,
  };

  return {
    success: false,
    error,
    fileName,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { COLUMN_MAP, ROW_MAP, JOB_NUMBER_PATTERNS };
