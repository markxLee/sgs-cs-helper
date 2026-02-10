# Specification — Multi-Select Registered By Filter with Dedicated Lookup Table
<!-- Phase 1 Specification | US-1.2.7 | 2026-02-10 -->

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Multi-Select "Registered By" Filter + Dedicated Registrant Lookup Table |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |
| Functional Requirements | 8 |
| Non-Functional Requirements | 5 |
| Affected Roots | sgs-cs-helper (1 root, no cross-root dependencies) |
| Status | Draft — Awaiting Review |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**🇻🇳** Nâng cấp bộ lọc "Registered By" từ single-select sang multi-select, với một bảng tra cứu `Registrant` chuyên dụng. Hiện tại, danh sách registrant được trích xuất từ các đơn hàng đã tải, dẫn đến khoảng trống dữ liệu do phân trang. Giải pháp này tạo một nguồn dữ liệu authoritative để registrant luôn sẵn sàng và hoàn chỉnh.

**🇬🇧** Upgrade the "Registered By" filter from single-select to multi-select, backed by a dedicated `Registrant` lookup table. Currently, registrant names are extracted from loaded orders, causing data gaps due to pagination. This solution creates an authoritative registrant datasource that is always available and complete.

### 1.2 Scope / Phạm vi

#### In Scope / Trong phạm vi

- ✅ Add `Registrant` model to Prisma schema
- ✅ Populate `Registrant` table during Excel upload (upsert)
- ✅ Seed existing orders into `Registrant` table on initial deployment
- ✅ Create Server Action `fetchRegistrants()` to fetch all registrants
- ✅ Upgrade "Registered By" filter UI to multi-select (Popover + Command pattern)
- ✅ Update filter logic to support array-based selections with OR logic
- ✅ Update `OrderFilters` type to support `registeredBy: string[]`
- ✅ Ensure consistency across both tabs (In Progress & Completed)
- ✅ Bilingual support (English + Vietnamese)
- ✅ Error handling for missing/NULL registrants

#### Out of Scope / Ngoài phạm vi

- ❌ Real-time registrant list updates (cached, not live)
- ❌ Registrant management UI (add/edit/delete registrants)
- ❌ Advanced filtering (AND logic, nested conditions)
- ❌ Export filtered results
- ❌ Custom filter saved views

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Create Registrant Lookup Table

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC1 |

**Description / Mô tả:**

**🇻🇳** Tạo mô hình Prisma `Registrant` với ba trường:
- `id` (cuid, khóa chính)
- `name` (String, unique constraint)
- `createdAt` (DateTime, default now)

Bảng này đóng vai trò là nguồn dữ liệu có thẩm quyền cho tất cả tên người đăng ký đã biết trong hệ thống.

**🇬🇧** Create a Prisma `Registrant` model with three fields:
- `id` (cuid, primary key)
- `name` (String, unique constraint)
- `createdAt` (DateTime, default now)

This table serves as the authoritative datasource for all known registrant names in the system.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC1.1**: Prisma migration created successfully with `Registrant` model
- [ ] **AC1.2**: Unique constraint on `name` field enforces no duplicate registrants
- [ ] **AC1.3**: Index on `name` field for fast lookups
- [ ] **AC1.4**: Model supports 1000+ registrants without performance degradation
- [ ] **AC1.5**: Schema rollback verified (migration reversible)

**Database Schema:**

```prisma
model Registrant {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  @@index([name])
}
```

---

### FR-002: Seed Existing Registrants

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC2 |

**Description / Mó tả:**

**🇻🇳** Khi triển khai lần đầu tiên, backfill bảng `Registrant` với tất cả giá trị `registeredBy` độc nhất từ bảng `Order` hiện có. Điều này đảm bảo rằng tất cả người đăng ký từ các đơn hàng trước đó sẽ có sẵn trong bộ lọc ngay lập tức.

