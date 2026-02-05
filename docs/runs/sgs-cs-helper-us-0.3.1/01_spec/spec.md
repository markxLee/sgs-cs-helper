# Specification — US-0.3.1 Create Core Database Schema
# Đặc tả — US-0.3.1 Tạo Schema Database Cốt lõi
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.3.1 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Create Core Database Schema |
| Status | Draft |
| Functional Requirements | 7 |
| Non-Functional Requirements | 4 |
| Affected Roots | sgs-cs-hepper |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:** This specification defines the database schema for the SGS CS Order Tracker application. The schema includes three models (User, Order, Config) and two enums (Role, OrderStatus) that will support authentication, order tracking, and application configuration features.

**VI:** Đặc tả này định nghĩa schema database cho ứng dụng SGS CS Order Tracker. Schema bao gồm ba models (User, Order, Config) và hai enums (Role, OrderStatus) sẽ hỗ trợ các tính năng authentication, order tracking, và cấu hình ứng dụng.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- Define complete User model with role and staff code support
- Define complete Order model with status tracking
- Define Config model for application settings
- Define Role and OrderStatus enums
- Add database indexes for query optimization
- Establish User-Order relationship

**Out of Scope / Ngoài phạm vi:**
- Authentication logic implementation (US-0.2.x)
- Order CRUD operations (US-1.x)
- Data seeding (US-0.3.2)
- Database migrations to production
- API endpoint implementation

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: User Model Definition

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Define User model with all fields required for multi-auth support (email auth for admins, shared code for staff).
- **VI:** Định nghĩa User model với tất cả fields cần thiết cho multi-auth (email auth cho admins, shared code cho staff).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: User model has `id` field (cuid, primary key)
- [ ] AC2: User model has `email` field (optional, unique)
- [ ] AC3: User model has `name` field (optional string)
- [ ] AC4: User model has `role` field (Role enum, default STAFF)
- [ ] AC5: User model has `staffCode` field (optional string)
- [ ] AC6: User model has `createdAt` and `updatedAt` timestamps
- [ ] AC7: User model has `orders` relation to Order[]

---

### FR-002: Order Model Definition

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Define Order model with all fields required for order tracking, including parsed Excel data and status management.
- **VI:** Định nghĩa Order model với tất cả fields cần thiết cho order tracking, bao gồm dữ liệu Excel đã parse và quản lý status.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Order model has `id` field (cuid, primary key)
- [ ] AC2: Order model has `jobNumber` field (unique string)
- [ ] AC3: Order model has `registeredDate` and `requiredDate` fields (DateTime)
- [ ] AC4: Order model has `priority` field (Int, default 0)
- [ ] AC5: Order model has `status` field (OrderStatus enum, default IN_PROGRESS)
- [ ] AC6: Order model has `registeredBy`, `sampleCount`, `description` fields
- [ ] AC7: Order model has `completedAt` field (optional DateTime)
- [ ] AC8: Order model has `uploadedAt`, `uploadedById`, `uploadedBy` relation
- [ ] AC9: Order model has `createdAt` and `updatedAt` timestamps

---

### FR-003: Config Model Definition

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Define Config model for storing application settings as key-value pairs.
- **VI:** Định nghĩa Config model để lưu trữ cấu hình ứng dụng dưới dạng cặp key-value.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Config model has `id` field (cuid, primary key)
- [ ] AC2: Config model has `key` field (unique string)
- [ ] AC3: Config model has `value` field (string)
- [ ] AC4: Config model has `updatedAt` timestamp

---

### FR-004: Role Enum Definition

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Define Role enum with three values for role-based access control.
- **VI:** Định nghĩa Role enum với ba giá trị cho role-based access control.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Role enum includes `SUPER_ADMIN` value
- [ ] AC2: Role enum includes `ADMIN` value
- [ ] AC3: Role enum includes `STAFF` value

---

### FR-005: OrderStatus Enum Definition

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Define OrderStatus enum with three values for order lifecycle tracking.
- **VI:** Định nghĩa OrderStatus enum với ba giá trị cho order lifecycle tracking.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: OrderStatus enum includes `IN_PROGRESS` value
- [ ] AC2: OrderStatus enum includes `COMPLETED` value
- [ ] AC3: OrderStatus enum includes `OVERDUE` value

---

### FR-006: Database Indexes

| Aspect | Detail |
|--------|--------|
| Priority | Should |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Add indexes on frequently queried Order fields for dashboard performance.
- **VI:** Thêm indexes trên các fields Order thường được query cho hiệu suất dashboard.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Index exists on `Order.status`
- [ ] AC2: Index exists on `Order.registeredDate`
- [ ] AC3: Index exists on `Order.requiredDate`

