# Solution Design: US-1.1.1 Upload Excel Files UI
<!-- Phase 0: Analysis & Design | Created: 2026-02-07 -->

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** The SGS CS Order Tracker currently has no mechanism for users to upload Excel files containing order data. Staff and Admin users need a dedicated upload interface at `/orders/upload` to:
- Select Excel files (.xlsx/.xls)
- See file information before upload
- Upload files with progress feedback
- Receive success/error notifications
- Pass files to the Excel parser (US-1.1.2)

**VI:** SGS CS Order Tracker hiện không có cơ chế để người dùng tải lên tệp Excel chứa dữ liệu đơn hàng. Người dùng Staff và Admin cần một giao diện tải lên tại `/orders/upload` để:
- Chọn tệp Excel (.xlsx/.xls)
- Xem thông tin tệp trước khi tải lên
- Tải lên tệp với phản hồi tiến trình
- Nhận thông báo thành công/lỗi
- Chuyển tệp cho trình phân tích Excel (US-1.1.2)

---

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Upload page | ❌ Does not exist | ✅ `/orders/upload` route |
| File selection | ❌ No UI | ✅ File input with validation |
| Progress feedback | ❌ None | ✅ Loading spinner during upload |
| Error handling | ❌ None | ✅ Toast notifications |
| Auth protection | ❌ Not applicable | ✅ Role + permission based |

---

### Gap Analysis / Phân tích Khoảng cách

| Gap | Description |
|-----|-------------|
| **Route missing** | No `/orders/upload` route exists |
| **UI component missing** | No file upload component |
| **Server Action missing** | No upload processing action |
| **Auth logic missing** | Need permission check for STAFF (canUpload) |
| **Validation missing** | Need file type/size validation |

---

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-helper | `src/app/(orders)/upload/` | New route - page.tsx |
| sgs-cs-helper | `src/components/orders/` | New component - upload-form.tsx |
| sgs-cs-helper | `src/lib/actions/` | New server action - upload.ts |
| sgs-cs-helper | `src/lib/upload/` | File validation utilities |

---

### Open Questions / Câu hỏi Mở

| # | Question | Answer / Resolution |
|---|----------|---------------------|
| 1 | Where should uploaded files be stored temporarily? | In-memory (Buffer) - processed immediately by parser |
| 2 | Should we use FormData or base64 for file transfer? | FormData - standard pattern for file upload |
| 3 | How to hand off to Excel parser (US-1.1.2)? | Export interface/type that parser will implement |

---

### Assumptions / Giả định

| # | Assumption | Rationale |
|---|------------|-----------|
| 1 | Files are processed synchronously | Excel files ≤10MB process quickly |
| 2 | No need for persistent file storage | File is parsed immediately, data stored in DB |
| 3 | Using existing shadcn/ui patterns | Consistent with project tech stack |
| 4 | Toast notifications via simple state | Can use sonner/react-hot-toast later |

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| `src/lib/actions/staff.ts` | Server Action with Zod validation | ✅ Yes | Follow same pattern for upload action |
| `src/components/admin/create-staff-form.tsx` | Client form with useTransition | ✅ Yes | Follow for upload form component |
| `src/app/admin/layout.tsx` | Role-based auth check | ✅ Yes | Follow for upload page protection |
| `src/lib/auth/index.ts` | auth() export | ✅ Yes | Use for session check |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| `create-staff-form.tsx` | Form with loading state, error handling | Use same UX pattern: `isPending`, `message` state |
| `staff.ts` action | Zod validation + auth check | Use same pattern: `requireUploadPermission()` helper |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `next-auth` | Authentication | ✅ Existing |
| `zod` | Validation | ✅ Existing |
| `prisma` | Database | ✅ Existing |
| `xlsx` | Excel parsing (US-1.1.2) | 📌 Will be added in US-1.1.2 |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| N/A | N/A | Single-root feature | No cross-root dependencies |

### Reusable Components / Component Tái sử dụng

