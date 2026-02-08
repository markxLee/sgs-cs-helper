# Implementation Log — US-1.2.6: Show Registered By, Filter/Sort, Priority ETA

## Summary

| Task | Status | Files Modified | Notes |
|------|--------|----------------|-------|
| T-002 | ✅ Complete | 3 files | Registered By column added |
| T-003 | ✅ Complete | 1 file created | Filter controls component |
| T-004 | ✅ Complete | 1 file created | Sortable header component |
| T-005 | ✅ Complete | 1 file created | Job search with debounce |
| T-006 | ✅ Complete | 2 files | ETA utility + table update |
| T-007 | ✅ Complete | 2 files | Integration hook + container |
| T-008 | ✅ Complete | 1 file | Empty state for filters |

---

## T-002: Add Registered By Column

### Files Modified
- [src/hooks/use-realtime-progress.ts](../../../../src/hooks/use-realtime-progress.ts#L20) — Added `registeredBy: string | null` to `OrderData` interface
- [src/components/orders/orders-table.tsx](../../../../src/components/orders/orders-table.tsx#L40) — Added registeredBy to interface, column header, and cell
- [src/app/(orders)/orders/page.tsx](../../../../src/app/(orders)/orders/page.tsx#L64) — Added registeredBy to initialOrders mapping

### Changes
- Added "Người Đăng Ký" column between Registered Date and Received Date
- Displays user name with truncation for long names
- Shows "Unknown" for null values

---

## T-003: Create Client-side Filter Controls

### Files Created
- [src/components/orders/order-filters.tsx](../../../../src/components/orders/order-filters.tsx) — Filter controls component

### Features
- **Registered By dropdown**: Select component with "Tất cả" default + unique registrant names
- **Date range pickers**: From/To inputs for Required Date filtering
- **Clear filters button**: Appears only when filters are active
- Uses shadcn/ui Select, Input, and Label components

---

## T-004: Implement Client-side Sorting

### Files Created
- [src/components/orders/sortable-header.tsx](../../../../src/components/orders/sortable-header.tsx) — Sortable table header component

### Features
- Clickable table headers with sort direction indicators
- Three-state cycle: null → asc → desc → null
- Arrow icons: ArrowUp (asc), ArrowDown (desc), ArrowUpDown (neutral)
- Sortable columns: Registered Date, Required Date, Priority, Progress

---

## T-005: Add Job Number Search

### Files Created
- [src/components/orders/job-search.tsx](../../../../src/components/orders/job-search.tsx) — Search input component

### Features
- Debounced search (300ms delay)
- Case-insensitive partial matching
- Search icon and clear button
- Placeholder: "Tìm Job Number..."

---

## T-006: Add Priority ETA Display

### Files Created
- [src/lib/utils/eta-format.ts](../../../../src/lib/utils/eta-format.ts) — ETA formatting utility

### Files Modified
- [src/components/orders/orders-table.tsx](../../../../src/components/orders/orders-table.tsx#L256) — Added ETA below priority badge

### Features
- `formatETA(priority)`: Returns "ETA: 24h", "ETA: 12h", "ETA: 6h", "ETA: 48h"
- `getETADescription(priority)`: Returns full description with priority name
- ETA displayed in muted text below priority badge

---

## T-007: Integrate All Features

### Files Created
- [src/hooks/use-order-controls.ts](../../../../src/hooks/use-order-controls.ts) — Unified state management hook

### Files Modified
- [src/components/orders/realtime-orders.tsx](../../../../src/components/orders/realtime-orders.tsx) — Integrated all controls

### Features
- `useOrderControls` hook manages:
  - Filter state (registeredBy, date range)
  - Sort state (field, direction)
  - Search state (query string)
- `processOrders<T>` function applies filter → search → sort pipeline
- Controls only visible on "in-progress" tab
- Filters panel with search + filter controls

---

## T-008: Handle Edge Cases & Polish

### Files Modified
- [src/components/orders/realtime-orders.tsx](../../../../src/components/orders/realtime-orders.tsx#L230) — Enhanced EmptyState

### Features
- Empty state with search icon when filters return no results
- Message: "Không tìm thấy đơn hàng" with hint to adjust filters
- Active filters indicator with "Xóa tất cả" quick action
- Null registeredBy handled with "Unknown" fallback

---

## Build Verification

```bash
pnpm tsc --noEmit  # ✅ Pass
pnpm build         # ✅ Pass
```

---

## Files Summary

### New Files (6)
1. `src/components/orders/order-filters.tsx`
2. `src/components/orders/sortable-header.tsx`
3. `src/components/orders/job-search.tsx`
4. `src/lib/utils/eta-format.ts`
5. `src/hooks/use-order-controls.ts`
6. `docs/runs/feature-sgs-cs-helper-us-1.2.6/03_impl/impl-log.md`

### Modified Files (4)
1. `src/hooks/use-realtime-progress.ts`
2. `src/components/orders/orders-table.tsx`
3. `src/components/orders/realtime-orders.tsx`
4. `src/app/(orders)/orders/page.tsx`

---

**Implementation Date**: 2026-02-08
**Implemented By**: GitHub Copilot (batch execution)
