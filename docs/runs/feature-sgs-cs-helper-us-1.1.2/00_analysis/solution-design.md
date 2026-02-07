# Solution Design: US-1.1.2 Parse Excel and Extract Order Data
<!-- Phase 0 Output | Generated: 2026-02-07 | Branch: feature/sgs-cs-helper-us-1.1.2 -->

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:**
After selecting Excel files (US-1.1.1), the system needs to parse the order data and store it in the database. Due to Vercel deployment bandwidth limits, parsing must be done client-side using xlsx.js instead of uploading files to the server. The current upload action only validates and confirms upload—no actual parsing or data extraction exists.

**VI:**
Sau khi chọn file Excel (US-1.1.1), hệ thống cần parse dữ liệu order và lưu vào database. Do giới hạn bandwidth của Vercel, việc parse phải thực hiện ở client-side bằng xlsx.js thay vì upload file lên server. Hiện tại action upload chỉ validate và xác nhận—chưa có parse hay extract data.

---

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| File Handling | Files uploaded to server as Buffer | Parse in browser, send JSON only |
| Data Extraction | None—files accepted but not parsed | Extract all Row 2 fields + jobNumber + note |
| Preview | None—upload and confirm | Preview parsed data before submit |
| Database | Schema ready with new fields | Populate Order with all extracted fields |
| Error Handling | File validation only | Parse errors with clear messages |

---

### Gap Analysis / Phân tích Khoảng cách

- **EN:** Missing client-side Excel parser using xlsx.js
- **VI:** Thiếu parser Excel ở client dùng xlsx.js

- **EN:** Missing column extraction logic (Row 0/1 → jobNumber, Row 2 → dates/people, Row 3 → note)
- **VI:** Thiếu logic extract column (Row 0/1 → jobNumber, Row 2 → ngày/người, Row 3 → note)

- **EN:** Missing preview UI for parsed data confirmation
- **VI:** Thiếu UI preview để xác nhận dữ liệu đã parse

- **EN:** Missing editable form before submission
- **VI:** Thiếu form chỉnh sửa trước khi submit

- **EN:** Missing server action to receive JSON and create Order
- **VI:** Thiếu server action nhận JSON và tạo Order

---

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-helper | `src/lib/excel/` | NEW: Parser and date utilities |
| sgs-cs-helper | `src/components/orders/` | NEW: Preview UI, editable form |
| sgs-cs-helper | `src/lib/actions/` | NEW: createOrder action |
| sgs-cs-helper | `upload-form.tsx` | MODIFY: Add parser integration |

---

### Open Questions / Câu hỏi Mở

1. **EN:** Is Row 3 note always in a merged cell? / **VI:** Note ở Row 3 có luôn là merged cell không?
   > Assumption: Will read from first non-empty cell in Row 3

2. **EN:** What if jobNumber format varies? / **VI:** Nếu format jobNumber khác nhau thì sao?
   > Assumption: Accept both `*XXX*` pattern and `SGS Job Number : XXX` format

---

### Assumptions / Giả định

1. **EN:** Excel files always follow the sample structure (docs/template/oder.xls)
   **VI:** File Excel luôn theo cấu trúc mẫu

2. **EN:** xlsx.js works reliably in modern browsers
   **VI:** xlsx.js hoạt động ổn định trên browser hiện đại

3. **EN:** Users will review and correct data before submitting
   **VI:** User sẽ review và sửa data trước khi submit

4. **EN:** Client-side data is trusted (internal users only)
   **VI:** Dữ liệu client-side được tin tưởng (chỉ user nội bộ)

5. **EN:** Excel date serials use 1900 date system (Windows default)
   **VI:** Excel date serial dùng hệ thống 1900 (Windows mặc định)

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| `src/lib/upload/validation.ts` | File validation with types | ✅ Yes | Reuse validation pattern |
| `src/lib/actions/staff.ts` | Zod schema + server action | ✅ Yes | Use for createOrder action |
| `src/components/orders/upload-form.tsx` | Form with file handling | ✅ Yes | Extend for preview flow |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| `src/lib/actions/staff.ts` | Zod validation → Prisma create | EN: Use same pattern for Order / VI: Dùng pattern tương tự cho Order |
| `src/components/orders/upload-form.tsx` | Multi-file selection, per-file results | EN: Extend for preview step / VI: Mở rộng thêm bước preview |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `xlsx` | Excel parsing | ✅ Existing (v0.18.5 in package.json) |
| `zod` | Schema validation | ✅ Existing |
| `@prisma/client` | Database operations | ✅ Existing |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| N/A | N/A | Single root | No cross-root dependencies |

### Reusable Components / Component Tái sử dụng

