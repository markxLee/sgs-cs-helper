# Implementation Log — Completed Orders Tab & Undo
<!-- Template Version: 1.0 | Contract: v1.0 | Last Updated: 2026-02-09 -->

**Branch:** `feature/sgs-cs-helper-us-1.3.2`
**Started:** 2026-02-09

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Completed Orders Tab & Undo |
| Progress | 7/7 tasks completed ✅ |
| Status | 🟢 All tasks complete |
| Last Updated | 2026-02-09 |

---

## 1. Progress Overview

| Task | Title | Root | Status | Completed |
|------|-------|------|--------|-----------|
| T-001 | Paginated Completed Orders API | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-002 | Undo Complete API | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-003 | useCompletedOrders Hook | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-004 | UndoCompleteModal | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-005 | CompletedOrdersTable | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-006 | CompletedOrders Container | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |
| T-007 | Page Integration | `sgs-cs-hepper` | ✅ Done | 2026-02-09 |

---

## 2. Task Implementation Details

### T-001 — Paginated Completed Orders API

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

🇻🇳 Tạo API route `GET /api/orders/completed` với server-side pagination, search, filter, sort. Auth check → parse query params → build Prisma where → `Promise.all([findMany, count])` → return `{ orders, total, page, totalPages }`.

🇬🇧 Created API route `GET /api/orders/completed` with server-side pagination, search, filter, sort. Auth check → parse query params → build Prisma where → `Promise.all([findMany, count])` → return `{ orders, total, page, totalPages }`.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/app/api/orders/completed/route.ts` | +148 |

#### Key Code

```typescript
// Parallel data + count query for performance
const [orders, total] = await Promise.all([
  prisma.order.findMany({
    where,
    orderBy: { [sortField]: sortDir },
    skip,
    take: limit,
    select: ORDER_SELECT,
  }),
  prisma.order.count({ where }),
]);
```

#### Implementation Notes

🇻🇳
- Sort field whitelist (`ALLOWED_SORT_FIELDS`) ngăn arbitrary column access
- `parsePositiveInt()` helper đảm bảo page/limit luôn > 0
- `satisfies Prisma.OrderSelect` cho type-safe select clause
- Date range filter trên `requiredDate` (gte/lte)
- Search dùng `contains` + `mode: "insensitive"` trên `jobNumber`

🇬🇧
- Sort field whitelist (`ALLOWED_SORT_FIELDS`) prevents arbitrary column access
- `parsePositiveInt()` helper ensures page/limit always > 0
- `satisfies Prisma.OrderSelect` for type-safe select clause
- Date range filter on `requiredDate` (gte/lte)
- Search uses `contains` + `mode: "insensitive"` on `jobNumber`

#### Deviations from Plan

None — implemented as planned.

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| Compiles | ⏳ Pending | |
| Lint passes | ⏳ Pending | |
| No type errors | ✅ Pass | IDE reports 0 errors |
| Manual test | ⏳ Pending | |

---

### T-004 — UndoCompleteModal

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

🇻🇳 Tạo `UndoCompleteModal` — mirror 1:1 từ `MarkDoneModal`. Wraps `ConfirmDialog` với title "Xác nhận Hoàn Tác", message xác nhận undo, `danger={false}`. Cùng interface props.

🇬🇧 Created `UndoCompleteModal` — 1:1 mirror of `MarkDoneModal`. Wraps `ConfirmDialog` with title "Xác nhận Hoàn Tác", undo confirmation message, `danger={false}`. Same props interface.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/components/orders/UndoCompleteModal.tsx` | +34 |

#### Deviations from Plan

None — exact mirror of MarkDoneModal as planned.

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| Compiles | ⏳ Pending | |
| Lint passes | ⏳ Pending | |
| No type errors | ✅ Pass | IDE reports 0 errors |
| Manual test | ⏳ Pending | |---

### T-002 — Undo Complete API

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

🇻🇳 Tạo API route `POST /api/orders/[id]/undo-complete` — mirror 1:1 từ `mark-done/route.ts`. Auth → permission → verify COMPLETED → revert IN_PROGRESS + clear completedAt → SSE broadcast → return updated order.

🇬🇧 Created API route `POST /api/orders/[id]/undo-complete` — 1:1 mirror of `mark-done/route.ts`. Auth → permission → verify COMPLETED → revert IN_PROGRESS + clear completedAt → SSE broadcast → return updated order.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/app/api/orders/[id]/undo-complete/route.ts` | +99 |

#### Key Code

```typescript
// Only 3 differences from mark-done:
// 1. Status check: !== "COMPLETED" (not !== "IN_PROGRESS")
// 2. Update data: { status: "IN_PROGRESS", completedAt: null }
// 3. Error message: "Order is not completed"
```

#### Deviations from Plan

None — implemented as planned (exact mirror of mark-done).

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| Compiles | ⏳ Pending | |
| Lint passes | ⏳ Pending | |
| No type errors | ✅ Pass | IDE reports 0 errors |
| Manual test | ⏳ Pending | |

---

### T-005 — CompletedOrdersTable

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

Created `CompletedOrdersTable` — data table for completed orders with columns: Job Number, Registered Date, Registered By, Required Date, Priority, Completed At, Action (Undo). Includes sortable headers (registeredDate, requiredDate, completedAt), pagination controls (prev/next + "Page X of Y"), loading skeleton, empty state with icon, and Undo button per row with `UndoCompleteModal` confirmation.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/components/orders/completed-orders-table.tsx` | +285 |

