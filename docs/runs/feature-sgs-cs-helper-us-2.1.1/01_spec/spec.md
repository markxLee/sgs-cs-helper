# Specification — Performance Dashboard with Chart Visualization

<!-- Template Version: 1.0 | Contract: v1.0 | US-2.1.1 -->

---

## TL;DR

| Aspect                      | Value                                          |
| --------------------------- | ---------------------------------------------- |
| Feature                     | Performance Dashboard with Chart Visualization |
| Status                      | In Review                                      |
| Functional Requirements     | 8                                              |
| Non-Functional Requirements | 4                                              |
| Affected Roots              | `sgs-cs-helper`                                |

---

## 1. Overview

🇻🇳 Thêm phần hiệu suất vào trang dashboard (`/`) cho Admin/Super Admin. Hiển thị KPI cards, biểu đồ (cột, tròn, đường), và bảng phân tích theo user. Có thể lọc theo phạm vi (Toàn team / Nhóm / Cá nhân) và khoảng thời gian. Dữ liệu tổng hợp phía server qua Server Action, biểu đồ render client-side bằng `recharts`. Staff view không đổi.

🇬🇧 Add a performance section to the dashboard page (`/`) for Admin/Super Admin. Displays KPI cards, charts (bar, pie/donut, line), and per-user breakdown table. Filterable by scope (All Team / Group / Individual) and time range. Server-side data aggregation via Server Action, charts rendered client-side with `recharts`. Staff view unchanged.

**Phase 0 Analysis:** [Solution Design](../00_analysis/solution-design.md)

---

## 2. Goals & Non-Goals

### Goals

🇻🇳

1. **Hiệu suất team:** Admin/Super Admin có thể theo dõi hiệu suất hoàn thành đơn của team
2. **Lọc linh hoạt:** Lọc theo toàn team, nhóm user, hoặc cá nhân + khoảng thời gian
3. **Trực quan hóa:** Biểu đồ và KPI cards giúp nắm bắt nhanh tình hình
4. **Server-side computation:** Giảm tải client, data pre-computed

🇬🇧

1. **Team performance:** Admin/Super Admin can monitor team order completion performance
2. **Flexible filtering:** Filter by all team, group of users, or individual + time range
3. **Visualization:** Charts and KPI cards for quick situation awareness
4. **Server-side computation:** Reduce client load, data pre-computed

### Non-Goals

🇻🇳

1. Xuất Excel (US-2.1.2)
2. Staff xem hiệu suất
3. Route riêng cho dashboard hiệu suất
4. Real-time/WebSocket updates
5. Backfill dữ liệu lịch sử

🇬🇧

1. Excel export (US-2.1.2)
2. Staff viewing performance
3. Separate route for performance dashboard
4. Real-time/WebSocket updates
5. Historical data backfill

---

## 3. User Stories

### US-2.1.1: Performance Dashboard with Chart Visualization

🇻🇳 Là Admin/Super Admin, tôi muốn xem biểu đồ hiệu suất và chỉ số KPI trên dashboard, để theo dõi năng suất team một cách trực quan.

🇬🇧 As an Admin/Super Admin, I want to see performance charts and KPI metrics on the dashboard, so I can monitor team productivity at a glance.

---

## 4. Requirements Matrix

| ID      | Title                          | Priority | Type        | Covered By |
| ------- | ------------------------------ | -------- | ----------- | ---------- |
| FR-001  | Role-Gated Performance Section | Must     | Functional  | AC1        |
| FR-002  | Scope Selector                 | Must     | Functional  | AC2        |
| FR-003  | Time Range Filter              | Must     | Functional  | AC3        |
| FR-004  | KPI Summary Cards              | Must     | Functional  | AC4        |
| FR-005  | Completion Bar Chart           | Must     | Functional  | AC5        |
| FR-006  | On-Time Ratio Pie Chart        | Must     | Functional  | AC6        |
| FR-007  | Completion Trend Line Chart    | Could    | Functional  | AC7        |
| FR-008  | User Breakdown Table           | Must     | Functional  | AC8        |
| NFR-001 | Server-Side Aggregation        | Must     | Performance | AC10       |
| NFR-002 | SSR Compatibility              | Must     | Technical   | AC9        |
| NFR-003 | Empty State                    | Must     | UX          | AC11       |
| NFR-004 | Responsive Layout              | Must     | UX          | AC12       |

---

## 5. Functional Requirements

### FR-001: Role-Gated Performance Section

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Trang dashboard (`/`) hiển thị phần hiệu suất CHỈ cho Admin và Super Admin. Staff thấy dashboard hiện tại không đổi. Performance section nằm bên dưới quick actions hiện tại.

