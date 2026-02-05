# Solution Design — US-0.3.2 Seed Initial Data
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.3.2 -->
<!-- 🇻🇳 Vietnamese follows 🇬🇧 English — per contract -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Seed Initial Data |
| User Story | US-0.3.2 |
| Status | Phase 0 Analysis Complete |
| Components | 2 (seed script + lib/auth) |
| Affected Roots | sgs-cs-hepper |

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** The database schema exists (US-0.3.1) but the system has no initial data. Before the application can be used, we need to seed a Super Admin user and default configuration values. Without this, no one can log in.

**VI:** Schema database đã tồn tại (US-0.3.1) nhưng hệ thống chưa có dữ liệu khởi tạo. Trước khi ứng dụng có thể sử dụng, cần seed Super Admin user và các config mặc định. Không có điều này, không ai có thể đăng nhập.

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Super Admin | No user exists | 1 Super Admin with hashed password |
| Config | No config values | warning_threshold, staff_code values |
| Seed Script | Does not exist | `prisma/seed.ts` with `pnpm prisma db seed` |
| Idempotency | N/A | Running twice should not create duplicates |

### Gap Analysis / Phân tích Khoảng cách

**EN:**
- No seed script exists in `prisma/` directory
- No password hashing utility exists
- No `prisma.seed` configuration in `package.json`
- No bcrypt or similar hashing library installed

**VI:**
- Chưa có seed script trong thư mục `prisma/`
- Chưa có utility để hash password
- Chưa có cấu hình `prisma.seed` trong `package.json`
- Chưa cài đặt bcrypt hoặc thư viện hash tương tự

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | `prisma/seed.ts` | Create seed script |
| sgs-cs-hepper | `src/lib/auth/password.ts` | Create password hashing utility |
| sgs-cs-hepper | `package.json` | Add prisma.seed config + bcrypt dependency |
| sgs-cs-hepper | `.env.example` | Add seed-related env vars |

### Open Questions / Câu hỏi Mở

1. **Password hashing algorithm?** → Use bcrypt (industry standard for password hashing)
2. **Super Admin email format?** → From `SUPER_ADMIN_EMAIL` env var
3. **Default staff code?** → From `STAFF_CODE` env var or generate random

### Assumptions / Giả định

1. Database connection is already configured (`DATABASE_URL` exists)
2. Prisma 7.x with adapter pattern is already working (from US-0.3.1)
3. Super Admin credentials will be provided via environment variables
4. staff_code is a simple string (not hashed) for easy staff login

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| `prisma.config.ts` | Prisma config pattern | Yes | Uses dotenv, export default |
| `src/generated/prisma/` | Generated Prisma client | Yes | Import from here |
| No seed.ts exists | N/A | Need to create | — |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| `prisma.config.ts` | Loads dotenv, configures Prisma | Use same dotenv pattern |
| Prisma 7.x docs | Seed scripts with ESM | Use `tsx` for TypeScript execution |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `bcrypt` | Password hashing (native, fast) | Need to add |
| `@types/bcrypt` | TypeScript types | Need to add |
| `tsx` | Run TypeScript seed script | Need to add (devDep) |

### Alternative: bcryptjs vs bcrypt

| Package | Pros | Cons | Verdict |
|---------|------|------|---------|
| `bcrypt` | Native, faster | Needs node-gyp | ✅ Better for production |
| `bcryptjs` | Pure JS, no build | Slower | ❌ Only if build issues |

### Reusable Components / Component Tái sử dụng

- `src/generated/prisma/` — Prisma client (already generated)
- `prisma.config.ts` — Pattern for loading env vars

### New Components Needed / Component Cần tạo Mới

1. `prisma/seed.ts` — Main seed script
2. `src/lib/auth/password.ts` — Password hashing utility (reusable for auth later)

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Create a Prisma seed script that:
1. Loads credentials from environment variables
2. Hashes the Super Admin password using bcrypt
3. Creates Super Admin user using upsert (idempotent)
4. Creates default Config values using upsert (idempotent)

The password hashing logic will be placed in a reusable utility `src/lib/auth/password.ts` so it can be reused by the authentication system (US-0.2.x) later.

**VI:** Tạo Prisma seed script:
1. Load credentials từ environment variables
2. Hash password Super Admin bằng bcrypt
3. Tạo Super Admin user bằng upsert (idempotent)
4. Tạo Config mặc định bằng upsert (idempotent)

