# Task Plan — Multi-Select Registered By Filter with Dedicated Lookup Table
# Kế hoạch Task — Bộ lọc Multi-Select Registered By có Bảng tra cứu chuyên dụng

**Phase**: 2 — Task Planning | **US**: US-1.2.7 | **Branch**: feature/sgs-cs-helper-us-1.2.7

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| **Feature** | Multi-Select Registered By Filter + Dedicated Lookup Table |
| **Specification** | [spec.md](../01_spec/spec.md) |
| **Total Tasks** | 10 |
| **Estimated Effort** | **12-16 hours** |
| **Affected Roots** | sgs-cs-helper (1 root) |
| **Parallel Groups** | 2 groups (some tasks can run in parallel) |
| **Test Plan** | Included (7.1 Test Strategy + 7.2 Test Cases) |
| **Dev Mode** | Standard (tests written in Phase 4) |
| **Critical Path** | T-001 → T-002 → T-003 → T-004 → T-006 → T-008 (6 tasks, ~9-11h) |

---

## 1. Task Overview / Tổng quan Task

| ID | Title | Root | Dependencies | Est | Category |
|----|-------|------|--------------|-----|----------|
| **T-001** | Create Registrant Prisma Model | sgs-cs-helper | - | **S** | Schema |
| **T-002** | Create Prisma Migration | sgs-cs-helper | T-001 | **S** | Schema |
| **T-003** | Create Seed Script for Registrants | sgs-cs-helper | T-001, T-002 | **M** | Data |
| **T-004** | Create fetchRegistrants Server Action | sgs-cs-helper | T-001, T-002 | **M** | API |
| **T-005** | Update OrderFilters Type to Array | sgs-cs-helper | - | **S** | Types |
| **T-006** | Update useOrderControls Filter Logic (OR) | sgs-cs-helper | T-005 | **M** | Logic |
| **T-007** | Update Excel Upload to Upsert Registrants | sgs-cs-helper | T-001, T-002 | **M** | Integration |
| **T-008** | Upgrade Multi-Select Filter Component | sgs-cs-helper | T-004, T-005, T-006 | **L** | UI |
| **T-009** | Update Completed Orders Server Query | sgs-cs-helper | T-005, T-006 | **M** | Query |
| **T-010** | Integration & Cross-Tab Testing | sgs-cs-helper | T-008, T-009 | **M** | Testing |

---

## 2. Dependency Graph / Đồ thị Phụ thuộc

```
Schema Layer (Critical Path):
T-001 (Registrant Model)
  ├─→ T-002 (Migration)
  │     └─→ T-003 (Seed Script)
  │
  └─→ T-004 (Server Action)
  └─→ T-007 (Excel Integration)

Types & Logic:
T-005 (OrderFilters Type)
  ├─→ T-006 (useOrderControls Logic)
  │     └─→ T-009 (Server Query)
  └─→ T-008 (Filter Component)

UI Integration:
T-004, T-005, T-006 → T-008 (Multi-Select UI)
T-008, T-009 → T-010 (Integration Testing)

[Parallel Groups]
- Group A: T-001, T-005 (no dependencies, can run in parallel)
- Group B: T-002, T-003 after T-001 (depend on same task, different files)
- Group C: T-004, T-006, T-007 (depends on T-001/T-002, different implementations)
```

---

## 3. Parallel Execution Opportunities / Cơ hội Thực thi Song song

### 3.1 Parallel Groups

**Group A — Initialization (can start immediately)**
- **T-001**: Create Registrant Model
- **T-005**: Update OrderFilters Type
- **Reason**: No dependencies, modify different files

**Group B — Schema & Types (depends on Group A)**
- **T-002**: Prisma Migration
- **T-006**: Update Filter Logic
- **Reason**: Both depend on A (T-001 + T-005), modify different files

**Group C — Implementation (depends on T-002 + T-005)**
- **T-004**: Server Action
- **T-007**: Excel Integration
- **Reason**: Both depend on schema completion, modify different files

**Group D — UI (depends on T-004 + T-006)**
- **T-008**: Multi-Select Component
- **Reason**: Needs both API and type definitions

**Group E — Finalization (depends on T-008 + T-006)**
- **T-003**: Seed Script
- **T-009**: Server Query
- **Reason**: T-003 needs finalized types (T-005 complete), T-009 needs logic (T-006)

### 3.2 Sequential Constraints

| Constraint | Reason |
|-----------|--------|
| T-001 before T-002 | Migration depends on model definition |
| T-002 before T-003 | Seed script needs schema to exist |
| T-004 before T-008 | Component needs API available |
| T-005 before T-006 | Logic depends on updated type |
| T-006 before T-008 | UI needs both API (T-004) and logic (T-006) |
| T-008, T-009 before T-010 | Integration testing requires both tabs complete |

### 3.3 Recommended Execution Order

```
Phase 2a (Day 1, 2-3 hours):
- T-001: Create Registrant Model (0.5h) [PARALLEL: start T-005]
- T-005: Update OrderFilters Type (0.5h)

Phase 2b (Day 1, 2-3 hours):
- T-002: Create Migration (0.5h)
- T-006: Update Filter Logic (1.5h) [PARALLEL: start T-004, T-007]

Phase 2c (Day 2, 3-4 hours):
- T-004: Server Action (1h)
- T-007: Excel Integration (1.5h)
- T-003: Seed Script (1.5h)

Phase 2d (Day 2-3, 3-4 hours):
- T-008: Multi-Select UI Component (2h)
- T-009: Server Query Update (1h)

Phase 2e (Day 3, 2 hours):
- T-010: Integration & Testing (2h)
```

