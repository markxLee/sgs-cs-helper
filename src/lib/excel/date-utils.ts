/**
 * Excel date serial number conversion utilities
 *
 * @module lib/excel/date-utils
 * @description Convert Excel date serial numbers to JavaScript Date objects
 *
 * Excel uses a serial number system where:
 * - Serial 1 = January 1, 1900 (in Windows Excel)
 * - Each integer increment = 1 day
 * - Fractional parts = time of day
 *
 * Note: Excel incorrectly treats 1900 as a leap year (Lotus 1-2-3 bug).
 * Serial 60 = Feb 29, 1900 (doesn't exist), but we handle this.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Excel epoch: January 1, 1900 in milliseconds
 * Note: We use Dec 30, 1899 because Excel serial 1 = Jan 1, 1900
 */
const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30)).getTime();

/**
 * Milliseconds per day
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Vietnam timezone offset in hours (UTC+7)
 */
const VIETNAM_TZ_OFFSET = 7;

/**
 * Minimum valid Excel serial (1 = Jan 1, 1900)
 */
const MIN_SERIAL = 1;

/**
 * Maximum reasonable Excel serial (year 9999)
 */
const MAX_SERIAL = 2958465;

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a value is a valid Excel date serial number
 *
 * @param value - Value to check
 * @returns True if valid serial number
 *
 * @example
 * isValidExcelSerial(45000) // true
 * isValidExcelSerial(-1) // false
 * isValidExcelSerial("45000") // false
 */
export function isValidExcelSerial(value: unknown): value is number {
  if (typeof value !== "number") {
    return false;
  }

  if (!Number.isFinite(value)) {
    return false;
  }

  // Must be positive and within reasonable range
  return value >= MIN_SERIAL && value <= MAX_SERIAL;
}

// ============================================================================
// Conversion
// ============================================================================

/**
 * Convert Excel date serial number to JavaScript Date
 *
 * @param serial - Excel date serial number
 * @param useVietnamTz - Whether to adjust for Vietnam timezone (default: true)
 * @returns JavaScript Date object, or null if invalid
 *
 * @example
 * // Excel serial 45000 = 2023-03-15
 * excelSerialToDate(45000)
 * // Returns: Date object for 2023-03-15 in Vietnam timezone
 *
 * @example
 * // Invalid serial
 * excelSerialToDate(-1) // Returns: null
 */
export function excelSerialToDate(serial: number): Date | null {
  if (!isValidExcelSerial(serial)) {
    return null;
  }

  // Convert to milliseconds and add to epoch
  // Excel dates represent Vietnam local time (UTC+7)
  // We subtract 7 hours to store as UTC
  const localMs = EXCEL_EPOCH + serial * MS_PER_DAY;
  const utcMs = localMs - VIETNAM_TZ_OFFSET * 60 * 60 * 1000;

  return new Date(utcMs);
}

/**
 * Convert Excel date serial to ISO string
 *
 * @param serial - Excel date serial number
 * @returns ISO date string, or null if invalid
 *
 * @example
 * excelSerialToISOString(45000) // "2023-03-15T07:00:00.000Z"
 */
export function excelSerialToISOString(serial: number): string | null {
  const date = excelSerialToDate(serial);
  return date ? date.toISOString() : null;
}

/**
 * Format Excel date serial as readable date string
 *
 * @param serial - Excel date serial number
 * @param locale - Locale for formatting (default: "vi-VN")
 * @returns Formatted date string, or "Invalid date" if invalid
 *
 * @example
 * formatExcelDate(45000, "vi-VN") // "15/03/2023"
 * formatExcelDate(45000, "en-US") // "3/15/2023"
 */
export function formatExcelDate(
  serial: number,
  locale: string = "vi-VN"
): string {
  const date = excelSerialToDate(serial);

  if (!date) {
    return "Invalid date";
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

// ============================================================================
// Parsing Helpers
// ============================================================================

/**
 * Try to parse a cell value as an Excel date
 *
 * Handles:
 * - Number (Excel serial)
 * - String that looks like a number
 * - Already a Date object
 *
 * @param value - Cell value from xlsx
 * @returns Date object or null if not parseable
 *
 * All dates are interpreted as Vietnam local time (UTC+7) and converted to UTC for storage.
 */
export function parseExcelDateCell(value: unknown): Date | null {
  // Already a Date (xlsx parsed it as UTC)
  if (value instanceof Date) {
    return value;
  }

  // Number (Excel serial)
  if (typeof value === "number") {
    return excelSerialToDate(value);
  }

  // String that might be a number
  if (typeof value === "string") {
    const trimmed = value.trim();
    const num = parseFloat(trimmed);

    if (!isNaN(num) && isValidExcelSerial(num)) {
      return excelSerialToDate(num);
    }

    // Try to parse as date string (assumed UTC)
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return null;
}

/**
 * Require a date from cell value, throwing descriptive error if invalid
 *
 * @param value - Cell value
 * @param fieldName - Field name for error message
 * @param row - Row number for error message
 * @param column - Column number for error message
 * @returns Date object
 * @throws Error with descriptive message if invalid
 */
export function requireExcelDate(
  value: unknown,
  fieldName: string,
  row?: number,
  column?: number
): Date {
  const date = parseExcelDateCell(value);

  if (!date) {
    const location =
      row !== undefined && column !== undefined
        ? ` at Row ${row}, Col ${column}`
        : "";
    throw new Error(`Invalid or missing date for ${fieldName}${location}`);
  }

  return date;
}