**🇬🇧** On initial deployment, backfill the `Registrant` table with all unique `registeredBy` values from the existing `Order` table. This ensures all registrants from prior orders are available in the filter immediately.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC2.1**: Seed script extracts all unique non-NULL `Order.registeredBy` values
- [ ] **AC2.2**: Seed script uses upsert pattern (idempotent, safe to run multiple times)
- [ ] **AC2.3**: All existing registrants appear in filter dropdown after seed
- [ ] **AC2.4**: Seed runs in < 5 seconds for 1000+ existing orders
- [ ] **AC2.5**: NULL or empty `registeredBy` values are skipped (not added to Registrant)

**Seed Implementation Pattern:**

```typescript
// Pseudo-code (TypeScript)
const uniqueNames = await prisma.order.findMany({
  distinct: ['registeredBy'],
  where: { registeredBy: { not: null } },
  select: { registeredBy: true }
});

for (const { registeredBy } of uniqueNames) {
  await prisma.registrant.upsert({
    where: { name: registeredBy },
    update: {},
    create: { name: registeredBy }
  });
}
```

---

### FR-003: Populate Registrants During Excel Upload

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC3 |

**Description / Mó tả:**

**🇻🇳** Khi người dùng tải lên file Excel chứa đơn hàng mới, hệ thống sẽ tự động trích xuất các giá trị `registeredBy` độc nhất và upsert chúng vào bảng `Registrant`. Điều này giữ cho danh sách registrant luôn được cập nhật khi có đơn hàng mới được thêm vào.

**🇬🇧** When a user uploads an Excel file containing new orders, the system automatically extracts unique `registeredBy` values and upserts them into the `Registrant` table. This keeps the registrant list up-to-date as new orders are added.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC3.1**: Excel parser extracts `registeredBy` from each row
- [ ] **AC3.2**: Duplicate registrant names in same file are deduplicated before upsert
- [ ] **AC3.3**: Registrant upsert happens atomically with order creation (same transaction)
- [ ] **AC3.4**: If registrant upsert fails, order creation also fails (transaction rollback)
- [ ] **AC3.5**: New registrants appear in filter dropdown within 2 seconds after upload

**Integration Point:**

```typescript
// Pseudo-code (in createOrders Server Action)
async function createOrders(input: CreateOrderInput[]) {
  return prisma.$transaction(async (tx) => {
    // 1. Extract unique registeredBy values
    const registrants = [...new Set(
      input
        .map(o => o.registeredBy)
        .filter(r => r && r.trim().length > 0)
    )];
    
    // 2. Upsert each into Registrant table
    for (const name of registrants) {
      await tx.registrant.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    
    // 3. Create/update orders
    // ... existing order creation logic
  });
}
```

---

### FR-004: Server Action to Fetch All Registrants

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC4 |

**Description / Mó tả:**

**🇻🇳** Tạo một Server Action `fetchRegistrants()` trả về danh sách tất cả tên người đăng ký độc nhất từ bảng `Registrant`, được sắp xếp theo tên. Thành phần filter gọi action này để điền vào danh sách dropdown.

**🇬🇧** Create a Server Action `fetchRegistrants()` that returns a list of all unique registrant names from the `Registrant` table, sorted by name. The filter component calls this action to populate the dropdown list.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC4.1**: Server Action is type-safe with proper TypeScript types
- [ ] **AC4.2**: Returns `string[]` sorted alphabetically (case-insensitive)
- [ ] **AC4.3**: Filters out NULL and empty strings
- [ ] **AC4.4**: Response time < 200ms for 1000+ registrants (cached if possible)
- [ ] **AC4.5**: Action includes auth check (user must be authenticated)

**Function Signature:**

```typescript
export async function fetchRegistrants(): Promise<string[]>
```

**Location:** `src/lib/actions/order.ts`

**Example Output:**

```typescript
[
  "Alice Johnson",
  "Bob Smith",
  "Carol Williams",
  // ... sorted alphabetically
]
```

---

### FR-005: Multi-Select Filter Component

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC5, AC6 |

**Description / Mó tả:**

**🇻🇧** Nâng cấp thành phần `OrderFiltersComponent` từ single-select (Select) sang multi-select (Popover + Command/Combobox). Người dùng có thể:
- Chọn nhiều người đăng ký cùng lúc
- Xóa từng lựa chọn bằng cách nhấp vào badge
- Xóa tất cả lựa chọn bằng nút "Clear Filters"
- Tìm kiếm/lọc danh sách bằng text input

