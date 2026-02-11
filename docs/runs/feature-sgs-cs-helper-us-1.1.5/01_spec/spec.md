# Specification — Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample
<!-- US-1.1.5 | Created: 2026-02-11 | Revised: 2026-02-11 | Contract: v1.0 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | US-1.1.5: Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample |
| FRs | 5 Functional Requirements |
| NFRs | 4 Non-Functional Requirements |
| ACs | 8 Acceptance Criteria (AC1-AC8) |

---

## 1. Functional Requirements

### FR-1: Parse Sample Data from Excel Rows 10+

**Description:** When parsing an Excel file, the system MUST read all rows from row 10 onwards (0-indexed: row index 10+). Each row represents a sample record with 9 columns.

**Column mapping:**

| Column | Index | Field | Type |
|--------|-------|-------|------|
| A | 0 | section | String (optional) |
| B | 1 | sampleId | String (required) |
| C | 2 | description | String (optional) |
| D | 3 | analyte | String (optional) |
| E | 4 | method | String (optional) |
| F | 5 | lod | String (optional) |
| G | 6 | loq | String (optional) |
| H | 7 | unit | String (optional) |
| I | 8 | requiredDate | String (optional) |

**Acceptance Criteria:**
- AC1: System parses rows 10+ with all 9 columns (Section, Sample ID, Description, Analyte, Method, LOD, LOQ, Unit, Required Date)
- AC2: Rows with empty Sample ID (column B) are skipped

### FR-2: Store Samples in OrderSample Table

**Description:** The system MUST store parsed sample data in a new `OrderSample` database table with a foreign key relation to the `Order` table.

**Data model:**
- `OrderSample` has all 9 fields from Excel columns
- `OrderSample` belongs to `Order` (many-to-one via `orderId`)
- `Order` has `samples` relation (one-to-many)
- Cascade delete: when Order is deleted, all its OrderSamples are deleted

**Acceptance Criteria:**
- AC3: Each parsed sample row is stored as an `OrderSample` record linked to its parent `Order`

### FR-3: Calculate and Store Total Sample Count

**Description:** The system MUST calculate the total number of unique samples from the Sample ID format `XXXX.NNN` where `NNN` is a sequential number. The total is determined by the maximum `.NNN` suffix value found across all sample rows for a given order.

**Calculation logic:**
1. Extract numeric suffix from each sampleId matching pattern `*.NNN`
2. Find the maximum suffix value
3. Store as `Order.sampleCount` (denormalized for fast UI reads)
4. If no valid suffix found, fallback to counting distinct sample rows

**Acceptance Criteria:**
- AC4: `sampleCount` is calculated from the max `.NNN` suffix in Sample ID format `XXXX.NNN`
- AC8: If no samples found (empty rows 10+), `sampleCount` = 0

### FR-4: Display Total Samples in Orders Tables

**Description:** Both the "In Progress" orders table and the "Completed" orders table MUST display a "Total Samples" column showing the `sampleCount` value for each order.

**UI placement:** After the "Priority" column, before "Progress" (In Progress tab) or "Completed At" (Completed tab).

**Acceptance Criteria:**
- AC5: "In Progress" orders table shows "Total Samples" column
- AC6: "Completed" orders table shows "Total Samples" column

### FR-5: Replace Samples on Re-Upload (Upsert)

**Description:** When the same order (same `jobNumber`) is uploaded again, the system MUST replace all existing `OrderSample` records with the new data from the Excel file. This is done atomically within a database transaction.

**Upsert logic:**
1. Compare order metadata (7 fields) — update Order if different
2. Delete ALL existing OrderSamples for this order
3. Create new OrderSamples from new Excel data
4. Update `sampleCount` from new data
5. All steps within a single transaction

**Acceptance Criteria:**
- AC7: Re-uploading replaces all existing samples with new data (delete + recreate)

---

## 2. Non-Functional Requirements

### NFR-1: Performance

- Sample parsing must complete within 2 seconds for files with up to 500 sample rows
- Database operations use batch `createMany` for efficiency
- `sampleCount` is denormalized on `Order` to avoid COUNT queries on every page load

### NFR-2: Data Integrity

- All sample operations (delete old + create new) happen in a single database transaction
- Cascade delete ensures no orphan samples when an Order is deleted
- `sampleCount` is always consistent with actual sample data at write time

### NFR-3: Backward Compatibility

- Existing orders with `sampleCount=1` (default) remain unchanged
- Only newly uploaded orders get accurate sample counts
- No data migration required for existing records

### NFR-4: Error Handling

- Invalid Excel rows (empty Sample ID) are silently skipped
- Sample ID format errors do not block order creation — fallback to row count
- Parser errors for sample section do not affect order metadata parsing

---

## 3. Acceptance Criteria Summary

| AC | Description | FR |
|----|-------------|-----|
| AC1 | Parse rows 10+ with all 9 columns | FR-1 |
| AC2 | Skip rows with empty Sample ID | FR-1 |
| AC3 | Store samples in OrderSample table | FR-2 |
| AC4 | Calculate sampleCount from max .NNN suffix | FR-3 |
| AC5 | Display Total Samples in In Progress table | FR-4 |
| AC6 | Display Total Samples in Completed table | FR-4 |
| AC7 | Re-upload replaces all samples (upsert) | FR-5 |
| AC8 | Empty sample section → sampleCount = 0 | FR-3 |

---

## 4. Out of Scope

- Editing individual sample records through UI
- Sample-level progress tracking
- Sample data validation beyond empty check
- Export/download sample data
- Sample grouping or filtering in UI

---

## 5. Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Prisma schema migration | Schema change | Required |
| xlsx library | Existing | Already installed |
| Order model | Existing | Has sampleCount field |
| Orders table components | Existing | Need column addition |

---

## 6. Cross-Root Impact

| Root | Impact | Details |
|------|--------|---------|
| sgs-cs-hepper | Primary | All changes in this root |
| a-z-copilot-flow | None | Tooling only, no code changes |

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Author | AI Assistant | ✅ Done | 2026-02-11 |
| Reviewer | User | ✅ Approved (Revised) | 2026-02-11 |
