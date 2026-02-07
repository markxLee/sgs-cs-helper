# Specification: Admin Credentials Login
# Đặc tả: Đăng nhập Admin bằng mật khẩu
<!-- Template Version: 1.0 | Contract: v1.0 | Created: 2026-02-07 -->

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Admin Credentials Login |
| User Story | US-0.2.4 |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |
| Status | Draft |
| Functional Requirements | 6 |
| Non-Functional Requirements | 5 |
| Affected Roots | sgs-cs-helper |
| Complexity | Medium |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

🇻🇳
Xây dựng chức năng đăng nhập bằng email/mật khẩu cho Admin thay vì chỉ Google OAuth. Super Admin tạo mật khẩu khi mời Admin. Hệ thống ghi log các lần đăng nhập, cho phép Super Admin đổi mật khẩu Admin, và khóa tài khoản sau 10 lần đăng nhập sai. Reset mật khẩu sẽ được xử lý ở User Story riêng.

🇬🇧
Build Admin login via email/password instead of only Google OAuth. Super Admin sets password during invitation. System logs all login attempts, allows Super Admin to change Admin passwords, and locks account after 10 failed attempts. Password reset will be handled in a separate User Story.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**

🇻🇳
- Đăng nhập Admin bằng email/mật khẩu
- Super Admin tạo/đổi mật khẩu cho Admin  
- Log audit cho các lần đăng nhập (thành công/thất bại)
- Khóa tài khoản sau 10 lần đăng nhập sai
- Cập nhật trạng thái Admin từ PENDING → ACTIVE khi đăng nhập lần đầu
- Thông báo lỗi cho các trường hợp sai thông tin, tài khoản khóa, chưa kích hoạt

🇬🇧
- Admin login via email/password
- Super Admin creates/changes passwords for Admin
- Audit logging for login attempts (success/failure)
- Lock account after 10 failed login attempts
- Update Admin status from PENDING → ACTIVE on first login
- Error messages for invalid credentials, locked account, inactive account

**Out of Scope / Ngoài phạm vi:**

🇻🇳
- Reset mật khẩu cho Admin (sẽ xử lý ở User Story riêng)
- Đăng nhập Staff (đã xử lý ở US-0.2.5)
- Đăng nhập Google OAuth (sẽ xử lý ở US-0.2.3)
- Email thông báo tự động cho Admin
- Tự thay đổi mật khẩu của chính mình (Admin self-service)

🇬🇧
- Password reset for Admin (separate User Story)
- Staff login (handled in US-0.2.5)
- Google OAuth login (handled in US-0.2.3)
- Automated email notifications to Admin
- Self-service password change

---

## 2. Goals & Non-Goals

### Goals / Mục tiêu

🇻🇳
1. **Admin Login UI:** Form đăng nhập email/mật khẩu
2. **Password Management:** Super Admin tạo/đổi mật khẩu Admin
3. **Security:** Mật khẩu hash bằng bcrypt, log audit, khóa sau 10 lần sai
4. **Status Management:** Tự động cập nhật trạng thái khi đăng nhập lần đầu
5. **Error Handling:** Thông báo lỗi rõ ràng, không lộ thông tin

🇬🇧
1. **Admin Login UI:** Email/password login form
2. **Password Management:** Super Admin creates/changes Admin passwords
3. **Security:** bcrypt password hashing, audit logging, lock after 10 failures
4. **Status Management:** Auto-update status on first login
5. **Error Handling:** Clear error messages without info leakage

### Non-Goals / Không nằm trong phạm vi

🇻🇳
1. Admin tự reset mật khẩu
2. Admin tự thay đổi mật khẩu
3. Email thông báo tự động
4. Two-factor authentication (2FA)
5. Social login khác ngoài Google OAuth

🇬🇧
1. Admin self-service password reset
2. Admin self-service password change
3. Automated email notifications
4. Two-factor authentication (2FA)
5. Other social logins besides Google OAuth

---

## 3. Functional Requirements / Yêu cầu Chức năng

### FR-001: Admin Credentials Login

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Admin có thể đăng nhập bằng email và mật khẩu do Super Admin tạo. Hệ thống xác thực thông tin với database, sử dụng bcrypt để verify mật khẩu.

