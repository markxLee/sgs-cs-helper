# Solution Design — US-0.3.1 Create Core Database Schema
# Thiết kế Giải pháp — US-0.3.1 Tạo Schema Database Cốt lõi
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.3.1 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Create Core Database Schema |
| Approach | Expand placeholder Prisma schema to full production schema |
| Components | 3 models (User, Order, Config), 2 enums (Role, OrderStatus) |
| Affected Roots | sgs-cs-hepper |
| Risk Level | Low (schema-only, no data migration) |
| Phase 0 Reference | [user-stories.md](../../product/sgs-cs-helper/user-stories.md) → US-0.3.1 |

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** The current Prisma schema contains placeholder models created during US-0.1.1. These models lack the required fields, relations, and indexes needed for the authentication (US-0.2.x) and order tracking (US-1.x) features. We need to expand the schema to support the full application requirements.

**VI:** Schema Prisma hiện tại chứa các models placeholder được tạo trong US-0.1.1. Các models này thiếu các fields, relations, và indexes cần thiết cho các tính năng authentication (US-0.2.x) và order tracking (US-1.x). Cần mở rộng schema để hỗ trợ đầy đủ yêu cầu ứng dụng.

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| User model | Basic (id, email, name, role) | Full (+ staffCode, orders relation) |
| Order model | Minimal (jobNumber, dates, status as String) | Full (+ priority, OrderStatus enum, uploader relation) |
| Config model | Basic (key, value) | Same (+ updatedAt) |
| Role enum | ✅ Exists | ✅ Keep as-is |
| OrderStatus enum | ❌ Missing | Add IN_PROGRESS, COMPLETED, OVERDUE |
| Indexes | ❌ None | Add on status, registeredDate, requiredDate |
| Relations | ❌ None | User → Order (1:N) |

### Gap Analysis / Phân tích Khoảng cách

**Missing / Còn thiếu:**
- `OrderStatus` enum with proper values
- `User.staffCode` field for shared code login
- `User.orders` relation
- `Order` fields: priority, registeredBy, sampleCount, description, completedAt
- `Order.uploadedBy` relation to User
- `Config.updatedAt` field
- Database indexes for query optimization

**Needs Change / Cần thay đổi:**
- `Order.status` from `String` to `OrderStatus` enum
- Add `@@index` decorators for frequently queried fields

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | prisma/schema.prisma | Schema expansion |
| sgs-cs-hepper | src/generated/prisma | Regenerate client |

### Open Questions / Câu hỏi Mở

1. ✅ **Resolved:** Should `staffCode` be on User model? → Yes, per tech stack instructions
2. ✅ **Resolved:** Is `OVERDUE` a stored status or computed? → Stored (can be updated by background job later)

### Assumptions / Giả định

1. **EN:** Database connection will be configured later (US-0.3.2 or deployment)
   **VI:** Kết nối database sẽ được cấu hình sau (US-0.3.2 hoặc deployment)

2. **EN:** No data migration needed (fresh schema, no existing data)
   **VI:** Không cần migration dữ liệu (schema mới, chưa có dữ liệu)

3. **EN:** Prisma 7.x driver adapter pattern is already configured (from US-0.1.1)
   **VI:** Pattern driver adapter Prisma 7.x đã được cấu hình (từ US-0.1.1)

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable |
|----------|---------|------------|
| `prisma/schema.prisma` | Placeholder models | Yes - expand these |
| `docs/tech-stack/sgs-cs-helper/instructions.md` | Target schema | Yes - exact specification |
| `src/lib/db/index.ts` | Prisma singleton | Yes - already configured |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| Tech Stack Instructions | Complete schema definition | Use as source of truth for field definitions |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `prisma` | Schema & migrations | ✅ Existing (7.3.0) |
| `@prisma/client` | Type-safe queries | ✅ Existing (7.3.0) |
| `@prisma/adapter-pg` | PostgreSQL adapter | ✅ Existing (7.3.0) |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| N/A | N/A | Single root | No cross-root dependencies |

### Reusable Components / Component Tái sử dụng

- `prisma/schema.prisma` — Existing placeholder, will be expanded
- `src/lib/db/index.ts` — Prisma client singleton (no changes needed)
- `prisma.config.ts` — Prisma 7.x config (no changes needed)

### New Components Needed / Component Cần tạo Mới

- **EN:** None - only schema expansion
- **VI:** Không có - chỉ mở rộng schema

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Expand the existing placeholder Prisma schema to include all fields, enums, relations, and indexes required for the SGS CS Order Tracker application. The schema follows the exact specification from the Tech Stack Instructions document. After updating the schema, regenerate the Prisma client to update TypeScript types.

