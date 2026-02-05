# Task Plan — US-0.1.1 Initialize Project Structure
# Kế hoạch Task — US-0.1.1 Khởi tạo Cấu trúc Dự án
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.1.1 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Initialize Next.js 16.0.10 Project Structure |
| Total Tasks | 8 |
| Estimated Effort | ~2 hours |
| Affected Roots | sgs-cs-hepper |
| Spec Reference | [spec.md](../01_spec/spec.md) |

---

## 1. Goal

🇻🇳 Sau khi hoàn thành tất cả tasks, sẽ có một dự án Next.js 16.0.10 hoàn chỉnh với cấu trúc thư mục đúng, dependencies đã cài đặt, Prisma schema placeholder, và build thành công.

🇬🇧 After completing all tasks, there will be a complete Next.js 16.0.10 project with correct folder structure, installed dependencies, Prisma schema placeholder, and successful build.

---

## 2. Task Overview

| ID | Title | Root | Type | Est. | Deps | Status |
|----|-------|------|------|------|------|--------|
| T-001 | Scaffold Next.js project | sgs-cs-hepper | New | 15m | - | ⏳ |
| T-002 | Initialize shadcn/ui | sgs-cs-hepper | New | 10m | T-001 | ⏳ |
| T-003 | Add Prisma ORM | sgs-cs-hepper | New | 10m | T-001 | ⏳ |
| T-004 | Create folder structure | sgs-cs-hepper | New | 15m | T-001 | ⏳ |
| T-005 | Create Prisma client singleton | sgs-cs-hepper | New | 10m | T-003 | ⏳ |
| T-006 | Create environment template | sgs-cs-hepper | New | 10m | T-003 | ⏳ |
| T-007 | Update Prisma schema | sgs-cs-hepper | Modify | 15m | T-003 | ⏳ |
| T-008 | Verify build | sgs-cs-hepper | Verify | 10m | T-001..T-007 | ⏳ |

**Legend:**
- Type: `New` = Create new, `Modify` = Change existing, `Verify` = Validation step
- Status: ⏳ Pending, 🔄 In Progress, ✅ Done, ❌ Blocked

---

## 3. Execution Flow

```mermaid
flowchart TD
    T001[T-001: Scaffold Next.js] --> T002[T-002: shadcn/ui]
    T001 --> T003[T-003: Add Prisma]
    T001 --> T004[T-004: Folder structure]
    T003 --> T005[T-005: Prisma client]
    T003 --> T006[T-006: .env.example]
    T003 --> T007[T-007: Update schema]
    T002 --> T008[T-008: Verify build]
    T004 --> T008
    T005 --> T008
    T006 --> T008
    T007 --> T008
    
    style T001 fill:#4dabf7,stroke:#1971c2,color:#fff
    style T008 fill:#51cf66,stroke:#2f9e44,color:#fff
```

---

## 3.5 Parallel Execution Notes

### Parallel Groups

🇻🇳 Các tasks trong cùng group có thể chạy song song (khác file, không depend lẫn nhau).

🇬🇧 Tasks in the same group can run in parallel (different files, no inter-dependencies).

| Group | Tasks | Reason |
|-------|-------|--------|
| A | T-002, T-003, T-004 | All depend on T-001 only, modify different files |
| B | T-005, T-006, T-007 | All depend on T-003 only, modify different files |

### Sequential Constraints

🇻🇳 Các tasks phải chạy tuần tự vì lý do kỹ thuật.

🇬🇧 Tasks that must run sequentially due to technical reasons.

| Sequence | Reason |
|----------|--------|
| T-001 → Group A | T-001 creates the project first |
| T-003 → Group B | T-003 creates Prisma schema first |
| All → T-008 | T-008 verifies everything is complete |

---

## 4. Task Details

### T-001 — Scaffold Next.js Project

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 15 min |
| Dependencies | None |
| FR Covered | FR-001, FR-002 |

#### Description

🇻🇳 Sử dụng `create-next-app` để tạo dự án Next.js 16.0.10 với TypeScript, Tailwind CSS, ESLint, App Router, và src directory.

🇬🇧 Use `create-next-app` to scaffold a Next.js 16.0.10 project with TypeScript, Tailwind CSS, ESLint, App Router, and src directory.

#### Files

| Action | Path |
|--------|------|
| Create | `sgs-cs-helper/` (entire project) |

#### Implementation

🇻🇳 Chạy command trong thư mục `sgs-cs-hepper/`. Project sẽ được tạo trong subfolder `sgs-cs-helper/`.

🇬🇧 Run command in `sgs-cs-hepper/` directory. Project will be created in subfolder `sgs-cs-helper/`.