---

## 4. Tasks by Root / Task theo Root

### Root: sgs-cs-helper

---

#### **T-001: Create Registrant Prisma Model**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Schema / Database |
| **Dependencies** | None |
| **Estimate** | **S** (30 minutes) |
| **Requirements** | FR-001 |
| **Parallel** | ✅ Can run with T-005 |

**Description / Mô tả:**

**🇻🇳** Thêm mô hình Prisma `Registrant` vào `prisma/schema.prisma`. Mô hình phải có ba trường:
- `id` (cuid, khóa chính)
- `name` (String, unique constraint)
- `createdAt` (DateTime, default now)

Thêm index trên trường `name` để tìm kiếm nhanh.

**🇬🇧** Add the Prisma `Registrant` model to `prisma/schema.prisma`. The model must have three fields:
- `id` (cuid, primary key)
- `name` (String, unique constraint)
- `createdAt` (DateTime, default now)

Add index on `name` field for fast lookups.

**Files to Change / File Thay đổi:**
- **Modify**: `prisma/schema.prisma`
  - Add `Registrant` model after `Order` model
  - Include unique constraint and index

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC1.1**: `Registrant` model added to schema.prisma
- [ ] **DC1.2**: Model has `id` (cuid), `name` (String @unique), `createdAt` fields
- [ ] **DC1.3**: Index on `name` field for performance
- [ ] **DC1.4**: Schema validates (no syntax errors)
- [ ] **DC1.5**: No other models modified

**Code to Add:**
```prisma
model Registrant {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  @@index([name])
}
```

**Verification / Kiểm tra:**
```bash
# Verify schema syntax
pnpm prisma validate

# Check generated types
pnpm prisma generate
```

---

#### **T-002: Create Prisma Migration**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Database / Migration |
| **Dependencies** | T-001 |
| **Estimate** | **S** (20 minutes) |
| **Requirements** | FR-001 |

**Description / Mô tả:**

**🇻🇳** Tạo migration Prisma mới cho mô hình `Registrant`. Migration này sẽ tạo bảng `Registrant` trong cơ sở dữ liệu với các cột và ràng buộc thích hợp.

**🇬🇧** Create a new Prisma migration for the `Registrant` model. This migration will create the `Registrant` table in the database with appropriate columns and constraints.

**Files to Change / File Thay đổi:**
- **Create**: `prisma/migrations/<timestamp>_add_registrant_model/migration.sql`
  - Generated by Prisma, contains SQL to create table

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC2.1**: Migration file created with correct timestamp
- [ ] **DC2.2**: Migration SQL includes CREATE TABLE Registrant
- [ ] **DC2.3**: Unique constraint on name column
- [ ] **DC2.4**: Index on name column
- [ ] **DC2.5**: migration_lock.toml updated

**Commands to Run:**
```bash
# Create migration (interactive, review changes)
pnpm prisma migrate dev --name add_registrant_model

# Verify migration created
ls -la prisma/migrations/ | grep registrant
```

**Verification / Kiểm tra:**
```bash
# Check schema.prisma matches database
pnpm prisma db validate

# Verify Registrant table exists
pnpm prisma db execute --stdin
  \dt "Registrant"
```

---

#### **T-003: Create Seed Script for Registrants**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Data / Database |
| **Dependencies** | T-001, T-002 |
| **Estimate** | **M** (1-1.5 hours) |
| **Requirements** | FR-002 |

**Description / Mó tả:**

**🇻🇳** Cập nhật `prisma/seed.ts` để backfill bảng `Registrant` với tất cả giá trị `registeredBy` độc nhất từ bảng `Order` hiện có. Seed script sẽ:
1. Truy vấn tất cả Order với registeredBy không null
2. Trích xuất giá trị độc nhất
3. Upsert mỗi giá trị vào bảng Registrant
4. Ghi log tiến trình

**🇬🇧** Update `prisma/seed.ts` to backfill the `Registrant` table with all unique `registeredBy` values from the existing `Order` table. Seed script will:
1. Query all Orders with non-null registeredBy
2. Extract unique values
3. Upsert each value into Registrant table
4. Log progress

**Files to Change / File Thay đổi:**
- **Modify**: `prisma/seed.ts`
  - Add async function to fetch unique Order.registeredBy values
  - Add upsert loop for each registrant
  - Integrate with existing seed flow

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC3.1**: Seed script queries Order.registeredBy DISTINCT
- [ ] **DC3.2**: Filters out NULL values
- [ ] **DC3.3**: Uses upsert pattern (idempotent)
- [ ] **DC3.4**: Completes in < 5 seconds for 1000+ orders
- [ ] **DC3.5**: Includes error handling and logging
- [ ] **DC3.6**: Can be run multiple times safely

**Implementation Notes:**
```typescript
// Pseudo-code pattern
const registrants = await prisma.order.findMany({
  distinct: ['registeredBy'],
  where: { registeredBy: { not: null } },
  select: { registeredBy: true }
});

for (const { registeredBy } of registrants) {
  if (registeredBy && registeredBy.trim().length > 0) {
    await prisma.registrant.upsert({
      where: { name: registeredBy },
      update: {},
      create: { name: registeredBy }
    });
  }
}
```

**Verification / Kiểm tra:**
```bash
# Run seed script
pnpm prisma db seed

# Check results
pnpm prisma studio
  # Navigate to Registrant table, verify count matches Order.registeredBy uniques

# Verify idempotence (run twice)
pnpm prisma db seed
# Should complete without errors
```

