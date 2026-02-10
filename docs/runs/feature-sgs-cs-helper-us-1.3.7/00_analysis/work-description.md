# 📋 Work Description / Mô tả Công việc
<!-- Created: 2026-02-10 -->

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.3.7 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Completed Tab UI Polish — Email Display & Early Completion Indicator |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Branch | feature/sgs-cs-helper-us-1.3.7 |
| Requestor | Team |
| Sources | User Story US-1.3.7, user request |

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** The Completed tab in the orders page has two UI issues: (1) The "Completed By" column shows `Name ()` with empty parentheses when a staff user has no email address (staff users created via code login may not have emails). (2) The "Actual Duration" column shows an "Overdue" sub-line when an order takes longer than its priority duration, but does NOT show the inverse — how much earlier an order was completed when it finishes ahead of schedule.

**VI:** Tab Hoàn thành trong trang orders có 2 vấn đề UI: (1) Cột "Completed By" hiển thị `Name ()` với dấu ngoặc rỗng khi staff user không có email (staff tạo qua code login có thể không có email). (2) Cột "Actual Duration" hiển thị dòng phụ "Overdue" khi đơn xử lý lâu hơn thời gian priority, nhưng KHÔNG hiển thị ngược lại — hoàn thành sớm bao lâu khi đơn xong trước hạn.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** (1) "Completed By" shows only the name without `()` when email is missing. (2) "Actual Duration" shows a green `"Early: {time}"` sub-line when the order was completed before the priority-based duration threshold, mirroring the purple "Overdue" sub-line format.

**VI:** (1) "Completed By" chỉ hiển thị tên, bỏ `()` khi không có email. (2) "Actual Duration" hiển thị dòng phụ xanh `"Early: {time}"` khi đơn hoàn thành sớm hơn thời gian priority, giống format dòng "Overdue" tím.

---

## In Scope — Trong Phạm vi

- EN: Fix "Completed By" empty parentheses display / VI: Sửa hiển thị dấu ngoặc rỗng "Completed By"
- EN: Add "Early" sub-line to "Actual Duration" column / VI: Thêm dòng phụ "Early" vào cột "Actual Duration"

## Out of Scope — Ngoài Phạm vi

- EN: API or schema changes / VI: Thay đổi API hoặc schema
- EN: New sorting/filtering logic / VI: Logic sort/filter mới
- EN: Changes to the In Progress tab / VI: Thay đổi tab Đang xử lý

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | UI-only change in `completed-orders-table.tsx`. Reuse existing `formatDuration()` and `getPriorityDuration()` |
| Scope / Phạm vi | Single file change, no API impact |

---

## Assumptions — Giả định

- EN: `completedBy.email` can be null or empty string for staff users / VI: `completedBy.email` có thể null hoặc chuỗi rỗng cho staff users
- EN: Green color scheme applies to both on-time and early completions / VI: Màu xanh áp dụng cho cả đúng hạn và hoàn thành sớm

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information — all requirements are clear from the User Story.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: "Completed By" — if `completedBy.email` is null/empty, display name only without `()`
- [ ] AC2: "Actual Duration" — if `actualMs < priorityDurationMs`, show green sub-line `"Early: {time}"`
- [ ] AC3: Early calculation: `priorityDurationMs - actualMs`
- [ ] AC4: Color scheme: green for on-time/early, purple for overdue (unchanged)
- [ ] AC5: No API changes — UI-only in `completed-orders-table.tsx`
