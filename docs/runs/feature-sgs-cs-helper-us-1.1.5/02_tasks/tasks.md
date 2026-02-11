# Task Plan — Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample
<!-- US-1.1.5 | Created: 2026-02-11 | Revised: 2026-02-11 | Contract: v1.0 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Total Tasks | 8 |
| Dev Mode | Standard |
| Estimated Effort | 2-3 days |
| Critical Path | T-001 → T-002 → T-003 → T-004 → T-005 → T-006 |

---

## 1. Task Overview

| ID | Task | Files | FRs | Status |
|----|------|-------|-----|--------|
| T-001 | Add OrderSample Prisma model + migration | `prisma/schema.prisma` | FR-2 | ⬜ Pending |
| T-002 | Add ParsedSample type + update ParsedOrder & CreateOrderInput | `src/lib/excel/types.ts` | FR-1, FR-2 | ⬜ Pending |
| T-003 | Implement sample parsing logic (rows 10+) | `src/lib/excel/parser.ts` | FR-1, FR-3 | ⬜ Pending |
| T-004 | Implement sampleCount calculation (max .NNN) | `src/lib/excel/parser.ts` | FR-3 | ⬜ Pending |
| T-005 | Update createOrders server action with sample upsert | `src/lib/actions/order.ts` | FR-2, FR-5 | ⬜ Pending |
| T-006 | Update getOrders to include sampleCount | `src/lib/actions/order.ts` | FR-4 | ⬜ Pending |
| T-007 | Add Total Samples column to In Progress table | `src/components/orders/orders-table.tsx` | FR-4 | ⬜ Pending |
| T-008 | Add Total Samples column to Completed table | `src/components/orders/completed-orders-table.tsx` | FR-4 | ⬜ Pending |

---

## 2. Dependency Graph

```
T-001 (Prisma model)
  │
  ▼
T-002 (Types)
  │
  ├──► T-003 (Parse samples) ──► T-004 (Calculate sampleCount)
  │                                       │
  │                                       ▼
  └──────────────────────────► T-005 (Server action upsert)
                                          │
                                          ▼
                               T-006 (getOrders include sampleCount)
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                    T-007 (In Progress UI)    T-008 (Completed UI)
```

---

## 3. Task Details

### T-001: Add OrderSample Prisma Model + Migration

**Files:** `prisma/schema.prisma`  
**FRs:** FR-2 (Store samples)  
**ACs:** AC3  
**Dependencies:** None  

**Description:**
Add the `OrderSample` model to the Prisma schema and add a `samples` relation to the existing `Order` model. Run migration to create the table.

**Implementation plan:**
1. Add `OrderSample` model with all 9 fields (section, sampleId, description, analyte, method, lod, loq, unit, requiredDate) + orderId FK
2. Add `@@index([orderId])` for query performance
3. Add `onDelete: Cascade` to the relation
4. Add `samples OrderSample[]` relation to `Order` model
5. Run `npx prisma migrate dev --name add-order-sample-table`
6. Run `npx prisma generate` to update client

**Acceptance:**
- [x] OrderSample model created with all 9 columns
- [x] Order model has `samples` relation
- [x] Migration runs successfully
- [x] Prisma client regenerated

---

### T-002: Add ParsedSample Type + Update ParsedOrder & CreateOrderInput

**Files:** `src/lib/excel/types.ts`  
**FRs:** FR-1, FR-2  
**ACs:** AC1, AC3  
**Dependencies:** T-001  

**Description:**
Define `ParsedSample` interface for parsed Excel rows, add `samples` array and `sampleCount` to `ParsedOrder`, add `CreateSampleInput` and update `CreateOrderInput`. Update `toCreateOrderInput()` function.

**Implementation plan:**
1. Add `ParsedSample` interface with 9 fields matching Excel columns
2. Add `samples: ParsedSample[]` and `sampleCount: number` to `ParsedOrder` interface
3. Add `CreateSampleInput` type (mirrors ParsedSample but for DB input)
4. Add `samples: CreateSampleInput[]` to `CreateOrderInput`
5. Update `toCreateOrderInput()` to map samples and include sampleCount

**Acceptance:**
- [x] `ParsedSample` interface defined with all 9 fields
- [x] `ParsedOrder` has `samples` and `sampleCount`
- [x] `CreateOrderInput` has `samples` array
- [x] `toCreateOrderInput()` maps samples correctly

---

### T-003: Implement Sample Parsing Logic (Rows 10+)

**Files:** `src/lib/excel/parser.ts`  
**FRs:** FR-1  
**ACs:** AC1, AC2  
**Dependencies:** T-002  

**Description:**
Add `parseSamples()` function that reads rows 10+ from the Excel worksheet and extracts all 9 columns per row. Skip rows where Sample ID (column B) is empty.

**Implementation plan:**
1. Add `SAMPLE_START_ROW = 10` constant
2. Add `SAMPLE_COLUMN_MAP` mapping column indices to field names
3. Create `parseSamples(worksheet: XLSX.WorkSheet): ParsedSample[]` function
4. Loop from row 10 until no more data
5. For each row: read all 9 columns using existing `getCellValue()` / `getStringValue()` helpers
6. Skip row if sampleId (column B, index 1) is empty/null
7. Return `ParsedSample[]`
8. Call `parseSamples()` from `parseExcelFile()` and add results to `ParsedOrder`

**Acceptance:**
- [x] Reads all rows from row 10+
- [x] Extracts all 9 columns per row
- [x] Skips rows with empty Sample ID
- [x] Returns ParsedSample array

---

### T-004: Implement sampleCount Calculation (max .NNN)

**Files:** `src/lib/excel/parser.ts`  
**FRs:** FR-3  
**ACs:** AC4, AC8  
**Dependencies:** T-003  

