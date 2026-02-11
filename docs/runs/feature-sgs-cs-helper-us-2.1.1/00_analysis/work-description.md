# 📋 Work Description / Mô tả Công việc

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| User Story ID  | US-2.1.1                                |
| Product        | sgs-cs-helper                           |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status         | IN_PROGRESS (updated from PLANNED)      |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Summary / Tóm tắt

| Aspect           | Value                                             |
| ---------------- | ------------------------------------------------- |
| Work Type / Loại | FEATURE                                           |
| Title / Tiêu đề  | Performance Dashboard with Chart Visualization    |
| Affected Roots   | sgs-cs-helper                                     |
| Base Branch      | main                                              |
| Requestor        | User Story US-2.1.1 (from Product Roadmap)        |
| Sources          | User Stories Backlog (user-stories.md), Checklist |

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** Admin and Super Admin users currently have no visibility into team performance metrics on the dashboard. The main dashboard page (`/`) only shows quick action links and account info. There is no way to see how many orders were completed, on-time rates, average processing times, or overdue counts — either by individual user, group, or across the entire team over any time range.

**VI:** Admin và Super Admin hiện không có cách nào xem chỉ số hiệu suất của team trên dashboard. Trang dashboard chính (`/`) chỉ hiển thị các liên kết nhanh và thông tin tài khoản. Không có cách nào xem số đơn hoàn thành, tỷ lệ đúng hạn, thời gian xử lý trung bình, hay số đơn trễ — theo cá nhân, nhóm, hoặc toàn bộ team trong bất kỳ khoảng thời gian nào.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** The dashboard page shows a performance section (Admin/Super Admin only) with:

- KPI summary cards (Total Completed, On-Time Rate, Avg Processing Time, Overdue Count)
- Interactive charts (bar chart per user, pie/donut on-time vs overdue, optional trend line)
- Filterable by scope (All Team / Group / Individual) and time range (presets + custom)
- Per-user breakdown table
- Server-side data aggregation via Server Actions
- Responsive layout; Staff view unchanged

**VI:** Trang dashboard hiển thị phần hiệu suất (chỉ Admin/Super Admin) với:

- Thẻ KPI tóm tắt (Tổng hoàn thành, Tỷ lệ đúng hạn, TG xử lý TB, Số trễ)
- Biểu đồ tương tác (bar chart theo user, pie/donut đúng hạn vs trễ, đường xu hướng tùy chọn)
- Lọc theo phạm vi (Toàn team / Nhóm / Cá nhân) và thời gian (presets + tùy chỉnh)
- Bảng phân tích theo người dùng
- Tổng hợp dữ liệu phía server qua Server Actions
- Responsive layout; Staff view không đổi

---

## In Scope — Trong Phạm vi

- EN: KPI summary cards on dashboard / VI: Thẻ KPI tóm tắt trên dashboard
- EN: Bar chart — completed orders per user / VI: Biểu đồ cột — đơn hoàn thành theo user
- EN: Pie/donut chart — on-time vs overdue ratio / VI: Biểu đồ tròn — tỷ lệ đúng hạn vs trễ
- EN: Optional line chart — completion trend over time / VI: Biểu đồ đường (tùy chọn) — xu hướng hoàn thành
- EN: Per-user breakdown table / VI: Bảng phân tích theo người dùng
- EN: Scope selector (All Team, Group, Individual) / VI: Bộ chọn phạm vi (Toàn team, Nhóm, Cá nhân)
- EN: Time range filter with presets + custom date picker / VI: Bộ lọc thời gian với presets + chọn ngày tùy chỉnh
- EN: Server-side data aggregation (Server Action) / VI: Tổng hợp dữ liệu phía server (Server Action)
- EN: Empty state when no data / VI: Trạng thái trống khi không có dữ liệu
- EN: Responsive layout / VI: Bố cục responsive
- EN: Install `recharts` library / VI: Cài đặt thư viện `recharts`

## Out of Scope — Ngoài Phạm vi