---

#### **T-004: Create fetchRegistrants Server Action**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | API / Server Action |
| **Dependencies** | T-001, T-002 |
| **Estimate** | **M** (1-1.5 hours) |
| **Requirements** | FR-004, NFR-001, NFR-003 |

**Description / Mó tả:**

**🇻🇳** Tạo Server Action `fetchRegistrants()` trong `src/lib/actions/order.ts` để lấy tất cả tên người đăng ký từ bảng `Registrant`, được sắp xếp theo tên. Action này được gọi từ thành phần filter để điền danh sách dropdown.

**🇬🇧** Create a Server Action `fetchRegistrants()` in `src/lib/actions/order.ts` to fetch all registrant names from the `Registrant` table, sorted by name. This action is called from the filter component to populate the dropdown list.

**Files to Change / File Thay đổi:**
- **Modify**: `src/lib/actions/order.ts`
  - Add `fetchRegistrants` async Server Action
  - Include auth check and error handling
  - Return typed `string[]`

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC4.1**: Server Action exported from order.ts
- [ ] **DC4.2**: Type-safe with proper TypeScript signatures
- [ ] **DC4.3**: Returns `string[]` sorted alphabetically (case-insensitive)
- [ ] **DC4.4**: Filters out NULL and empty strings
- [ ] **DC4.5**: Response time < 200ms for 1000+ registrants
- [ ] **DC4.6**: Includes auth check (requires user session)
- [ ] **DC4.7**: Proper error handling

**Code Template:**
```typescript
export async function fetchRegistrants(): Promise<string[]> {
  try {
    // Check auth
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }
    
    // Fetch registrants
    const registrants = await prisma.registrant.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });
    
    return registrants.map(r => r.name);
  } catch (error) {
    console.error('fetchRegistrants error:', error);
    throw error;
  }
}
```

**Verification / Kiểm gia:**
```bash
# Test in development
curl "http://localhost:3000/api/test-server-action" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"fetchRegistrants"}'

# Should return: ["Alice Johnson", "Bob Smith", ...]
```

---

#### **T-005: Update OrderFilters Type to Support Array**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Types / Interfaces |
| **Dependencies** | None |
| **Estimate** | **S** (30 minutes) |
| **Requirements** | FR-006 |
| **Parallel** | ✅ Can run with T-001 |

**Description / Mó tả:**

**🇻🇳** Cập nhật giao diện `OrderFilters` để thay đổi `registeredBy` từ `string` (giá trị duy nhất) thành `string[]` (mảng giá trị). Cập nhật giá trị mặc định `DEFAULT_FILTERS` để khởi tạo `registeredBy` thành mảng rỗng.

**🇬🇧** Update the `OrderFilters` interface to change `registeredBy` from `string` (single value) to `string[]` (array of values). Update the `DEFAULT_FILTERS` default value to initialize `registeredBy` as an empty array.

**Files to Change / File Thay đổi:**
- **Modify**: `src/types/orders.ts` or `src/components/orders/order-filters.tsx`
  - Update `OrderFilters` interface
  - Update `DEFAULT_FILTERS` constant

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC5.1**: `registeredBy: string[]` in OrderFilters interface
- [ ] **DC5.2**: `DEFAULT_FILTERS.registeredBy = []` (empty array)
- [ ] **DC5.3**: TypeScript compiles without errors
- [ ] **DC5.4**: No unexpected type errors in dependent files (will be fixed in T-006)
- [ ] **DC5.5**: Types are properly exported for use in components

**Code Changes:**
```typescript
// Before
export interface OrderFilters {
  registeredBy: string;
  requiredDateFrom: string;
  requiredDateTo: string;
}

// After
export interface OrderFilters {
  registeredBy: string[];  // Changed: string → string[]
  requiredDateFrom: string;
  requiredDateTo: string;
}

// Update default
export const DEFAULT_FILTERS: OrderFilters = {
  registeredBy: [],  // Changed: '' → []
  requiredDateFrom: '',
  requiredDateTo: ''
};
```

**Verification / Kiểm tra:**
```bash
# Check TypeScript errors (expected: consuming components need updates)
pnpm tsc --noEmit

# Verify type definition
grep -n "registeredBy: string\[\]" src/types/orders.ts
```

---

#### **T-006: Update useOrderControls Filter Logic (OR Logic)**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Business Logic / Hooks |
| **Dependencies** | T-005 |
| **Estimate** | **M** (1-1.5 hours) |
| **Requirements** | FR-007, NFR-001, NFR-004 |

**Description / Mó tả:**

**🇻🇳** Cập nhật logic lọc trong hook `useOrderControls` từ single-value matching thành array-based matching với logic OR. Khi `filters.registeredBy` là mảng:
- Nếu mảng trống: không áp dụng lọc (hiển thị tất cả)
- Nếu mảng có giá trị: chỉ hiển thị đơn hàng có `registeredBy` khớp với BẤT KỲ giá trị nào trong mảng

**🇬🇧** Update the filter logic in `useOrderControls` hook from single-value matching to array-based matching with OR logic. When `filters.registeredBy` is an array:
- If empty: apply no filter (show all)
- If has values: show orders where registeredBy matches ANY value in array

**Files to Change / File Thay đổi:**
- **Modify**: `src/hooks/use-order-controls.ts`
  - Update `processOrders` function
  - Change filter condition from `===` to `includes()`

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC6.1**: Empty array `registeredBy: []` shows all orders (no filter)
- [ ] **DC6.2**: Non-empty array applies OR logic: `registeredBy.includes(order.registeredBy)`
- [ ] **DC6.3**: NULL/undefined `order.registeredBy` not matched (unless filter empty)
- [ ] **DC6.4**: Date range filters still apply (AND logic with registrant)
- [ ] **DC6.5**: Search still applies (AND logic)
- [ ] **DC6.6**: Performance remains < 100ms for 1000 orders
- [ ] **DC6.7**: Logic is clearly commented

