# Specification: Upload Excel Files UI
# Đặc tả: Giao diện Tải lên Tệp Excel
<!-- US-1.1.1 | Phase 1 | Created: 2026-02-07 -->

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Upload Excel Files UI |
| User Story | US-1.1.1 |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |
| Functional Reqs | 6 |
| Non-Functional Reqs | 4 |
| Affected Roots | sgs-cs-helper |
| Edge Cases | 7 |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:** 
This specification defines the Upload Excel Files UI feature that allows authorized users to upload Excel files (.xlsx/.xls) containing order data. The feature includes a dedicated upload page at `/orders/upload`, file selection and validation, upload progress feedback, and integration with the Excel parser (US-1.1.2).

**VI:** 
Đặc tả này định nghĩa tính năng Giao diện Tải lên Tệp Excel cho phép người dùng được ủy quyền tải lên các tệp Excel (.xlsx/.xls) chứa dữ liệu đơn hàng. Tính năng bao gồm trang tải lên tại `/orders/upload`, chọn và xác thực tệp, phản hồi tiến trình tải lên, và tích hợp với trình phân tích Excel (US-1.1.2).

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- Upload page at `/orders/upload` route
- File selection UI (click to select, .xlsx/.xls only)
- File information display (name, size)
- Client-side file extension validation
- Server-side file validation (MIME type, extension, size ≤10MB)
- Role-based access control (ADMIN/SUPER_ADMIN full access, STAFF needs canUpload)
- Loading indicator during upload
- Success/error feedback messages
- Sequential file upload (one at a time)
- Export interface for Excel parser (US-1.1.2)

**Out of Scope / Ngoài phạm vi:**
- Drag-and-drop file upload (Phase 2+)
- Batch upload (multiple files at once)
- Excel parsing logic (US-1.1.2)
- Order storage in database (US-1.1.3)
- Duplicate detection (US-1.1.3)
- File preview before upload
- Upload history/log

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Upload Page Route

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall provide an upload page accessible at `/orders/upload` route.
- **VI:** Hệ thống cung cấp trang tải lên có thể truy cập tại route `/orders/upload`.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Page exists at `/orders/upload` and returns 200 status for authorized users
- [ ] AC2: Page displays upload form with file input and upload button
- [ ] AC3: Page is accessible from dashboard via navigation link

---

### FR-002: Role-Based Access Control

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall enforce role-based access control on the upload page. ADMIN and SUPER_ADMIN have full access. STAFF requires `canUpload=true` permission.
- **VI:** Hệ thống thực thi kiểm soát truy cập dựa trên vai trò trên trang tải lên. ADMIN và SUPER_ADMIN có quyền truy cập đầy đủ. STAFF cần quyền `canUpload=true`.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Unauthenticated users are redirected to `/login`
- [ ] AC2: SUPER_ADMIN can access upload page regardless of canUpload value
- [ ] AC3: ADMIN can access upload page regardless of canUpload value
- [ ] AC4: STAFF with `canUpload=true` can access upload page
- [ ] AC5: STAFF with `canUpload=false` is redirected to `/` with implicit access denied

---

### FR-003: File Selection UI

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall provide a file input that allows users to select Excel files (.xlsx, .xls) from their device.
- **VI:** Hệ thống cung cấp input tệp cho phép người dùng chọn các tệp Excel (.xlsx, .xls) từ thiết bị của họ.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: File input accepts only .xlsx and .xls file extensions
- [ ] AC2: File input opens native file picker on click
- [ ] AC3: After file selection, file name is displayed
- [ ] AC4: After file selection, file size is displayed (formatted: KB/MB)
- [ ] AC5: User can re-select a different file before uploading

---