Logic hash password sẽ đặt trong utility tái sử dụng `src/lib/auth/password.ts` để dùng lại cho hệ thống authentication (US-0.2.x) sau này.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Upsert pattern** | Idempotent, safe to run multiple times | Slightly more complex | ✅ Selected |
| Create with check | Simple logic | Race conditions possible | ❌ Not idempotent |
| Delete + create | Simple | Destroys data on re-run | ❌ Dangerous |

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | `prisma/seed.ts` | sgs-cs-hepper | Main seed script for Prisma |
| 2 | `src/lib/auth/password.ts` | sgs-cs-hepper | Password hashing utility (hashPassword, verifyPassword) |

### Component Details / Chi tiết Component

#### Component 1: `prisma/seed.ts`

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Location | `prisma/seed.ts` |
| Purpose | EN: Seed Super Admin user and default configs / VI: Seed Super Admin và configs mặc định |
| Inputs | Environment variables: `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `STAFF_CODE` |
| Outputs | Database records: 1 User, 2-3 Config entries |
| Dependencies | Prisma client, `src/lib/auth/password.ts`, bcrypt |

#### Component 2: `src/lib/auth/password.ts`

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Location | `src/lib/auth/password.ts` |
| Purpose | EN: Reusable password hashing for auth / VI: Utility hash password tái sử dụng |
| Inputs | Plain text password |
| Outputs | Hashed password (bcrypt) |
| Dependencies | bcrypt |
| Exports | `hashPassword(password: string): Promise<string>`, `verifyPassword(password: string, hash: string): Promise<boolean>` |

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | Environment | seed.ts | Credentials | Load env vars |
| 2 | seed.ts | password.ts | Plain password | Hash password |
| 3 | password.ts | seed.ts | Hashed password | Return hash |
| 4 | seed.ts | Prisma Client | User data | Upsert Super Admin |
| 5 | seed.ts | Prisma Client | Config data | Upsert configs |
| 6 | Prisma Client | PostgreSQL | SQL | Execute queries |

### Seed Data Values / Giá trị Dữ liệu Seed

| Model | Key/Email | Value | Notes |
|-------|-----------|-------|-------|
| User | `$SUPER_ADMIN_EMAIL` | role=SUPER_ADMIN, hashed password | From env |
| Config | `warning_threshold` | `"80"` | Percentage |
| Config | `staff_code` | `$STAFF_CODE` or `"SGS2026"` | From env or default |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Missing env vars | Throw descriptive error, exit 1 | Clear message what's missing |
| Database connection fails | Prisma error bubbles up | Fix DATABASE_URL |
| Duplicate key (upsert) | No error - upsert handles it | Idempotent by design |
| Invalid password (too short) | Validate before hashing | Clear error message |

### Rollback Plan / Kế hoạch Rollback

**EN:** 
- Delete seeded records: `DELETE FROM "User" WHERE role = 'SUPER_ADMIN'`
- Delete configs: `DELETE FROM "Config" WHERE key IN ('warning_threshold', 'staff_code')`
- Remove added files and dependencies
- Revert package.json changes

**VI:**
- Xóa records đã seed bằng SQL
- Xóa các files và dependencies đã thêm
- Revert thay đổi package.json

---

## 0.4 Decisions / Quyết định

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Use bcrypt (not bcryptjs) | Native performance, industry standard |
| D-002 | Use upsert pattern | Idempotent, safe to run multiple times |
| D-003 | Separate password utility | Reusable for auth system (US-0.2.x) |
| D-004 | Use tsx for seed execution | TypeScript support without compilation |
| D-005 | Store credentials in env vars | Security best practice, configurable per environment |
| D-006 | Store staff_code as plain text in Config | Simple login mechanism, not sensitive like passwords |

---

## Files to Create / Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `prisma/seed.ts` | Main seed script |
| Create | `src/lib/auth/password.ts` | Password hashing utility |
| Create | `src/lib/auth/index.ts` | Auth lib barrel export |
| Modify | `package.json` | Add prisma.seed config + dependencies |
| Modify | `.env.example` | Add seed env vars |

---

## Summary / Tóm tắt

**EN:** Create idempotent seed script using Prisma upsert pattern. Separate password hashing into reusable utility. Use bcrypt for secure password hashing. All credentials from environment variables.

**VI:** Tạo seed script idempotent sử dụng Prisma upsert pattern. Tách logic hash password thành utility tái sử dụng. Sử dụng bcrypt cho hash password an toàn. Tất cả credentials từ biến môi trường.
