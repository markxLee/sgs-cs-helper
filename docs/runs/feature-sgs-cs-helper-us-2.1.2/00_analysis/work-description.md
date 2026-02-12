# 📋 Work Description / Mô tả Công việc

## Summary / Tóm tắt

| Aspect           | Value                                        |
| ---------------- | -------------------------------------------- |
| Work Type / Loại | FEATURE                                      |
| Title / Tiêu đề  | Export Completed Orders to Excel             |
| Affected Roots   | sgs-cs-helper                                |
| Base Branch      | main                                         |
| Requestor        | User                                         |
| Sources          | User description, Product checklist US-2.1.2 |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| User Story ID  | US-2.1.2                                |
| Product        | sgs-cs-helper                           |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status         | IN_PROGRESS (updated from PLANNED)      |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** The Completed Orders tab currently allows viewing and filtering completed orders, but there is no way to export this data to Excel for reporting, record-keeping, or offline analysis. CS team admins need to export filtered completed orders to `.xlsx` files for team reporting and stakeholder communication.

**VI:** Tab Completed Orders hiện cho phép xem và lọc các đơn hàng đã hoàn thành, nhưng không có cách nào xuất dữ liệu này ra Excel để báo cáo, lưu trữ hoặc phân tích offline. Quản lý CS team cần xuất danh sách đơn hàng đã hoàn thành (đã lọc) sang file `.xlsx` để báo cáo nhóm và giao tiếp với các bên liên quan.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** Admin and Super Admin users can click an "Export Excel" button on the Completed Orders tab. The system fetches all matching orders (respecting current search/filter criteria) in batches from the server, builds an `.xlsx` file entirely on the client side using ExcelJS, and triggers a browser download. A progress indicator shows export progress during batch fetching.

**VI:** Người dùng Admin và Super Admin có thể nhấn nút "Export Excel" trên tab Completed Orders. Hệ thống sẽ fetch tất cả đơn hàng phù hợp (theo tiêu chí search/filter hiện tại) theo từng batch từ server, tạo file `.xlsx` hoàn toàn ở phía client bằng ExcelJS, và trigger download trên trình duyệt. Thanh tiến trình hiển thị quá trình export trong khi fetch batch.

---

## In Scope — Trong Phạm vi

- EN: Export button on Completed Orders tab (Admin/Super Admin only) / VI: Nút Export trên tab Completed Orders (chỉ Admin/Super Admin)
- EN: Client-side Excel file generation using ExcelJS / VI: Tạo file Excel phía client bằng ExcelJS
- EN: Batch data fetching (paginated API calls until all data collected) / VI: Fetch dữ liệu theo batch (gọi API phân trang cho đến khi lấy hết dữ liệu)
- EN: Respect current search/filter/sort state when exporting / VI: Tuân thủ trạng thái search/filter/sort hiện tại khi xuất
- EN: Progress indicator during export / VI: Hiển thị tiến trình khi đang export
- EN: Proper column formatting (dates, numbers) / VI: Định dạng cột phù hợp (ngày, số)

## Out of Scope — Ngoài Phạm vi

- EN: Server-side Excel generation / VI: Tạo Excel phía server
- EN: Export from In-Progress tab / VI: Export từ tab In-Progress
- EN: Export for STAFF role / VI: Export cho vai trò STAFF
- EN: Performance summary report or dashboard export / VI: Báo cáo tổng hợp hiệu suất hoặc export dashboard
- EN: Team avg comparison statistics / VI: Thống kê so sánh trung bình nhóm
- EN: CSV export format / VI: Định dạng xuất CSV

---

## Constraints — Ràng buộc

| Type                 | Constraint                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Technical / Kỹ thuật | Must use client-side Excel generation (ExcelJS), NOT server-side. Client fetches all data in batches before creating file. |
| Technical / Kỹ thuật | Existing `GET /api/orders/completed` API supports pagination — can be reused for batch fetching with increased page size.  |
| Technical / Kỹ thuật | Role check: Admin and Super Admin only (`session.user.role` in `["ADMIN", "SUPER_ADMIN"]`).                                |
| UX                   | Export must show progress feedback (% or count) while fetching batches.                                                    |
| UX                   | Export button should be disabled while export is in progress.                                                              |

---

## Assumptions — Giả định

- EN: ExcelJS library works well in browser environment for the expected data sizes (up to ~10,000 orders) / VI: Thư viện ExcelJS hoạt động tốt trên trình duyệt với kích thước dữ liệu dự kiến (tối đa ~10,000 đơn)
- EN: The existing `/api/orders/completed` route can handle larger page sizes (e.g., 500 per batch) for export / VI: Route `/api/orders/completed` hiện tại có thể xử lý page size lớn hơn (ví dụ 500 mỗi batch) cho export
- EN: The `completedBy` relation data (name, email) should be included in the exported Excel / VI: Dữ liệu quan hệ `completedBy` (tên, email) nên được bao gồm trong Excel xuất ra
- EN: Export filename will follow pattern `completed-orders-YYYY-MM-DD.xlsx` / VI: Tên file export theo mẫu `completed-orders-YYYY-MM-DD.xlsx`
- EN: No missing information — all requirements are clear from user description / VI: Không thiếu thông tin — tất cả yêu cầu đã rõ ràng từ mô tả người dùng

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information. All requirements are clear.

---

## Acceptance Criteria (Refined) — Tiêu chí Nghiệm thu (Tinh chỉnh)

> Reviewed and refined during Work Review — 2026-02-11

- [ ] AC1: EN: Export Excel button visible only to Admin and Super Admin users on the Completed Orders tab / VI: Nút Export Excel chỉ hiển thị cho Admin và Super Admin trên tab Completed Orders
- [ ] AC2: EN: Clicking Export fetches all completed orders matching current search/filter/sort in batches via existing API / VI: Nhấn Export fetch tất cả completed orders phù hợp search/filter/sort hiện tại theo batch qua API hiện có
- [ ] AC3: EN: Excel file generated entirely client-side using ExcelJS `writeBuffer()` / VI: File Excel được tạo hoàn toàn phía client bằng ExcelJS `writeBuffer()`
- [ ] AC4: EN: Downloaded file is valid `.xlsx` with formatted columns (dates, numbers) and proper headers / VI: File `.xlsx` hợp lệ với cột được định dạng (ngày, số) và tiêu đề đúng
- [ ] AC5: EN: Progress indicator visible during batch fetching (shows count or percentage) / VI: Hiển thị tiến trình khi fetch batch (hiện số lượng hoặc phần trăm)
- [ ] AC6: EN: Export button disabled while export is in progress / VI: Nút Export bị vô hiệu khi đang export
- [ ] AC7: EN: STAFF users cannot see or access the export button / VI: Người dùng STAFF không thể thấy hoặc truy cập nút export
- [ ] AC8: EN: Filename follows pattern `completed-orders-YYYY-MM-DD.xlsx` / VI: Tên file theo mẫu `completed-orders-YYYY-MM-DD.xlsx`
- [ ] AC9: EN: Error handling — user sees toast/notification if export fails mid-batch / VI: Xử lý lỗi — user thấy toast/thông báo nếu export thất bại giữa chừng
