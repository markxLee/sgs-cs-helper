# Specification — US-0.3.2 Seed Initial Data
# Đặc tả — US-0.3.2 Seed Dữ liệu Khởi tạo
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.3.2 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Seed Initial Data |
| User Story | US-0.3.2 |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |
| Functional Reqs | 5 |
| Non-Functional Reqs | 3 |
| Affected Roots | sgs-cs-hepper |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:** This specification defines the requirements for seeding initial data into the database. The seed script will create a Super Admin user with hashed password and default configuration values. The script must be idempotent, allowing it to run multiple times without creating duplicate data.

**VI:** Đặc tả này định nghĩa yêu cầu cho việc seed dữ liệu khởi tạo vào database. Seed script sẽ tạo Super Admin user với mật khẩu đã hash và các giá trị config mặc định. Script phải idempotent, cho phép chạy nhiều lần mà không tạo dữ liệu trùng lặp.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- Create Prisma seed script (`prisma/seed.ts`)
- Create password hashing utility (`src/lib/auth/password.ts`)
- Seed Super Admin user with bcrypt-hashed password
- Seed default Config values (warning_threshold, staff_code)
- Configure package.json for `pnpm prisma db seed`
- Update .env.example with required environment variables

**Out of Scope / Ngoài phạm vi:**
- Authentication logic (US-0.2.x)
- Additional admin or staff users
- Order data seeding
- Production database migration
- Database connection configuration (already done)

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Super Admin User Seeding

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The seed script must create a Super Admin user with email, name, and hashed password. The user credentials must be read from environment variables for security.
- **VI:** Seed script phải tạo Super Admin user với email, name, và password đã hash. Credentials phải đọc từ biến môi trường để bảo mật.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Super Admin user is created with `role = SUPER_ADMIN`
- [ ] AC2: Email is read from `SUPER_ADMIN_EMAIL` environment variable
- [ ] AC3: Password is hashed using bcrypt before storing
- [ ] AC4: User has `name = "Super Admin"` or from env
- [ ] AC5: Running seed twice does NOT create duplicate users (upsert by email)

---

### FR-002: Password Hashing Utility

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Create a reusable password hashing utility that uses bcrypt. This utility will be used by the seed script and later by the authentication system (US-0.2.x).
- **VI:** Tạo utility hash password tái sử dụng dùng bcrypt. Utility này sẽ được dùng bởi seed script và sau đó bởi hệ thống authentication (US-0.2.x).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: `hashPassword(password: string): Promise<string>` function exists
- [ ] AC2: `verifyPassword(password: string, hash: string): Promise<boolean>` function exists
- [ ] AC3: Uses bcrypt with default cost factor (10)
- [ ] AC4: Functions are exported from `src/lib/auth/password.ts`
- [ ] AC5: Barrel export exists at `src/lib/auth/index.ts`

---

### FR-003: Default Config Values Seeding

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The seed script must create default configuration values in the Config table. These values will be used by the application for warning thresholds and staff login.
- **VI:** Seed script phải tạo các giá trị config mặc định trong bảng Config. Các giá trị này sẽ được dùng bởi ứng dụng cho ngưỡng cảnh báo và đăng nhập staff.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Config with `key = "warning_threshold"` and `value = "80"` is created
- [ ] AC2: Config with `key = "staff_code"` is created (value from `STAFF_CODE` env or default)
- [ ] AC3: Running seed twice does NOT create duplicate configs (upsert by key)
- [ ] AC4: Config values are strings (as per schema)

---

### FR-004: Seed Script Configuration

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Configure the project to run the seed script via `pnpm prisma db seed`. This requires updating package.json with the seed command.
- **VI:** Cấu hình project để chạy seed script qua `pnpm prisma db seed`. Điều này yêu cầu cập nhật package.json với lệnh seed.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: `package.json` has `prisma.seed` configuration
- [ ] AC2: Seed command uses `tsx` to run TypeScript directly
- [ ] AC3: `pnpm prisma db seed` executes successfully
- [ ] AC4: `tsx` and `bcrypt` packages are installed

---

### FR-005: User Schema Update for Password Storage

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Add `passwordHash` optional field to User model in Prisma schema. This field will store bcrypt-hashed passwords for users with password-based authentication (Super Admin, Admin). Generate and apply migration.
- **VI:** Thêm field `passwordHash` tùy chọn vào User model trong Prisma schema. Field này sẽ lưu password đã hash bằng bcrypt cho users sử dụng xác thực bằng password (Super Admin, Admin). Generate và apply migration.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: User model has `passwordHash String?` field in `prisma/schema.prisma`
- [ ] AC2: Migration is generated using `pnpm prisma migrate dev`
- [ ] AC3: Migration applies successfully to database
- [ ] AC4: Prisma client is regenerated with new field

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Security - Password Hashing

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | bcrypt cost factor ≥ 10 |

