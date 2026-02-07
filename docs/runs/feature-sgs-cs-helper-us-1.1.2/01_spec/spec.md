# Specification: Parse Excel and Extract Order Data
# Đặc tả: Parse Excel và Trích xuất Dữ liệu Order
<!-- Phase 1 | US-1.1.2 | Generated: 2026-02-07 -->

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Parse Excel Client-side and Extract Order Data (Multi-file) |
| Phase 0 Analysis | [Solution Design](../00_analysis/solution-design.md) |
| Functional Reqs | 8 |
| Non-Functional Reqs | 5 |
| Affected Roots | sgs-cs-helper |
| Edge Cases | 8 |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:**
This feature enables CS staff to parse multiple Excel files simultaneously in the browser, preview extracted order data in a list, edit if needed, and submit all orders as a JSON array to the server for batch database insertion.

**VI:**
Tính năng này cho phép nhân viên CS parse nhiều file Excel đồng thời trong browser, preview dữ liệu order đã trích xuất dạng danh sách, chỉnh sửa nếu cần, và submit tất cả orders dưới dạng JSON array lên server để batch insert vào database.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- Client-side Excel parsing with xlsx.js (multiple files in parallel)
- Extract order fields from Excel structure (Row 0/1: jobNumber, Row 2: dates/people, Row 3: note)
- Excel date serial to JavaScript Date conversion (Vietnam timezone)
- Preview UI showing list of all parsed orders with per-file status
- Editable form for individual order correction
- Batch JSON submission to server
- Server-side Zod validation of order array
- Batch Order creation in database (createMany or transaction)
- Per-order error handling and result reporting

**Out of Scope / Ngoài phạm vi:**
- File upload to server (replaced by JSON submission)
- Sample data parsing (Row 8+) — future US
- Duplicate detection across existing orders — US-1.1.3
- Data encryption/signing
- Real-time progress tracking for large batches

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Client-side Excel Parsing

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall parse Excel files (.xlsx, .xls) entirely in the browser using xlsx.js library. No file data shall be uploaded to the server.
- **VI:** Hệ thống phải parse file Excel (.xlsx, .xls) hoàn toàn trong browser sử dụng thư viện xlsx.js. Không có dữ liệu file nào được upload lên server.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: xlsx.js library is loaded and functional in browser environment
- [ ] AC2: System can read .xlsx and .xls file formats
- [ ] AC3: File content is processed without server round-trip
- [ ] AC4: Memory usage stays reasonable for files up to 10MB

---

### FR-002: Multi-file Parallel Parsing

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall support parsing multiple Excel files simultaneously using Promise.all for parallel processing. Each file produces an independent ParseResult.
- **VI:** Hệ thống phải hỗ trợ parse nhiều file Excel đồng thời sử dụng Promise.all để xử lý song song. Mỗi file tạo ra một ParseResult độc lập.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: User can select multiple files at once (consistent with US-1.1.1 UX)
- [ ] AC2: All selected files are parsed in parallel (not sequentially)
- [ ] AC3: Each file's result (success or error) is tracked separately
- [ ] AC4: One file's failure does not block other files from processing

---

### FR-003: Job Number Extraction

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall extract the unique job number from Row 0 or Row 1 of the Excel file. Accept patterns: `*XXX*` or `SGS Job Number : XXX`.
- **VI:** Hệ thống phải trích xuất job number duy nhất từ Row 0 hoặc Row 1 của file Excel. Chấp nhận pattern: `*XXX*` hoặc `SGS Job Number : XXX`.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Job number extracted from Row 0 if present
- [ ] AC2: Falls back to Row 1 if Row 0 doesn't contain job number
- [ ] AC3: Correctly parses `*XXX*` pattern (asterisk-wrapped)
- [ ] AC4: Correctly parses `SGS Job Number : XXX` format
- [ ] AC5: Parse error if no valid job number found

---

