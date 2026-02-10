# 📋 Work Description / Mô tả Công việc
<!-- Created: 2026-02-09 | US-1.1.3 -->

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Store Order with Upsert by Job Number |
| Affected Roots | sgs-cs-hepper |
| Base Branch | main |
| Requestor | Product Checklist (US-1.1.3) |
| Sources | user-stories.md, checklist.md |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.1.3 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from TODO/PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** The current upload action (`src/lib/actions/order.ts` → `createOrders`) uses a skip-duplicate strategy: when a Job Number already exists, the order is silently skipped and reported as "failed" with a duplicate message. This is incorrect behavior — users re-upload Excel files with updated data (e.g., new required dates, changed priorities) and expect existing orders to be **updated** rather than skipped. The current approach also:
- Doesn't distinguish between "duplicate/skipped" and "actual error"
- Provides no way to update order data without manual DB intervention
- Reports duplicates as failures, which confuses users

**VI:** Upload action hiện tại dùng chiến lược skip duplicate: khi Job Number đã tồn tại, đơn hàng bị bỏ qua và báo "failed" với thông báo trùng. Đây là hành vi sai — người dùng re-upload file Excel với dữ liệu mới (ngày yêu cầu mới, priority thay đổi) và mong đợi đơn hàng hiện tại được **cập nhật** thay vì bỏ qua. Cách tiếp cận hiện tại cũng:
- Không phân biệt giữa "trùng/bỏ qua" và "lỗi thật"
- Không có cách cập nhật dữ liệu đơn hàng ngoài sửa DB thủ công
- Báo duplicate là lỗi, gây nhầm lẫn cho user

---

## Expected Outcome — Kết quả Mong đợi

**EN:** When orders are uploaded:
1. New Job Numbers → CREATE new orders (status = IN_PROGRESS)
2. Existing Job Numbers with changed data → UPDATE order (preserve status)
3. Existing Job Numbers with same data → report as UNCHANGED
4. User sees clear summary: "Created: X, Updated: Y, Unchanged: Z"
5. SSE broadcasts all created + updated orders to connected clients

**VI:** Khi upload đơn hàng:
1. Job Number mới → TẠO đơn mới (status = IN_PROGRESS)
2. Job Number đã tồn tại và dữ liệu thay đổi → CẬP NHẬT đơn (giữ status)
3. Job Number đã tồn tại và dữ liệu giống → báo KHÔNG ĐỔI
4. User thấy summary rõ ràng: "Created: X, Updated: Y, Unchanged: Z"
5. SSE broadcast tất cả đơn tạo mới + cập nhật cho clients

---

## In Scope — Trong Phạm vi

- EN: Refactor `createOrders` to use upsert logic / VI: Refactor `createOrders` dùng logic upsert
- EN: Compare fields before update (only update if changed) / VI: So sánh fields trước khi update
- EN: Preserve existing order status on update / VI: Giữ nguyên status đơn hàng khi update
- EN: Update result type to include `updated` + `unchanged` / VI: Cập nhật result type thêm `updated` + `unchanged`
- EN: Update upload-form UI to show 3-category results / VI: Cập nhật upload-form UI hiển thị kết quả 3 loại
- EN: SSE broadcast for created + updated orders / VI: SSE broadcast cho đơn tạo mới + cập nhật
- EN: Database transaction for batch integrity / VI: Database transaction cho tính toàn vẹn batch
- EN: Case-insensitive Job Number matching / VI: So khớp Job Number không phân biệt hoa thường
- EN: Update existing tests / VI: Cập nhật tests hiện tại

---

## Out of Scope — Ngoài Phạm vi

- EN: Upload UI changes (drag-drop, file selection — US-1.1.1) / VI: Thay đổi UI upload
- EN: Excel parsing logic (US-1.1.2) / VI: Logic parse Excel
- EN: Order dashboard display (US-1.2.x) / VI: Hiển thị dashboard đơn hàng
- EN: Delete/archive orders / VI: Xóa/lưu trữ đơn hàng
- EN: Conflict resolution UI (manual merge) / VI: UI giải quyết xung đột

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Must use Prisma upsert with `jobNumber` as unique key |
| Technical / Kỹ thuật | Must preserve existing `status` field (never overwrite COMPLETED → IN_PROGRESS) |
| Technical / Kỹ thuật | Must work within existing SSE broadcaster (`broadcastBulkUpdate`) |
| Technical / Kỹ thuật | Job Number comparison must be case-insensitive |
| Technical / Kỹ thuật | Must use database transaction for batch operations |
| Stack | Next.js 16, Prisma, TypeScript strict, Server Actions |

---

## Assumptions — Giả định

- EN: `jobNumber` has a `@unique` constraint in Prisma schema (confirmed) / VI: `jobNumber` có constraint `@unique` trong Prisma schema (đã xác nhận)
- EN: Field comparison for "unchanged" detection covers: registeredDate, receivedDate, requiredDate, priority, registeredBy, checkedBy, note, sampleCount, description / VI: So sánh field cho phát hiện "unchanged": registeredDate, receivedDate, requiredDate, priority, registeredBy, checkedBy, note, sampleCount, description
- EN: `completedAt` should NOT be overwritten on update / VI: `completedAt` không bị overwrite khi update
- EN: Upload form already handles displaying results — only the category structure changes / VI: Upload form đã xử lý hiển thị kết quả — chỉ thay đổi cấu trúc phân loại

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information. All acceptance criteria are clear from the User Story.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: Job Number is used as unique identifier (case-insensitive)
- [ ] AC2: If Job Number exists → UPDATE order with new data (if data changed)
- [ ] AC3: If Job Number not exists → CREATE new order
- [ ] AC4: User is notified: X created, Y updated, Z unchanged
- [ ] AC5: Only changed fields trigger update (compare before update)
- [ ] AC6: Status is NOT overwritten if order already exists
- [ ] AC7: `uploadedAt` timestamp is updated on both create and update
- [ ] AC8: `uploadedById` references the user who uploaded
- [ ] AC9: Database transaction ensures data integrity
- [ ] AC10: SSE broadcasts bulk update after successful upsert

---

## Key Files (Current State)

| File | Role | Change Needed |
|------|------|---------------|
| `src/lib/actions/order.ts` | Server action — `createOrders` | Refactor to upsert logic |
| `src/components/orders/upload-form.tsx` | Upload UI — results display | Add updated/unchanged categories |
| `src/lib/sse/broadcaster.ts` | SSE broadcast | May need to include updated orders |
| `src/lib/actions/__tests__/order.test.ts` | Tests | Update for upsert behavior |
| `prisma/schema.prisma` | Order model | No change needed (jobNumber already @unique) |
