# Work Description — Update #1

<!-- Version: 1.0 | Contract: v1.0 | US-2.1.1 | Update: 1 -->

---

## Update Context / Ngữ cảnh Cập nhật

| Field         | Value                   |
| ------------- | ----------------------- |
| Original Work | work-description.md     |
| Update Type   | REQUIREMENT_CHANGE      |
| Source        | User Feedback / Testing |
| Timestamp     | 2026-02-11              |
| Restart From  | Phase 1: Specification  |

---

## What Changed / Những gì Đã thay đổi

### 🇻🇳 Mô tả Thay đổi

Sau khi hoàn thành implementation ban đầu, người dùng đã đưa ra phản hồi yêu cầu cải thiện UX/UI của dashboard:

1. **Đơn giản hóa Scope**: Bỏ "Group" option, chỉ giữ lại "All Team" và "Individual" để interface đơn giản hơn
2. **Cải thiện Chart Visualization**:
   - Thay thế Completion Trend (line chart) bằng stacked column chart theo ngày/tuần
   - Hiển thị breakdown on-time/overdue với phần trăm trong mỗi cột
   - Orders per User chart cũng chuyển sang dạng stacked column với breakdown
3. **Fix Date Picker**: Sửa lỗi custom date picker không auto-select today và không thể chọn range
4. **KPI Cards cải tiến**: Hiển thị ratio thay vì absolute numbers (ví dụ: "Total Completed/Total Orders")

### 🇬🇧 Change Description

After completing the initial implementation, user provided feedback requesting UX/UI improvements to the dashboard:

1. **Simplify Scope**: Remove "Group" option, keep only "All Team" and "Individual" for simpler interface
2. **Improve Chart Visualization**:
   - Replace Completion Trend (line chart) with stacked column chart by day/week
   - Show on-time/overdue breakdown with percentages in each column
   - Orders per User chart also changed to stacked column with breakdown
3. **Fix Date Picker**: Fix bug where custom date picker doesn't auto-select today and can't select range
4. **Enhanced KPI Cards**: Show ratios instead of absolute numbers (e.g., "Total Completed/Total Orders")

---

## Affected Requirements / Yêu cầu Bị ảnh hưởng

| ID     | Change Type | Original                                              | Updated                                                        |
| ------ | ----------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| FR-002 | Modified    | Scope selector with "All Team", "Group", "Individual" | Scope selector with only "All Team", "Individual"              |
| FR-003 | Modified    | Time range filter with basic custom dates             | Time range filter with improved custom date picker             |
| FR-004 | Modified    | KPI cards showing absolute values                     | KPI cards showing ratios and percentages                       |
| FR-005 | Modified    | Completion bar chart showing total per user           | Stacked bar chart showing on-time/overdue breakdown            |
| FR-007 | Modified    | Completion trend line chart over time                 | Stacked column chart with daily/weekly breakdown + percentages |

---

## Technical Impact / Ảnh hưởng Kỹ thuật

### Components Affected / Components Bị ảnh hưởng

1. **DashboardFilters**: Remove "group" scope option and multi-select logic
2. **CompletionTrendChart**: Replace LineChart with stacked BarChart (vertical)
3. **CompletionBarChart**: Change to stacked bars showing breakdown
4. **KpiCards**: Update display logic to show ratios
5. **Calendar Component**: Fix date selection and range logic

### Data Structure Changes / Thay đổi Cấu trúc Dữ liệu

- Server Action `getDashboardMetrics` may need additional data for percentage calculations
- Chart data structures need to support stacked/breakdown format
- Remove "group" validation from Zod schemas

---

## User Experience Goals / Mục tiêu Trải nghiệm Người dùng

1. **Simplified Filtering**: Reduce cognitive load by removing complex group selection
2. **Better Data Visualization**: Stacked charts provide more insight than simple totals
3. **Intuitive Date Selection**: Custom date picker should work as expected
4. **Contextual Metrics**: Ratios are more meaningful than absolute numbers for decision-making

---

## Priority / Ưu tiên

| Component            | Priority | Reason                       |
| -------------------- | -------- | ---------------------------- |
| Date Picker Fix      | High     | Blocking basic functionality |
| Scope Simplification | High     | Core UX improvement          |
| Chart Visualization  | Medium   | Enhanced insights            |
| KPI Ratios           | Medium   | Better context               |

---

## Next Steps / Các bước Tiếp theo

1. Update specification with modified functional requirements
2. Revise task breakdown to reflect component changes
3. Update implementation focusing on affected components
4. Update test cases for new UI behaviors
5. Verify all changes work together

---

**References:**

- Original work: [work-description.md](work-description.md)
- Original spec: [01_spec/spec.md](../01_spec/spec.md)
- Implementation: [03_impl/impl-log.md](../03_impl/impl-log.md)
