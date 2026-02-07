## 📋 Work Description / Mô tả Công việc

### Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.3.1 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

### Summary / Tóm tắt
| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Mark Order as Done / Đánh dấu Đơn Hoàn thành |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Requestor | User Story US-1.3.1 |
| Sources | User Stories Backlog, Product Checklist |

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:** Staff need to mark an order as Done so completed work is tracked and visible to all users in real time.

**VI:** Nhân viên cần đánh dấu đơn là Hoàn thành để công việc đã xong được theo dõi và hiển thị realtime cho tất cả người dùng.

---

### Expected Outcome — Kết quả Mong đợi

**EN:** Staff can mark any in-progress order as Done. The order status changes to COMPLETED, completedAt is recorded, and the UI updates in real time for all users. Completed orders move to the Completed filter and cannot be marked again.

**VI:** Nhân viên có thể đánh dấu đơn đang xử lý là Hoàn thành. Trạng thái đơn chuyển sang COMPLETED, completedAt được ghi nhận, UI cập nhật realtime cho tất cả người dùng. Đơn hoàn thành chuyển sang bộ lọc Hoàn thành và không thể đánh dấu lại.

---

### In Scope — Trong Phạm vi
- EN: "Mark Done" button for in-progress orders / VI: Nút "Đánh dấu Hoàn thành" cho đơn đang xử lý
- EN: Update order status to COMPLETED / VI: Cập nhật trạng thái đơn sang COMPLETED
- EN: Record completedAt timestamp / VI: Ghi nhận thời gian hoàn thành
- EN: Real-time UI update via SSE / VI: Cập nhật UI realtime qua SSE
- EN: Move order to Completed filter / VI: Chuyển đơn sang bộ lọc Hoàn thành

### Out of Scope — Ngoài Phạm vi
- EN: Undo completion (covered by US-1.3.3) / VI: Hoàn tác hoàn thành (US-1.3.3)
- EN: Visual distinction for completed orders (US-1.3.2) / VI: Phân biệt trực quan đơn hoàn thành (US-1.3.2)
- EN: Changes to order creation or upload / VI: Thay đổi chức năng tạo hoặc upload đơn

---

### Constraints — Ràng buộc
| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Use Server Action for mutation; must call broadcastOrderUpdate(order) after status change |
| Technical / Kỹ thuật | SSE endpoint: /api/orders/sse must push updates to all clients |
| Technical / Kỹ thuật | Only in-progress orders can be marked as Done; button disabled for completed orders |
| Process / Quy trình | Must follow acceptance criteria from user story |

---

### Assumptions — Giả định
- EN: Orders are already listed and filterable by status / VI: Đơn đã hiển thị và lọc theo trạng thái
- EN: SSE infrastructure is working / VI: Hạ tầng SSE đã hoạt động
- EN: User has permission to update order status / VI: User có quyền cập nhật trạng thái đơn

---


### Missing Information — Thông tin Còn thiếu

> ✅ All critical questions answered by user.

**Clarifications:**
- EN: Marking as Done should require confirmation if implemented as a button (confirmation modal is needed). / VI: Đánh dấu Hoàn thành cần xác nhận nếu là button (cần modal xác nhận).
- EN: completedAt must use server time, converted to Vietnam timezone. / VI: completedAt lấy thời gian server, chuyển sang giờ Việt Nam.
- EN: Log/audit or notification is needed for manual test, but should not impact UI significantly. / VI: Cần log/audit hoặc thông báo để test thủ công, nhưng không ảnh hưởng nhiều tới UI.

---

### Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)
- [ ] AC1: EN: "Mark Done" button exists for each in-progress order / VI: Nút "Đánh dấu Hoàn thành" tồn tại cho mỗi đơn đang xử lý
- [ ] AC2: EN: Clicking button changes order status to COMPLETED / VI: Click nút thay đổi trạng thái đơn sang COMPLETED
- [ ] AC3: EN: completedAt timestamp is recorded / VI: Timestamp completedAt được ghi nhận
- [ ] AC4: EN: Visual feedback confirms action (toast notification) / VI: Phản hồi trực quan xác nhận hành động (toast notification)
- [ ] AC5: EN: Order moves to Completed filter / VI: Đơn chuyển sang bộ lọc Hoàn thành
- [ ] AC6: EN: Button is disabled for already-completed orders / VI: Nút bị vô hiệu hóa cho đơn đã hoàn thành