**🇬🇧** Upgrade `OrderFiltersComponent` from single-select (Select) to multi-select (Popover + Command/Combobox). Users can:
- Select multiple registrants simultaneously
- Remove individual selections by clicking on badges
- Clear all selections using "Clear Filters" button
- Search/filter the list using text input

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC5.1**: Component renders Popover trigger button
- [ ] **AC5.2**: Trigger button displays count badge: "2 selected" or "Registered By" (empty state)
- [ ] **AC5.3**: Popover opens on click, shows Command/Combobox with all registrants
- [ ] **AC5.4**: User can type to filter registrant names (case-insensitive)
- [ ] **AC5.5**: Each registrant shows checkbox (checked/unchecked)
- [ ] **AC5.6**: User can click checkbox to toggle selection
- [ ] **AC5.7**: Selected registrants display as dismissible badges below input
- [ ] **AC5.8**: Clicking badge X removes that registrant from selection
- [ ] **AC5.9**: Escape key closes popover without changing selection
- [ ] **AC5.10**: Component is responsive (works on mobile, tablet, desktop)

**Component Props:**

```typescript
interface OrderFiltersProps {
  filters: OrderFilters;              // { registeredBy: string[]; ... }
  onFiltersChange: (filters: OrderFilters) => void;
  registrants: string[];              // All available registrant names
  isLoading?: boolean;                // Loading state while fetching
}
```

**UI Structure:**

```
┌─────────────────────────────────────┐
│ Popover Trigger Button              │
│ "2 selected" or "Registered By"     │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ [x] Search input    │
    ├─────────────────────┤
    │ ☐ Alice Johnson     │
    │ ☑ Bob Smith         │
    │ ☐ Carol Williams    │
    │ ☑ David Lee         │
    │ ... (scrollable)    │
    └─────────────────────┘

Below component:
[Bob Smith ✕] [David Lee ✕]
```

---

### FR-006: Update OrderFilters Type

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC7 |

**Description / Mó tả:**

**🇻🇳** Cập nhật giao diện `OrderFilters` để hỗ trợ nhiều lựa chọn registrant. Trường `registeredBy` thay đổi từ `string` (giá trị duy nhất) thành `string[]` (mảng giá trị).

**🇬🇧** Update the `OrderFilters` interface to support multiple registrant selections. The `registeredBy` field changes from `string` (single value) to `string[]` (array of values).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC6.1**: TypeScript type definition updated: `registeredBy: string[]`
- [ ] **AC6.2**: Initialization uses empty array: `registeredBy: []`
- [ ] **AC6.3**: All components using `OrderFilters` updated to handle array
- [ ] **AC6.4**: No TypeScript errors after type change
- [ ] **AC6.5**: Clear Filters button sets `registeredBy` to empty array

**Type Definition:**

```typescript
export interface OrderFilters {
  registeredBy: string[];             // Changed: string → string[]
  requiredDateFrom: string;           // Unchanged
  requiredDateTo: string;             // Unchanged
}

// Default/Initial state
const DEFAULT_FILTERS: OrderFilters = {
  registeredBy: [],
  requiredDateFrom: '',
  requiredDateTo: ''
};
```

---

### FR-007: Client-Side Filter Logic (In Progress Tab)

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC8 |

**Description / Mó tả:**

**🇻🇳** Cập nhật logic lọc client-side trong hook `useOrderControls` để hỗ trợ mảng `registeredBy` với logic OR. Khi người dùng chọn nhiều người đăng ký, hiển thị các đơn hàng khớp với BẤT KỲ người đăng ký nào trong danh sách.