**Description:**
Add `calculateSampleCount(samples: ParsedSample[]): number` function that extracts the maximum `.NNN` suffix from Sample IDs and returns it as the total sample count.

**Implementation plan:**
1. Create `calculateSampleCount(samples: ParsedSample[]): number` function
2. For each sample, extract numeric suffix from sampleId using regex `/\.(\d+)$/`
3. Track max suffix value
4. Return max value, or fallback to `samples.length` if no valid suffixes found
5. Return 0 if samples array is empty
6. Call from `parseExcelFile()` and set on `ParsedOrder.sampleCount`

**Acceptance:**
- [x] Correctly extracts max .NNN suffix
- [x] Returns 0 for empty samples array
- [x] Fallback to samples.length if no suffix pattern found

---

### T-005: Update createOrders Server Action with Sample Upsert

**Files:** `src/lib/actions/order.ts`  
**FRs:** FR-2, FR-5  
**ACs:** AC3, AC7  
**Dependencies:** T-002, T-004  

**Description:**
Update the `createOrders()` server action to handle OrderSample records within the existing transaction. For new orders: create samples. For existing orders (re-upload): delete old samples + create new. Always update sampleCount.

**Implementation plan:**
1. Update the transaction block to include sample operations
2. For new orders: after creating Order, use `prisma.orderSample.createMany()` with the samples array
3. For existing orders (update or unchanged path): 
   - `prisma.orderSample.deleteMany({ where: { orderId } })` 
   - `prisma.orderSample.createMany({ data: samples.map(s => ({ ...s, orderId })) })`
   - Update `sampleCount` on Order
4. Ensure sampleCount is included in the Order create/update data
5. Handle edge case: order with 0 samples (just delete old, don't create new)

**Acceptance:**
- [x] New orders get their samples created
- [x] Re-uploaded orders get samples replaced (delete + create)
- [x] sampleCount is stored on Order record
- [x] All operations in single transaction

---

### T-006: Update getOrders to Include sampleCount

**Files:** `src/lib/actions/order.ts`  
**FRs:** FR-4  
**ACs:** AC5, AC6  
**Dependencies:** T-001  

**Description:**
Ensure `getOrders()` and related query functions include `sampleCount` in the select/return data so UI tables can display it.

**Implementation plan:**
1. Check if `getOrders()` already returns `sampleCount` (it's on the Order model, likely already included)
2. If using select, ensure `sampleCount: true` is included
3. Verify the data flows to both `OrderWithProgress` type and `CompletedOrder` type
4. Update types if needed to include `sampleCount`

**Acceptance:**
- [x] `sampleCount` is available in the data returned to UI components

---

### T-007: Add Total Samples Column to In Progress Table

**Files:** `src/components/orders/orders-table.tsx`  
**FRs:** FR-4  
**ACs:** AC5  
**Dependencies:** T-006  

**Description:**
Add a "Total Samples" column to the In Progress orders table, positioned after "Priority" and before "Progress".

**Implementation plan:**
1. Add `sampleCount` to the `OrderWithProgress` type (if not already included)
2. Add column definition for "Total Samples" in the columns array
3. Position after Priority column
4. Display `order.sampleCount` value (simple number)
5. Enable sorting on the column

**Acceptance:**
- [x] "Total Samples" column visible in In Progress table
- [x] Shows correct sampleCount for each order
- [x] Positioned after Priority column

---

### T-008: Add Total Samples Column to Completed Table

**Files:** `src/components/orders/completed-orders-table.tsx`  
**FRs:** FR-4  
**ACs:** AC6  
**Dependencies:** T-006  

**Description:**
Add a "Total Samples" column to the Completed orders table, positioned after "Priority" and before "Completed At".

**Implementation plan:**
1. Add `sampleCount` to the `CompletedOrder` type (if not already included)
2. Add column definition for "Total Samples" in the columns array
3. Position after Priority column
4. Display `order.sampleCount` value (simple number)
5. Enable sorting on the column

**Acceptance:**
- [x] "Total Samples" column visible in Completed table
- [x] Shows correct sampleCount for each order
- [x] Positioned after Priority column

---

## 4. Implementation Order

```
Phase A — Data Layer:
  T-001 → T-002 (schema + types)

Phase B — Parser:
  T-003 → T-004 (parse samples + calculate count)

Phase C — Server:
  T-005 → T-006 (upsert + query)

Phase D — UI:
  T-007, T-008 (can be done in parallel)
```

---

## 5. Risk Register

| Risk | Task | Mitigation |
|------|------|------------|
| Migration fails on existing data | T-001 | New table, no data migration needed |
| Sample ID format varies | T-004 | Regex with fallback to row count |
| Transaction timeout with many samples | T-005 | Batch createMany, reasonable timeout |
| sampleCount not in existing queries | T-006 | Verify select includes all Order fields |

---

## 6. Test Plan

| Test | Type | Task | Priority |
|------|------|------|----------|
| ParsedSample interface matches 9 columns | Type check | T-002 | High |
| parseSamples reads correct rows | Unit | T-003 | High |
| parseSamples skips empty Sample ID rows | Unit | T-003 | High |
| calculateSampleCount returns max .NNN | Unit | T-004 | High |
| calculateSampleCount returns 0 for empty | Unit | T-004 | Medium |
| calculateSampleCount fallback to length | Unit | T-004 | Medium |
| createOrders creates samples for new order | Integration | T-005 | High |
| createOrders replaces samples on re-upload | Integration | T-005 | High |
| Total Samples column renders in UI | Component | T-007, T-008 | Medium |

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Author | AI Assistant | ✅ Done | 2026-02-11 |
| Reviewer | User | ⬜ Pending | — |