### FR-004: File Validation

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall validate files both client-side (extension) and server-side (MIME type, extension, size).
- **VI:** Hệ thống xác thực tệp cả phía client (extension) và server (MIME type, extension, size).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Client-side validation rejects files without .xlsx or .xls extension
- [ ] AC2: Server validates MIME type is `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `application/vnd.ms-excel`
- [ ] AC3: Server validates file extension is .xlsx or .xls
- [ ] AC4: Server validates file size is ≤ 10MB (10,485,760 bytes)
- [ ] AC5: Invalid file type shows error: "Only .xlsx and .xls files are allowed"
- [ ] AC6: File too large shows error: "File must be 10MB or less"

---

### FR-005: Upload Process with Feedback

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall provide visual feedback during file upload including loading state, success message, and error messages.
- **VI:** Hệ thống cung cấp phản hồi trực quan trong quá trình tải lên bao gồm trạng thái loading, thông báo thành công và thông báo lỗi.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Upload button is disabled when no file is selected
- [ ] AC2: Upload button is disabled during upload (prevents double-submit)
- [ ] AC3: Loading spinner is displayed during upload
- [ ] AC4: Success message is displayed after successful upload
- [ ] AC5: Error message is displayed if upload fails
- [ ] AC6: File input is reset after successful upload (ready for next file)

---

### FR-006: Sequential Upload Support

| Aspect | Detail |
|--------|--------|
| Priority | Should |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The system shall allow users to upload multiple files sequentially (one after another).
- **VI:** Hệ thống cho phép người dùng tải lên nhiều tệp theo thứ tự (từng tệp một).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: After successful upload, user can select and upload another file
- [ ] AC2: Previous upload result message is cleared when new file is selected
- [ ] AC3: Each upload is independent (no state carried over)

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | Upload completes within 5 seconds for 10MB file on stable connection |

**Description / Mô tả:**
- **EN:** File upload and validation should complete within acceptable time limits for good user experience.
- **VI:** Tải lên và xác thực tệp cần hoàn thành trong giới hạn thời gian chấp nhận được để có trải nghiệm người dùng tốt.

**Criteria:**
- File selection feedback: < 100ms
- Upload initiation: < 200ms
- Server validation: < 500ms
- Total upload (10MB file): < 5 seconds

---

### NFR-002: Security

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | 100% of requests validated server-side |

**Description / Mô tả:**
- **EN:** All file uploads must be validated server-side. Auth checks must occur before any file processing.
- **VI:** Tất cả các tệp tải lên phải được xác thực phía server. Kiểm tra auth phải xảy ra trước khi xử lý tệp.

**Criteria:**
- Server-side auth check before file processing
- Server-side file type validation (not just client)
- File size limit enforced server-side
- No file execution (files are parsed, not executed)

---

### NFR-003: Accessibility

| Aspect | Detail |
|--------|--------|
| Category | Accessibility |
| Metric | WCAG 2.1 Level AA compliance |

**Description / Mô tả:**
- **EN:** Upload UI should be accessible to users with disabilities.
- **VI:** UI tải lên cần truy cập được cho người dùng khuyết tật.

**Criteria:**
- File input is keyboard accessible
- Error messages are announced by screen readers
- Loading state is announced
- Success/error states have sufficient color contrast

---

### NFR-004: Maintainability

| Aspect | Detail |
|--------|--------|
| Category | Maintainability |
| Metric | Components follow project patterns |

**Description / Mô tả:**
- **EN:** Code should follow established project patterns for consistency and maintainability.
- **VI:** Code cần tuân theo các pattern đã thiết lập của dự án để đảm bảo tính nhất quán và bảo trì.

**Criteria:**
- Server Action follows pattern in `staff.ts`
- Client component follows pattern in `create-staff-form.tsx`
- Validation uses Zod schema
- Error handling returns typed results

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect | Detail |
|--------|--------|
| Changes | New route, components, server action, utilities |
| Sync Type | N/A (single root) |

**New Files / Tệp Mới:**

| Path | Type | Purpose |
|------|------|---------|
| `src/app/(orders)/upload/layout.tsx` | Server Component | Auth protection |
| `src/app/(orders)/upload/page.tsx` | Server Component | Upload page |
| `src/components/orders/upload-form.tsx` | Client Component | Upload form UI |
| `src/lib/actions/upload.ts` | Server Action | File upload processing |
| `src/lib/upload/validation.ts` | Utility | File validation logic |

**Integration Points / Điểm Tích hợp:**
- `@/lib/auth` - Session and role checking
- `@/lib/db` - User permission lookup (canUpload)
- US-1.1.2 - Excel parser will consume `UploadResult` interface

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- None (new feature, no existing dependencies affected)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Interface: UploadResult

```typescript
/**
 * Result returned by uploadExcel action on success.
 * Will be consumed by Excel parser (US-1.1.2).
 */
export interface UploadResult {
  /** Original file name */
  fileName: string;
  
  /** File size in bytes */
  fileSize: number;
  