🇬🇧 Dashboard page (`/`) displays performance section ONLY for Admin and Super Admin roles. Staff sees current dashboard unchanged. Performance section placed below existing quick actions.

#### Acceptance Criteria

- [ ] AC1: Admin user sees performance section on dashboard
- [ ] AC2: Super Admin user sees performance section on dashboard
- [ ] AC3: Staff user does NOT see performance section — current view unchanged
- [ ] AC4: Performance section renders below the existing quick action links

---

### FR-002: Scope Selector

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Bộ chọn phạm vi với 3 mode: (1) "All Team" — tất cả users, mặc định; (2) "Group" — chọn nhiều users (multi-select dropdown); (3) "Individual" — chọn 1 user (single-select dropdown). Khi mode thay đổi, dữ liệu tự động refresh.

🇬🇧 Scope selector with 3 modes: (1) "All Team" — all users, default; (2) "Group" — select multiple users (multi-select dropdown); (3) "Individual" — select one user (single-select dropdown). When mode changes, data auto-refreshes.

#### Acceptance Criteria

- [ ] AC1: Scope selector displays three options: All Team, Group, Individual
- [ ] AC2: Default selection is "All Team"
- [ ] AC3: Selecting "Group" shows multi-select user picker
- [ ] AC4: Selecting "Individual" shows single-select user picker
- [ ] AC5: Changing scope triggers data refresh with new filter
- [ ] AC6: User list shows only STAFF and ADMIN users with `status = ACTIVE`

---

### FR-003: Time Range Filter

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Bộ lọc thời gian với các preset: Today, Last 7 Days, This Month (mặc định), Last Month, Last 3 Months, và Custom date range picker. Time range lọc theo `completedAt` của đơn hàng.

🇬🇧 Time range filter with presets: Today, Last 7 Days, This Month (default), Last Month, Last 3 Months, and Custom date range picker. Time range filters by order's `completedAt`.

#### Acceptance Criteria

- [ ] AC1: Time range selector shows 6 preset options + Custom
- [ ] AC2: Default selection is "This Month"
- [ ] AC3: Selecting Custom opens date range picker (from/to)
- [ ] AC4: Changing time range triggers data refresh
- [ ] AC5: Filter is applied on `Order.completedAt` field
- [ ] AC6: Custom date range validates `from <= to`

---

### FR-004: KPI Summary Cards

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 4 thẻ KPI tóm tắt: (1) Total Completed — tổng số đơn hoàn thành trong range; (2) On-Time Rate — phần trăm đơn đúng hạn; (3) Average Processing Time — thời gian xử lý trung bình (formatted); (4) Overdue Count — số đơn trễ hạn.

🇬🇧 4 KPI summary cards: (1) Total Completed — count of completed orders in range; (2) On-Time Rate — percentage of on-time orders; (3) Average Processing Time — mean processing time (formatted); (4) Overdue Count — count of overdue orders.

#### Acceptance Criteria

- [ ] AC1: "Total Completed" card shows integer count
- [ ] AC2: "On-Time Rate" card shows percentage (e.g., "85.2%")
- [ ] AC3: "Average Processing Time" card shows formatted duration (e.g., "1h 45m")
- [ ] AC4: "Overdue Count" card shows integer count
- [ ] AC5: On-time = `calcActualDuration(receivedDate, completedAt) <= getPriorityDuration(priority) * MS_PER_HOUR`
- [ ] AC6: Cards update when filters change
- [ ] AC7: Cards show loading skeleton while data is fetching

---

### FR-005: Completion Bar Chart

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Biểu đồ cột ngang hiển thị số đơn hoàn thành theo từng user, sắp xếp giảm dần. Dùng `recharts` BarChart component.

🇬🇧 Horizontal bar chart showing completed order count per user, sorted descending. Uses `recharts` BarChart component.

#### Acceptance Criteria

- [ ] AC1: Horizontal bar chart renders with user names on Y-axis, counts on X-axis
- [ ] AC2: Bars sorted descending by count (highest on top)
- [ ] AC3: Chart responds to scope and time range filters
- [ ] AC4: Tooltip shows exact count on hover
- [ ] AC5: Chart dynamically imported with `{ ssr: false }`

---

### FR-006: On-Time Ratio Pie Chart

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Biểu đồ donut hiển thị tỷ lệ đơn đúng hạn vs trễ hạn. Hai segments: On-Time (xanh) và Overdue (đỏ). Hiển thị phần trăm ở giữa.