**Code Changes:**
```typescript
// Before
if (filters.registeredBy) {
  result = result.filter(
    (order) => order.registeredBy === filters.registeredBy
  );
}

// After
if (filters.registeredBy.length > 0) {
  result = result.filter(order => 
    filters.registeredBy.includes(order.registeredBy)
  );
}
// If empty array, no filtering applied (show all)
```

**Verification / Kiểm tra:**
```bash
# Run type check
pnpm tsc --noEmit

# Check logic in unit tests
pnpm vitest src/hooks/use-order-controls.test.ts
```

---

#### **T-007: Update Excel Upload to Upsert Registrants**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Integration / Data Flow |
| **Dependencies** | T-001, T-002 |
| **Estimate** | **M** (1.5-2 hours) |
| **Requirements** | FR-003, NFR-002 |

**Description / Mó tả:**

**🇻🇳** Cập nhật Server Action `createOrders` trong `src/lib/actions/order.ts` để tự động upsert các giá trị `registeredBy` độc nhất vào bảng `Registrant` trong cùng một transaction. Điều này đảm bảo rằng:
1. Bảng `Registrant` được giữ cập nhật khi có đơn hàng mới
2. Upsert là idempotent (an toàn nếu chạy nhiều lần)
3. Nếu upsert registrant thất bại, toàn bộ tạo đơn hàng được rollback

**🇬🇧** Update the `createOrders` Server Action in `src/lib/actions/order.ts` to automatically upsert unique `registeredBy` values into the `Registrant` table within the same transaction. This ensures:
1. `Registrant` table stays up-to-date as new orders are added
2. Upsert is idempotent (safe to run multiple times)
3. If registrant upsert fails, entire order creation rolls back

**Files to Change / File Thay đổi:**
- **Modify**: `src/lib/actions/order.ts`
  - In `createOrders`, extract unique registeredBy values before order creation
  - Add Registrant upsert loop within transaction
  - Wrap in try-catch with appropriate error handling

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC7.1**: Excel parser extracts `registeredBy` from each row
- [ ] **DC7.2**: Unique registrant names extracted (Set deduplication)
- [ ] **DC7.3**: Registrant upsert happens in same transaction as orders
- [ ] **DC7.4**: If registrant upsert fails, order creation rolled back
- [ ] **DC7.5**: NULL and empty string `registeredBy` values skipped
- [ ] **DC7.6**: New registrants appear in filter dropdown within 2 seconds
- [ ] **DC7.7**: Idempotent (safe to re-run)

**Implementation Pattern:**
```typescript
export async function createOrders(input: CreateOrderInput[]) {
  return prisma.$transaction(async (tx) => {
    // 1. Extract unique registeredBy values
    const registrantNames = [...new Set(
      input
        .map(o => o.registeredBy)
        .filter(r => r && r.trim().length > 0)
    )];
    
    // 2. Upsert each into Registrant table
    for (const name of registrantNames) {
      await tx.registrant.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    
    // 3. Create/update orders (existing logic)
    // ... rest of order creation logic
  });
}
```

**Verification / Kiểm tra:**
```bash
# Upload test Excel file with new registrants
curl -F "file=@test.xlsx" http://localhost:3000/api/orders/upload

# Check Registrant table populated
pnpm prisma studio
# Registrant table should have new entries
```

---

#### **T-008: Upgrade Multi-Select Filter Component**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | UI / Components |
| **Dependencies** | T-004, T-005, T-006 |
| **Estimate** | **L** (2-2.5 hours) |
| **Requirements** | FR-005, NFR-004, NFR-005 |

**Description / Mó tả:**

**🇻🇳** Nâng cấp thành phần `OrderFiltersComponent` từ single-select dropdown thành multi-select sử dụng Popover + Command pattern từ shadcn/ui. Thành phần phải:
1. Hiển thị nút trigger với count badge ("2 selected" hoặc "Registered By")
2. Mở popover với Command component cho danh sách searchable
3. Hiển thị checkbox cho mỗi registrant (checked/unchecked)
4. Cho phép người dùng gõ để lọc danh sách
5. Hiển thị badges cho các lựa chọn đã chọn
6. Cho phép xóa từng lựa chọn hoặc tất cả

**🇬🇧** Upgrade `OrderFiltersComponent` from single-select dropdown to multi-select using Popover + Command pattern from shadcn/ui. Component must:
1. Display trigger button with count badge ("2 selected" or "Registered By")
2. Open popover with Command component for searchable list
3. Show checkbox for each registrant (checked/unchecked)
4. Allow user to type to filter list
5. Display badges for selected choices
6. Allow clearing individual or all selections

**Files to Change / File Thay đổi:**
- **Modify**: `src/components/orders/order-filters.tsx`
  - Import Popover, Command, Badge from shadcn/ui
  - Rewrite registeredBy select to Popover + Command
  - Add checkbox rendering
  - Add badge display and clear logic

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC8.1**: Popover trigger button displays count badge
- [ ] **DC8.2**: Popover opens on button click
- [ ] **DC8.3**: Command component renders with search input
- [ ] **DC8.4**: Registrants fetch via `fetchRegistrants()` on mount
- [ ] **DC8.5**: Checkboxes render for each registrant
- [ ] **DC8.6**: Typing filters list (case-insensitive)
- [ ] **DC8.7**: Selected registrants display as dismissible badges
- [ ] **DC8.8**: Badge X button removes selection
- [ ] **DC8.9**: Escape key closes popover without changes
- [ ] **DC8.10**: Component responsive (mobile, tablet, desktop)
- [ ] **DC8.11**: Loading state while fetching registrants
- [ ] **DC8.12**: Accessibility: ARIA labels, keyboard navigation