```bash
pnpm create next-app@latest sgs-cs-helper \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

#### Done Criteria

- [ ] Project folder `sgs-cs-helper/` created
- [ ] `package.json` contains `"next": "^16"` or compatible
- [ ] `src/app/` directory exists
- [ ] `tsconfig.json` has `"strict": true`

#### Verification

```bash
cd sgs-cs-helper && cat package.json | grep next
ls -la src/app/
cat tsconfig.json | grep strict
```

---

### T-002 — Initialize shadcn/ui

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 10 min |
| Dependencies | T-001 |
| FR Covered | FR-003 |

#### Description

🇻🇳 Khởi tạo shadcn/ui với style New York và CSS variables. Không cài đặt components ở giai đoạn này - sẽ thêm khi cần.

🇬🇧 Initialize shadcn/ui with New York style and CSS variables. Do not install components at this stage - will add as needed.

#### Files

| Action | Path |
|--------|------|
| Create | `components.json` |
| Modify | `tailwind.config.ts` |
| Modify | `src/app/globals.css` |
| Create | `src/lib/utils.ts` |

#### Implementation

```bash
cd sgs-cs-helper
pnpm dlx shadcn@latest init
```

🇻🇳 Khi được hỏi, chọn:
- Style: New York
- Base color: Slate
- CSS variables: Yes

🇬🇧 When prompted, choose:
- Style: New York  
- Base color: Slate
- CSS variables: Yes

#### Done Criteria

- [ ] `components.json` exists
- [ ] `src/components/ui/` directory exists
- [ ] `src/lib/utils.ts` exists with `cn` function
- [ ] CSS variables configured in `globals.css`

#### Verification

```bash
ls -la components.json
ls -la src/components/ui/
cat src/lib/utils.ts
```

---

### T-003 — Add Prisma ORM

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 10 min |
| Dependencies | T-001 |
| FR Covered | FR-004 |

#### Description

🇻🇳 Cài đặt Prisma và khởi tạo schema với PostgreSQL provider.

🇬🇧 Install Prisma and initialize schema with PostgreSQL provider.

#### Files

| Action | Path |
|--------|------|
| Create | `prisma/schema.prisma` |
| Modify | `package.json` (add deps) |

#### Implementation

```bash
cd sgs-cs-helper
pnpm add prisma @prisma/client
pnpm prisma init --datasource-provider postgresql
```

#### Done Criteria

- [ ] `prisma/schema.prisma` exists
- [ ] Schema has `postgresql` provider
- [ ] `@prisma/client` in dependencies

#### Verification

```bash
cat prisma/schema.prisma
cat package.json | grep prisma
```

---

### T-004 — Create Folder Structure

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 15 min |
| Dependencies | T-001 |
| FR Covered | FR-006 |

#### Description

🇻🇳 Tạo cấu trúc thư mục theo hướng dẫn tech stack. Sử dụng `.gitkeep` cho các thư mục placeholder.

🇬🇧 Create folder structure per tech stack instructions. Use `.gitkeep` for placeholder directories.

#### Files

| Action | Path |
|--------|------|
| Create | `src/app/(auth)/.gitkeep` |
| Create | `src/app/(dashboard)/.gitkeep` |
| Create | `src/app/api/.gitkeep` |
| Create | `src/components/orders/.gitkeep` |
| Create | `src/components/notifications/.gitkeep` |
| Create | `src/lib/auth/.gitkeep` |
| Create | `src/lib/excel/.gitkeep` |
| Create | `src/lib/utils/.gitkeep` |
| Create | `src/types/.gitkeep` |
| Create | `src/hooks/.gitkeep` |

#### Implementation

```bash
cd sgs-cs-helper

# App route groups
mkdir -p src/app/\(auth\) && touch src/app/\(auth\)/.gitkeep
mkdir -p src/app/\(dashboard\) && touch src/app/\(dashboard\)/.gitkeep
mkdir -p src/app/api && touch src/app/api/.gitkeep

# Components
mkdir -p src/components/orders && touch src/components/orders/.gitkeep
mkdir -p src/components/notifications && touch src/components/notifications/.gitkeep

# Lib subdirectories
mkdir -p src/lib/auth && touch src/lib/auth/.gitkeep
mkdir -p src/lib/excel && touch src/lib/excel/.gitkeep
mkdir -p src/lib/utils && touch src/lib/utils/.gitkeep

# Types and hooks
mkdir -p src/types && touch src/types/.gitkeep
mkdir -p src/hooks && touch src/hooks/.gitkeep
```

#### Done Criteria

- [ ] `src/app/(auth)/` exists
- [ ] `src/app/(dashboard)/` exists
- [ ] `src/app/api/` exists
- [ ] `src/components/orders/` exists
- [ ] `src/lib/auth/` exists
- [ ] `src/lib/excel/` exists
- [ ] `src/types/` exists
- [ ] `src/hooks/` exists

#### Verification

```bash
find src -name ".gitkeep" | wc -l
# Should be at least 10
```

---

### T-005 — Create Prisma Client Singleton

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 10 min |
| Dependencies | T-003 |
| FR Covered | FR-004 |

#### Description

🇻🇳 Tạo Prisma client singleton pattern để tránh connection exhaustion trong development mode.

🇬🇧 Create Prisma client singleton pattern to prevent connection exhaustion in development mode.

#### Files

| Action | Path |
|--------|------|
| Create | `src/lib/db/index.ts` |

#### Implementation

```typescript
// src/lib/db/index.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

