# Work Description: US-1.1.1 Upload Excel Files UI
<!-- Generated: 2026-02-07 | User Story: US-1.1.1 | Product: sgs-cs-helper -->

---

## 📋 Work Description / Mô tả Công việc

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| User Story ID | US-1.1.1 |
| Title / Tiêu đề | Upload Excel Files UI |
| Phase / Giai đoạn | 1: MVP (Minimum Viable Product) |
| Epic / Epic | 1.1 Order Upload & Parsing |
| Product / Sản phẩm | SGS CS Order Tracker (sgs-cs-helper) |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Status | IN_PROGRESS (from PLANNED) |
| Requestor / Người yêu cầu | Product Checklist (docs/product/sgs-cs-helper/checklist.md) |

---

### Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| Source | /roadmap-to-delivery (Flow 1 Step 12) |
| User Story ID | US-1.1.1 |
| Product Slug | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status Change | PLANNED → IN_PROGRESS |

> ℹ️ When Phase 5 (Done Check) completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** 
Staff and admin users need a user-friendly interface to upload Excel files (.xlsx/.xls) containing order data. Currently, there is no upload mechanism. The upload UI should accept files, display upload progress, handle errors gracefully, and integrate with the Excel parser (US-1.1.2).

**VI:** 
Người dùng Staff và Admin cần một giao diện thân thiện để tải lên các tệp Excel (.xlsx/.xls) chứa dữ liệu đơn hàng. Hiện tại không có cơ chế tải lên. Giao diện tải lên sẽ chấp nhận các tệp, hiển thị tiến trình tải, xử lý lỗi và tích hợp với trình phân tích cú pháp Excel (US-1.1.2).

---

## Expected Outcome — Kết quả Mong đợi

**EN:** 
When complete, users will be able to navigate to `/orders/upload`, select an Excel file, see upload progress, and receive confirmation of successful upload. The UI will validate file type/size, show user-friendly errors, and hand off the file to the Excel parser for processing.

**VI:** 
Khi hoàn thành, người dùng sẽ có thể điều hướng đến `/orders/upload`, chọn một tệp Excel, xem tiến trình tải lên và nhận xác nhận tải lên thành công. Giao diện sẽ xác thực loại/kích thước tệp, hiển thị lỗi thân thiện, và chuyển tệp cho trình phân tích Excel để xử lý.

---

## In Scope — Trong Phạm vi

- **EN:** Upload page exists at `/orders/upload` route  
  **VI:** Trang tải lên tồn tại ở route `/orders/upload`

- **EN:** File input UI accepts .xlsx and .xls formats only  
  **VI:** UI input tệp chỉ chấp nhận định dạng .xlsx và .xls

- **EN:** Display file name and size after selection  
  **VI:** Hiển thị tên tệp và kích thước sau khi chọn

- **EN:** Upload button initiates file processing via Server Action  
  **VI:** Nút tải lên khởi tạo xử lý tệp qua Server Action

- **EN:** Progress indicator shown during upload  
  **VI:** Chỉ báo tiến độ hiển thị trong khi tải lên

- **EN:** Success message shown on completion  
  **VI:** Thông báo thành công hiển thị khi hoàn thành

- **EN:** Error messages for invalid file types/sizes  
  **VI:** Thông báo lỗi cho loại tệp/kích thước không hợp lệ

- **EN:** File is handed off to Excel parser (US-1.1.2)  
  **VI:** Tệp được chuyển cho trình phân tích Excel (US-1.1.2)

- **EN:** Can upload multiple files sequentially  
  **VI:** Có thể tải lên nhiều tệp theo thứ tự

- **EN:** Upload respects role-based auth: ADMIN/SUPER_ADMIN have full access, STAFF requires canUpload permission  
  **VI:** Tải lên tuân theo xác thực dựa trên vai trò: ADMIN/SUPER_ADMIN có toàn quyền, STAFF cần quyền canUpload

---

## Out of Scope — Ngoài Phạm vi

- **EN:** Excel parsing logic (handled by US-1.1.2)  
  **VI:** Logic phân tích Excel (được xử lý bởi US-1.1.2)

- **EN:** Storing parsed orders in database (handled by US-1.1.3)  
  **VI:** Lưu các đơn hàng được phân tích vào cơ sở dữ liệu (được xử lý bởi US-1.1.3)

- **EN:** Duplicate detection (handled by US-1.1.3)  
  **VI:** Phát hiện trùng lặp (được xử lý bởi US-1.1.3)

- **EN:** Drag-and-drop file upload (Phase 2+)  
  **VI:** Tải lên tệp kéo thả (Phase 2+)