🇬🇧
Admin can log in using email and password set by Super Admin. System validates credentials against database using bcrypt for password verification.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Email/password form exists on login page (reuses existing form)
- [ ] AC2: Only invited Admins (role=ADMIN or SUPER_ADMIN) with authMethod=CREDENTIALS can log in
- [ ] AC3: Credentials validated against Admin table with bcrypt verification
- [ ] AC4: Invalid credentials show "Invalid email or password" (generic message for security)
- [ ] AC5: Successful login creates NextAuth session with correct role
- [ ] AC6: Successful login redirects to `/dashboard` or home page

---

### FR-002: Super Admin Password Management

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Super Admin có thể tạo hoặc đổi mật khẩu cho bất kỳ Admin nào. Mật khẩu được hash bằng bcrypt trước khi lưu vào database. Việc đổi mật khẩu sẽ mở khóa tài khoản và reset số lần đăng nhập sai.

🇬🇧
Super Admin can create or change password for any Admin. Passwords are hashed with bcrypt before storing in database. Password change unlocks account and resets failed login count.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Super Admin can set initial password during Admin invitation
- [ ] AC2: Super Admin can change password for existing Admin
- [ ] AC3: Password is hashed with bcrypt (SALT_ROUNDS=10) before storage
- [ ] AC4: Changing password resets failedLoginCount to 0
- [ ] AC5: Changing password updates Admin status from LOCKED to ACTIVE (if applicable)
- [ ] AC6: Password change is logged in audit log

---

### FR-003: Audit Logging for Login Attempts

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Tất cả lần đăng nhập (thành công/thất bại) đều được ghi log cho mục đích bảo mật và audit. Log bao gồm timestamp, user, kết quả, và IP address (tùy chọn).

🇬🇧
All login attempts (success/failure) are logged for security and audit purposes. Logs include timestamp, user, result, and IP address (optional).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Every login attempt creates an audit log entry
- [ ] AC2: Log includes: adminId, timestamp, result (SUCCESS/FAILURE), IP (optional)
- [ ] AC3: Logs are stored in AuditLog table/model
- [ ] AC4: Super Admin can view audit logs (query by Admin, date range)
- [ ] AC5: Failed login attempts are logged before incrementing failedLoginCount

---

### FR-004: Account Lockout After 10 Failed Attempts

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Tài khoản Admin bị khóa sau 10 lần đăng nhập sai. Admin bị khóa không thể đăng nhập cho đến khi Super Admin mở khóa (bằng cách đổi mật khẩu hoặc reset failedLoginCount).

🇬🇧
Admin account is locked after 10 failed login attempts. Locked Admin cannot log in until Super Admin unlocks (by changing password or resetting failedLoginCount).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Failed login increments Admin.failedLoginCount
- [ ] AC2: After 10 failed attempts, Admin.status changes to LOCKED
- [ ] AC3: Locked Admin sees "Account locked after 10 failed attempts" error
- [ ] AC4: Successful login resets failedLoginCount to 0
- [ ] AC5: Super Admin password change unlocks account and resets count

---

### FR-005: Update Admin Status on First Login

| Aspect | Detail |
|--------|--------|
| Priority | Should |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Lần đăng nhập thành công đầu tiên chuyển trạng thái Admin từ PENDING sang ACTIVE. Điều này đảm bảo luồng onboarding chính xác và trạng thái database phản ánh thực tế.

🇬🇧
First successful login updates Admin status from PENDING to ACTIVE. This ensures accurate onboarding flow and database state reflects reality.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: If Admin.status == PENDING and login succeeds, update to ACTIVE
- [ ] AC2: Status update is saved to database before session creation
- [ ] AC3: Session reflects ACTIVE status after first login

---

### FR-006: Error Handling and User Feedback

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

🇻🇳
Hệ thống hiển thị thông báo lỗi rõ ràng nhưng không lộ thông tin bảo mật. Thông báo lỗi chung cho sai email/mật khẩu, riêng biệt cho tài khoản khóa, chưa kích hoạt, hoặc lỗi hệ thống.

🇬🇧
System displays clear error messages without leaking security information. Generic error for wrong email/password, specific errors for locked account, inactive account, or system errors.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Invalid email or password shows "Invalid email or password" (generic)
- [ ] AC2: Locked account shows "Account locked after 10 failed attempts"
- [ ] AC3: Inactive account (status != ACTIVE, != LOCKED) shows "Account not active"
- [ ] AC4: Database/system errors show "Login failed. Please try again."
- [ ] AC5: Error messages do not reveal whether email exists in system

