# Work Description / Mô tả Công việc

<!-- Created: 2026-02-12 | US-1.2.8 -->

## Summary / Tóm tắt

| Aspect           | Value                                              |
| ---------------- | -------------------------------------------------- |
| Work Type / Loại | FEATURE                                            |
| Title / Tiêu đề  | Reorder In Progress Table Columns                  |
| Affected Roots   | sgs-cs-helper                                      |
| Base Branch      | main                                               |
| Requestor        | User (via Flow 1 roadmap-to-delivery)              |
| Sources          | User Stories Backlog (US-1.2.8), Product Checklist |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| User Story ID  | US-1.2.8                                |
| Product        | sgs-cs-helper                           |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status         | IN_PROGRESS (updated from PLANNED)      |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** The In Progress orders table currently displays columns in a suboptimal order. Key at-a-glance information — Registered By, Total Samples, Progress, and Time Left — is buried behind less frequently referenced date columns (Registered Date, Received Date, Due Date). Staff members need to scan these critical columns quickly without horizontal scrolling.

**VI:** Bảng đơn hàng In Progress hiện hiển thị các cột theo thứ tự chưa tối ưu. Thông tin quan trọng cần xem nhanh — Registered By, Total Samples, Progress, Time Left — bị ẩn sau các cột ngày ít tham chiếu hơn (Registered Date, Received Date, Due Date). Nhân viên cần xem nhanh các cột quan trọng mà không cần cuộn ngang.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** The In Progress tab table columns are reordered so the most actionable information appears first: Job Number → Registered By → Total Samples → Progress → Time Left → (remaining columns). All existing functionality remains intact.

**VI:** Các cột bảng tab In Progress được sắp xếp lại để thông tin quan trọng nhất hiển thị đầu tiên: Job Number → Registered By → Total Samples → Progress → Time Left → (các cột còn lại). Toàn bộ chức năng hiện có vẫn giữ nguyên.

---

## In Scope — Trong Phạm vi

- EN: Reorder columns in the In Progress tab table / VI: Sắp xếp lại cột trong bảng tab In Progress
- EN: Column order: Job Number → Registered By → Total Samples → Progress → Time Left → Registered Date → Received Date → Due Date → Priority → Action / VI: Thứ tự cột: Job Number → Registered By → Total Samples → Progress → Time Left → Registered Date → Received Date → Due Date → Priority → Action
- EN: Verify responsive behavior after reorder / VI: Kiểm tra giao diện responsive sau khi sắp xếp lại

## Out of Scope — Ngoài Phạm vi

- EN: Completed tab table — no changes / VI: Bảng tab Completed — không thay đổi
- EN: Adding new columns / VI: Thêm cột mới
- EN: API or data model changes / VI: Thay đổi API hoặc data model
- EN: Column visibility toggles / VI: Bật/tắt hiển thị cột

---

## Constraints — Ràng buộc

| Type                 | Constraint                                                   |
| -------------------- | ------------------------------------------------------------ |
| Technical / Kỹ thuật | UI-only change in `orders-table.tsx`. No API/schema changes. |
| Scope / Phạm vi      | Only affects In Progress tab, not Completed tab              |
| Process / Quy trình  | Must follow governed workflow phases                         |

---

## Assumptions — Giả định

- EN: The Action column remains last (rightmost) / VI: Cột Action vẫn ở cuối (bên phải nhất)
- EN: Column header labels remain unchanged / VI: Nhãn tiêu đề cột không thay đổi
- EN: Sorting and filtering on all columns still work after reorder / VI: Sắp xếp và lọc trên tất cả các cột vẫn hoạt động sau khi sắp xếp lại

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information. All details are clear from the User Story.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: In Progress table column order is: Job Number → Registered By → Total Samples → Progress → Time Left → Registered Date → Received Date → Due Date → Priority → Action
- [ ] AC2: All existing data, sorting, and functionality remain intact after reorder
- [ ] AC3: Table header labels unchanged — only column position changes
- [ ] AC4: Responsive behavior and overflow scrolling still work correctly