### FR-004: Row 2 Field Extraction

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall extract all order metadata fields from Row 2 according to column mapping: registeredDate (Col 1), registeredBy (Col 3), receivedDate (Col 5), checkedBy (Col 7), requiredDate (Col 9), priority (Col 11).
- **VI:** Hệ thống phải trích xuất tất cả các field metadata từ Row 2 theo mapping cột: registeredDate (Col 1), registeredBy (Col 3), receivedDate (Col 5), checkedBy (Col 7), requiredDate (Col 9), priority (Col 11).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: registeredDate extracted from Row 2, Col 1 (Excel serial → DateTime)
- [ ] AC2: registeredBy extracted from Row 2, Col 3 (string, optional)
- [ ] AC3: receivedDate extracted from Row 2, Col 5 (Excel serial → DateTime, REQUIRED)
- [ ] AC4: checkedBy extracted from Row 2, Col 7 (string, optional)
- [ ] AC5: requiredDate extracted from Row 2, Col 9 (Excel serial → DateTime)
- [ ] AC6: priority extracted from Row 2, Col 11 (integer)
- [ ] AC7: Parse error if receivedDate is missing or invalid

---

### FR-005: Excel Date Conversion

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall convert Excel date serial numbers to JavaScript Date objects using the 1900 date system (Windows Excel default). Dates shall be interpreted in Vietnam timezone (Asia/Ho_Chi_Minh).
- **VI:** Hệ thống phải chuyển đổi số serial date của Excel sang JavaScript Date objects sử dụng hệ thống ngày 1900 (mặc định Windows Excel). Ngày phải được giải thích theo múi giờ Việt Nam (Asia/Ho_Chi_Minh).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Excel serial 45000 converts to correct JavaScript Date
- [ ] AC2: Dates are timezone-aware (Vietnam TZ)
- [ ] AC3: Invalid date serials produce clear error message
- [ ] AC4: Empty date cells handled appropriately (null for optional, error for required)

---

### FR-006: Preview UI with List View

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall display all parsed orders in a list view before submission. Each item shows: source file name, job number, key dates, and parse status (success/error). Users can expand items to see full details.
- **VI:** Hệ thống phải hiển thị tất cả orders đã parse trong list view trước khi submit. Mỗi item hiển thị: tên file nguồn, job number, các ngày quan trọng, và trạng thái parse (thành công/lỗi). User có thể mở rộng để xem chi tiết.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: List shows all parsed files with summary info
- [ ] AC2: Success items show green indicator, error items show red
- [ ] AC3: Each item displays: fileName, jobNumber, registeredDate, receivedDate, requiredDate
- [ ] AC4: Error items show specific error message
- [ ] AC5: Items are expandable to show all fields
- [ ] AC6: User can remove individual items from list

---

### FR-007: Order Edit Form

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall provide an editable form for each order, allowing users to correct parsed values before submission. Required fields must be validated before allowing submit.
- **VI:** Hệ thống phải cung cấp form chỉnh sửa cho mỗi order, cho phép user sửa các giá trị đã parse trước khi submit. Các field bắt buộc phải được validate trước khi cho phép submit.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: User can click "Edit" on any order in preview list
- [ ] AC2: Form shows all editable fields with current values
- [ ] AC3: Date fields use date picker component
- [ ] AC4: Required fields (jobNumber, registeredDate, receivedDate, requiredDate) show validation errors
- [ ] AC5: Changes update the preview list immediately
- [ ] AC6: User can cancel edit to revert changes

---

### FR-008: Batch Order Submission

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall submit all valid orders as a JSON array to the server. Server validates each order with Zod schema and performs batch insert. Results show per-order success/failure with reasons.
- **VI:** Hệ thống phải submit tất cả orders hợp lệ dưới dạng JSON array lên server. Server validate từng order với Zod schema và thực hiện batch insert. Kết quả hiển thị thành công/thất bại từng order với lý do.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Submit button enabled only when at least one valid order exists
- [ ] AC2: Orders with parse errors are excluded from submission (with warning)
- [ ] AC3: Server receives JSON array, not file data
- [ ] AC4: Server validates each order against Zod schema
- [ ] AC5: Database batch insert uses transaction or createMany
- [ ] AC6: Response includes: {created: Order[], failed: {order, error}[]}
- [ ] AC7: UI shows summary: "X orders created, Y failed"
- [ ] AC8: Failed orders display specific error message

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Parsing Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | < 2 seconds for 10 files × 1MB each |