**🇬🇧** Update the client-side filter logic in the `useOrderControls` hook to support array `registeredBy` with OR logic. When a user selects multiple registrants, show orders matching ANY registrant in the list.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC7.1**: Filter logic checks if array is empty (show all)
- [ ] **AC7.2**: If array has values, use OR matching: `registrants.includes(order.registeredBy)`
- [ ] **AC7.3**: NULL or empty `order.registeredBy` values are NOT matched (unless array empty)
- [ ] **AC7.4**: Date range filters still apply (AND logic with registrant filter)
- [ ] **AC7.5**: Search term still applies (AND logic)
- [ ] **AC7.6**: Filter performance remains < 100ms for 1000 orders

**Filter Logic:**

```typescript
// Old (single-select)
if (filters.registeredBy) {
  result = result.filter(order => order.registeredBy === filters.registeredBy);
}

// New (multi-select with OR)
if (filters.registeredBy.length > 0) {
  result = result.filter(order => 
    filters.registeredBy.includes(order.registeredBy)
  );
}
// If empty array, no filtering applied (show all)
```

---

### FR-008: Server-Side Filter Logic (Completed Tab)

| Aspect | Detail |
|--------|--------|
| Priority | **MUST** |
| Affected Roots | sgs-cs-helper |
| User Story AC | AC8 |

**Description / Mó tả:**

**🇻🇳** Cập nhật truy vấn server-side trong phần Completed Orders để áp dụng bộ lọc array `registeredBy` tại cơ sở dữ liệu. Sử dụng mệnh đề `where: { registeredBy: { in: [...] } }` để lọc server-side.

**🇬🇧** Update the server-side query in the Completed Orders section to apply the array `registeredBy` filter at the database level. Use `where: { registeredBy: { in: [...] } }` clause to filter server-side.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] **AC8.1**: Prisma query includes `where` clause for registeredBy
- [ ] **AC8.2**: Uses `in` operator for OR logic: `{ in: filters.registeredBy }`
- [ ] **AC8.3**: Query skips filter if array is empty (shows all)
- [ ] **AC8.4**: Pagination still works with filters applied
- [ ] **AC8.5**: Query performance remains < 500ms for 1000+ records

**Prisma Query Pattern:**

```typescript
const orders = await prisma.order.findMany({
  where: {
    status: 'COMPLETED',
    ...(filters.registeredBy.length > 0 && {
      registeredBy: { in: filters.registeredBy }
    }),
    // ... other filters
  },
  skip: page * pageSize,
  take: pageSize,
});
```

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Priority | MUST |

**Description / Mó tả:**

**🇻🇳** Hệ thống phải đáp ứng nhanh chóng với dữ liệu lớn.

**🇬🇧** System must respond quickly even with large datasets.

**Metrics / Chỉ số:**

| Operation | Target | Notes |
|-----------|--------|-------|
| `fetchRegistrants()` | < 200ms | 1000+ registrants |
| Client-side filter | < 100ms | 1000+ orders |
| Server-side query | < 500ms | 1000+ records |
| Seed script | < 5 seconds | 1000+ existing orders |
| Excel upload + upsert | < 10 seconds | 500-line Excel file |

---

### NFR-002: Reliability & Data Integrity

| Aspect | Detail |
|--------|--------|
| Category | Reliability |
| Priority | MUST |

**Description / Mó tả:**

**🇻🇳** Dữ liệu Registrant phải luôn chính xác và nhất quán.

**🇬🇧** Registrant data must always be accurate and consistent.

**Requirements:**

- [ ] Registrant upsert is idempotent (safe to run multiple times)
- [ ] Unique constraint on `Registrant.name` prevents duplicates
- [ ] Excel upload + registrant creation is atomic (all or nothing)
- [ ] NULL `registeredBy` values are consistently handled
- [ ] Seed script is reversible (can be re-run or rolled back)

---

### NFR-003: Security & Authorization

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Priority | MUST |

**Description / Mó tả:**

**🇻🇳** Chỉ người dùng được xác thực mới có thể truy cập bộ lọc và dữ liệu registrant.

**🇬🇧** Only authenticated users can access filters and registrant data.

**Requirements:**

- [ ] `fetchRegistrants()` Server Action requires user session
- [ ] User role/permissions checked before returning registrants
- [ ] Filter state is not exposed in URL (kept in component state)
- [ ] No sensitive data in registrant names

---

### NFR-004: Maintainability & Code Quality