- `src/lib/auth` - `auth()` for session check
- `src/lib/db` - `prisma` client (not needed directly in US-1.1.1)
- Form pattern from `create-staff-form.tsx`

### New Components Needed / Component Cần tạo Mới

| Component | Location | Purpose |
|-----------|----------|---------|
| `UploadForm` | `src/components/orders/upload-form.tsx` | Client component for file upload UI |
| `uploadExcel` action | `src/lib/actions/upload.ts` | Server Action to process upload |
| `validateExcelFile` | `src/lib/upload/validation.ts` | File validation utilities |
| Upload page | `src/app/(orders)/upload/page.tsx` | Server Component route |
| Upload layout | `src/app/(orders)/upload/layout.tsx` | Auth protection wrapper |

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** 
Create a dedicated upload page at `/orders/upload` that:
1. Uses a Server Component page with auth protection (layout checks role + permission)
2. Renders a Client Component form for file selection and upload
3. Validates files client-side (extension) and server-side (MIME, size)
4. Uses Server Action to receive FormData and validate
5. Returns typed result to client for success/error feedback
6. Exports interface for Excel parser (US-1.1.2) to implement

**VI:** 
Tạo trang tải lên tại `/orders/upload`:
1. Sử dụng Server Component page với bảo vệ auth (layout kiểm tra role + permission)
2. Render Client Component form để chọn và tải lên tệp
3. Xác thực tệp phía client (extension) và server (MIME, size)
4. Sử dụng Server Action để nhận FormData và xác thực
5. Trả về kết quả có kiểu cho client để hiển thị thành công/lỗi
6. Export interface cho Excel parser (US-1.1.2) triển khai

---

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Server Action + FormData** | Type-safe, progressive enhancement, follows Next.js patterns | Requires client component for interactivity | ✅ Selected |
| API Route + fetch | More control | Extra endpoint, less integrated | ❌ Rejected: Overkill |
| Client-side only | Quick | No server validation, security risk | ❌ Rejected: Insecure |

---

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | `upload/layout.tsx` | sgs-cs-helper | Auth protection for upload route |
| 2 | `upload/page.tsx` | sgs-cs-helper | Server Component - renders form |
| 3 | `UploadForm` | sgs-cs-helper | Client Component - file selection & upload |
| 4 | `uploadExcel` | sgs-cs-helper | Server Action - receive & validate file |
| 5 | `validateExcelFile` | sgs-cs-helper | Utility - file validation logic |

---

### Component Details / Chi tiết Component

#### Component 1: `upload/layout.tsx`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/app/(orders)/upload/layout.tsx` |
| Purpose | EN: Auth protection - check role and canUpload permission / VI: Bảo vệ auth - kiểm tra role và quyền canUpload |
| Inputs | `children` (ReactNode), session from `auth()` |
| Outputs | Children or redirect |
| Dependencies | `@/lib/auth` |

**Logic:**
```
IF not authenticated → redirect /login
IF role === STAFF AND canUpload === false → redirect / (access denied)
IF role === ADMIN OR SUPER_ADMIN → allow (full access)
IF role === STAFF AND canUpload === true → allow
```

#### Component 2: `upload/page.tsx`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/app/(orders)/upload/page.tsx` |
| Purpose | EN: Upload page - Server Component / VI: Trang tải lên - Server Component |
| Inputs | None (session available from layout) |
| Outputs | Page with UploadForm |
| Dependencies | `UploadForm` component |

#### Component 3: `UploadForm`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/components/orders/upload-form.tsx` |
| Purpose | EN: Client form for file selection and upload / VI: Form client để chọn và tải lên tệp |
| Inputs | None (self-contained) |
| Outputs | File upload to Server Action |
| Dependencies | `uploadExcel` action |

**State:**
- `file: File | null` - selected file
- `message: { type: 'success' | 'error', text: string } | null`
- `isPending: boolean` - from useTransition

**Features:**
- File input with accept=".xlsx,.xls"
- Display file name + size after selection
- Upload button (disabled when no file or pending)
- Loading spinner during upload
- Success/error message display