**Description / Mô tả:**
- **EN:** Passwords must be securely hashed using bcrypt with a cost factor of at least 10 (default). Plain text passwords must never be stored.
- **VI:** Mật khẩu phải được hash an toàn bằng bcrypt với cost factor ít nhất 10 (mặc định). Mật khẩu plain text không bao giờ được lưu.

---

### NFR-002: Reliability - Idempotency

| Aspect | Detail |
|--------|--------|
| Category | Reliability |
| Metric | Running seed N times produces same result as running once |

**Description / Mô tả:**
- **EN:** The seed script must be idempotent. Running it multiple times must not create duplicate records or cause errors. Use Prisma's upsert operation.
- **VI:** Seed script phải idempotent. Chạy nhiều lần không được tạo record trùng lặp hoặc gây lỗi. Sử dụng upsert của Prisma.

---

### NFR-003: Maintainability - Error Handling

| Aspect | Detail |
|--------|--------|
| Category | Maintainability |
| Metric | Clear error messages for missing env vars |

**Description / Mô tả:**
- **EN:** The seed script must validate required environment variables and provide clear error messages if they are missing.
- **VI:** Seed script phải validate các biến môi trường bắt buộc và đưa ra thông báo lỗi rõ ràng nếu thiếu.

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-hepper

| Aspect | Detail |
|--------|--------|
| Changes | Add seed script, password utility, update package.json |
| Sync Type | none (single root) |

**Files Changed / Files Thay đổi:**

| Action | File | Purpose |
|--------|------|---------|
| Modify | `prisma/schema.prisma` | Add passwordHash field to User |
| Generate | `prisma/migrations/*` | Schema migration for passwordHash |
| Create | `prisma/seed.ts` | Main seed script |
| Create | `src/lib/auth/password.ts` | Password hashing utility |
| Create | `src/lib/auth/index.ts` | Barrel export |
| Modify | `package.json` | Add prisma.seed, bcrypt, tsx |
| Modify | `.env.example` | Add seed env vars |

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Seeded User Record

```typescript
{
  id: string,          // cuid, auto-generated
  email: string,       // from SUPER_ADMIN_EMAIL env
  name: "Super Admin", // or from SUPER_ADMIN_NAME env
  role: "SUPER_ADMIN", // enum value
  passwordHash: string,// bcrypt hash (see FR-005 for schema update)
  staffCode: null,     // not used for Super Admin
  createdAt: Date,
  updatedAt: Date
}
```

### Seeded Config Records

```typescript
// Config 1
{
  id: string,
  key: "warning_threshold",
  value: "80",
  updatedAt: Date
}

// Config 2
{
  id: string,
  key: "staff_code", 
  value: string, // from STAFF_CODE env or "SGS2026"
  updatedAt: Date
}
```

---

## 6. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Missing SUPER_ADMIN_EMAIL env var | Exit with error: "SUPER_ADMIN_EMAIL is required" |
| EC-002 | Missing SUPER_ADMIN_PASSWORD env var | Exit with error: "SUPER_ADMIN_PASSWORD is required" |
| EC-003 | Password too short (< 8 chars) | Validated in seed.ts before hashing. Exit with error: "Password must be at least 8 characters" |
| EC-004 | Database connection fails | Prisma error bubbles up, exit 1 |
| EC-005 | Run seed twice | Second run updates existing records (upsert), no error |
| EC-006 | Missing STAFF_CODE env var | Use default value "SGS2026" |

---

## 7. Dependencies / Phụ thuộc

| Dependency | Type | Status | Purpose |
|------------|------|--------|---------|
| `bcrypt` | Package | New | Password hashing |
| `@types/bcrypt` | Package | New | TypeScript types for bcrypt |
| `tsx` | Package | New | Run TypeScript seed script |
| `@prisma/client` | Package | Existing | Database access |
| `dotenv` | Package | Existing | Load env vars |

---

## 8. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Mitigation |
|------|--------|------------|
| bcrypt native build fails | High | Fallback to bcryptjs if needed |
| Migration conflicts with existing data | Medium | FR-005 uses optional field (String?) |
| Env vars not set in production | High | Document required vars, validate at startup |
| Seed runs in production accidentally | Medium | Add NODE_ENV check warning |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-05 |
| Reviewer | ⏳ Pending | |