**Description / Mô tả:**
- **EN:** Parsing multiple files should complete within reasonable time. Target: 10 files of 1MB each should parse within 2 seconds on modern browser.
- **VI:** Parse nhiều file phải hoàn thành trong thời gian hợp lý. Mục tiêu: 10 file 1MB mỗi file phải parse trong 2 giây trên browser hiện đại.

---

### NFR-002: Memory Efficiency

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | No memory leak, < 100MB peak for 10 files |

**Description / Mô tả:**
- **EN:** File parsing should not cause memory leaks. Peak memory usage should stay under 100MB for batch of 10 files.
- **VI:** Parse file không được gây memory leak. Bộ nhớ đỉnh phải dưới 100MB cho batch 10 files.

---

### NFR-003: Server Validation Security

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | All input validated, no SQL injection possible |

**Description / Mô tả:**
- **EN:** Despite trusting client-side data (internal users), server must validate all input with Zod before database operations. Prisma parameterized queries prevent SQL injection.
- **VI:** Mặc dù tin tưởng dữ liệu client (user nội bộ), server phải validate tất cả input với Zod trước khi thao tác database. Prisma parameterized queries ngăn SQL injection.

---

### NFR-004: Error Recovery

| Aspect | Detail |
|--------|--------|
| Category | Reliability |
| Metric | Partial failures don't lose successful data |

**Description / Mô tả:**
- **EN:** If some orders fail validation or DB insert, successfully created orders should not be rolled back. User should be able to fix failed orders and retry.
- **VI:** Nếu một số orders fail validation hoặc DB insert, các orders đã tạo thành công không bị rollback. User có thể sửa orders lỗi và thử lại.

---

### NFR-005: Browser Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Compatibility |
| Metric | Works on Chrome, Firefox, Edge (latest 2 versions) |

**Description / Mô tả:**
- **EN:** xlsx.js and all UI features must work on modern browsers: Chrome, Firefox, Edge (latest 2 major versions).
- **VI:** xlsx.js và tất cả tính năng UI phải hoạt động trên browser hiện đại: Chrome, Firefox, Edge (2 phiên bản mới nhất).

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect | Detail |
|--------|--------|
| Changes | Add Excel parser, preview UI, server action for batch order creation |
| Sync Type | N/A (single root) |

**New Files / Files Mới:**

| Path | Purpose |
|------|---------|
| `src/lib/excel/parser.ts` | Excel parsing logic |
| `src/lib/excel/date-utils.ts` | Excel date conversion |
| `src/lib/excel/types.ts` | Type definitions |
| `src/components/orders/order-preview.tsx` | Preview list component |
| `src/components/orders/order-edit-form.tsx` | Edit form component |
| `src/lib/actions/order.ts` | createOrders server action |

**Modified Files / Files Chỉnh sửa:**

| Path | Changes |
|------|---------|
| `src/components/orders/upload-form.tsx` | Integrate parser, add preview step |

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- `xlsx` package (existing devDependency)
- `zod` package (existing)
- Prisma client (existing)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### 5.1 Type Definitions

```typescript
// src/lib/excel/types.ts

/** Parsed order data from Excel */
interface ParsedOrder {
  jobNumber: string;
  registeredDate: Date;
  registeredBy: string | null;
  receivedDate: Date;        // REQUIRED
  checkedBy: string | null;
  requiredDate: Date;
  priority: number;
  note: string | null;
  sourceFileName: string;    // Track origin
}

/** Parse error information */
interface ParseError {
  field: string;
  message: string;
  row?: number;
  column?: number;
}

/** Result for single file parse */
type ParseResult = 
  | { success: true; data: ParsedOrder; fileName: string }
  | { success: false; error: ParseError; fileName: string };

/** Input for server action */
interface CreateOrderInput {
  jobNumber: string;
  registeredDate: string;    // ISO string
  registeredBy?: string;
  receivedDate: string;      // ISO string - REQUIRED
  checkedBy?: string;
  requiredDate: string;      // ISO string
  priority: number;
  note?: string;
  sourceFileName: string;
}

/** Server action response */
interface BatchCreateResult {
  success: boolean;
  created: Order[];
  failed: { order: CreateOrderInput; error: string }[];
}
```