- EN: Excel export (US-2.1.2) / VI: Xuất Excel (US-2.1.2)
- EN: Staff-facing performance view / VI: Giao diện hiệu suất cho Staff
- EN: Separate route — renders on existing dashboard page / VI: Route riêng — hiển thị trên trang dashboard hiện tại
- EN: Real-time / WebSocket updates / VI: Cập nhật real-time / WebSocket
- EN: Historical data backfill / VI: Bổ sung dữ liệu lịch sử

---

## Constraints — Ràng buộc

| Type                 | Constraint                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical / Kỹ thuật | Chart library: `recharts` (React-native, composable, ~45kB gzipped)                                                                               |
| Technical / Kỹ thuật | Charts must use `dynamic(() => import(...), { ssr: false })` for Next.js SSR compatibility                                                        |
| Technical / Kỹ thuật | Data aggregation via Server Actions — client receives pre-computed metrics                                                                        |
| Technical / Kỹ thuật | "Group" = multi-select users (UI-only filter, no DB change). Scope: All Team (all users), Group (pick multiple users), Individual (pick one user) |
| Technical / Kỹ thuật | On-time/overdue determined by comparing `actualDuration` to priority-based duration (existing `getPriorityDuration` utility)                      |
| Process / Quy trình  | Only Admin and Super Admin roles see performance section                                                                                          |
| Process / Quy trình  | Staff view must remain unchanged                                                                                                                  |

---

## Assumptions — Giả định

- EN: "On-Time" means `actualDuration <= getPriorityDuration(priority)` using existing duration utilities / VI: "Đúng hạn" nghĩa là `actualDuration <= getPriorityDuration(priority)` sử dụng utility duration hiện có
- EN: "Completed" orders are those with `status = COMPLETED` and `completedAt != null` / VI: Đơn "Hoàn thành" là đơn có `status = COMPLETED` và `completedAt != null`
- EN: Average Processing Time = mean of actual durations for completed orders / VI: TG xử lý TB = trung bình thời gian thực tế của đơn đã hoàn thành
- EN: The existing dashboard page will be extended (not replaced) / VI: Trang dashboard hiện tại sẽ được mở rộng (không thay thế)
- EN: `recharts` will be installed as a new dependency / VI: `recharts` sẽ được cài đặt như dependency mới
- EN: "Group" scope = multi-select users (UI filter only, no DB group entity) / VI: Phạm vi "Nhóm" = chọn nhiều user (chỉ filter UI, không cần entity Group trong DB)

---

## Missing Information — Thông tin Còn thiếu

✅ All questions answered. No missing information.

> **Resolved:** "Group" = multi-select users from a user list (UI-only concept, no DB schema change needed). The scope selector works as:
>
> - **All Team** = all users (no filter)
> - **Group** = select multiple users (multi-select dropdown)
> - **Individual** = select one user (single-select dropdown)

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: Dashboard page (`/`) shows performance section for Admin and Super Admin roles (Staff sees current view unchanged)
- [ ] AC2: Scope selector: "All Team" (all users), "Group" (multi-select users), "Individual" (single user) — defaults to "All Team"
- [ ] AC3: Time range filter with presets: Today, Last 7 Days, This Month, Last Month, Last 3 Months, Custom date range picker
- [ ] AC4: KPI summary cards: Total Completed, On-Time Rate (%), Average Processing Time, Overdue Count
- [ ] AC5: Bar chart: completed orders per user (horizontal bar, sorted descending)
- [ ] AC6: Pie/donut chart: On-Time vs Overdue ratio
- [ ] AC7: Line chart (optional): completion trend over time (daily/weekly granularity)
- [ ] AC8: Table view below charts: per-user breakdown (User Name, Completed Count, On-Time %, Avg Duration, Overdue Count)
- [ ] AC9: Chart library: `recharts`
- [ ] AC10: Data aggregation computed server-side (Server Action)
- [ ] AC11: Empty state shown when no completed orders exist in selected range
- [ ] AC12: Responsive layout — charts stack vertically on mobile, grid on desktop
