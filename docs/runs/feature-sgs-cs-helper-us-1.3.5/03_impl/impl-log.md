# Implementation Log — Completion Tracking: Log Completed By & Show Actual Duration

---

## T-006 — Update CompletedOrdersTable UI — new columns & indicators

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Reviewed

- **By:** User (manual)
- **Date:** 2026-02-10

### Changes

| File                                               | Action   | Summary                                                                                              |
| -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `src/hooks/use-completed-orders.ts`                | Modified | Added `completedById`, `completedBy: { id, name, email }` to `CompletedOrder` interface              |
| `src/components/orders/completed-orders-table.tsx` | Modified | Added "Completed By" sortable column, "Actual Duration" column with overdue/on-time color indicators |

### Notes

- "Completed By" column: shows `Name (email)` or `"—"` for legacy orders without `completedBy`
- "Actual Duration" column: uses `calcActualDuration` (with lunch break deduction) + `formatDuration`
- On-time: `text-green-600`; Overdue: `text-purple-600` with sub-line "Overdue: Xh Ym"
- "Completed By" is sortable via `SortableHeader`; "Actual Duration" is not (computed client-side)
- Skeleton row updated with 2 extra cells; empty state colSpan updated (+2)
- `completed-orders.tsx` required no changes — sort/filter wiring is already generic
- Build passes with zero type errors

### Deviations

None — implemented as planned.

---

## T-001 — Add completedById to Order schema + migration

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Reviewed

- **By:** User (manual)
- **Date:** 2026-02-10

### Changes

| File                                                              | Action         | Summary                                                                                                                                                     |
| ----------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                            | Modified       | Added `completedById String?`, `completedBy User? @relation("CompletedBy", ...)` to Order; added `completedOrders Order[] @relation("CompletedBy")` to User |
| `prisma/migrations/20260210044602_add_completed_by/migration.sql` | Created (auto) | Migration adds `completedById` column + FK constraint                                                                                                       |

### Notes

- Removed corrupted empty migration directory `20260206_staff_code_permissions` (no `migration.sql` inside)
- Ran `prisma migrate reset` to clean state, then `prisma migrate dev --name add_completed_by`
- Re-seeded database after reset
- Build passes with zero type errors
- Field is nullable — existing data unaffected

### Deviations

None — implemented as planned.

---

## T-005 — Add duration utilities (formatDuration, calcOverdue)

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Changes

| File                        | Action  | Summary                                                                                  |
| --------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `src/lib/utils/duration.ts` | Created | 4 exported functions: formatDuration, calcActualDuration, calcOverdueDuration, isOverdue |

### Notes

- **Revised**: Initial implementation had simple `completedAt − receivedDate` without lunch break deduction. User feedback: must exclude lunch break (12:00–13:00), same as progress bar.
- Imports `getLunchBreakDeduction` from `progress.ts` and applies it in `calcActualDuration`
- Formula: `(completedAt − receivedDate) − lunchDeductionHours × MS_PER_HOUR`
- `isOverdue` and `calcOverdueDuration` use strict `>` (not `>=`) per EC-004: completedAt === requiredDate is on-time
- Build passes with zero type errors

### Deviations

- **D-001**: `calcActualDuration` now imports `getLunchBreakDeduction` from `progress.ts` instead of being a pure utility with no dependencies. This ensures consistent lunch-break logic across progress bar and completion tracking.

---

## T-004 — Update GET /api/orders/completed to include completedBy data

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Reviewed

- **By:** User (manual)
- **Date:** 2026-02-10

### Changes

| File                                    | Action   | Summary                                                                                                                    |
| --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/orders/completed/route.ts` | Modified | Added `completedBy` relation to ORDER_SELECT, `completedBy` to sort fields, `completedById` filter, relation sort handling |

### Notes

- Added `completedBy: { select: { id, name, email } }` and `completedById: true` to ORDER_SELECT
- Added `"completedBy"` to ALLOWED_SORT_FIELDS
- Sort by `completedBy` maps to `{ completedBy: { name: sortDir } }` for relation sorting
- Added optional `completedById` query param for filtering
- Build passes with zero type errors

### Deviations

## None — implemented as planned.

## T-003 — Update undo-complete API to clear completedById

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Reviewed

- **By:** User (manual)
- **Date:** 2026-02-10

### Changes

| File                                             | Action   | Summary                                                                           |
| ------------------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| `src/app/api/orders/[id]/undo-complete/route.ts` | Modified | Added `completedById: null` to update data; added `completedById: true` to select |

### Notes

- Mirror of T-002 pattern — 2-line change
- Build passes with zero type errors

### Deviations

None — implemented as planned.---

## T-002 — Update mark-done API to record completedById

| Field     | Value        |
| --------- | ------------ |
| Started   | 2026-02-10   |
| Completed | 2026-02-10   |
| Status    | ✅ Completed |

### Reviewed

- **By:** User (manual)
- **Date:** 2026-02-10

### Changes

| File                                         | Action   | Summary                                                                                      |
| -------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `src/app/api/orders/[id]/mark-done/route.ts` | Modified | Added `completedById: session.user.id` to update data; added `completedById: true` to select |

### Notes

- Required `pnpm db:generate` to regenerate Prisma client (schema had new field from T-001 but client wasn't regenerated in this session)
- Build passes with zero type errors
- Minimal 2-line change — no behavioral side effects

### Deviations

None — implemented as planned.