**VI:** Mở rộng schema Prisma placeholder hiện tại để bao gồm tất cả fields, enums, relations, và indexes cần thiết cho ứng dụng SGS CS Order Tracker. Schema tuân theo đặc tả chính xác từ tài liệu Tech Stack Instructions. Sau khi cập nhật schema, regenerate Prisma client để cập nhật TypeScript types.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Expand existing schema** | Simple, matches spec, no migration | None | ✅ Selected |
| Create new schema file | Fresh start | Loses generator/datasource config | ❌ Unnecessary |
| Use raw SQL | Maximum control | Loses type safety, more work | ❌ Defeats Prisma purpose |

### Target Schema / Schema Mục tiêu

```prisma
// ============================================
// ENUMS
// ============================================

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
}

enum OrderStatus {
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

// ============================================
// MODELS
// ============================================

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // For STAFF with shared code
  staffCode String?
  
  // Relations
  orders    Order[]  @relation("UploadedBy")
}

model Order {
  id              String      @id @default(cuid())
  jobNumber       String      @unique
  registeredDate  DateTime
  requiredDate    DateTime
  priority        Int         @default(0)
  status          OrderStatus @default(IN_PROGRESS)
  
  // Parsed data
  registeredBy    String?
  sampleCount     Int         @default(1)
  description     String?
  
  // Tracking
  completedAt     DateTime?
  uploadedAt      DateTime    @default(now())
  uploadedById    String
  uploadedBy      User        @relation("UploadedBy", fields: [uploadedById], references: [id])
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([status])
  @@index([registeredDate])
  @@index([requiredDate])
}

model Config {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

### Changes Summary / Tóm tắt Thay đổi

| Model/Enum | Change Type | Details |
|------------|-------------|---------|
| `OrderStatus` | **ADD** | New enum with IN_PROGRESS, COMPLETED, OVERDUE |
| `User.staffCode` | **ADD** | Optional String for shared code login |
| `User.orders` | **ADD** | Relation to Order[] |
| `Order.status` | **MODIFY** | String → OrderStatus enum |
| `Order.priority` | **ADD** | Int field with default 0 |
| `Order.registeredBy` | **ADD** | Optional String |
| `Order.sampleCount` | **ADD** | Int with default 1 |
| `Order.description` | **ADD** | Optional String |
| `Order.completedAt` | **ADD** | Optional DateTime |
| `Order.uploadedAt` | **ADD** | DateTime with default now() |
| `Order.uploadedById` | **ADD** | Foreign key to User |
| `Order.uploadedBy` | **ADD** | Relation to User |
| `Order.@@index` | **ADD** | 3 indexes on status, registeredDate, requiredDate |
| `Config.updatedAt` | **ADD** | DateTime with @updatedAt |

### Data Flow / Luồng Dữ liệu

| Step | Action | Result |
|------|--------|--------|
| 1 | Update `prisma/schema.prisma` | Schema file modified |
| 2 | Run `pnpm prisma generate` | TypeScript types updated in `src/generated/prisma` |
| 3 | Run `pnpm prisma db push` (when DB available) | Database schema applied |
| 4 | Verify with `pnpm build` | Confirm no type errors |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Schema syntax error | Prisma validate catches | Fix before generate |
| Type generation fails | Prisma generate shows error | Fix schema issue |
| Build fails after generate | TypeScript errors | Investigate type mismatches |

### Rollback Plan / Kế hoạch Rollback

**EN:** If schema changes cause issues:
1. Revert `prisma/schema.prisma` to previous version (git checkout)
2. Re-run `pnpm prisma generate`
3. No database migration needed (schema only, no data)

**VI:** Nếu thay đổi schema gây lỗi:
1. Revert `prisma/schema.prisma` về version trước (git checkout)
2. Chạy lại `pnpm prisma generate`
3. Không cần migration database (chỉ schema, không có data)

---

## 0.4 Verification Plan / Kế hoạch Xác minh

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Schema valid | `pnpm prisma validate` | No errors |
| Client generated | `pnpm prisma generate` | Success, types in `src/generated/prisma` |
| Build passes | `pnpm build` | Compiled successfully |
| (Optional) DB push | `pnpm prisma db push` | Schema applied (requires DB connection) |

---

## Acceptance Criteria Mapping / Ánh xạ Tiêu chí Nghiệm thu

| AC | Requirement | How Verified |
|----|-------------|--------------|
| AC1 | User model with id, email, name, role, staffCode, timestamps | Schema inspection |
| AC2 | Order model with jobNumber, registeredDate, requiredDate, priority, status | Schema inspection |
| AC3 | Config model with key-value pairs | Schema inspection |
| AC4 | Role enum includes SUPER_ADMIN, ADMIN, STAFF | Schema inspection |
| AC5 | OrderStatus enum includes IN_PROGRESS, COMPLETED, OVERDUE | Schema inspection |
| AC6 | Indexes on frequently queried fields | Schema inspection (@@index) |
| AC7 | `pnpm prisma generate` succeeds | Command execution |

---

## Diagrams / Sơ đồ

See: [diagrams/flow-overview.md](./diagrams/flow-overview.md)

---

## Decision Log Reference / Tham chiếu Nhật ký Quyết định

See: [decision-log.md](./decision-log.md)