**UI Structure Reference:**
```
Trigger Button: "2 selected" | "Registered By"
                        ↓ (click)
          ┌─────────────────────────┐
          │ 🔍 [Search input]       │
          ├─────────────────────────┤
          │ ☐ Alice Johnson         │
          │ ☑ Bob Smith             │
          │ ☐ Carol Williams        │
          │ ☑ David Lee             │
          │ ... (scrollable)        │
          └─────────────────────────┘

Selected Badges: [Bob Smith ✕] [David Lee ✕]
```

**Verification / Kiểm tra:**
```bash
# Visual check in browser
npm run dev
# Open dashboard, verify filter UI

# Check component renders without errors
pnpm tsc --noEmit

# Run E2E test for multi-select interaction
pnpm e2e:ui --filter="multi-select"
```

---

#### **T-009: Update Completed Orders Server-Side Query**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Query / Database |
| **Dependencies** | T-005, T-006 |
| **Estimate** | **M** (1-1.5 hours) |
| **Requirements** | FR-008, NFR-001 |

**Description / Mó tả:**

**🇻🇳** Cập nhật truy vấn server-side trong thành phần `CompletedOrders` để áp dụng bộ lọc `registeredBy` dưới dạng mảng tại cơ sở dữ liệu. Sử dụng mệnh đề `where: { registeredBy: { in: [...] } }` để lọc server-side thay vì client-side.

**🇬🇧** Update the server-side query in the `CompletedOrders` component to apply the `registeredBy` filter as an array at the database level. Use `where: { registeredBy: { in: [...] } }` clause to filter server-side instead of client-side.

**Files to Change / File Thay đổi:**
- **Modify**: `src/components/orders/completed-orders.tsx`
  - Update Prisma query to use `in` operator
  - Call `fetchRegistrants()` to populate dropdown
  - Remove Set-based extraction logic

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC9.1**: Prisma query includes `where` clause for registeredBy
- [ ] **DC9.2**: Uses `in` operator for array: `{ in: filters.registeredBy }`
- [ ] **DC9.3**: Query skips filter if array empty (no modification to WHERE)
- [ ] **DC9.4**: Pagination still works with filters applied
- [ ] **DC9.5**: Query performance remains < 500ms for 1000+ records
- [ ] **DC9.6**: Removes Set extraction logic from component
- [ ] **DC9.7**: Calls `fetchRegistrants()` to get dropdown options

**Code Pattern:**
```typescript
const orders = await prisma.order.findMany({
  where: {
    status: 'COMPLETED',
    ...(filters.registeredBy.length > 0 && {
      registeredBy: { in: filters.registeredBy }
    }),
    // ... other filters (date range, etc.)
  },
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE,
  orderBy: { completedAt: 'desc' }
});
```

**Verification / Kiểm tra:**
```bash
# Check query generates correct SQL
# Enable Prisma query logging in development
export DEBUG=prisma:query
npm run dev

# Select multiple registrants in Completed tab
# Verify SQL shows WHERE registeredBy IN (...)

# Check performance
# With 1000+ records, query should complete in < 500ms
```

---

#### **T-010: Integration & Cross-Tab Testing**

| Aspect | Detail |
|--------|--------|
| **Root** | sgs-cs-helper |
| **Category** | Testing / Integration |
| **Dependencies** | T-008, T-009 |
| **Estimate** | **M** (1.5-2 hours) |
| **Requirements** | All FRs, cross-tab consistency |

**Description / Mó tả:**

**🇻🇳** Thực hiện kiểm thử tích hợp để xác minh rằng:
1. Cả hai tab (In Progress & Completed) hiển thị cùng danh sách registrant
2. Multi-select filter hoạt động nhất quán trên cả hai tab
3. OR logic được áp dụng chính xác
4. Dữ liệu seed được tải chính xác khi ứng dụng khởi động
5. Dữ liệu Excel upload tạo registrant mới được hiển thị ngay lập tức

**🇬🇧** Perform integration testing to verify:
1. Both tabs (In Progress & Completed) show the same registrant list
2. Multi-select filter works consistently across both tabs
3. OR logic is applied correctly
4. Seeded data loads correctly on app startup
5. Excel upload creates new registrants visible immediately

**Files to Check / File Kiểm tra:**
- `src/components/orders/realtime-orders.tsx`
- `src/components/orders/completed-orders.tsx`
- `src/components/orders/order-filters.tsx`
- `src/lib/actions/order.ts`

**Done Criteria / Tiêu chí Hoàn thành:**
- [ ] **DC10.1**: Both tabs call `fetchRegistrants()` on mount
- [ ] **DC10.2**: Both tabs display identical registrant lists
- [ ] **DC10.3**: Selecting registrant in In Progress shows correct orders
- [ ] **DC10.4**: Selecting registrant in Completed shows correct orders
- [ ] **DC10.5**: Clearing filter shows all orders in both tabs
- [ ] **DC10.6**: Multiple selection works in both tabs
- [ ] **DC10.7**: Filter state persists while navigating between tabs
- [ ] **DC10.8**: Seed script runs successfully on fresh database
- [ ] **DC10.9**: Excel upload with new registrants updates filter immediately
- [ ] **DC10.10**: No console errors or warnings