| Aspect | Detail |
|--------|--------|
| Category | Maintainability |
| Priority | SHOULD |

**Description / Mó tả:**

**🇻🇳** Code phải sạch, dễ hiểu, và dễ bảo trì.

**🇬🇧** Code must be clean, understandable, and easy to maintain.

**Requirements:**

- [ ] Follow Next.js best practices (Server Actions, Server Components)
- [ ] TypeScript strict mode, no `any` types
- [ ] Components are documented with JSDoc comments
- [ ] No code duplication between tabs
- [ ] Bilingual comments for complex logic

---

### NFR-005: Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Compatibility |
| Priority | SHOULD |

**Description / Mó tả:**

**🇻🇳** UI phải hoạt động trên tất cả trình duyệt và thiết bị hiện đại.

**🇬🇧** UI must work on all modern browsers and devices.

**Requirements:**

- [ ] Compatible with Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessible with keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatible (ARIA labels)

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect | Detail |
|--------|--------|
| Root Name | sgs-cs-helper |
| Sync Type | N/A (single root) |

**Changes Summary / Tóm tắt Thay đổi:**

All work is contained within this root. No other roots are affected.

**Integration Points / Điểm Tích hợp:**

- `prisma/schema.prisma` — Add `Registrant` model
- `prisma/seed.ts` — Backfill registrants from existing orders
- `src/lib/actions/order.ts` — Add `fetchRegistrants()` and extend `createOrders()`
- `src/types/orders.ts` — Update `OrderFilters` type
- `src/components/orders/order-filters.tsx` — Upgrade to multi-select
- `src/hooks/use-order-controls.ts` — Update filter logic
- `src/components/orders/realtime-orders.tsx` — Call `fetchRegistrants()` instead of Set extraction
- `src/components/orders/completed-orders.tsx` — Call `fetchRegistrants()` instead of Set extraction

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**

- Prisma ORM (schema change)
- React hooks (filter state management)
- Next.js Server Actions (data fetching)
- shadcn/ui (Popover, Command components)
- TypeScript (type definitions)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Server Action: fetchRegistrants

**Location / Vị trí:** `src/lib/actions/order.ts`

**Signature / Chữ ký:**

```typescript
export async function fetchRegistrants(): Promise<string[]>
```

**Parameters / Tham số:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| (none) | — | — | No parameters |

**Returns / Trả về:**

| Type | Example |
|------|---------|
| `string[]` | `["Alice Johnson", "Bob Smith", "Carol Williams"]` |

**Error Handling / Xử lý Lỗi:**

- If user not authenticated: throw `Unauthorized`
- If database query fails: throw `DatabaseError`
- Empty registrant table returns empty array `[]`

---

### Prisma Model: Registrant

**Location / Vị trí:** `prisma/schema.prisma`

**Schema / Lược đồ:**

```prisma
model Registrant {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  @@index([name])
}
```

**Constraints / Ràng buộc:**

- Primary Key: `id` (cuid)
- Unique: `name` (case-sensitive)
- Index: `name` (for fast lookups)

---

### Type: OrderFilters

**Location / Vị trí:** `src/types/orders.ts` or `src/components/orders/order-filters.tsx`

**Interface / Giao diện:**

```typescript
export interface OrderFilters {
  registeredBy: string[];             // NEW: array instead of string
  requiredDateFrom: string;           // Unchanged
  requiredDateTo: string;             // Unchanged
}
```

**Default Value / Giá trị Mặc định:**

```typescript
const DEFAULT_FILTERS: OrderFilters = {
  registeredBy: [],
  requiredDateFrom: '',
  requiredDateTo: ''
};
```

---

## 6. Edge Cases & Error Handling / Trường hợp Biên & Xử lý Lỗi

### Edge Case 1: NULL or Empty registeredBy

| Scenario | Expected Behavior |
|----------|-------------------|
| Order has `registeredBy = NULL` | Not matched by any filter selection (not included in Registrant table) |
| Order has `registeredBy = ""` (empty string) | Treated as NULL, not included in Registrant table |
| Order created via API without registeredBy | No registrant extraction, order still created |