- `src/lib/upload/validation.ts`: File type/size validation (keep for initial check)
- `src/lib/actions/staff.ts`: Zod + Prisma action pattern
- `src/components/ui/*`: shadcn/ui components for forms

### New Components Needed / Component Cần tạo Mới

1. **EN:** `src/lib/excel/parser.ts` - Client-side Excel parser
   **VI:** Parser Excel ở client

2. **EN:** `src/lib/excel/date-utils.ts` - Excel date serial conversion
   **VI:** Chuyển đổi Excel date serial

3. **EN:** `src/lib/excel/types.ts` - ParsedOrder type definitions
   **VI:** Định nghĩa type ParsedOrder

4. **EN:** `src/components/orders/order-preview.tsx` - Preview parsed data
   **VI:** Component preview dữ liệu đã parse

5. **EN:** `src/components/orders/order-edit-form.tsx` - Editable form before submit
   **VI:** Form chỉnh sửa trước khi submit

6. **EN:** `src/lib/actions/order.ts` - createOrder server action
   **VI:** Server action createOrder

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:**
Implement a two-step flow supporting **multiple files**: (1) User selects multiple Excel files, parse all files concurrently in browser using xlsx.js, extract order fields, and display in a preview list. (2) User reviews/edits each order, then submits **array of orders** to server action which validates with Zod and creates Orders in database (batch insert).

Key changes:
- Keep multiple file selection from US-1.1.1
- Parse multiple files in parallel (Promise.all)
- No file upload to server—only JSON array payload
- Preview UI shows list of all parsed orders
- Server-side Zod array validation before batch DB insert

**VI:**
Triển khai flow 2 bước hỗ trợ **nhiều file**: (1) User chọn nhiều file Excel, parse tất cả file đồng thời trong browser dùng xlsx.js, extract các field, hiển thị trong danh sách preview. (2) User review/edit từng order, sau đó submit **array của orders** lên server action để validate với Zod và tạo Orders trong database (batch insert).

Thay đổi chính:
- Giữ multiple file selection từ US-1.1.1
- Parse nhiều file song song (Promise.all)
- Không upload file lên server—chỉ JSON array payload
- UI preview hiển thị danh sách tất cả orders đã parse
- Server validate Zod array trước khi batch insert DB

---

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Chosen:** Multi-file parallel parse → Array submit | Fast, batch insert, consistent with US-1.1.1 UX | More complex preview UI | ✅ Selected |
| **Chosen:** Client-side parse → JSON submit | No bandwidth usage, fast, editable preview | Trust client data | ✅ Selected |
| Alternative 1: Server-side parse | More secure, single source of truth | Bandwidth limits on Vercel, slower | ❌ Rejected: Bandwidth |
| Alternative 2: Hybrid (validate server) | Best security | Complex, still needs upload | ❌ Rejected: Complexity |

---

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | `parser.ts` | sgs-cs-helper | EN: Parse Excel with xlsx.js / VI: Parse Excel với xlsx.js |
| 2 | `date-utils.ts` | sgs-cs-helper | EN: Convert Excel date serials / VI: Chuyển Excel date serial |
| 3 | `types.ts` | sgs-cs-helper | EN: ParsedOrder type / VI: Type ParsedOrder |
| 4 | `order-preview.tsx` | sgs-cs-helper | EN: Display parsed data / VI: Hiển thị data đã parse |
| 5 | `order-edit-form.tsx` | sgs-cs-helper | EN: Editable form / VI: Form chỉnh sửa |
| 6 | `order.ts` (action) | sgs-cs-helper | EN: createOrder server action / VI: Server action createOrder |

---

### Component Details / Chi tiết Component

#### Component 1: `src/lib/excel/parser.ts`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/excel/parser.ts` |
| Purpose | EN: Parse single or multiple Excel files to extract order data / VI: Parse 1 hoặc nhiều file Excel để extract order data |
| Inputs | `File` or `File[]` |
| Outputs | `ParseResult` (single) or `ParseResult[]` (multiple) |
| Dependencies | `xlsx`, `date-utils.ts`, `types.ts` |
| Key Functions | `parseExcelFile(file)`, `parseExcelFiles(files)` - parallel with Promise.all |

#### Component 2: `src/lib/excel/date-utils.ts`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/excel/date-utils.ts` |
| Purpose | EN: Convert Excel serial to JS Date (Vietnam TZ) / VI: Chuyển Excel serial sang JS Date (múi giờ VN) |
| Inputs | `number` (Excel serial) |
| Outputs | `Date` |
| Dependencies | None |