🇬🇧 Donut chart showing on-time vs overdue ratio. Two segments: On-Time (green) and Overdue (red). Percentage displayed in center.

#### Acceptance Criteria

- [ ] AC1: Donut chart renders with two segments: On-Time, Overdue
- [ ] AC2: On-Time segment is green, Overdue segment is red
- [ ] AC3: Center label shows on-time percentage
- [ ] AC4: Tooltip shows count and percentage on hover
- [ ] AC5: Chart responds to scope and time range filters
- [ ] AC6: Chart dynamically imported with `{ ssr: false }`

---

### FR-007: Completion Trend Line Chart

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Could           |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Biểu đồ đường hiển thị xu hướng hoàn thành theo thời gian. Trục X là ngày/tuần (granularity tự động theo range), trục Y là số lượng. Hai đường: Completed và On-Time.

🇬🇧 Line chart showing completion trend over time. X-axis is date/week (auto granularity based on range), Y-axis is count. Two lines: Completed and On-Time.

#### Acceptance Criteria

- [ ] AC1: Line chart renders with date on X-axis, count on Y-axis
- [ ] AC2: Shows two lines: total Completed (blue) and On-Time (green)
- [ ] AC3: Granularity auto-selects: daily for ≤30 days, weekly for >30 days
- [ ] AC4: Tooltip shows date + values on hover
- [ ] AC5: Chart responds to scope and time range filters
- [ ] AC6: Chart dynamically imported with `{ ssr: false }`

---

### FR-008: User Breakdown Table

| Aspect         | Detail          |
| -------------- | --------------- |
| Priority       | Must            |
| Affected Roots | `sgs-cs-helper` |

#### Description

🇻🇳 Bảng phân tích theo user hiển thị bên dưới biểu đồ. Cột: User Name, Completed Count, On-Time %, Avg Duration, Overdue Count. Sắp xếp theo Completed Count giảm dần.

🇬🇧 Per-user breakdown table displayed below charts. Columns: User Name, Completed Count, On-Time %, Avg Duration, Overdue Count. Sorted by Completed Count descending.

#### Acceptance Criteria

- [ ] AC1: Table renders with 5 columns: User Name, Completed Count, On-Time %, Avg Duration, Overdue Count
- [ ] AC2: Default sort by Completed Count descending
- [ ] AC3: "Avg Duration" column shows formatted duration (e.g., "1h 30m")
- [ ] AC4: "On-Time %" column shows percentage (e.g., "92.5%")
- [ ] AC5: Table responds to scope and time range filters
- [ ] AC6: Shows "No data" row when no completed orders exist for any user

---

## 6. Non-Functional Requirements

### NFR-001: Server-Side Aggregation Performance

| Aspect   | Detail                                                       |
| -------- | ------------------------------------------------------------ |
| Category | Performance                                                  |
| Metric   | Server Action response < 2s for typical dataset (<5K orders) |

#### Description

🇻🇳 `getDashboardMetrics` Server Action phải hoàn thành trong <2s cho dataset điển hình (<5,000 completed orders trong range). Dùng Prisma query với index trên `completedAt`. Aggregation logic chạy trên server (JS), không ở client.

🇬🇧 `getDashboardMetrics` Server Action must complete in <2s for typical dataset (<5,000 completed orders in range). Use Prisma query with index on `completedAt`. Aggregation logic runs on server (JS), not client.

---

### NFR-002: SSR Compatibility (recharts)

| Aspect   | Detail                    |
| -------- | ------------------------- |
| Category | Technical                 |
| Metric   | Zero SSR hydration errors |

#### Description

🇻🇳 Tất cả recharts components phải được `dynamic(() => import(...), { ssr: false })`. Không được có hydration mismatch errors. PerformanceDashboard wrapper là client component (`"use client"`).

🇬🇧 All recharts components must use `dynamic(() => import(...), { ssr: false })`. No hydration mismatch errors. PerformanceDashboard wrapper is a client component (`"use client"`).

---

### NFR-003: Empty State UX

| Aspect   | Detail                          |
| -------- | ------------------------------- |
| Category | UX                              |
| Metric   | Meaningful message when no data |

#### Description

🇻🇳 Khi không có đơn hoàn thành trong range đã chọn: KPI cards hiển thị 0/0%/—, charts hiển thị empty state message thay vì chart trống, table hiển thị "No completed orders in this period".

🇬🇧 When no completed orders exist in selected range: KPI cards show 0/0%/—, charts show empty state message instead of empty charts, table shows "No completed orders in this period".

---

### NFR-004: Responsive Layout