#### Done Criteria

- [ ] `src/lib/db/index.ts` exists
- [ ] Exports `prisma` singleton
- [ ] Uses globalThis pattern

#### Verification

```bash
cat src/lib/db/index.ts
```

---

### T-006 — Create Environment Template

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | New |
| Estimated | 10 min |
| Dependencies | T-003 |
| FR Covered | FR-005 |

#### Description

🇻🇳 Tạo `.env.example` để document tất cả biến môi trường cần thiết.

🇬🇧 Create `.env.example` to document all required environment variables.

#### Files

| Action | Path |
|--------|------|
| Create | `.env.example` |
| Modify | `.gitignore` (ensure .env.local ignored) |

#### Implementation

```bash
# .env.example
# ============================================
# SGS CS Order Tracker - Environment Variables
# ============================================
# Copy this file to .env.local and fill in values

# Database (PostgreSQL)
# Option 1: Vercel Postgres
# Option 2: Supabase
# Option 3: Local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/sgs_order_tracker?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for Admin login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Staff Login (shared code)
STAFF_LOGIN_CODE="your-staff-login-code"
```

#### Done Criteria

- [ ] `.env.example` exists
- [ ] Contains DATABASE_URL placeholder
- [ ] Contains NEXTAUTH_SECRET placeholder
- [ ] Contains NEXTAUTH_URL placeholder
- [ ] Contains Google OAuth placeholders
- [ ] `.env.local` is in `.gitignore`

#### Verification

```bash
cat .env.example
grep ".env.local" .gitignore
```

---

### T-007 — Update Prisma Schema

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | Modify |
| Estimated | 15 min |
| Dependencies | T-003 |
| FR Covered | FR-004 |

#### Description

🇻🇳 Cập nhật Prisma schema với các models placeholder: User, Order, Config. Đây là placeholder - sẽ được hoàn thiện trong US-0.3.1.

🇬🇧 Update Prisma schema with placeholder models: User, Order, Config. These are placeholders - will be finalized in US-0.3.1.

#### Files

| Action | Path |
|--------|------|
| Modify | `prisma/schema.prisma` |

#### Implementation

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// PLACEHOLDER MODELS - Will be detailed in US-0.3.1
// ============================================

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id             String   @id @default(cuid())
  jobNumber      String   @unique
  status         String   @default("pending")
  registeredDate DateTime
  requiredDate   DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Config {
  id    String @id @default(cuid())
  key   String @unique
  value String
}
```

#### Done Criteria

- [ ] Schema has User model with Role enum
- [ ] Schema has Order model with required fields
- [ ] Schema has Config model
- [ ] `pnpm prisma validate` succeeds

#### Verification

```bash
pnpm prisma validate
pnpm prisma format
```

---

### T-008 — Verify Build

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Type | Verify |
| Estimated | 10 min |
| Dependencies | T-001, T-002, T-003, T-004, T-005, T-006, T-007 |
| FR Covered | FR-007 |

#### Description

🇻🇳 Xác minh dự án build thành công. Điều này đảm bảo tất cả cấu hình và dependencies hoạt động chính xác.

🇬🇧 Verify the project builds successfully. This ensures all configuration and dependencies work correctly.

#### Files

| Action | Path |
|--------|------|
| N/A | Verification only |

#### Implementation

```bash
cd sgs-cs-helper

# Generate Prisma client (required before build)
pnpm prisma generate