---

### Edge Case 2: Duplicate Registrant Names

| Scenario | Expected Behavior |
|----------|-------------------|
| Excel upload with "Alice" and "alice" (case mismatch) | Both treated as different registrants (case-sensitive unique constraint) |
| Excel upload with "Alice Johnson" twice | Upserted once (idempotent) |
| User manually creates "John Smith" in Order, then seed runs | Seed upsert matches existing, no duplicate |

---

### Edge Case 3: Filter Array Behavior

| Scenario | Expected Behavior |
|----------|-------------------|
| User selects 0 registrants (empty array) | Show all orders (no filter applied) |
| User selects 1 registrant | Show orders matching that registrant |
| User selects 5 registrants | Show orders matching any of the 5 (OR logic) |

---

### Edge Case 4: Performance with Large Data

| Scenario | Expected Behavior |
|----------|-------------------|
| 10,000+ registrants in table | `fetchRegistrants()` still returns in < 200ms (with index) |
| 100,000+ orders in database | Server-side query < 500ms (with `in` clause optimization) |
| 10,000+ orders on In Progress tab | Client-side filter < 100ms (with `includes` on Set) |

---

### Edge Case 5: Concurrent Uploads

| Scenario | Expected Behavior |
|----------|-------------------|
| Two users upload Excel files simultaneously with same registrant names | Both upserts succeed, unique constraint prevents duplicates, final count = 1 unique registrant |
| Upload A and B create registrants "Alice" and "Bob" concurrently | Both are created (transactions maintain isolation) |

---

### Error Handling / Xử lý Lỗi

| Error Scenario | Handler | User Impact |
|----------------|---------|-------------|
| `fetchRegistrants()` fails (DB down) | Catch error, return empty array, show toast | Filter unavailable, user can still view all orders |
| Registrant upsert fails during upload | Wrap in transaction, rollback order creation | Upload fails with clear error, no partial data |
| Unique constraint violation | Catch, log, retry with upsert | Silent retry, eventual consistency |
| Excel upload with 10,000 rows | Seed script batches inserts | Process completes in < 10 seconds |
| User selects 50+ registrants | Component handles (no limit enforced) | May cause large query, but acceptable UX |

---

## 7. Dependencies / Phụ thuộc

| Dependency | Type | Current Status | Version |
|-----------|------|--------|---------|
| **Prisma ORM** | Package | Existing | Latest |
| **Next.js Server Actions** | Framework Feature | Existing | 16.0.10+ |
| **shadcn/ui (Popover)** | Component Library | Existing | Latest |
| **shadcn/ui (Command)** | Component Library | Existing | Latest |
| **React Hooks** | Framework Feature | Existing | 19.0+ |
| **TypeScript** | Language | Existing | Latest |
| **NextAuth.js** | Auth Library | Existing | Latest |

---

## 8. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Seed script slow with 100k+ orders** | Deploy time exceeds limit | Medium | Batch upserts, use `createMany`, test with production-like data |
| **Unique constraint violation in Registrant** | Duplicate creation attempt | Low | Use upsert pattern (always idempotent) |
| **Breaking change to OrderFilters type** | TypeScript errors in other components | High | Update all consuming files in same PR, run full build test |
| **NULL registeredBy values in production** | Inconsistent filter behavior | Medium | Filter out NULLs in seed + extraction, add validation |
| **Registrants table grows unbounded** | Query performance degrades | Low | Index on `name`, cleanup migration if needed (archival pattern) |
| **UI Popover positioning issues** | Component looks wrong on mobile | Low | Use shadcn Popover (handles positioning), test responsive design |
| **Excel upload + upsert within transaction timeout** | Long transactions fail | Low | Monitor transaction time, optimize batch size if needed |

---

## 9. Testing Strategy / Chiến lược Kiểm thử

> **Note**: Detailed test cases will be defined in Phase 4 (Testing). This section outlines the testing approach.

### Unit Tests

- `fetchRegistrants()` Server Action
  - Returns sorted array
  - Filters NULL values
  - Auth check works
  