| Aspect   | Detail                                |
| -------- | ------------------------------------- |
| Category | UX                                    |
| Metric   | Usable on mobile (≥375px) and desktop |

#### Description

🇻🇳 Desktop: KPI cards grid 4 cột, charts grid 2 cột (bar + pie), table full width. Mobile: Tất cả stack dọc, charts chiếm full width. Filter bar responsive — stack trên mobile.

🇬🇧 Desktop: KPI cards 4-column grid, charts 2-column grid (bar + pie), table full width. Mobile: All stack vertically, charts full width. Filter bar responsive — stacks on mobile.

---

## 7. User Flow

| Step | Action                                   | System Response                                        | Next Step |
| ---- | ---------------------------------------- | ------------------------------------------------------ | --------- |
| 1    | Admin navigates to `/`                   | Page loads with default filters (All Team, This Month) | 2         |
| 2    | Dashboard renders                        | KPI cards + charts + table with default data           | 3         |
| 3    | User changes scope to "Individual"       | User picker appears (single-select)                    | 4         |
| 4    | User selects a staff member              | Data refreshes for selected user only                  | 5         |
| 5    | User changes time range to "Last 7 Days" | Data refreshes for last 7 days                         | 6         |
| 6    | User selects "Custom" time range         | Date range picker opens                                | 7         |
| 7    | User picks from/to dates                 | Data refreshes for custom range                        | End       |

---

## 8. Data Models

```typescript
// Server Action input
interface DashboardFilters {
  scope: "all" | "group" | "individual";
  userIds?: string[]; // Required when scope = "group" or "individual"
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
}

// Server Action output
interface DashboardMetrics {
  kpi: {
    totalCompleted: number;
    onTimeRate: number; // 0–100 percentage
    avgProcessingTime: number; // milliseconds
    overdueCount: number;
  };
  perUser: UserMetrics[];
  onTimeVsOverdue: {
    onTime: number;
    overdue: number;
  };
  trend: TrendPoint[];
}

interface UserMetrics {
  userId: string;
  userName: string;
  completedCount: number;
  onTimePercent: number; // 0–100
  avgDuration: number; // milliseconds
  overdueCount: number;
}

interface TrendPoint {
  date: string; // ISO date (day or week start)
  completed: number;
  onTime: number;
  overdue: number;
}
```

---

## 9. API Contracts

### Server Action: `getDashboardMetrics`

```typescript
// Input
getDashboardMetrics(filters: DashboardFilters): Promise<
  | { success: true; data: DashboardMetrics }
  | { success: false; error: string }
>

// Auth: Requires ADMIN or SUPER_ADMIN role
// Filters: scope + userIds + dateFrom + dateTo
// Returns: Pre-computed KPI, per-user breakdown, chart data
```

### Server Action: `getDashboardUsers`

```typescript
// Input
getDashboardUsers(): Promise<
  | { success: true; data: Array<{ id: string; name: string; role: string }> }
  | { success: false; error: string }
>

// Auth: Requires ADMIN or SUPER_ADMIN role
// Returns: List of active users for scope selector
```

---

## 10. Edge Cases

| ID     | Scenario                                           | Expected Behavior                                      | Priority      |
| ------ | -------------------------------------------------- | ------------------------------------------------------ | ------------- |
| EC-001 | No completed orders in range                       | Empty state: KPIs show 0, charts show message          | Must handle   |
| EC-002 | Only 1 user has completions                        | Bar chart shows single bar, table shows 1 row          | Must handle   |
| EC-003 | User selected in Individual mode has 0 completions | Show empty state for that user                         | Must handle   |
| EC-004 | Custom date range: from > to                       | Validation error, prevent submission                   | Must handle   |
| EC-005 | Very large range (>1 year)                         | Allow but warn about performance; no hard limit        | Should handle |
| EC-006 | User with no name (name = null)                    | Display "Unknown User" or user ID                      | Must handle   |
| EC-007 | Division by zero (0 completed → on-time rate)      | Show "—" or "0%"                                       | Must handle   |
| EC-008 | completedBy is null (old orders before US-1.3.5)   | Exclude from per-user breakdown, include in total KPIs | Must handle   |

### EC-008: Orders Without `completedBy`

🇻🇳
**Khi:** Đơn hoàn thành trước US-1.3.5 (không có `completedById`)
**Thì:** Đếm vào tổng KPI (totalCompleted, onTimeRate) nhưng KHÔNG hiển thị trong per-user breakdown hoặc bar chart
**Lý do:** Không biết ai hoàn thành, không thể gán cho user nào