#### Component 3: `src/lib/excel/types.ts`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/excel/types.ts` |
| Purpose | EN: Type definitions for parsed data / VI: Định nghĩa type cho data đã parse |
| Inputs | N/A |
| Outputs | `ParsedOrder`, `ParseError`, `ParseResult`, `BatchParseResult` types |
| Dependencies | None |
| Key Types | `ParseResult = { success: true, data: ParsedOrder, fileName: string } \| { success: false, error: ParseError, fileName: string }` |

#### Component 4: `src/components/orders/order-preview.tsx`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/components/orders/order-preview.tsx` |
| Purpose | EN: Read-only preview of multiple parsed orders (list view) / VI: Preview dạng read-only của nhiều orders đã parse (danh sách) |
| Inputs | `ParsedOrder[]` - array of parsed orders |
| Outputs | UI display - list with per-order status (success/error) |
| Dependencies | `types.ts`, shadcn/ui components |
| Features | Show file name, parse status, expand/collapse details |

#### Component 5: `src/components/orders/order-edit-form.tsx`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/components/orders/order-edit-form.tsx` |
| Purpose | EN: Editable form for order data / VI: Form chỉnh sửa data order |
| Inputs | `ParsedOrder`, `onSubmit` callback |
| Outputs | Validated order data |
| Dependencies | `types.ts`, Zod, react-hook-form (optional), shadcn/ui |

#### Component 6: `src/lib/actions/order.ts`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/actions/order.ts` |
| Purpose | EN: Server action to validate and create multiple Orders (batch) / VI: Server action validate và tạo nhiều Orders (batch) |
| Inputs | `CreateOrderInput[]` (JSON array from client) |
| Outputs | `{ success: true, data: { created: Order[], failed: FailedOrder[] } } \| { success: false, error: string }` |
| Dependencies | Zod, Prisma (createMany or transaction), auth |
| Key Functions | `createOrders(orders[])` - batch insert with per-order error handling |

---

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | Browser | File selection | User selects multiple .xlsx/.xls files |
| 2 | Browser | `parser.ts` | `File[]` | Parse all files in parallel (Promise.all) |
| 3 | `parser.ts` | `date-utils.ts` | Excel serials | Convert dates for each file |
| 4 | `parser.ts` | UI | `ParseResult[]` | Return array of extracted data |
| 5 | UI | `order-preview.tsx` | `ParsedOrder[]` | Display preview list (success/error per file) |
| 6 | User | `order-edit-form.tsx` | Edits | User modifies individual orders if needed |
| 7 | `order-edit-form.tsx` | `createOrders` action | JSON array | Submit array to server |
| 8 | Server | Zod | JSON array | Validate each order in array |
| 9 | Server | Prisma | Validated array | Batch create Order records (transaction) |
| 10 | Server | UI | Result | Show per-order success/error |

---

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Invalid Excel format | EN: Show parse error with details / VI: Hiển thị lỗi parse với chi tiết | User sees clear message, can try different file |
| Missing required field (receivedDate) | EN: Highlight field, block submit / VI: Highlight field, chặn submit | User must fill before submit |
| Invalid date format | EN: Show "Invalid date" in preview / VI: Hiển thị "Ngày không hợp lệ" | User can manually correct |
| Duplicate jobNumber | EN: Server returns error / VI: Server trả về lỗi | User sees duplicate message |
| Server validation fails | EN: Show validation errors / VI: Hiển thị lỗi validation | User can correct and retry |

---

### Rollback Plan / Kế hoạch Rollback

**EN:**
1. New files are additive—no existing code modified significantly
2. `upload-form.tsx` changes are isolated to adding parser call
3. If issues: Remove parser integration, revert to file-upload-only flow
4. Database: No migration needed (schema already updated)

**VI:**
1. File mới là additive—không sửa code cũ đáng kể
2. Thay đổi `upload-form.tsx` chỉ thêm gọi parser
3. Nếu có vấn đề: Bỏ tích hợp parser, quay lại flow upload-only
4. Database: Không cần migration (schema đã update)

---

## Key Decisions / Quyết định Quan trọng

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Client-side Excel parsing | Vercel bandwidth limits, faster UX |
| D-002 | Preview before submit | User can verify/correct data |
| D-003 | Zod validation on server | Defense in depth, even for trusted clients |
| D-004 | Separate parser from form | Reusable for batch processing later |
| D-005 | Keep existing upload validation | Still useful for file type/size checks |
| D-006 | receivedDate as Required Field | Critical for processing time calculation |
| D-007 | Excel Date Serial Conversion | Need proper conversion with timezone handling |
| D-008 | Multi-file parallel parsing | Keep UX from US-1.1.1, batch submit array |

---

## Diagrams / Sơ đồ

See:
- [Flow Overview](./diagrams/flow-overview.md)
- [Sequence Diagram](./diagrams/sequence-main.md)

---

**Created:** 2026-02-07  
**Phase:** 0 - Analysis & Design