- Filter logic (`useOrderControls`)
  - OR matching with empty array
  - OR matching with multiple values
  - Combination with date range & search

### Integration Tests

- Excel upload → Registrant creation → Filter shows new registrants
- Seed script → Existing registrants → Filter populated
- Multi-tab consistency (In Progress & Completed both show same registrants)

### E2E Tests

- User opens dashboard → registrants load → selects multiple → filter applies → results match
- User uploads Excel → new registrants appear immediately → can select them

### Visual Tests

- Multi-select component renders correctly
- Badges display properly
- Popover positioning works on mobile/tablet/desktop
- Responsive design verified

---

## 10. Approval & Sign-Off / Phê duyệt & Ký duyệt

| Role | Name | Status | Date |
|------|------|--------|------|
| **Spec Author** | Copilot | ✅ Complete | 2026-02-10 |
| **Product Manager** | ⏳ Pending | (approval required) | |
| **Tech Lead** | ⏳ Pending | (approval required) | |

---

---

## ⏸️ Phase 1 Complete / Hoàn thành Phase 1

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| **Functional Requirements** | 8 (FR-001 to FR-008) |
| **Non-Functional Requirements** | 5 (NFR-001 to NFR-005) |
| **Affected Roots** | 1 (sgs-cs-helper) |
| **Edge Cases Documented** | 5 scenarios |
| **Error Handling** | 6 scenarios covered |
| **Testing Approach** | Unit, Integration, E2E, Visual |

### Artifacts Created / Artifact Đã tạo

✅ **[Specification Document](./spec.md)** (this file)  
✅ **All 8 Functional Requirements** specified with acceptance criteria  
✅ **All 5 Non-Functional Requirements** with measurable metrics  
✅ **Cross-Root Impact Analysis** (single root, no dependencies)  
✅ **Data Contracts** (Server Action, Prisma model, TypeScript types)  
✅ **Edge Cases & Error Handling** (10 scenarios mapped)  
✅ **Risk Mitigation** (8 identified risks with solutions)  

### Requirements Summary / Tóm tắt Yêu cầu

| ID | Title | Priority | Roots | Status |
|----|-------|----------|-------|--------|
| FR-001 | Create Registrant Lookup Table | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-002 | Seed Existing Registrants | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-003 | Populate Registrants During Upload | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-004 | Server Action fetchRegistrants | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-005 | Multi-Select Filter Component | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-006 | Update OrderFilters Type | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-007 | Client-Side Filter Logic (OR) | **MUST** | sgs-cs-helper | Specified ✅ |
| FR-008 | Server-Side Filter Logic (OR) | **MUST** | sgs-cs-helper | Specified ✅ |
| NFR-001 | Performance Metrics | **MUST** | sgs-cs-helper | Specified ✅ |
| NFR-002 | Reliability & Data Integrity | **MUST** | sgs-cs-helper | Specified ✅ |
| NFR-003 | Security & Authorization | **MUST** | sgs-cs-helper | Specified ✅ |
| NFR-004 | Maintainability & Code Quality | **SHOULD** | sgs-cs-helper | Specified ✅ |
| NFR-005 | Compatibility | **SHOULD** | sgs-cs-helper | Specified ✅ |

---

## 📋 Next Steps (EXPLICIT PROMPTS REQUIRED)

**Step 1: Review Specification (RECOMMENDED)**

```
/spec-review
```

This will validate the spec quality, check for gaps, and provide feedback.

---

**Step 2: Proceed to Phase 2 Task Planning**

After review passes (or manual approval):

```
/phase-2-tasks
```

---

**⚠️ Alternative: Skip Review & Proceed Directly**

If you've reviewed manually and want to proceed immediately:

Say `approved` then run:

```
/phase-2-tasks
```

---

**Status**: Draft — Ready for Review  
**Phase**: 1 — Specification  
**Branch**: feature/sgs-cs-helper-us-1.2.7  
**Generated**: 2026-02-10  

---

**Important**: DO NOT use generic commands like `go`, `continue`, or `next`.  
Use explicit phase prompts: `/spec-review` or `/phase-2-tasks`