🇬🇧
**When:** Orders completed before US-1.3.5 (no `completedById`)
**Then:** Count in total KPIs (totalCompleted, onTimeRate) but DO NOT show in per-user breakdown or bar chart
**Rationale:** Unknown who completed it, cannot attribute to any user

---

## 11. Error Handling

| Error Condition              | User Message                                         | System Action                |
| ---------------------------- | ---------------------------------------------------- | ---------------------------- |
| Auth failure (not logged in) | Redirect to `/login`                                 | Server redirect              |
| Role unauthorized (Staff)    | Section not rendered                                 | Skip rendering               |
| Server Action failure        | "Failed to load metrics. Please try again."          | Log error, show retry button |
| Invalid date range           | "Start date must be before end date"                 | Client-side validation       |
| DB query timeout             | "Data is taking too long. Try a shorter time range." | Return error with suggestion |

---

## 12. Cross-Root Impact

| Root               | Changes                                         | Sync Required    |
| ------------------ | ----------------------------------------------- | ---------------- |
| `sgs-cs-helper`    | Server Action + dashboard UI + chart components | No (single root) |
| `a-z-copilot-flow` | None                                            | No               |

🇻🇳 Tất cả thay đổi nằm trong `sgs-cs-helper`. Không cần đồng bộ cross-root.

🇬🇧 All changes within `sgs-cs-helper`. No cross-root sync needed.

---

## 13. Dependencies

| Dependency              | Type      | Status                                 |
| ----------------------- | --------- | -------------------------------------- |
| `recharts` ^2.x         | Package   | **New** — chart rendering              |
| `react-day-picker` ^9.x | Package   | **New** — calendar for date range      |
| shadcn/ui `card`        | Component | **New** — KPI card containers          |
| shadcn/ui `calendar`    | Component | **New** — date range picker            |
| `date-fns` ^4.1.0       | Package   | Existing — date manipulation           |
| `calcActualDuration`    | Utility   | Existing — `src/lib/utils/duration.ts` |
| `getPriorityDuration`   | Utility   | Existing — `src/lib/utils/progress.ts` |
| `formatDuration`        | Utility   | Existing — `src/lib/utils/duration.ts` |

---

## 14. Risks & Assumptions

### Risks

| Risk                                             | Impact | Mitigation                                             |
| ------------------------------------------------ | ------ | ------------------------------------------------------ |
| Large dataset slows Server Action                | Medium | Add DB index on `completedAt`; query only range needed |
| recharts bundle size (~45kB gzip)                | Low    | Dynamic import `{ ssr: false }` + tree-shaking         |
| Prisma `groupBy` not sufficient for on-time calc | Low    | Fetch records + JS aggregation (D-004 decision)        |

### Assumptions

| #   | Assumption                                                          | Validated |
| --- | ------------------------------------------------------------------- | --------- |
| 1   | On-time = actualDuration ≤ priorityDuration (reuses existing logic) | Yes       |
| 2   | Team size < 50 users (no pagination on table)                       | Yes       |
| 3   | `completedAt` index will be added for query performance             | Pending   |
| 4   | "Group" = multi-select users, no DB entity                          | Yes       |
| 5   | Old orders without completedBy excluded from per-user stats         | Yes       |

---

## 15. Open Questions

| #   | Question             | Status      | Answer                         |
| --- | -------------------- | ----------- | ------------------------------ |
| 1   | Group concept        | ✅ Resolved | Multi-select users (UI filter) |
| 2   | P1 duration 1h vs 2h | ✅ Resolved | 2h (current codebase value)    |

---

## 16. Notes

🇻🇳

- On-time/overdue logic PHẢI tái sử dụng `calcActualDuration` + `getPriorityDuration` — không duplicate
- `calcActualDuration` trừ giờ ăn trưa (12:00–13:00) — server aggregation phải import cùng utility
- Line chart (FR-007) là "Could" priority — implement nếu còn thời gian
- Cần thêm DB index trên `completedAt` cho performance
- Initial data fetch trong Server Component để tránh loading flash

🇬🇧

- On-time/overdue logic MUST reuse `calcActualDuration` + `getPriorityDuration` — no duplication
- `calcActualDuration` deducts lunch break (12:00–13:00) — server aggregation must import same utility
- Line chart (FR-007) is "Could" priority — implement if time permits
- Add DB index on `completedAt` for performance
- Initial data fetch in Server Component to avoid loading flash

---

## Approval

| Role     | Name    | Status     | Date       |
| -------- | ------- | ---------- | ---------- |
| Author   | Copilot | ✅ Done    | 2026-02-10 |
| Reviewer | User    | ⏳ Pending | —          |