- **EN:** File size limits beyond basic validation  
  **VI:** Giới hạn kích thước tệp vượt quá xác thực cơ bản

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| **Technical / Kỹ thuật** | Must use Next.js Server Action for file processing (no client-side parsing) |
| **Technical / Kỹ thuật** | File upload handled via FormData, validated server-side with Zod |
| **Technical / Kỹ thuật** | Must respect auth/permissions: ADMIN/SUPER_ADMIN có full quyền, STAFF cần canUpload=true |
| **Technical / Kỹ thuật** | UI built with React Server Components + shadcn/ui form components |
| **Technical / Kỹ thuật** | File size must be ≤ 10MB (reasonable for Excel files) |
| **Process / Quy trình** | Cannot implement US-1.1.2 (parser) until US-1.1.1 UI is complete |
| **Dependency / Phụ thuộc** | Requires US-0.2.5 (Staff Login) ✅ and US-0.3.1 (Database) ✅ - SATISFIED |

---

## Assumptions — Giả định

- **EN:** File storage will be handled by upload server action (not persistent blob storage)  
  **VI:** Lưu trữ tệp sẽ được xử lý bởi server action tải lên (không phải lưu trữ blob persistent)

- **EN:** File validation includes MIME type + extension check  
  **VI:** Xác thực tệp bao gồm kiểm tra loại MIME + tiện ích mở rộng

- **EN:** Users will click to select file (not drag-drop in this iteration)  
  **VI:** Người dùng sẽ nhấp để chọn tệp (không phải kéo-thả trong lần lặp này)

- **EN:** Progress indication is simple (spinner during upload, not percentage)  
  **VI:** Chỉ báo tiến trình đơn giản (spinner trong quá trình tải lên, không phải phần trăm)

- **EN:** File will be stored temporarily during parsing then removed after US-1.1.2 processes it  
  **VI:** Tệp sẽ được lưu trữ tạm thời trong quá trình phân tích rồi xóa sau khi US-1.1.2 xử lý nó

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

> ✅ Refined during work review (2026-02-07)

- [ ] **AC1:** Upload page exists at `/orders/upload` route  
  Trang tải lên tồn tại ở route `/orders/upload`

- [ ] **AC2:** File input accepts .xlsx and .xls formats only (MIME + extension validation)  
  Input tệp chỉ chấp nhận định dạng .xlsx và .xls (xác thực MIME + tiện ích mở rộng)

- [ ] **AC3:** Shows file name and size after selection  
  Hiển thị tên tệp và kích thước sau khi chọn

- [ ] **AC4:** Upload button initiates file processing via Server Action  
  Nút tải lên khởi tạo xử lý tệp qua Server Action

- [ ] **AC5:** Loading spinner shown during upload  
  Hiển thị spinner loading trong khi tải lên

- [ ] **AC6:** Success toast shown on completion  
  Hiển thị toast thành công khi hoàn thành

- [ ] **AC7:** Error toast for invalid file format/size (max 10MB)  
  Hiển thị toast lỗi cho định dạng/kích thước tệp không hợp lệ (tối đa 10MB)

- [ ] **AC8:** File is passed to Excel parser (US-1.1.2) via shared interface  
  Tệp được chuyển cho trình phân tích Excel (US-1.1.2) qua interface chung

- [ ] **AC9:** Sequential upload: can upload another file after first completes  
  Tải lên tuần tự: có thể tải tệp khác sau khi tệp đầu hoàn thành

- [ ] **AC10:** Auth: ADMIN và SUPER_ADMIN có full quyền upload (không cần check canUpload), STAFF chỉ được upload nếu canUpload=true  
  Xác thực: ADMIN và SUPER_ADMIN có toàn quyền upload, STAFF cần có canUpload=true mới được truy cập

---

## Documented Assumptions — Giả định Đã Ghi nhận

> ✅ These clarifications were resolved during work review (2026-02-07)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Batch vs Sequential upload? | **Sequential only** | Per AC9: "upload multiple files sequentially" |
| Maximum file size limit? | **10MB** | Reasonable for Excel files, prevents abuse |
| File storage method? | **Temporary during processing** | Per tech stack: server-side processing |
| UI/UX requirements? | **shadcn/ui defaults** | Per project tech stack standards |

---

## Sources — Nguồn

- **User Stories:** `/sgs-cs-helper/docs/product/sgs-cs-helper/user-stories.md` (US-1.1.1 section)
- **Product Checklist:** `/sgs-cs-helper/docs/product/sgs-cs-helper/checklist.md` (Epic 1.1, US-1.1.1)
- **Tech Stack:** `/sgs-cs-helper/docs/tech-stack/sgs-cs-helper/instructions.md`
- **Flow Source:** `/roadmap-to-delivery` (Flow 1 Step 12)

---

## Notes / Ghi chú

- **Dependency Tree:** This story unblocks US-1.1.2 (Parser) and US-1.1.3 (Store + Dedup)
- **Technical Lead:** Next.js Server Actions + shadcn/ui form + Zod validation
- **Integration Point:** File will be passed to Excel parser in US-1.1.2
- **Testing:** Focus on file validation, auth checks, and happy path (successful upload)

---

**Status:** ✅ READY — Work Review Passed (2026-02-07)  
**Created:** 2026-02-07  
**Reviewed:** 2026-02-07  
**Confidence:** Medium  
**Next Step:** Run `/phase-0-analysis` to start Analysis & Design