# Run build
pnpm build
```

#### Done Criteria

- [ ] `pnpm prisma generate` succeeds
- [ ] `pnpm build` succeeds without errors
- [ ] `.next/` directory created
- [ ] No TypeScript errors
- [ ] No ESLint errors

#### Verification

```bash
ls -la .next/
echo "Build successful!"
```

---

## 5. Cross-Root Integration Tasks

Not applicable - only sgs-cs-hepper root is affected.

---

## 6. Requirements Coverage

| Requirement | Tasks | Status |
|-------------|-------|--------|
| FR-001 | T-001 | ⬜ |
| FR-002 | T-001 | ⬜ |
| FR-003 | T-002 | ⬜ |
| FR-004 | T-003, T-005, T-007 | ⬜ |
| FR-005 | T-006 | ⬜ |
| FR-006 | T-004 | ⬜ |
| FR-007 | T-008 | ⬜ |
| NFR-001 | T-001 | ⬜ |
| NFR-002 | T-001 | ⬜ |
| NFR-003 | T-001, T-008 | ⬜ |
| NFR-004 | T-004 | ⬜ |

---

## 7. Test Plan

### 7.1 Test Strategy

🇻🇳 Vì đây là story foundation (khởi tạo dự án), testing tập trung vào verification commands thay vì automated tests. Unit tests sẽ được thêm trong các story tiếp theo khi có business logic.

🇬🇧 Since this is a foundation story (project initialization), testing focuses on verification commands rather than automated tests. Unit tests will be added in subsequent stories when there's business logic.

| Type | Scope | Coverage Target |
|------|-------|-----------------|
| Verification | Build, config files | 100% of criteria |
| Unit | N/A (no business logic) | N/A |
| Integration | N/A (no integrations) | N/A |

### 7.2 Test Cases by Task

| TC ID | Task | Test Description | Type | Expected Result |
|-------|------|------------------|------|-----------------|
| TC-001 | T-001 | Check Next.js version in package.json | Verify | Contains `next: ^16` |
| TC-002 | T-001 | Verify src/app structure exists | Verify | `layout.tsx`, `page.tsx` present |
| TC-003 | T-001 | Verify TypeScript strict mode | Verify | `strict: true` in tsconfig |
| TC-004 | T-002 | Verify shadcn config exists | Verify | `components.json` present |
| TC-005 | T-002 | Verify utils.ts with cn function | Verify | `cn` function exported |
| TC-006 | T-003 | Verify Prisma schema exists | Verify | `prisma/schema.prisma` present |
| TC-007 | T-004 | Verify all folders created | Verify | 10+ `.gitkeep` files |
| TC-008 | T-005 | Verify Prisma singleton | Verify | `src/lib/db/index.ts` exists |
| TC-009 | T-006 | Verify .env.example contents | Verify | All required vars present |
| TC-010 | T-007 | Verify Prisma schema validates | Verify | `prisma validate` succeeds |
| TC-011 | T-008 | Verify build succeeds | Verify | `pnpm build` exits 0 |
| TC-012 | T-008 | Verify .next directory created | Verify | `.next/` exists |

### 7.3 Edge Cases & Error Scenarios

🇻🇳 Các trường hợp lỗi có thể xảy ra trong quá trình initialization.

🇬🇧 Error scenarios that may occur during initialization.

| TC ID | Scenario | Input | Expected Behavior |
|-------|----------|-------|-------------------|
| TC-E01 | pnpm not installed | Run command | Show install instructions |
| TC-E02 | Node.js < 20 | Run create-next-app | Clear error message |
| TC-E03 | Port 3000 in use | pnpm dev | Auto-select next port |
| TC-E04 | Invalid Prisma schema | pnpm prisma validate | Show validation errors |

### 7.4 Test Data Requirements

🇻🇳 Không cần test data vì đây là project initialization.

🇬🇧 No test data needed as this is project initialization.

---

## 8. Risk per Task

| Task | Risk | Mitigation |
|------|------|------------|
| T-001 | create-next-app version mismatch | Use `@latest`, verify version |
| T-002 | shadcn/ui breaking changes | Use `@latest`, follow prompts |
| T-003 | Prisma version conflicts | Use latest stable version |
| T-007 | Schema validation errors | Run `prisma validate` immediately |
| T-008 | Build fails | Check TypeScript errors, fix before proceeding |

---

## 9. Rollback Plan

| Task | Rollback Action |
|------|-----------------|
| T-001 | `rm -rf sgs-cs-helper/` |
| T-002 | Remove `components.json`, revert `tailwind.config.ts` |
| T-003 | Remove `prisma/` folder, remove deps from package.json |
| T-004 | Remove created `.gitkeep` files and empty folders |
| T-005 | Delete `src/lib/db/index.ts` |
| T-006 | Delete `.env.example` |
| T-007 | Restore original schema or `git checkout prisma/schema.prisma` |

---

## 10. Environment Requirements

🇻🇳 Cần có trước khi bắt đầu:

🇬🇧 Required before starting:

```bash
# Check Node.js version (must be 20+)
node --version

# Check pnpm is installed
pnpm --version

# If pnpm not installed:
npm install -g pnpm
```

---

## 11. Open Questions

🇻🇳 Không có câu hỏi mở - tất cả đã được giải quyết trong Phase 0 & 1.

🇬🇧 No open questions - all resolved in Phase 0 & 1.

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Author | Copilot | ✅ Done | 2026-02-05 |
| Reviewer | ... | ⏳ Pending | ... |

---

## Next Step

🇻🇳 Sau khi phê duyệt, tiến hành **Phase 3: Implementation** với task đầu tiên.

🇬🇧 After approval, proceed to **Phase 3: Implementation** with the first task.

Reply: `approved` or `revise: <feedback>`
