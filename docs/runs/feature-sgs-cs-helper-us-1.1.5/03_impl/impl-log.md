# Implementation Log — US-1.1.5

> **Branch**: `feature/sgs-cs-helper-us-1.1.5`  
> **Mode**: Batch execution (all 8 tasks)  
> **Date**: 2026-02-11

---

## Summary

| Task | Status | Files Modified |
|------|--------|----------------|
| T-001 | ✅ Done | `prisma/schema.prisma` |
| T-002 | ✅ Done | `src/lib/excel/types.ts` |
| T-003 | ✅ Done | `src/lib/excel/parser.ts` |
| T-004 | ✅ Done | `src/lib/excel/parser.ts` |
| T-005 | ✅ Done | `src/lib/actions/order.ts` |
| T-006 | ✅ Done | `src/hooks/use-realtime-progress.ts`, `src/hooks/use-order-sse.ts`, `src/lib/sse/broadcaster.ts`, `src/app/(orders)/orders/page.tsx` |
| T-007 | ✅ Done | `src/components/orders/orders-table.tsx` |
| T-008 | ✅ Done | `src/components/orders/completed-orders-table.tsx`, `src/hooks/use-completed-orders.ts`, `src/app/api/orders/completed/route.ts` |

---

## T-001: Add OrderSample Prisma model + migration

**Files**: `prisma/schema.prisma`

- Added `samples OrderSample[]` relation to `Order` model
- Created `OrderSample` model with 9 data fields: `section`, `sampleId`, `description`, `analyte`, `method`, `lod`, `loq`, `unit`, `requiredDate`
- Added `orderId` FK with `onDelete: Cascade` and `@@index([orderId])`
- Synced DB via `npx prisma db push` (migrate dev failed due to shadow DB issue with old migration)
- Regenerated Prisma client via `npx prisma generate`

**Note**: `prisma migrate dev` fails with P3006 error (old migration `20260210055235_add_registrant_model` has duplicate column). Used `db push` as workaround.

---

## T-002: Add ParsedSample type + update ParsedOrder & CreateOrderInput

**Files**: `src/lib/excel/types.ts`

- Added `ParsedSample` interface with all 9 fields
- Added `samples: ParsedSample[]` and `sampleCount: number` to `ParsedOrder`
- Added `CreateSampleInput` interface (mirrors ParsedSample for DB input)
- Added `sampleCount: number` and `samples: CreateSampleInput[]` to `CreateOrderInput`
- Updated `toCreateOrderInput()` to map samples array and include sampleCount

---

## T-003: Implement sample parsing logic (rows 10+)

**Files**: `src/lib/excel/parser.ts`

- Added `SAMPLE_START_ROW = 10` constant
- Added `SAMPLE_COLUMN_MAP` mapping 9 columns (A-I) to indices 0-8
- Implemented `parseSamples(data: unknown[][]): ParsedSample[]`
  - Loops from row 10 onward
  - Skips rows with empty `sampleId`
  - Maps all 9 columns to ParsedSample fields
- Updated `parseExcelFile()` to call `parseSamples`

---

## T-004: Implement sampleCount calculation (max .NNN)

**Files**: `src/lib/excel/parser.ts`

- Implemented `calculateSampleCount(samples: ParsedSample[]): number`
  - Regex `/\.(\d+)$/` to extract numeric suffix from sampleId
  - Returns max suffix value across all samples
  - Fallback to `samples.length` if no suffixes found
  - Returns 0 for empty array
- Updated `parseExcelFile()` to call `calculateSampleCount`

---

## T-005: Update createOrders server action with sample upsert

**Files**: `src/lib/actions/order.ts`

- Added `createSampleSchema` Zod schema for sample validation (9 fields)
- Added `sampleCount` and `samples` to `createOrderSchema`
- **New orders**: After `createManyAndReturn`, creates samples via `orderSample.createMany` for each order
- **Updated orders**: Added `sampleCount` to update data, then `orderSample.deleteMany` + `orderSample.createMany` (delete+recreate upsert strategy per D-004)
- **Unchanged orders**: Still replaces samples and updates sampleCount (ensures consistency on re-upload)

---

## T-006: Update getOrders to include sampleCount + full data flow

**Files**: `src/hooks/use-realtime-progress.ts`, `src/hooks/use-order-sse.ts`, `src/lib/sse/broadcaster.ts`, `src/app/(orders)/orders/page.tsx`

- `getOrders()` already returns all Order fields (no explicit select), so `sampleCount` is automatically included
- Added `sampleCount: number` to `OrderData` interface in `use-realtime-progress.ts`
- Added `sampleCount` to page order mapping in `page.tsx`
- Added `sampleCount` to SSE `parseOrderDates` in `use-order-sse.ts` (with `?? 0` fallback)
- Added `"sampleCount"` to SSE broadcaster `OrderData` Pick type

---

## T-007: Add Total Samples column to In Progress table

**Files**: `src/components/orders/orders-table.tsx`

- Added `sampleCount: number` to `OrderWithProgress` interface
- Added `<TableHead>Total Samples</TableHead>` after Priority column
- Added `<TableCell className="text-center">{order.sampleCount}</TableCell>` in data rows

---

## T-008: Add Total Samples column to Completed table

**Files**: `src/components/orders/completed-orders-table.tsx`, `src/hooks/use-completed-orders.ts`, `src/app/api/orders/completed/route.ts`

- Added `sampleCount: number` to `CompletedOrder` interface in hook
- Added `sampleCount: true` to `ORDER_SELECT` in API route
- Added `<TableHead>Total Samples</TableHead>` after Priority column
- Added `<TableCell className="text-center">{order.sampleCount}</TableCell>` in data rows
- Added extra skeleton cell for loading state
- Updated empty state `colSpan` from `9:8` to `10:9`

---

## Deviations & Notes

1. **Migration approach**: Used `prisma db push` instead of `prisma migrate dev` due to shadow DB error with old migration
2. **T-006 scope expansion**: Required updating 4 additional files in the data flow pipeline (OrderData → page mapping → SSE parsing → SSE broadcasting) beyond the originally scoped `order.ts`
3. **Unchanged orders**: Per D-004, even unchanged orders get their samples replaced and sampleCount updated on re-upload for consistency