### 5.2 Zod Schema (Server-side)

```typescript
// src/lib/actions/order.ts

const createOrderSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
  registeredDate: z.string().datetime(),
  registeredBy: z.string().optional(),
  receivedDate: z.string().datetime(),
  checkedBy: z.string().optional(),
  requiredDate: z.string().datetime(),
  priority: z.number().int().min(0),
  note: z.string().optional(),
  sourceFileName: z.string(),
});

const createOrdersSchema = z.array(createOrderSchema);
```

---

## 6. UI/UX Specifications / Đặc tả UI/UX

### 6.1 Updated Upload Flow

```
1. File Selection (unchanged from US-1.1.1)
   └─ Multiple file input, file list display

2. Parse & Preview (NEW)
   ├─ Parse button triggers parallel parsing
   ├─ Show loading state during parse
   └─ Display preview list with results

3. Review & Edit (NEW)
   ├─ List view with expand/collapse
   ├─ Edit button per order
   ├─ Remove button for unwanted orders
   └─ Validation indicators

4. Submit (MODIFIED)
   ├─ Submit All button (only valid orders)
   ├─ Show batch results
   └─ Reset or retry failed
```

### 6.2 Preview List Layout

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Parsed Orders (3 files)                    [Submit All] │
├─────────────────────────────────────────────────────────┤
│ ✅ order_001.xlsx                                    [▼] │
│    Job: SGS-2026-001 | Received: 2026-02-05              │
│    Registered: 2026-02-01 → Required: 2026-02-10         │
│                                        [Edit] [Remove]   │
├─────────────────────────────────────────────────────────┤
│ ✅ order_002.xlsx                                    [▼] │
│    Job: SGS-2026-002 | Received: 2026-02-06              │
│    ...                                                   │
├─────────────────────────────────────────────────────────┤
│ ❌ order_003.xlsx                                    [▼] │
│    Error: Missing receivedDate in Row 2, Col 5           │
│                                        [Edit] [Remove]   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Empty Excel file | Show parse error: "No data found in file" |
| EC-002 | Missing Row 2 | Show parse error: "Row 2 metadata not found" |
| EC-003 | Invalid date serial | Show field error: "Invalid date in [field]" |
| EC-004 | Job number in neither Row 0 nor Row 1 | Show parse error: "Job number not found" |
| EC-005 | Duplicate jobNumber in batch | Allow parse, server rejects with "Duplicate job number" |
| EC-006 | All files fail parsing | Show error list, Submit button disabled |
| EC-007 | Very large file (>10MB) | Show file validation error (existing validation) |
| EC-008 | Network error during submit | Show error, allow retry, keep order data |

---

## 8. Dependencies / Phụ thuộc

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| `xlsx` | Package | Existing (v0.18.5) | Client-side Excel parsing |
| `zod` | Package | Existing | Schema validation |
| `@prisma/client` | Package | Existing | Database operations |
| US-1.1.1 | Feature | Complete | File selection UI reused |
| Schema update | Migration | Complete | receivedDate, checkedBy, note added |

---

## 9. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Mitigation |
|------|--------|------------|
| xlsx.js browser compatibility | Medium | Test on target browsers; fallback instructions |
| Large batch memory usage | Medium | Limit batch size to 50 files; warning for large batches |
| Excel format variations | High | Document expected format; clear parse errors |
| Client data tampering | Low | Internal users only; server-side Zod validation |
| Partial batch failure | Medium | Don't rollback success; report per-order status |

---

## 10. Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-07 |
| Reviewer | ⏳ Pending | |

---

**Created:** 2026-02-07  
**Phase:** 1 - Specification