---

## 4. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Security

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | Passwords hashed with bcrypt (SALT_ROUNDS=10), audit logs for all attempts |

**Description / Mô tả:**

🇻🇳
Mật khẩu được hash an toàn bằng bcrypt trước khi lưu. Mọi lần đăng nhập đều được log. Thông báo lỗi không lộ thông tin. Tài khoản tự động khóa sau 10 lần sai.

🇬🇧
Passwords securely hashed with bcrypt before storage. All login attempts logged. Error messages don't leak info. Accounts auto-lock after 10 failures.

---

### NFR-002: Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | Login response time <1 second (p95) |

**Description / Mô tả:**

🇻🇳
Đăng nhập phản hồi dưới 1 giây cho 95% request. Bcrypt verify không block UI thread.

🇬🇧
Login responds within 1 second for 95% of requests. Bcrypt verification doesn't block UI thread.

---

### NFR-003: Maintainability

| Aspect | Detail |
|--------|--------|
| Category | Maintainability |
| Metric | Code follows project conventions, Server Actions pattern, Zod validation |

**Description / Mô tả:**

🇻🇳
Code tuân thủ convention của project, dùng Server Actions pattern, Zod để validate input, TypeScript strict mode.

🇬🇧
Code follows project conventions, uses Server Actions pattern, Zod for validation, TypeScript strict mode.

---

### NFR-004: Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Compatibility |
| Metric | Works on Chrome, Edge, Firefox, Safari (latest 2 versions) |

**Description / Mô tả:**

🇻🇳
Đăng nhập hoạt động trên các trình duyệt chính (2 phiên bản gần nhất).

🇬🇧
Login works on all major browsers (latest 2 versions).

---

### NFR-005: Scalability

| Aspect | Detail |
|--------|--------|
| Category | Scalability |
| Metric | Supports 100+ concurrent Admin logins |

**Description / Mô tả:**

🇻🇳
Hệ thống hỗ trợ tối thiểu 100 Admin login cùng lúc.

🇬🇧
System supports at least 100 concurrent Admin logins.

---

## 5. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect | Detail |
|--------|--------|
| Changes Summary | NextAuth config, login page, Admin model, audit log, password management |
| Sync Type | immediate (single root) |
| Build Impact | None (single root project) |

**Integration Points / Điểm Tích hợp:**
- NextAuth CredentialsProvider: Extend for Admin login
- Prisma Admin model: Add failedLoginCount, update status logic
- Prisma AuditLog model: New table for login logs
- Login page: May need to extend form (if not already supporting email/password)

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- bcrypt: Already in use for Super Admin, extend for Admin
- NextAuth: Already configured, add Credentials provider
- Prisma: Schema migration needed for failedLoginCount and AuditLog

---

## 6. Data Contracts / Hợp đồng Dữ liệu

### Schema: Admin (Extended)

```prisma
model Admin {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String?  // bcrypt hash
  role              Role     // ADMIN or SUPER_ADMIN
  status            AdminStatus // PENDING, ACTIVE, LOCKED
  authMethod        AuthMethod // CREDENTIALS, GOOGLE_OAUTH
  failedLoginCount  Int      @default(0) // NEW FIELD
  auditLogs         AuditLog[] // NEW RELATION
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Schema: AuditLog (New)

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  adminId   String
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  timestamp DateTime @default(now())
  result    LoginResult // SUCCESS, FAILURE
  ip        String?  // Optional IP address
  createdAt DateTime @default(now())
  
  @@index([adminId, timestamp])
}

enum LoginResult {
  SUCCESS
  FAILURE
}
```

---

## 7. UI/UX Specifications

### Login Form

**Current State:**
- Form already exists at `/login`
- Supports email/password input for Super Admin

**Changes Needed:**
- Ensure form works for both Super Admin and Admin (same form)
- Update error handling to show specific messages (locked, inactive)
- Add failed attempt counter display (optional, for UX)