**Test Scenarios:**
1. **Scenario 1**: Fresh database after seed
   - Seed script runs
   - Dashboard loads
   - All registrants from seed appear in filter
   
2. **Scenario 2**: Multi-select filter
   - Select "Alice" and "Bob"
   - In Progress shows orders from Alice OR Bob
   - Completed shows orders from Alice OR Bob
   - Same results on both tabs
   
3. **Scenario 3**: Excel upload
   - Upload Excel with new registrant "Charlie"
   - "Charlie" appears in filter dropdown
   - Can immediately select and filter by "Charlie"
   
4. **Scenario 4**: Edge cases
   - Select zero registrants: show all
   - Select all registrants: show all
   - Clear filters: show all
   - Cross-tab consistency maintained

**Verification / Kiểm tra:**
```bash
# Run integration tests
pnpm vitest src/components/orders/__tests__/integration.test.ts

# Manual testing
npm run dev
# 1. Verify seed data appears in filter
# 2. Select multiple registrants
# 3. Check both tabs show filtered results
# 4. Upload test Excel with new registrant
# 5. Verify new registrant appears immediately
# 6. Switch tabs and verify consistency
```

---

## 5. Requirements Coverage / Độ phủ Yêu cầu

### Functional Requirements Mapping

| Requirement | Tasks | Status |
|-------------|-------|--------|
| **FR-001**: Create Registrant Model | T-001 | ✅ |
| **FR-002**: Seed Existing Registrants | T-003 | ✅ |
| **FR-003**: Populate During Upload | T-007 | ✅ |
| **FR-004**: Server Action fetchRegistrants | T-004 | ✅ |
| **FR-005**: Multi-Select Filter UI | T-008 | ✅ |
| **FR-006**: Update OrderFilters Type | T-005 | ✅ |
| **FR-007**: Client-Side Filter Logic | T-006 | ✅ |
| **FR-008**: Server-Side Filter Logic | T-009 | ✅ |

**Coverage**: ✅ 100% (all 8 FRs have tasks)

### Non-Functional Requirements Mapping

| Requirement | Tasks | Coverage |
|-------------|-------|----------|
| **NFR-001**: Performance | T-004, T-006, T-009 | ✅ Verified in task criteria |
| **NFR-002**: Reliability & Data Integrity | T-003, T-007, T-010 | ✅ Tested in integration |
| **NFR-003**: Security & Authorization | T-004, T-008 | ✅ Auth check in SA + UI |
| **NFR-004**: Maintainability & Code Quality | T-005, T-006, T-008 | ✅ Code review in Phase 3 |
| **NFR-005**: Compatibility | T-008, T-010 | ✅ Responsive testing |

**Coverage**: ✅ 100% (all 5 NFRs addressed)

---

## 6. Risk Assessment / Đánh giá Rủi ro

| Task | Risk | Probability | Mitigation |
|------|------|-------------|-----------|
| **T-003** | Seed script slow with 100k+ orders | Medium | Batch inserts, test with prod-like data |
| **T-004** | Server Action timeout on large dataset | Low | Implement caching, pagination if needed |
| **T-005** | Breaking TypeScript changes | High | Update all consuming files in same PR |
| **T-007** | Transaction rollback on registrant upsert failure | Low | Test transaction semantics thoroughly |
| **T-008** | Popover/Command accessibility issues | Low | Use existing shadcn/ui components (tested) |
| **T-009** | Query performance with large in() clause | Low | Test with 100+ registrants |
| **T-010** | Flaky integration tests | Medium | Use proper async/await, wait for data load |

---

## 7. Test Plan / Kế hoạch Kiểm thử

### 7.1 Test Strategy / Chiến lược Kiểm thử

**Development Mode**: Standard (tests written in Phase 4 after implementation)

**Test Coverage Targets**:
- **Unit Tests**: 80% coverage for logic functions
- **Integration Tests**: All cross-component interactions
- **E2E Tests**: Critical user workflows
- **Visual Tests**: Responsive design on mobile/tablet/desktop

**Testing Approach**:
- **Unit**: Vitest + React Testing Library for components
- **Integration**: Vitest with mocked Prisma for data layer
- **E2E**: Playwright for critical user workflows
- **Visual**: Manual testing + screenshot comparison

---

### 7.2 Test Cases by Task / Trường hợp Kiểm thử theo Task