---

### FR-007: User-Order Relationship

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Establish one-to-many relationship between User and Order for upload tracking.
- **VI:** Thiết lập quan hệ one-to-many giữa User và Order cho upload tracking.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Order has `uploadedById` foreign key to User
- [ ] AC2: Order has `uploadedBy` relation field
- [ ] AC3: User has `orders` relation field (Order[])
- [ ] AC4: Relation uses named relation "UploadedBy"

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Schema Validation

| Aspect | Detail |
|--------|--------|
| Category | Quality |
| Metric | `pnpm prisma validate` passes with 0 errors |

**Description / Mô tả:**
- **EN:** Prisma schema must be syntactically valid and pass Prisma validation.
- **VI:** Prisma schema phải hợp lệ về cú pháp và pass Prisma validation.

---

### NFR-002: Client Generation

| Aspect | Detail |
|--------|--------|
| Category | Build |
| Metric | `pnpm prisma generate` completes successfully |

**Description / Mô tả:**
- **EN:** Prisma client must be generated with correct TypeScript types.
- **VI:** Prisma client phải được generate với TypeScript types chính xác.

---

### NFR-003: Build Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Build |
| Metric | `pnpm build` passes with 0 type errors |

**Description / Mô tả:**
- **EN:** Application must build successfully with the new schema types.
- **VI:** Ứng dụng phải build thành công với schema types mới.

---

### NFR-004: Query Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | Dashboard queries use indexes |

**Description / Mô tả:**
- **EN:** Indexes must be defined to optimize common dashboard queries (filter by status, sort by dates).
- **VI:** Indexes phải được định nghĩa để tối ưu các queries dashboard phổ biến (lọc theo status, sắp xếp theo dates).

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-hepper

| Aspect | Detail |
|--------|--------|
| Changes | Expand Prisma schema, regenerate client |
| Sync Type | none (single root) |

**Files Affected / Files Ảnh hưởng:**
- `prisma/schema.prisma` — Schema expansion
- `src/generated/prisma/` — Regenerated client types

**Integration Points / Điểm Tích hợp:**
- None (schema-only, no application code changes)

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- None (using existing Prisma dependencies)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Schema: User

```typescript
interface User {
  id: string;           // cuid
  email: string | null; // unique
  name: string | null;
  role: Role;           // SUPER_ADMIN | ADMIN | STAFF
  staffCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];      // relation
}
```

### Schema: Order

```typescript
interface Order {
  id: string;              // cuid
  jobNumber: string;       // unique
  registeredDate: Date;
  requiredDate: Date;
  priority: number;        // default 0
  status: OrderStatus;     // IN_PROGRESS | COMPLETED | OVERDUE
  registeredBy: string | null;
  sampleCount: number;     // default 1
  description: string | null;
  completedAt: Date | null;
  uploadedAt: Date;
  uploadedById: string;    // FK to User
  uploadedBy: User;        // relation
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema: Config

```typescript
interface Config {
  id: string;      // cuid
  key: string;     // unique
  value: string;
  updatedAt: Date;
}
```

---

## 6. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Prisma 7.x adapter pattern | Schema must NOT include `url` in datasource (configured in prisma.config.ts) |
| EC-002 | Optional email on User | STAFF users may not have email (use staffCode instead) |
| EC-003 | Required uploadedById | Every Order must have an uploader (no anonymous uploads) |
| EC-004 | Empty database | Schema works with no data (fresh install) |

---

## 7. Dependencies / Phụ thuộc

| Dependency | Type | Status |
|------------|------|--------|
| `prisma@7.3.0` | Package | ✅ Existing |
| `@prisma/client@7.3.0` | Package | ✅ Existing |
| `@prisma/adapter-pg@7.3.0` | Package | ✅ Existing |
| PostgreSQL (connection) | Service | ⏳ Later (deployment/US-0.3.2) |

---

## 8. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Mitigation |
|------|--------|------------|
| Prisma 7.x breaking changes | Medium | Already addressed in US-0.1.1, schema follows 7.x patterns |
| Schema doesn't match app needs | Low | Schema from Tech Stack Instructions (authoritative source) |
| Build failures after schema change | Low | Verify with `pnpm build` before completing |

---

## 9. Verification Plan / Kế hoạch Xác minh

| Step | Command | Expected Result |
|------|---------|-----------------|
| 1 | `pnpm prisma validate` | Schema valid, no errors |
| 2 | `pnpm prisma generate` | Client generated in `src/generated/prisma` |
| 3 | `pnpm build` | Build passes, no type errors |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-05 |
| Reviewer | ⏳ Pending | |