**User Flow:**
1. Admin navigates to `/login`
2. Enters email and password
3. Submits form
4. If valid: Redirect to `/dashboard`
5. If invalid: Show error, increment failed count
6. If locked: Show lockout message, prevent login

---

## 8. Edge Cases & Error Handling / Trường hợp Biên & Xử lý Lỗi

### Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Admin enters wrong password 10 times | Account locked, status = LOCKED, error shown |
| EC-002 | Super Admin changes password for locked Admin | Account unlocked, failedLoginCount reset to 0 |
| EC-003 | Admin tries to log in with status = PENDING | Allow login, update status to ACTIVE on success |
| EC-004 | Admin tries to log in with status = LOCKED | Block login, show "Account locked" error |
| EC-005 | Database error during login | Log error, show "Login failed" to user |
| EC-006 | bcrypt verification fails (corrupted hash) | Treat as invalid password, increment failed count |
| EC-007 | Admin with authMethod = GOOGLE_OAUTH tries credentials login | Reject with "Invalid email or password" |

### Error Scenarios / Kịch bản Lỗi

| Scenario | User Message | System Action |
|----------|--------------|---------------|
| Wrong email/password | "Invalid email or password" | Increment failedLoginCount, log attempt |
| Account locked | "Account locked after 10 failed attempts" | Block login, log attempt |
| Account inactive | "Account not active" | Block login, log attempt |
| Database unavailable | "Login failed. Please try again." | Log error, no password leak |
| Missing email/password | "Email and password are required" | Block login, no increment |

---

## 9. Dependencies / Phụ thuộc

### Technical Dependencies / Phụ thuộc Kỹ thuật

| Dependency | Purpose | Status | Version |
|------------|---------|--------|---------|
| bcrypt | Password hashing/verification | Existing | Latest |
| NextAuth.js | Auth/session management | Existing | v5 |
| Prisma | Database ORM | Existing | Latest |

### Business Dependencies / Phụ thuộc Nghiệp vụ

| Dependency | Type | Status |
|------------|------|--------|
| US-0.2.2 | Super Admin invitation flow | ✅ DONE |
| Admin table with passwordHash | Database schema | ✅ EXISTS |

---

## 10. Risks & Mitigations / Rủi ro & Giảm thiểu

### Technical Risks / Rủi ro Kỹ thuật

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Brute force login attacks | High | High | Lock account after 10 failures, audit logging |
| Password hash collision | Very Low | High | Use bcrypt with SALT_ROUNDS=10, proven algorithm |
| Audit log table growth | Medium | Medium | Archive logs older than 1 year, add database indexes |
| Database unavailable during login | Low | High | Graceful error handling, retry logic (if needed) |

### Business Risks / Rủi ro Nghiệp vụ

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Admin locked out accidentally | Medium | Medium | Super Admin can unlock via password change |
| Super Admin misuse (password snooping) | Low | Medium | Log all password changes, audit trail |
| User confusion (password reset not available) | Medium | Low | Clear messaging, separate US for password reset |

---

## 11. Out of Scope (Explicit) / Ngoài Phạm vi (Rõ ràng)

🇻🇳
1. **Reset mật khẩu cho Admin** - Sẽ xử lý ở User Story riêng với email verification
2. **Admin tự thay đổi mật khẩu** - Chức năng self-service sẽ xử lý sau
3. **Two-factor authentication (2FA)** - Không nằm trong Phase 0 hiện tại
4. **Email thông báo tự động** - Không cần thiết cho MVP
5. **Theo dõi thiết bị đăng nhập** - Nice to have, không ưu tiên
6. **IP whitelist/blacklist** - Security nâng cao, không cần thiết hiện tại

🇬🇧
1. **Password reset for Admin** - Separate US with email verification
2. **Admin self-service password change** - Future enhancement
3. **Two-factor authentication (2FA)** - Not in current Phase 0 scope
4. **Automated email notifications** - Not needed for MVP
5. **Device tracking** - Nice to have, not priority
6. **IP whitelist/blacklist** - Advanced security, not needed now

---

## 12. Approval / Phê duyệt

| Role | Name | Status | Date |
|------|------|--------|------|
| Spec Author | Copilot | ✅ Done | 2026-02-07 |
| Technical Reviewer | | ⏳ Pending | |
| Product Owner | | ⏳ Pending | |

---

**Spec Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** Awaiting Review
