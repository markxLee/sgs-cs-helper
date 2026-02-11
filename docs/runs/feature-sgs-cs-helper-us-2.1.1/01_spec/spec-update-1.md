# Specification — Performance Dashboard with Chart Visualization (Update #1)

<!-- Template Version: 1.0 | Contract: v1.0 | Last Updated: 2026-02-11 -->
<!-- Update: Incorporates UI/UX improvements from user feedback -->
<!-- 🇻🇳 Vietnamese first, 🇬🇧 English follows — for easy scanning -->

---

## TL;DR

| Aspect                      | Value                                          |
| --------------------------- | ---------------------------------------------- |
| Feature                     | Performance Dashboard with Chart Visualization |
| Status                      | Draft (Update #1)                              |
| Functional Requirements     | 8 (5 updated)                                  |
| Non-Functional Requirements | 4 (unchanged)                                  |
| Affected Roots              | `sgs-cs-helper`                                |

---

## 1. Overview

🇻🇳 **Update #1 Context:** Sau khi hoàn thành implementation ban đầu, người dùng đã đưa ra feedback yêu cầu cải thiện UX/UI. Update này tập trung vào đơn giản hóa interface, cải thiện chart visualization, fix date picker bugs, và hiển thị KPI dưới dạng ratio thay vì absolute numbers.

🇬🇧 **Update #1 Context:** After completing the initial implementation, user provided feedback requesting UX/UI improvements. This update focuses on simplifying the interface, improving chart visualization, fixing date picker bugs, and showing KPIs as ratios instead of absolute numbers.

**Core Feature:** Performance dashboard giúp Admin/Super Admin theo dõi hiệu suất đội nhóm qua KPI cards, biểu đồ, và bảng phân tích chi tiết. Staff view giữ nguyên (chỉ hiển thị quick actions).

**Core Feature:** Performance dashboard helps Admin/Super Admin monitor team performance through KPI cards, charts, and detailed breakdown tables. Staff view remains unchanged (quick actions only).

---

## 2. Goals & Non-Goals

### Goals

🇻🇳

1. **Interface Đơn giản:** Loại bỏ "Group" scope, chỉ giữ "All Team" và "Individual" để UX đơn giản hơn
2. **Visualization Cải thiện:** Stacked column charts thay thế line/simple charts để cung cấp breakdown insights tốt hơn
3. **Date Picker Chức năng:** Sửa lỗi custom date picker để auto-select today và hỗ trợ range selection
4. **KPI Contextual:** Hiển thị ratio/percentage thay vì absolute numbers để decision-making tốt hơn
5. **Performance Monitoring:** Admin/Super Admin theo dõi được hiệu suất team qua metrics và charts
6. **User-specific Analysis:** Xem được performance của từng user individual
7. **Time-based Filtering:** Filter dữ liệu theo different time ranges

🇬🇧

1. **Simplified Interface:** Remove "Group" scope, keep only "All Team" and "Individual" for simpler UX
2. **Enhanced Visualization:** Stacked column charts replace line/simple charts to provide better breakdown insights
3. **Functional Date Picker:** Fix custom date picker bugs to auto-select today and support range selection
4. **Contextual KPIs:** Show ratios/percentages instead of absolute numbers for better decision-making
5. **Performance Monitoring:** Admin/Super Admin can track team performance through metrics and charts
6. **User-specific Analysis:** View individual user performance breakdown
7. **Time-based Filtering:** Filter data across different time ranges

### Non-Goals

🇻🇳

1. Group-based analysis không còn hỗ trợ (simplified scope)
2. Advanced analytics (predictions, forecasting) ngoài phạm vi
3. Email notifications/alerts ngoài phạm vi
4. Export functionality ngoài phạm vi
5. Mobile-optimized charts (desktop-first approach)

🇬🇧

1. Group-based analysis no longer supported (simplified scope)
2. Advanced analytics (predictions, forecasting) out of scope
3. Email notifications/alerts out of scope
4. Export functionality out of scope
5. Mobile-optimized charts (desktop-first approach)

---

## 3. User Stories & Acceptance Criteria

### US-2.1.1A: Simplified Dashboard Filters _(Updated)_

**As an** Admin/Super Admin  
**I want** simplified filtering options (only "All Team" and "Individual")  
**So that** the interface is less cluttered and easier to navigate

**Acceptance Criteria:**

🇻🇳

- ✅ Scope selector chỉ hiển thị "All Team" và "Individual" options (bỏ "Group")
- ✅ "All Team" được select mặc định
- ✅ Khi chọn "Individual", hiển thị user dropdown để select specific user
- ✅ Time range filter hỗ trợ: Today, This Week, This Month, Custom Range
- ✅ Custom date picker auto-select today và hỗ trợ range selection
- ✅ Filter changes trigger dashboard data refresh

🇬🇧

- ✅ Scope selector only shows "All Team" and "Individual" options (remove "Group")
- ✅ "All Team" is selected by default
- ✅ When selecting "Individual", show user dropdown to select specific user
- ✅ Time range filter supports: Today, This Week, This Month, Custom Range
- ✅ Custom date picker auto-selects today and supports range selection
- ✅ Filter changes trigger dashboard data refresh

### US-2.1.1B: Contextual KPI Cards _(Updated)_

**As an** Admin/Super Admin  
**I want** KPI cards to show ratios and percentages instead of absolute numbers  
**So that** I can better understand performance context and make informed decisions

**Acceptance Criteria:**

🇻🇳

- ✅ **Total Completed:** Hiển thị "X completed / Y total orders" với percentage
- ✅ **On-time Rate:** Hiển thị percentage với trend indicator (up/down arrow)
- ✅ **Avg Processing Time:** Hiển thị số ngày với comparison to target/average
- ✅ **Overdue Count:** Hiển thị "X overdue / Y total" với percentage và severity color

🇬🇧

- ✅ **Total Completed:** Show "X completed / Y total orders" with percentage
- ✅ **On-time Rate:** Show percentage with trend indicator (up/down arrow)
- ✅ **Avg Processing Time:** Show days with comparison to target/average
- ✅ **Overdue Count:** Show "X overdue / Y total" with percentage and severity color

### US-2.1.1C: Enhanced Chart Visualization _(Updated)_

**As an** Admin/Super Admin  
**I want** stacked column charts that show breakdown details  
**So that** I can see not just totals but the composition of each data point

**Acceptance Criteria:**

🇻🇳

- ✅ **Completion per User Chart:** Stacked bars showing "On-time" và "Overdue" portions per user
- ✅ **Completion Trend Chart:** Stacked column chart by day/week showing on-time vs overdue breakdown
- ✅ Mỗi stack segment hiển thị percentage tooltip khi hover
- ✅ Legend hiển thị rõ màu sắc cho "On-time" (green) và "Overdue" (red/orange)
- ✅ Chart responsive và có proper spacing

🇬🇧

- ✅ **Completion per User Chart:** Stacked bars showing "On-time" and "Overdue" portions per user
- ✅ **Completion Trend Chart:** Stacked column chart by day/week showing on-time vs overdue breakdown
- ✅ Each stack segment shows percentage tooltip on hover
- ✅ Legend clearly shows colors for "On-time" (green) and "Overdue" (red/orange)
- ✅ Chart is responsive with proper spacing

### US-2.1.1D: User Performance Breakdown _(Unchanged)_

**As an** Admin/Super Admin  
**I want** a detailed table showing each user's performance metrics  
**So that** I can identify top performers and users who need support

**Acceptance Criteria:**

🇻🇳

- ✅ Table columns: User Name, Total Orders, Completed, On-time Rate, Avg Processing Time, Currently Processing
- ✅ Sortable by any column
- ✅ Color-coded performance indicators (green = good, yellow = average, red = needs attention)
- ✅ Click on user row để drill down vào individual performance
- ✅ Pagination if > 20 users

🇬🇧

- ✅ Table columns: User Name, Total Orders, Completed, On-time Rate, Avg Processing Time, Currently Processing
- ✅ Sortable by any column
- ✅ Color-coded performance indicators (green = good, yellow = average, red = needs attention)
- ✅ Click on user row to drill down into individual performance
- ✅ Pagination if > 20 users

---

## 4. Functional Requirements

### FR-001: Role-based Dashboard Access _(Unchanged)_

🇻🇳 **Admin/Super Admin:** Hiển thị full performance dashboard với KPI cards, charts, và user breakdown table.

**Staff:** Chỉ hiển thị quick action buttons (View Orders, Upload Excel), không có performance section.

🇬🇧 **Admin/Super Admin:** Display full performance dashboard with KPI cards, charts, and user breakdown table.

**Staff:** Only show quick action buttons (View Orders, Upload Excel), no performance section.

**Edge Cases:**

- Staff trying to access dashboard metrics directly → Block with appropriate message
- Newly promoted Admin → Dashboard should immediately show after role change

### FR-002: Simplified Scope Filtering _(Updated)_

🇻🇳 **Scope Options:** Chỉ "All Team" (mặc định) và "Individual".

- **All Team:** Hiển thị metrics cho toàn bộ team
- **Individual:** Hiển thị user dropdown để select specific user, metrics chỉ cho user đó

**Removed:** "Group" option để đơn giản hóa interface.

🇬🇧 **Scope Options:** Only "All Team" (default) and "Individual".

- **All Team:** Show metrics for entire team
- **Individual:** Show user dropdown to select specific user, metrics only for that user

**Removed:** "Group" option to simplify interface.

**Edge Cases:**

- Selected user has no orders in time range → Show "No data" message
- User gets deleted while selected → Reset to "All Team"

### FR-003: Enhanced Time Range Filtering _(Updated)_

🇻🇳 **Pre-defined Options:** Today, This Week, This Month, Custom Range

**Custom Range:**

- Auto-select today's date when opened
- Support range selection (from date to date)
- Max range: 1 year
- Validate start ≤ end date

🇬🇧 **Pre-defined Options:** Today, This Week, This Month, Custom Range

**Custom Range:**

- Auto-select today's date when opened
- Support range selection (from date to date)
- Max range: 1 year
- Validate start ≤ end date

**Edge Cases:**

- Invalid date range → Show validation error
- Future dates selected → Allow but show "No data yet" message
- Custom range > 1 year → Show warning and suggest shorter range

### FR-004: Contextual KPI Cards Display _(Updated)_

🇻🇳 **4 KPI Cards hiển thị ratio/percentage:**

1. **Total Completed:** "X completed / Y total (Z%)" với progress bar
2. **On-time Rate:** "X% on-time" với trend arrow (↑/↓) so với previous period
3. **Avg Processing Time:** "X days avg" với comparison "vs Y target"
4. **Overdue Count:** "X overdue / Y total (Z%)" với severity color coding

🇬🇧 **4 KPI Cards showing ratio/percentage:**

1. **Total Completed:** "X completed / Y total (Z%)" with progress bar
2. **On-time Rate:** "X% on-time" with trend arrow (↑/↓) vs previous period
3. **Avg Processing Time:** "X days avg" with comparison "vs Y target"
4. **Overdue Count:** "X overdue / Y total (Z%)" with severity color coding

**Edge Cases:**

- No orders in time range → Show "No data available"
- Division by zero → Handle gracefully with "N/A"
- Negative processing time → Show data validation error

### FR-005: Enhanced Completion per User Chart _(Updated)_

🇻🇳 **Stacked Bar Chart:** Mỗi user có 1 bar với 2 segments:

- Green segment: Orders hoàn thành đúng hạn
- Red/Orange segment: Orders hoàn thành trễ

**Interactions:**

- Hover tooltip hiển thị breakdown numbers và percentages
- Click bar để drill down vào user detail
- Y-axis hiển thị total count, segments hiển thị breakdown

🇬🇧 **Stacked Bar Chart:** Each user has 1 bar with 2 segments:

- Green segment: Orders completed on-time
- Red/Orange segment: Orders completed late

**Interactions:**

- Hover tooltip shows breakdown numbers and percentages
- Click bar to drill down into user detail
- Y-axis shows total count, segments show breakdown

**Edge Cases:**

- User with 0 completed orders → Show empty bar with tooltip "No completed orders"
- > 20 users → Paginate or show top N performers with "View all" option

### FR-006: On-time vs Overdue Ratio Chart _(Unchanged)_

🇻🇳 **Donut Chart:** Tỷ lệ orders đúng hạn vs trễ hạn.

**Display:**

- Green: On-time orders với percentage
- Red: Overdue orders với percentage
- Center text hiển thị dominant metric
- Legend với counts và percentages

🇬🇧 **Donut Chart:** Ratio of on-time vs overdue orders.

**Display:**

- Green: On-time orders with percentage
- Red: Overdue orders with percentage
- Center text shows dominant metric
- Legend with counts and percentages

**Edge Cases:**

- All orders on-time → Show 100% green with celebratory message
- All orders overdue → Show 100% red with alert styling
- No completed orders → Show "No data" placeholder

### FR-007: Enhanced Completion Trend Chart _(Updated)_

🇻🇳 **Stacked Column Chart:** Thay thế line chart bằng stacked columns theo ngày/tuần.

**Structure:**

- X-axis: Time periods (daily or weekly based on range)
- Y-axis: Number of completions
- Each column có 2 segments: On-time (green) và Overdue (red/orange)
- Hover tooltip hiển thị breakdown với percentages

🇬🇧 **Stacked Column Chart:** Replace line chart with stacked columns by day/week.

**Structure:**

- X-axis: Time periods (daily or weekly based on range)
- Y-axis: Number of completions
- Each column has 2 segments: On-time (green) and Overdue (red/orange)
- Hover tooltip shows breakdown with percentages

**Edge Cases:**

- No completions on certain days → Show empty space with dashed baseline
- Large date range → Automatically switch from daily to weekly grouping
- Single day selected → Show hourly breakdown if available

### FR-008: User Performance Breakdown Table _(Unchanged)_

🇻🇳 **Table với columns:**

- User Name (với avatar nếu có)
- Total Assigned Orders
- Completed Orders
- On-time Rate (percentage với color coding)
- Avg Processing Time (days)
- Currently Processing (active orders count)

**Features:**

- Sort by any column (asc/desc)
- Performance color indicators
- Click row để xem individual user dashboard
- Search/filter by user name

🇬🇧 **Table with columns:**

- User Name (with avatar if available)
- Total Assigned Orders
- Completed Orders
- On-time Rate (percentage with color coding)
- Avg Processing Time (days)
- Currently Processing (active orders count)

**Features:**

- Sort by any column (asc/desc)
- Performance color indicators
- Click row to view individual user dashboard
- Search/filter by user name

**Edge Cases:**

- User with no assigned orders → Show "No orders assigned"
- User currently on leave → Show status indicator
- Very long user names → Truncate with tooltip

---

## 5. Non-Functional Requirements

### NFR-001: Performance _(Unchanged)_

🇻🇳 **Load Time:** Dashboard phải load ≤ 2 giây trên internet connection bình thường. Aggregation queries phải execute ≤ 500ms.

🇬🇧 **Load Time:** Dashboard must load ≤ 2 seconds on normal internet connection. Aggregation queries must execute ≤ 500ms.

**Implementation:** Server Component với pre-calculated metrics, efficient Prisma queries với proper indexing.

### NFR-002: Scalability _(Unchanged)_

🇻🇳 **Data Volume:** Hỗ trợ dashboard với ≤ 10,000 orders và ≤ 100 users mà không performance degradation.

🇬🇧 **Data Volume:** Support dashboard with ≤ 10,000 orders and ≤ 100 users without performance degradation.

**Implementation:** Pagination cho user table, efficient aggregation với database-level grouping.

### NFR-003: Responsive Design _(Unchanged)_

🇻🇳 **Breakpoints:** Dashboard responsive trên desktop (≥1024px), tablet (768-1023px). Mobile không ưu tiên.

🇬🇧 **Breakpoints:** Dashboard responsive on desktop (≥1024px), tablet (768-1023px). Mobile not prioritized.

**Implementation:** CSS Grid/Flexbox với proper chart scaling, collapsible sidebar on smaller screens.

### NFR-004: Accessibility _(Unchanged)_

🇻🇳 **WCAG Compliance:** Level AA compliance với keyboard navigation, screen reader support, color contrast ≥4.5:1.

🇬🇧 **WCAG Compliance:** Level AA compliance with keyboard navigation, screen reader support, color contrast ≥4.5:1.

**Implementation:** ARIA labels cho charts, semantic HTML, focus management, alt text cho visual indicators.

---

## 6. API & Data Requirements

### Dashboard Metrics Server Action _(Updated)_

```typescript
// Updated to support simplified scope (no group) and ratio calculations
async function getDashboardMetrics({
  scope: 'all-team' | 'individual',  // Removed 'group' option
  userId?: number,  // Required when scope = 'individual'
  startDate: Date,
  endDate: Date
}): Promise<{
  // Updated KPI structure for ratios
  kpis: {
    totalCompleted: { completed: number; total: number; percentage: number };
    onTimeRate: { rate: number; trend: 'up' | 'down' | 'stable'; previousRate: number };
    avgProcessingTime: { days: number; target: number; comparison: 'above' | 'below' | 'on-target' };
    overdueCount: { overdue: number; total: number; percentage: number };
  };

  // Updated chart data for stacked visualization
  completionPerUser: Array<{
    userName: string;
    userId: number;
    onTimeCount: number;
    overdueCount: number;
    totalCompleted: number;
    onTimePercentage: number;
  }>;

  completionTrend: Array<{
    date: string;  // YYYY-MM-DD format
    onTimeCount: number;
    overdueCount: number;
    totalCompleted: number;
    onTimePercentage: number;
  }>;

  onTimeRatio: {
    onTime: number;
    overdue: number;
    totalCompleted: number;
  };

  userBreakdown: Array<{
    userId: number;
    userName: string;
    avatar?: string;
    totalAssigned: number;
    completed: number;
    onTimeRate: number;
    avgProcessingDays: number;
    currentlyProcessing: number;
    performanceScore: 'good' | 'average' | 'needs-attention';
  }>;
}>
```

### Key Changes in API _(Update #1)_

🇻🇳 **Simplified Scope:** Bỏ "group" option, chỉ còn "all-team" và "individual"

**Ratio-based KPIs:** Tất cả KPI metrics bao gồm both absolute numbers và percentages/ratios

**Stacked Data:** Chart data bao gồm breakdown (onTime vs overdue) thay vì chỉ totals

🇬🇧 **Simplified Scope:** Remove "group" option, only "all-team" and "individual"

**Ratio-based KPIs:** All KPI metrics include both absolute numbers and percentages/ratios

**Stacked Data:** Chart data includes breakdown (onTime vs overdue) instead of just totals

---

## 7. Database Considerations _(Unchanged)_

### Required Indices

```sql
-- For efficient dashboard aggregations
CREATE INDEX idx_orders_user_completion ON "Order" ("assignedUserId", "completedAt") WHERE "completedAt" IS NOT NULL;
CREATE INDEX idx_orders_date_status ON "Order" ("createdAt", "status");
CREATE INDEX idx_orders_deadline_completion ON "Order" ("expectedCompletionDate", "completedAt");
```

### Aggregation Strategy

🇻🇳 **Server-side Processing:** Tất cả calculations được thực hiện trên server để avoid large data transfers và ensure consistency.

🇬🇧 **Server-side Processing:** All calculations performed on server to avoid large data transfers and ensure consistency.

**Key Calculations:**

- `calcActualDuration()` để determine on-time vs overdue
- Percentage calculations với safe division (avoid divide by zero)
- Time-based grouping (daily/weekly) based on selected range

---

## 8. UI/UX Specifications _(Updated)_

### Layout Structure

```
Dashboard Page (/dashboard)
├── Header (Account Info, Role Badge)
├── Quick Actions (unchanged)
└── Performance Section (Admin/Super Admin only)
    ├── Dashboard Filters (Simplified)
    │   ├── Scope: [All Team] [Individual▼] (no Group option)
    │   └── Time Range: [This Week▼] [Custom Calendar]
    ├── KPI Cards (4x grid, ratio display)
    │   ├── Total Completed: "45/60 (75%)" + progress bar
    │   ├── On-time Rate: "82% ↑" + trend comparison
    │   ├── Avg Processing: "3.2 days" + vs target
    │   └── Overdue: "8/60 (13%)" + severity color
    ├── Charts (2x2 grid)
    │   ├── Completion per User (Stacked Bar - Enhanced)
    │   ├── On-time Ratio (Donut - Unchanged)
    │   ├── Completion Trend (Stacked Column - New)
    │   └── Reserved for future chart
    └── User Performance Table (Enhanced sorting)
```

### Key Visual Updates

🇻🇳 **Simplified Filters:** Bỏ "Group" dropdown, interface cleaner

**Enhanced KPIs:** Ratio display với visual indicators (progress bars, trend arrows)

**Stacked Charts:** Replaced simple charts với stacked versions showing breakdown

**Improved Date Picker:** Auto-select today, better range selection UX

🇬🇧 **Simplified Filters:** Remove "Group" dropdown, cleaner interface

**Enhanced KPIs:** Ratio display with visual indicators (progress bars, trend arrows)

**Stacked Charts:** Replace simple charts with stacked versions showing breakdown

**Improved Date Picker:** Auto-select today, better range selection UX

---

## 9. Edge Cases & Error Handling

### Filter Edge Cases _(Updated)_

| Scenario                         | Behavior                              |
| -------------------------------- | ------------------------------------- |
| Custom date picker opened        | Auto-select today's date              |
| Invalid date range (start > end) | Show validation error, prevent apply  |
| Range > 1 year                   | Show warning, suggest shorter range   |
| Future dates selected            | Allow but show "No data yet" message  |
| Selected user deleted            | Reset to "All Team" with notification |

### Chart Data Edge Cases _(Updated)_

| Scenario                       | Behavior                                  |
| ------------------------------ | ----------------------------------------- |
| No data for selected filters   | Show "No data available" placeholder      |
| All orders on-time             | Show 100% green with positive message     |
| Stacked chart with zero values | Show empty segments with proper spacing   |
| Large date range               | Auto-switch from daily to weekly grouping |
| User with no completions       | Show empty bar with informative tooltip   |

---

## 10. Testing Requirements

### Critical Test Cases _(Updated)_

1. **Simplified Scope Filtering**
   - Verify only "All Team" and "Individual" options shown
   - Test user dropdown appears only for "Individual" scope
   - Verify "Group" option completely removed

2. **Enhanced Date Picker**
   - Test auto-selection of today's date
   - Test range selection functionality
   - Test validation for invalid ranges
   - Test max 1-year range limit

3. **Ratio-based KPIs**
   - Test percentage calculations for all KPI cards
   - Test trend arrows for on-time rate
   - Test division by zero handling
   - Test color coding for overdue percentage

4. **Stacked Chart Visualization**
   - Test stacked bars show correct breakdown
   - Test hover tooltips with percentages
   - Test legend accuracy
   - Test responsive behavior

5. **Performance & Edge Cases**
   - Load testing with 10,000+ orders
   - No data scenarios
   - Network failure handling
   - User permission changes

### Updated Test Data

```typescript
// Test scenarios for stacked chart data
const mockStackedData = [
  { userName: "Alice", onTimeCount: 8, overdueCount: 2, onTimePercentage: 80 },
  { userName: "Bob", onTimeCount: 5, overdueCount: 5, onTimePercentage: 50 },
  // ... more test users
];

// Test scenarios for ratio-based KPIs
const mockKPIs = {
  totalCompleted: { completed: 45, total: 60, percentage: 75 },
  onTimeRate: { rate: 82, trend: "up", previousRate: 78 },
  avgProcessingTime: { days: 3.2, target: 3.0, comparison: "above" },
  overdueCount: { overdue: 8, total: 60, percentage: 13 },
};
```

---

## 11. Dependencies & Integration

### Updated Dependencies

```json
{
  "recharts": "^2.12.7", // For stacked charts (unchanged)
  "@radix-ui/react-calendar": "latest" // Enhanced date picker
}
```

### Component Updates _(Modified for Update #1)_

| Component                | Change Type   | Update Description                         |
| ------------------------ | ------------- | ------------------------------------------ |
| `DashboardFilters`       | **Modified**  | Remove "Group" option, enhance date picker |
| `KpiCards`               | **Modified**  | Show ratios instead of absolute numbers    |
| `CompletionPerUserChart` | **Modified**  | Convert to stacked bar chart               |
| `CompletionTrendChart`   | **Modified**  | Convert from line to stacked column        |
| `OnTimeRatioChart`       | **Unchanged** | Keep existing donut chart                  |
| `UserBreakdownTable`     | **Unchanged** | Keep existing functionality                |

---

## 12. Success Criteria

### Updated Acceptance _(For Update #1)_

🇻🇳 **UX Improvements:**

- ✅ Interface đơn giản hơn với chỉ 2 scope options
- ✅ Date picker functional với auto-select và range support
- ✅ KPI cards hiển thị meaningful ratios thay vì raw numbers
- ✅ Charts cung cấp breakdown insights, không chỉ totals

**Performance:**

- ✅ Dashboard load time ≤ 2 seconds (unchanged)
- ✅ Charts render smoothly với stacked data
- ✅ Date filtering responsive ≤ 500ms

🇬🇧 **UX Improvements:**

- ✅ Simplified interface with only 2 scope options
- ✅ Functional date picker with auto-select and range support
- ✅ KPI cards show meaningful ratios instead of raw numbers
- ✅ Charts provide breakdown insights, not just totals

**Performance:**

- ✅ Dashboard load time ≤ 2 seconds (unchanged)
- ✅ Charts render smoothly with stacked data
- ✅ Date filtering responsive ≤ 500ms

---

**Document Status:** Draft (Update #1)  
**Last Updated:** 2026-02-11  
**Previous Version:** [spec.md](spec.md)  
**Change Summary:** Simplified scope, enhanced visualization, fixed date picker, ratio-based KPIs