| TC ID | Task | Test Description | Type | Expected Result |
|-------|------|------------------|------|-----------------|
| **TC-001** | T-001 | Registrant model has required fields | Unit | Schema validates, types compile |
| **TC-002** | T-001 | Unique constraint on name | Unit | Duplicate insert rejected |
| **TC-003** | T-002 | Migration creates table | Integration | Table exists in database |
| **TC-004** | T-002 | Rollback reverses changes | Integration | Table removed on rollback |
| **TC-005** | T-003 | Seed extracts unique registrants | Unit | Correct count of unique names |
| **TC-006** | T-003 | Seed upsert is idempotent | Integration | Running twice produces same result |
| **TC-007** | T-003 | Seed handles NULL values | Unit | NULL and empty strings skipped |
| **TC-008** | T-003 | Seed completes in < 5 seconds | Performance | 1000+ orders seed in < 5s |
| **TC-009** | T-004 | fetchRegistrants returns sorted array | Unit | Array sorted alphabetically |
| **TC-010** | T-004 | fetchRegistrants filters NULL | Unit | No NULL values in result |
| **TC-011** | T-004 | fetchRegistrants auth check | Unit | Unauthorized user gets error |
| **TC-012** | T-004 | fetchRegistrants performance | Performance | < 200ms for 1000+ registrants |
| **TC-013** | T-005 | OrderFilters type accepts array | Unit | `registeredBy: string[]` compiles |
| **TC-014** | T-005 | DEFAULT_FILTERS initializes empty | Unit | `registeredBy: []` in default |
| **TC-015** | T-006 | Empty array shows all orders | Unit | Filter not applied when empty |
| **TC-016** | T-006 | Non-empty array uses OR logic | Unit | `includes()` returns correct results |
| **TC-017** | T-006 | NULL registeredBy not matched | Unit | NULL values excluded |
| **TC-018** | T-006 | Date + registrant filters combine | Unit | AND logic: both filters apply |
| **TC-019** | T-007 | Excel upsert creates registrants | Integration | New registrants in table |
| **TC-020** | T-007 | Transaction rollback on failure | Integration | No partial data on error |
| **TC-021** | T-007 | Upsert is idempotent | Integration | Same result on re-run |
| **TC-022** | T-008 | Popover trigger renders count | Component | Badge shows "N selected" |
| **TC-023** | T-008 | Popover opens/closes | Component | Click trigger toggles popover |
| **TC-024** | T-008 | Search filters registrants | Component | Typing filters list correctly |
| **TC-025** | T-008 | Checkboxes toggle selection | Component | Click checkbox updates state |
| **TC-026** | T-008 | Badges display selections | Component | Selected items show as badges |
| **TC-027** | T-008 | Badge X removes item | Component | Click X removes from selection |
| **TC-028** | T-008 | Escape closes popover | Component | Esc key closes without changes |
| **TC-029** | T-008 | Responsive on mobile | Visual | UI works on narrow viewports |
| **TC-030** | T-009 | Server query uses in clause | Unit | SQL contains WHERE ... IN (...) |
| **TC-031** | T-009 | Query skips filter if empty | Unit | No WHERE clause for empty array |
| **TC-032** | T-009 | Pagination works with filters | Integration | Correct page count with filters |
| **TC-033** | T-010 | Both tabs same registrant list | Integration | In Progress === Completed |
| **TC-034** | T-010 | Multi-select works both tabs | Integration | Filter applies correctly on both |
| **TC-035** | T-010 | Seed data loads on startup | E2E | All registrants appear in filter |
| **TC-036** | T-010 | Excel upload updates filter | E2E | New registrant visible immediately |
| **TC-037** | T-010 | Tab switching preserves filter | E2E | Filter state persists |

---

### 7.3 Edge Cases / Trường hợp Biên

| Edge Case | Test Approach | Expected Behavior |
|-----------|---------------|-------------------|
| **NULL registeredBy in Order** | Unit test with NULL value | Skipped in seed, not in filter |
| **Empty string registeredBy** | Unit test with "" | Treated as NULL, skipped |
| **Duplicate names in Excel** | Integration test | Upserted once, not duplicated |
| **Case-sensitive names** | Unit test | "Alice" and "alice" are different |
| **Large dataset (10k registrants)** | Performance test | fetchRegistrants < 200ms |
| **Concurrent Excel uploads** | Integration test | No duplicate registrants |
| **Zero selections (empty array)** | Unit test | All orders shown (no filter) |
| **All selections (n=100)** | Performance test | Query still completes < 500ms |
| **Registrant name with special chars** | Unit test | Stored and retrieved correctly |
| **Very long registrant names** | Unit test | Handled without truncation |

---

### 7.4 Test Data / Dữ liệu Kiểm thử

**Seed Fixtures**:
```typescript
// 20-50 existing orders with diverse registeredBy values
const testOrders = [
  { jobNumber: 'JOB-001', registeredBy: 'Alice Johnson', ... },
  { jobNumber: 'JOB-002', registeredBy: 'Bob Smith', ... },
  { jobNumber: 'JOB-003', registeredBy: 'Alice Johnson', ... },
  { jobNumber: 'JOB-004', registeredBy: null, ... },
  // ...
];
```

**Mock Excel Data**:
```json
[
  { jobNumber: 'NEW-001', registeredBy: 'Charlie Brown', ... },
  { jobNumber: 'NEW-002', registeredBy: 'David Lee', ... },
  { jobNumber: 'NEW-003', registeredBy: 'Charlie Brown', ... }
]
```

**Test Registrant List**:
- Alice Johnson
- Bob Smith
- Charlie Brown
- David Lee
- Emily White

---

### 7.5 Verification Matrix / Ma trận Xác minh

| Component | Test Type | Pass Criteria |
|-----------|-----------|----------------|
| **Registrant Model** | Schema validation | ✅ Schema compiles, types generated |
| **Seed Script** | Data integrity | ✅ Count matches, idempotent |
| **Server Action** | API contract | ✅ Returns sorted string[], auth checks |
| **Filter Type** | Type safety | ✅ No TypeScript errors |
| **Filter Logic** | Functionality | ✅ OR logic correct, performance < 100ms |
| **Excel Integration** | Transaction | ✅ Atomic, upsert works, rollback on error |
| **Filter UI** | UX/Accessibility | ✅ Multi-select works, responsive, accessible |
| **Server Query** | Query correctness | ✅ Uses `in` clause, pagination works |
| **Integration** | Cross-tab | ✅ Both tabs consistent, no race conditions |

---

## 8. Sync Points & Build Order / Điểm Đồng bộ & Thứ tự Xây dựng

