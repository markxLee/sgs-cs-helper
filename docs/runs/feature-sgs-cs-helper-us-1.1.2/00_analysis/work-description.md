# Work Description: US-1.1.2 Parse Excel and Extract Order Data
<!-- Generated: 2026-02-07 | User Story: US-1.1.2 | Product: sgs-cs-helper -->

---

## 📋 Work Description / Mô tả Công việc

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE (with scope change) |
| Title / Tiêu đề | Parse Excel Client-side and Extract Order Data |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Requestor | Flow 1 (roadmap-to-delivery) |
| Sources | User Story US-1.1.2, Excel sample: docs/template/oder.xls |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.1.2 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:** 
When a user selects an Excel file from SGS, the system needs to parse order data and store it in the database. Due to Vercel deployment (bandwidth limits), parsing will be done client-side instead of uploading files to server. This changes the approach from US-1.1.1's file upload to client-side parsing with JSON submission.

**VI:** 
Khi user chọn file Excel từ SGS, hệ thống cần parse dữ liệu order và lưu vào database. Do deploy trên Vercel (giới hạn bandwidth), việc parse sẽ thực hiện ở client-side thay vì upload file lên server. Điều này thay đổi approach từ upload file của US-1.1.1 sang client-side parsing với JSON submission.

---

### Expected Outcome — Kết quả Mong đợi

**EN:**
- User selects Excel file in browser
- xlsx.js parses file client-side
- Preview UI shows extracted data for confirmation
- User submits parsed JSON data to server
- Server validates and stores order in database
- Processing time can be calculated from `receivedDate`

**VI:**
- User chọn file Excel trong browser
- xlsx.js parse file ở client-side
- Preview UI hiển thị dữ liệu đã extract để xác nhận
- User submit JSON data đã parse lên server
- Server validate và lưu order vào database
- Có thể tính processing time từ `receivedDate`

---

### In Scope — Trong Phạm vi

- EN: Client-side Excel parsing with xlsx.js / VI: Parse Excel ở client với xlsx.js
- EN: Column mapping from sample Excel structure / VI: Mapping column từ cấu trúc Excel mẫu
- EN: Excel date serial number conversion / VI: Chuyển đổi số serial date của Excel
- EN: Preview UI for parsed data / VI: UI preview cho dữ liệu đã parse
- EN: Server validation of parsed data / VI: Validate dữ liệu đã parse ở server
- EN: Store order in database / VI: Lưu order vào database

### Out of Scope — Ngoài Phạm vi

- EN: File upload to server (removed) / VI: Upload file lên server (bỏ)
- EN: Sample data parsing (Row 8+) - future US / VI: Parse dữ liệu mẫu (Row 8+) - US tương lai
- EN: Duplicate detection - US-1.1.3 / VI: Phát hiện trùng lặp - US-1.1.3
- EN: Data encryption/signing / VI: Mã hóa/ký dữ liệu

---

### Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Must use xlsx.js in browser, no server-side file handling |
| Technical / Kỹ thuật | receivedDate is REQUIRED - used for processing time calculation |
| Technical / Kỹ thuật | Excel date serials must be converted to JavaScript Date (Vietnam TZ) |
| Platform / Nền tảng | Vercel deployment - minimize payload size |
| Security / Bảo mật | Accept client-side data without file verification (acknowledged risk) |

---

### Assumptions — Giả định

- EN: Excel file structure follows sample (docs/template/oder.xls) / VI: Cấu trúc file Excel theo mẫu
- EN: xlsx.js can run in browser without issues / VI: xlsx.js chạy được trong browser
- EN: User will verify parsed data before submitting / VI: User sẽ xác nhận dữ liệu trước khi submit
- EN: Client-side data is trusted (internal users only) / VI: Dữ liệu từ client được tin tưởng (chỉ user nội bộ)

---

### Column Mapping — Mapping Cột

| Excel Location | DB Field | Type | Required | Notes |
|----------------|----------|------|----------|-------|
| Row 0-1 | `jobNumber` | String | ✅ | Unique identifier, extract from `*XXX*` or `SGS Job Number : XXX` |
| Row 2, Col 1 | `registeredDate` | DateTime | ✅ | Excel serial → DateTime (Vietnam TZ) |
| Row 2, Col 3 | `registeredBy` | String | ❌ | Người đăng ký |
| Row 2, Col 5 | `receivedDate` | DateTime | ✅ | **CRITICAL: Used for processing time** |
| Row 2, Col 7 | `checkedBy` | String | ❌ | Người kiểm tra (often empty) |
| Row 2, Col 9 | `requiredDate` | DateTime | ✅ | Deadline |
| Row 2, Col 11 | `priority` | Int | ✅ | Priority level |
| Row 3 | `note` | String | ❌ | Ghi chú |

---

### Schema Changes Applied — Thay đổi Schema Đã áp dụng

```prisma
model Order {
  // Existing fields...
  receivedDate    DateTime    // NEW - REQUIRED - Processing time
  checkedBy       String?     // NEW - Optional
  note            String?     // NEW - Optional
}
```

---

### Missing Information — Thông tin Còn thiếu

> ✅ All information gathered - no missing items

---

### Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: xlsx.js installed and works in browser / xlsx.js cài đặt và chạy được trong browser
- [ ] AC2: Job Number extracted from Row 0 or Row 1 / Job Number được extract từ Row 0 hoặc Row 1
- [ ] AC3: `registeredDate` extracted from Row 2, Col 1 (Excel serial → DateTime) / registeredDate được extract
- [ ] AC4: `registeredBy` extracted from Row 2, Col 3 / registeredBy được extract
- [ ] AC5: `receivedDate` extracted from Row 2, Col 5 (REQUIRED) / receivedDate được extract (BẮT BUỘC)
- [ ] AC6: `checkedBy` extracted from Row 2, Col 7 / checkedBy được extract
- [ ] AC7: `requiredDate` extracted from Row 2, Col 9 / requiredDate được extract
- [ ] AC8: `priority` extracted from Row 2, Col 11 as integer / priority được extract dạng integer
- [ ] AC9: `note` extracted from Row 3 / note được extract từ Row 3
- [ ] AC10: Preview UI displays parsed data for user confirmation / Preview UI hiển thị dữ liệu để user xác nhận
- [ ] AC11: User can edit parsed data before submit / User có thể chỉnh sửa trước khi submit
- [ ] AC12: Server receives JSON, validates required fields, stores order / Server nhận JSON, validate, lưu order
- [ ] AC13: Parse errors reported with clear message / Lỗi parse được báo rõ ràng

---

### Key Decisions — Quyết định Quan trọng

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Client-side Excel parsing | Vercel bandwidth limits, avoid file upload overhead |
| D-002 | receivedDate is REQUIRED | Used to calculate processing time for orders |
| D-003 | Accept client data without file verification | Internal users only, acknowledged security tradeoff |

---

### Dependencies — Phụ thuộc

| Dependency | Status |
|------------|--------|
| US-1.1.1 (Upload UI) | ✅ DONE - Page structure reusable |
| Schema update | ✅ DONE - receivedDate, checkedBy, note added |
| xlsx package | ✅ DONE - Already installed as devDependency |

---

**Created:** 2026-02-07  
**Author:** Copilot (Flow 1 → Flow 2 handoff)