#### Key Design Decisions

- No progress bar or time-left columns (irrelevant for completed orders)
- Undo button uses `Undo2` icon from lucide-react with `variant="outline"`
- Completed At column shown in green font for visual distinction
- Action column conditionally rendered based on `canUndo` prop
- Loading state: skeleton rows when loading with no data, opacity when loading with existing data
- Empty state: `PackageOpen` icon + "No completed orders found" message

#### Deviations from Plan

None.

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| No type errors | ✅ Pass | IDE reports 0 errors |

---

### T-006 — CompletedOrders Container

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

Created `CompletedOrders` client container that wires `useCompletedOrders` hook with `JobSearch`, `OrderFiltersComponent`, and `CompletedOrdersTable`. Manages sort toggle logic (asc ↔ desc), filter state mapping, undo success handling (refetch or reset to page 1 if page empty), and displays total count.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/components/orders/completed-orders.tsx` | +144 |

#### Key Design Decisions

- Registrant list extracted from current page's orders via `useMemo` (no separate API call)
- Sort toggle: same field → flip direction, new field → start with "asc"
- Undo success: if last item on page and page > 1, reset to page 1; otherwise refetch current page
- Search + Filters on same flex row (matching in-progress tab layout)

#### Deviations from Plan

None.

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| No type errors | ✅ Pass | IDE reports 0 errors |

---

### T-007 — Page Integration

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

Modified `page.tsx` to conditionally render `CompletedOrders` vs `RealtimeOrders` based on `activeTab`. Added `canUndo` permission (same as `canMarkDone`). Optimized data fetching: only runs `getOrders()` when on in-progress tab (completed tab fetches client-side). Simplified tab count display.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Modified | `src/app/(orders)/orders/page.tsx` | ~20 lines changed |

#### Key Changes

1. Import `CompletedOrders` component
2. `canUndo = canMarkDone` (same permission)
3. Conditional data fetch: `if (activeTab === "in-progress")` only
4. Conditional render: `CompletedOrders` vs `RealtimeOrders`
5. Removed stale `console.log` debug statement
6. Tab count: in-progress shows count only when active; completed shows label only

#### Deviations from Plan

- Simplified tab counts (no server-side completed count) — completed count would require an extra DB query and is visible in the table's total anyway

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| No type errors | ✅ Pass | IDE reports 0 errors |

| Aspect | Value |
|--------|-------|
| Root | `sgs-cs-hepper` |
| Started | 2026-02-09 |
| Completed | 2026-02-09 |
| Status | ✅ Done (Reviewed: Manual by user) |

#### Summary

🇻🇳 Tạo custom hook `useCompletedOrders` quản lý toàn bộ data fetching cho completed tab. Bao gồm: fetch từ API với pagination, search debounce 300ms, filter/sort gửi lên server (reset page 1), polling 5 phút, refetch khi chuyển tab, `refetch()` cho undo. Sử dụng `AbortController` để cancel stale requests.

🇬🇧 Created custom hook `useCompletedOrders` managing all data fetching for completed tab. Includes: API fetch with pagination, 300ms search debounce, server-side filter/sort (reset page 1), 5-min polling, refetch on tab switch, `refetch()` for undo. Uses `AbortController` to cancel stale requests.

#### Files Changed

| Action | Path | Lines |
|--------|------|-------|
| Created | `src/hooks/use-completed-orders.ts` | +275 |

#### Key Code

```typescript
// AbortController prevents stale data from overwriting fresh results
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
const controller = new AbortController();
abortControllerRef.current = controller;

// Debounced search — only fires after 300ms pause
searchDebounceRef.current = setTimeout(() => {
  setPageState(1);
  void fetchOrders({ ...paramsRef.current, search: newSearch, page: 1 });
}, SEARCH_DEBOUNCE_MS);

// 5-min polling while on completed tab
const intervalId = setInterval(() => {
  void fetchOrders();
}, POLL_INTERVAL_MS);
```

#### Implementation Notes

🇻🇳
- `paramsRef` giữ latest params cho polling (tránh stale closure trong setInterval)
- Filter/sort changes reset page về 1 ngay lập tức + trigger fetch
- `refetch()` dùng params hiện tại từ ref — dùng sau undo
- Tab switch effect: fetch khi `activeTab` chuyển sang "completed"
- Cleanup effect: abort in-flight + clear debounce timeout on unmount

🇬🇧
- `paramsRef` holds latest params for polling (avoids stale closure in setInterval)
- Filter/sort changes reset page to 1 immediately + trigger fetch
- `refetch()` uses current params from ref — used after undo
- Tab switch effect: fetches when `activeTab` changes to "completed"
- Cleanup effect: abort in-flight + clear debounce timeout on unmount

#### Deviations from Plan

None — implemented as planned.

#### Verification

| Check | Status | Notes |
|-------|--------|-------|
| Compiles | ⏳ Pending | |
| Lint passes | ⏳ Pending | |
| No type errors | ✅ Pass | IDE reports 0 errors |
| Manual test | ⏳ Pending | |