  /** File content as Buffer for parsing */
  buffer: Buffer;
}
```

### Interface: UploadActionResult

```typescript
/**
 * Return type of uploadExcel server action.
 */
export type UploadActionResult =
  | { success: true; data: UploadResult }
  | { success: false; error: string };
```

### Schema: File Validation

```typescript
// Zod schema for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
```

---

## 6. UI/UX Specifications / Đặc tả UI/UX

### 6.1 Upload Page Layout

```
┌─────────────────────────────────────────────┐
│ Header (from dashboard layout)              │
├─────────────────────────────────────────────┤
│                                             │
│  📤 Upload Orders                           │
│  ─────────────────                          │
│                                             │
│  Upload Excel file containing order data.   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  📁 Choose File                      │   │
│  │  ─────────────────────────────────   │   │
│  │  [Click to select .xlsx or .xls]     │   │
│  │                                       │   │
│  │  Selected: orders-feb-2026.xlsx       │   │
│  │  Size: 2.4 MB                         │   │
│  │                                       │   │
│  │  [Upload]                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✅ File uploaded successfully!             │
│  (or ❌ Error message here)                 │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.2 States

| State | UI Elements |
|-------|-------------|
| Initial | File input enabled, Upload button disabled |
| File Selected | File name + size displayed, Upload button enabled |
| Uploading | Input disabled, Upload button disabled, Spinner visible |
| Success | Success message (green), Input reset, Ready for new file |
| Error | Error message (red), Input enabled, Can retry |

### 6.3 Component Styling

- Use existing Tailwind classes consistent with admin pages
- Button style: Primary blue (`bg-blue-600 hover:bg-blue-700`)
- Success message: Green text (`text-green-600`)
- Error message: Red text (`text-red-600`)
- Loading spinner: Blue spinner

---

## 7. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | User selects non-Excel file via browser dev tools bypass | Server rejects with "Invalid file format" error |
| EC-002 | User uploads file exactly 10MB | File is accepted (boundary condition) |
| EC-003 | User uploads file 10MB + 1 byte | File is rejected with size error |
| EC-004 | User's session expires during upload | Server returns auth error, user sees "Session expired" |
| EC-005 | Network disconnects during upload | Upload fails, user sees "Upload failed" error |
| EC-006 | User double-clicks upload button | Second click ignored (button disabled during upload) |
| EC-007 | File has .xlsx extension but wrong MIME type | Server rejects with "Invalid file format" error |

---

## 8. Dependencies / Phụ thuộc

| Dependency | Type | Status | Purpose |
|------------|------|--------|---------|
| `next-auth` | Package | Existing | Authentication |
| `zod` | Package | Existing | Validation schemas |
| `react` | Package | Existing | UI components |
| `tailwindcss` | Package | Existing | Styling |
| US-0.2.5 (Staff Login) | Feature | ✅ Done | Auth dependency |
| US-0.3.1 (Database) | Feature | ✅ Done | User permissions |

---

## 9. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Large file causes server timeout | Medium | Low | 10MB limit enforced |
| Malicious file upload attempt | High | Low | Server-side MIME validation, no execution |
| Memory exhaustion from many uploads | Medium | Low | In-memory processing is quick, no persistence |
| Auth bypass attempt | High | Low | Server-side auth check in action, not just layout |

---

## 10. Test Scenarios / Kịch bản Kiểm thử

### 10.1 Happy Path

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| T-001 | SUPER_ADMIN uploads valid .xlsx file | Success, file processed |
| T-002 | ADMIN uploads valid .xls file | Success, file processed |
| T-003 | STAFF (canUpload=true) uploads valid file | Success, file processed |
| T-004 | User uploads second file after first succeeds | Both uploads succeed |

### 10.2 Authorization

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| T-005 | Unauthenticated user accesses /orders/upload | Redirected to /login |
| T-006 | STAFF (canUpload=false) accesses /orders/upload | Redirected to / |
| T-007 | Session expires, user tries to upload | Error: Session expired |

### 10.3 Validation

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| T-008 | User selects .txt file | Error: Invalid file type |
| T-009 | User uploads file > 10MB | Error: File too large |
| T-010 | User uploads 0-byte file | Error: Invalid file |
| T-011 | User uploads file with wrong MIME but correct extension | Error: Invalid file format |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-07 |
| Reviewer | ⏳ Pending | |

---

**Created:** 2026-02-07  
**Author:** Copilot (Technical Specification Writer)