#### Component 4: `uploadExcel` Server Action

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/actions/upload.ts` |
| Purpose | EN: Process file upload, validate, prepare for parser / VI: Xử lý tải lên, xác thực, chuẩn bị cho parser |
| Inputs | `FormData` with file |
| Outputs | `{ success: true, data: UploadResult } | { success: false, error: string }` |
| Dependencies | `@/lib/auth`, `@/lib/upload/validation` |

**Validation:**
1. Check auth (session exists)
2. Check permission (ADMIN/SUPER_ADMIN = always, STAFF = check canUpload)
3. Validate file exists in FormData
4. Validate file type (MIME + extension)
5. Validate file size (≤ 10MB)

**Output Interface (for US-1.1.2):**
```typescript
export interface UploadResult {
  fileName: string;
  fileSize: number;
  buffer: Buffer;  // File content for parser
}
```

#### Component 5: `validateExcelFile`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-helper` |
| Location | `src/lib/upload/validation.ts` |
| Purpose | EN: File validation utilities / VI: Tiện ích xác thực tệp |
| Inputs | `File` object |
| Outputs | `{ valid: true } | { valid: false, error: string }` |
| Dependencies | None |

---

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | UploadForm | File selection | User clicks input, selects .xlsx/.xls file |
| 2 | UploadForm | UploadForm | File info | Display file name + size |
| 3 | User | UploadForm | Click upload | User clicks Upload button |
| 4 | UploadForm | uploadExcel | FormData | Send file via Server Action |
| 5 | uploadExcel | uploadExcel | Validation | Check auth, permissions, file type/size |
| 6 | uploadExcel | UploadForm | Result | Return success with UploadResult or error |
| 7 | UploadForm | User | Feedback | Display success/error message |

---

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Not authenticated | Redirect to /login (layout) | Sees login page |
| No upload permission | Redirect to / (layout) | Sees dashboard with message |
| No file selected | Disable upload button | Cannot submit empty |
| Invalid file type | Server returns error | Error message: "Only .xlsx and .xls files are allowed" |
| File too large | Server returns error | Error message: "File must be 10MB or less" |
| Server error | Catch and return error | Error message: "Upload failed. Please try again." |

---

### Rollback Plan / Kế hoạch Rollback

**EN:** 
If issues arise after deployment:
1. Remove or disable the `/orders/upload` route
2. Revert the upload action
3. No database changes in this story - safe rollback

**VI:** 
Nếu có vấn đề sau khi triển khai:
1. Xóa hoặc vô hiệu hóa route `/orders/upload`
2. Hoàn tác upload action
3. Không có thay đổi database trong story này - rollback an toàn

---

## 0.4 Diagrams / Sơ đồ

See [diagrams/](./diagrams/) folder:
- [flow-overview.md](./diagrams/flow-overview.md) - Upload flow
- [sequence-main.md](./diagrams/sequence-main.md) - Component interactions

---

## Key Decisions / Quyết định Chính

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Use Server Action instead of API Route | Follows Next.js patterns, type-safe, progressive enhancement |
| D-002 | File validation both client + server | UX (fast feedback) + Security (server is source of truth) |
| D-003 | Use FormData for file transfer | Standard browser API, works with Server Actions |
| D-004 | In-memory file processing | Files ≤10MB, no need for disk storage |
| D-005 | Export interface for parser | Clean separation, US-1.1.2 will implement |

---

## Risk Assessment / Đánh giá Rủi ro

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large file causes timeout | Low | Medium | 10MB limit + progress indicator |
| Auth bypass attempt | Low | High | Server-side auth check in action |
| Invalid file type bypass | Medium | Medium | Server-side MIME validation |

---

## Next Steps / Bước tiếp theo

After approval, proceed to:
1. **Phase 1: Specification** - Finalize acceptance criteria and edge cases
2. **Phase 2: Task Planning** - Break down into implementation tasks

---

**Status:** ✅ Phase 0 Complete — Awaiting Approval  
**Created:** 2026-02-07  
**Author:** Copilot (Solution Architect)
