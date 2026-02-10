# Work Description — US-1.2.7

**Prepared for Flow 2 Handoff** | 2026-02-10

---

## Overview

| Field | Value |
|-------|-------|
| **User Story ID** | US-1.2.7 |
| **Title** | Multi-Select Registered By Filter with Dedicated Lookup Table |
| **Phase** | 1 (MVP) |
| **Epic** | 1.2 (Order Dashboard) |
| **Work Type** | Feature |
| **Product Slug** | sgs-cs-helper |
| **Git Branch** | `feature/sgs-cs-helper-us-1.2.7` |
| **Status** | IN_PROGRESS |

---

## Problem Statement

Currently, the "Registered By" filter on both In Progress and Completed tabs is limited to single-select, and the filter datasource is extracted from loaded orders (In Progress tab uses `Set` extraction, Completed tab limited to max 50 per page). This creates gaps:

- Users cannot filter by multiple registrants at once
- Registrants who only appear on other pages are never discovered
- Inconsistent data sources across tabs

**Goal**: Enable multi-select "Registered By" filtering backed by a dedicated `Registrant` lookup table populated during Excel upload, seeded from existing orders.

---

## Scope (What is Included)

### 1. Database Schema
- **New Prisma model**: `Registrant` with `name String @unique`
- Ensures complete data source independent of pagination or tab state

### 2. Data Population
- **During Excel upload**: Extract unique `registeredBy` values and insert into `Registrant` table (upsert)
- **Seed/migration script**: Populate `Registrant` from existing `Order.registeredBy`
  - Query: `SELECT DISTINCT registeredBy FROM "Order" WHERE registeredBy IS NOT NULL`

### 3. API/Server Action
- Fetch all registrants from `Registrant` table (replaces client-side `Set` extraction)
- Use this as the authoritative datasource for filter dropdowns

### 4. UI Updates
- **In Progress tab**: Change "Registered By" filter to multi-select
- **Completed tab**: Change "Registered By" filter to multi-select (same component reuse)
- Multi-select UI shows selected count badge (e.g., "2 selected")
- Support clearing all or individual selections

### 5. Filter Logic
- **Operator**: OR (show orders matching ANY selected registrant)
- **In Progress tab**: Client-side filter logic updated to support array `registeredBy: string[]`
- **Completed tab**: Server-side query updated to support array `registeredBy: string[]` (Prisma `in` clause)

### 6. Type Updates
- Update `OrderFilters` type: `registeredBy: string` → `registeredBy: string[]`

---

## Acceptance Criteria (from User Story)

✅ **AC1**: New Prisma model `Registrant` with `name String @unique`  
✅ **AC2**: During Excel upload (upsert flow), extract unique `registeredBy` and insert into `Registrant`  
✅ **AC3**: Seed/migration script to populate `Registrant` from existing `Order.registeredBy`  
✅ **AC4**: API endpoint or Server Action to fetch all registrants from `Registrant` table  
✅ **AC5**: "Registered By" filter on In Progress tab → multi-select  
✅ **AC6**: "Registered By" filter on Completed tab → multi-select  
✅ **AC7**: Filter logic: multiple registrants → OR logic (match ANY)  
✅ **AC8**: Multi-select UI shows selected count badge, clear options  
✅ **AC9**: `OrderFilters` type updated: `registeredBy: string` → `registeredBy: string[]`  
✅ **AC10**: Completed tab server-side query supports `registeredBy` as array  
✅ **AC11**: In Progress tab client-side filter supports `registeredBy` as array  

---

## Non-Goals (What is NOT Included)

- Changes to other filters (Required Date, Status, etc.)
- Changes to order list sorting
- Changes to pagination or page size
- New filter components for other fields
- Performance optimization beyond current scope

---

## Dependencies Already Satisfied

| Dependency | Status | Details |
|------------|--------|---------|
| **US-1.2.6** (Show Registered By, Filter/Sort) | ✅ DONE | Multi-select builds on existing single-select implementation |
| **US-1.2.1** (Order Dashboard) | ✅ DONE | Dashboard UI foundation exists |
| **US-1.1.3** (Store Order with Upsert) | ✅ DONE | Order upsert logic available for extension |
| **Database schema** | ✅ DONE | Prisma client and migrations available |

---

## Technical Hints

### Database Schema
```prisma
model Registrant {
  id    String @id @default(cuid())
  name  String @unique
  createdAt DateTime @default(now())
}
```

### Seed Logic
```sql
SELECT DISTINCT registeredBy 
FROM "Order" 
WHERE registeredBy IS NOT NULL
ORDER BY registeredBy
```

### UI Pattern
- Use shadcn `Popover` + `Command` (combobox) or similar multi-select component
- Maintain consistency with existing filter UI

### Prisma Query (Completed Tab)
```typescript
registeredBy: filters.registeredBy?.length > 0 ? { in: filters.registeredBy } : undefined
```

---

## Next Steps (Flow 2)

1. **Phase 0 (Analysis & Design)**
   - Review acceptance criteria in detail
   - Design data flow: upload → upsert → seed → API
   - Create sequence diagrams if needed

2. **Phase 1 (Specification)**
   - Define exact API/Server Action contract
   - Specify filter UI component behavior
   - Document type changes

3. **Phase 2 (Task Planning)**
   - Break down into tasks: schema, seed, API, UI, tests
   - Identify cross-component dependencies

4. **Phase 3 (Implementation)**
   - Implement per task with code review

5. **Phase 4 (Testing)**
   - Unit tests for seed/API logic
   - Integration tests for multi-select behavior

6. **Phase 5 (Done Check)**
   - Verify all ACs met
   - Performance check

---

## Handoff Summary

✅ **Git branch created**: `feature/sgs-cs-helper-us-1.2.7`  
✅ **Checklist updated**: US-1.2.7 status changed to IN_PROGRESS  
✅ **Workflow path**: `/Users/trucle/Desktop/project/sgs-cs-helper/docs/runs/feature-sgs-cs-helper-us-1.2.7/`  
✅ **State file created**: `.workflow-state.yaml`  
✅ **Ready for Flow 2**: `/work-intake`

---

**Ready to proceed?** Say `approved` to enter Flow 2, or `revise` if changes are needed.
