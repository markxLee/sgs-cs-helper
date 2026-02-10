# Implementation Log — US-1.1.3

---

## T-001 — Extend BatchCreateResult & add UnchangedOrder type

- **Date:** 2026-02-09
- **Status:** Implemented (awaiting review)
- **Files Changed:**
  - src/lib/excel/types.ts
- **Summary:**
  - Extended `BatchCreateResult` to include `created`, `updated`, `unchanged`, and `failed` arrays.
  - Added `UnchangedOrder` type with `reason` field for unchanged orders.
- **Notes:**
  - Types are exported and ready for use in subsequent tasks.

## T-001 — Manual Review Complete

- **Date:** 2026-02-09
- **Status:** Completed (manual review)
- **Reviewed by:** User (manual)
- **Notes:**
  - Task marked as complete after manual verification.

---

## T-002 — Implement hasOrderChanged() helper

- **Date:** 2026-02-09
- **Status:** Completed (manual review)
- **Reviewed by:** User (manual)
- **Files Changed:**
  - src/lib/actions/order.ts
- **Summary:**
  - Added `hasOrderChanged(existing, input)` internal helper function.
  - Compares 7 fields: registeredDate, receivedDate, requiredDate, priority, registeredBy, checkedBy, note.
  - Date comparison via `.getTime()`, nullable strings via `?? null`, number directly.
  - Pure function, no side effects, not exported (internal to "use server" module).

---

## T-003 — Refactor createOrders() to upsert with transaction

- **Date:** 2026-02-09
- **Status:** Completed (manual review)
- **Reviewed by:** User (manual)
- **Files Changed:**
  - src/lib/actions/order.ts
- **Summary:**
  - Fixed imports: removed `FailedOrder` (deleted in T-001), added `UnchangedOrder`.
  - Wrapped order processing in `prisma.$transaction()` with 10s timeout (NFR-001).
  - Replaced `findUnique` with `findFirst` + `mode: "insensitive"` for case-insensitive matching (FR-004).
  - 3-way branching: create (new) / update (changed, preserves status+completedAt per FR-003) / unchanged (metadata refresh only).
  - SSE broadcasts `[...created, ...updated]` only when changes exist (NFR-003).
  - Return type matches new `BatchCreateResult` (no more `success`/`message` fields).
  - `failed` uses `{ input, error }` matching the new type.
  - All error return paths include `updated: []` and `unchanged: []`.

---

## T-004 — Update SubmitResult & upload results UI

- **Date:** 2026-02-09
- **Status:** Implemented (awaiting review)
- **Files Changed:**
  - src/components/orders/upload-form.tsx
- **Summary:**
  - Added `UpdatedOrderInfo` and `UnchangedOrderInfo` interfaces.
  - Extended `SubmitResult` with `updated`, `unchanged` counts and `updatedOrders`, `unchangedOrders` arrays.
  - Refactored `handleSubmit` success path: compute `success` from `failed.length === 0`, build `message` from 4 counts, map `failed` via `.input.jobNumber`.
  - Updated error path and early-return path with `updated`/`unchanged` defaults.
  - Changed "Creating orders..." to "Processing orders..." (FR-006 AC7).
  - Updated summary line to 4 categories: Created | Updated | Unchanged | Failed.
  - Added blue card (bg-blue-50, border-blue-200) for updated orders with pencil icon.
  - Added gray card (bg-gray-50, border-gray-200) for unchanged orders with minus-circle icon.
  - Card order: created (green) → updated (blue) → unchanged (gray) → failed (red).
  - Cards only render when respective array is non-empty.

---

## T-005 — Update tests for upsert behavior

- **Date:** 2026-02-09
- **Status:** Implemented (awaiting review)
- **Files Changed:**
  - src/lib/actions/__tests__/order.test.ts
- **Summary:**
  - Full rewrite of test file for upsert architecture.
  - Mock setup: `$transaction` callback pattern with `txProxy` delegating to `mockFindFirst`, `mockCreate`, `mockUpdate`.
  - Removed all `result.success` / `result.message` assertions (fields no longer exist in `BatchCreateResult`).
  - Removed `findUnique` mock → replaced with `findFirst`.
  - Added test data: `mockExistingOrder`, `mockCompletedOrder`, `adminSession`.
  - Added helper functions: `setupTransaction()`, `setupAuth()`.
  - **16 test cases across 8 describe blocks:**
    - Upsert Logic: create new (TC-001), update changed (TC-002), skip unchanged (TC-003), mixed batch (TC-004)
    - Status Preservation: COMPLETED status preserved on update (TC-005)
    - Case-insensitive Matching: findFirst called with `mode: "insensitive"` (TC-006)
    - Transaction: 10s timeout verified (TC-017)
    - SSE Broadcast: created+updated together (TC-007), not called when unchanged (TC-008), failure doesn't block (TC-009), batch created (TC-009-4)
    - Permission Validation: unauthenticated (TC-010), STAFF no canUpload (TC-011), STAFF with canUpload
    - Validation: empty array (TC-012)
    - Error Handling: individual order error in transaction
  - TC-018 skipped: unchanged orders do NO DB write per user decision.
- **Verification:**
  - `pnpm tsc --noEmit` → 0 errors
  - `pnpm test:run` → 128 tests pass (9 files), 16 tests in order.test.ts