**No Cross-Root Dependencies**: All work in single root (sgs-cs-helper)

**Internal Build Order**:
1. **Phase A - Database Schema** (T-001, T-002): Schema changes must be deployed before data operations
2. **Phase B - Data Layer** (T-003, T-004, T-007): Seed and APIs depend on schema
3. **Phase C - Type System** (T-005, T-006): Type updates enable component changes
4. **Phase D - UI Components** (T-008, T-009): Component depends on API and types
5. **Phase E - Verification** (T-010): Integration testing after all components ready

---

## 9. Effort Estimates & Timeline / Ước tính Công suất & Lịch trình

### Effort Summary

| Task | Estimate | Effort (Hours) |
|------|----------|----------------|
| T-001 | S | 0.5 |
| T-002 | S | 0.3 |
| T-003 | M | 1.25 |
| T-004 | M | 1.25 |
| T-005 | S | 0.5 |
| T-006 | M | 1.25 |
| T-007 | M | 1.75 |
| T-008 | L | 2.25 |
| T-009 | M | 1.25 |
| T-010 | M | 1.75 |
| **TOTAL** | | **12-16 hours** |

### Recommended Timeline (3-4 day sprint)

| Day | Phase | Tasks | Hours | Notes |
|-----|-------|-------|-------|-------|
| **Day 1 (4h)** | Schema | T-001, T-002, T-005 | 1.3h | Parallel group A |
| **Day 1 (4h)** | Types | T-006 | 1.25h | Depends on A |
| **Day 1 (4h)** | Buffer | Code review, testing | 1.5h | |
| **Day 2 (6h)** | Data | T-003, T-004, T-007 | 4.25h | Depends on T-002 |
| **Day 2 (6h)** | Buffer | Testing, adjustments | 1.75h | |
| **Day 3 (6h)** | UI | T-008, T-009 | 3.5h | Depends on T-004, T-006 |
| **Day 3 (6h)** | Testing | T-010 | 1.75h | Depends on T-008, T-009 |
| **Day 3 (6h)** | Buffer | Fixes, final verification | 0.75h | |

**Total**: ~3-4 developer days (single developer), or 2-3 days (pair programming)

---

## ⏸️ Phase 2 Complete / Hoàn thành Phase 2

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| **Feature** | Multi-Select Registered By Filter + Lookup Table |
| **Total Tasks** | 10 |
| **Estimated Effort** | 12-16 hours |
| **Affected Roots** | sgs-cs-helper (1 root) |
| **Sync Points** | 0 (single root) |
| **Test Plan Included** | ✅ Yes (37 test cases) |
| **Requirements Coverage** | ✅ 100% (all 8 FRs + 5 NFRs) |

### Task List Summary / Tóm tắt Danh sách Task

| ID | Title | Root | Est | Dependencies |
|----|-------|------|-----|--------------|
| **T-001** | Create Registrant Model | sgs-cs-helper | S | - |
| **T-002** | Create Migration | sgs-cs-helper | S | T-001 |
| **T-003** | Seed Script | sgs-cs-helper | M | T-001, T-002 |
| **T-004** | fetchRegistrants Server Action | sgs-cs-helper | M | T-001, T-002 |
| **T-005** | Update OrderFilters Type | sgs-cs-helper | S | - |
| **T-006** | Update Filter Logic (OR) | sgs-cs-helper | M | T-005 |
| **T-007** | Excel Upload Integration | sgs-cs-helper | M | T-001, T-002 |
| **T-008** | Multi-Select UI Component | sgs-cs-helper | L | T-004, T-005, T-006 |
| **T-009** | Server-Side Query Update | sgs-cs-helper | M | T-005, T-006 |
| **T-010** | Integration & Testing | sgs-cs-helper | M | T-008, T-009 |

### Parallel Opportunities / Cơ hội Song song

| Group | Tasks | Dependency | Effort |
|-------|-------|-----------|--------|
| **Group A** | T-001, T-005 | None | 1h |
| **Group B** | T-002, T-006 | A | 1.5h |
| **Group C** | T-004, T-007 | B | 3h |
| **Group D** | T-003, T-009 | C | 3h |
| **Group E** | T-008 | C | 2.25h |
| **Group F** | T-010 | E | 1.75h |

### Artifacts Created / Artifact Đã tạo

✅ **[Task Plan](./02_tasks/tasks.md)** (this document)
- 10 detailed tasks with dependencies, done criteria, verification steps
- Test plan with 37 test cases across all task categories
- Risk assessment and mitigation strategies
- Timeline and effort estimates
- Parallel execution opportunities identified

---

## 📋 Next Steps (EXPLICIT PROMPTS REQUIRED)

### Step 1: Run Task Plan Review (RECOMMENDED)

```
/task-plan-review
```

This validates task breakdown, checks dependencies, and confirms all requirements are covered.

---

### Step 2: Proceed to Phase 3 Implementation

After review passes:

```
/phase-3-impl T-001
```

This starts Phase 3 with the first task (Create Registrant Model).

---

### Alternative: Skip Review & Proceed Directly

If you've reviewed the task plan manually and want to proceed:

Say `approved` then run:

```
/phase-3-impl T-001
```

---

**⚠️ Important**: DO NOT use generic commands like `go`, `continue`, or `next`.  
Use explicit phase prompts: `/task-plan-review` or `/phase-3-impl T-001`

---

**Status**: Draft — Ready for Review  
**Phase**: 2 — Task Planning  
**Branch**: feature/sgs-cs-helper-us-1.2.7  
**Generated**: 2026-02-10
