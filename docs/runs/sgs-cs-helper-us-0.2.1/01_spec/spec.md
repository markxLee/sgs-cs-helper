# Specification: Super Admin Seeded Login
# Đặc tả: Đăng nhập Super Admin

> US-0.2.1 | Phase 1 Specification | Created: 2026-02-05

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Super Admin Seeded Login |
| User Story | US-0.2.1 |
| Phase 0 Analysis | [solution-design.md](../00_analysis/solution-design.md) |
| Functional Reqs | 5 |
| Non-Functional Reqs | 4 |
| Affected Roots | sgs-cs-hepper |
| Edge Cases | 6 |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:** Implement authentication for Super Admin users using NextAuth.js v5 with Credentials provider. The system will verify email and password against the seeded Super Admin user in the database. Upon successful authentication, a JWT session is created and the user is redirected to the dashboard.

**VI:** Triển khai xác thực cho Super Admin sử dụng NextAuth.js v5 với Credentials provider. Hệ thống sẽ xác thực email và password với Super Admin đã được seed trong database. Khi xác thực thành công, JWT session được tạo và user được redirect đến dashboard.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- ✅ Login page at `/login` with email/password form
- ✅ NextAuth.js v5 configuration with Credentials provider
- ✅ JWT-based session management
- ✅ Password verification using existing `verifyPassword()` utility
- ✅ Redirect to `/dashboard` on successful login
- ✅ Error display for invalid credentials
- ✅ Placeholder dashboard page showing logged-in user

**Out of Scope / Ngoài phạm vi:**
- ❌ Google OAuth login (US-0.2.2)
- ❌ Staff shared code login (US-0.2.3)
- ❌ Route protection middleware (US-0.2.4)
- ❌ Password reset functionality
- ❌ Remember me / session extension
- ❌ Rate limiting on login endpoint
- ❌ Full dashboard features (orders, settings)

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Login Page

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The system shall provide a login page accessible at `/login` route that displays an email and password form.
- **VI:** Hệ thống phải cung cấp trang đăng nhập tại route `/login` hiển thị form email và password.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1.1: Login page is accessible at `/login`
- [ ] AC1.2: Page displays email input field with label
- [ ] AC1.3: Page displays password input field with label (masked)
- [ ] AC1.4: Page displays "Login" submit button
- [ ] AC1.5: Form is centered and styled appropriately

---

### FR-002: Credential Validation

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The system shall validate submitted credentials against the database. It shall find the user by email, then verify the password using bcrypt comparison.
- **VI:** Hệ thống phải xác thực credentials được submit với database. Tìm user bằng email, sau đó xác thực password bằng so sánh bcrypt.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC2.1: System queries database for user by email (case-insensitive)
- [ ] AC2.2: If user not found, return generic "Invalid credentials" error
- [ ] AC2.3: If user found, verify password using `verifyPassword()` function
- [ ] AC2.4: If password incorrect, return generic "Invalid credentials" error
- [ ] AC2.5: No distinction between "user not found" and "wrong password" errors (security)

---

### FR-003: Session Creation

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Upon successful credential verification, the system shall create a JWT session containing user information including id, email, name, and role.
- **VI:** Khi xác thực credentials thành công, hệ thống phải tạo JWT session chứa thông tin user bao gồm id, email, name, và role.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC3.1: JWT token is created on successful login
- [ ] AC3.2: Token contains user id
- [ ] AC3.3: Token contains user email
- [ ] AC3.4: Token contains user name
- [ ] AC3.5: Token contains user role (SUPER_ADMIN)
- [ ] AC3.6: Session cookie is httpOnly and secure (production)

---

### FR-004: Login Redirect

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** After successful login, the system shall redirect the user to the dashboard page at `/dashboard`.
- **VI:** Sau khi đăng nhập thành công, hệ thống phải redirect user đến trang dashboard tại `/dashboard`.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC4.1: Successful login redirects to `/dashboard`
- [ ] AC4.2: Dashboard shows welcome message with user name
- [ ] AC4.3: Dashboard shows user role
- [ ] AC4.4: Dashboard provides logout button

---

### FR-005: Error Display

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The login form shall display clear error messages when authentication fails. Loading state shall be shown during submission.
- **VI:** Form đăng nhập phải hiển thị thông báo lỗi rõ ràng khi xác thực thất bại. Trạng thái loading được hiển thị trong quá trình submit.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC5.1: Error message displayed for invalid credentials
- [ ] AC5.2: Error message displayed for empty email
- [ ] AC5.3: Error message displayed for empty password
- [ ] AC5.4: Loading indicator shown during submission
- [ ] AC5.5: Submit button disabled during loading

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Security

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | Zero password exposure |

**Description / Mô tả:**
- **EN:** Passwords must never be logged or exposed in error messages. CSRF protection must be enabled. Session cookies must use httpOnly flag.
- **VI:** Password không bao giờ được log hoặc expose trong thông báo lỗi. CSRF protection phải được bật. Session cookies phải sử dụng httpOnly flag.

**Requirements:**
- Passwords never logged to console or error tracking
- Generic error messages (no user enumeration)
- CSRF protection via NextAuth built-in
- httpOnly cookies for session
- Secure cookie flag in production

---

### NFR-002: Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | < 2 seconds login response |

**Description / Mô tả:**
- **EN:** Login process should complete within 2 seconds under normal conditions. Form submission should show immediate feedback.
- **VI:** Quá trình đăng nhập phải hoàn thành trong 2 giây ở điều kiện bình thường. Form submission phải hiển thị feedback ngay lập tức.

**Requirements:**
- Login API response < 2 seconds
- Immediate UI feedback on button click
- No blocking operations on login page load

---

### NFR-003: Accessibility

| Aspect | Detail |
|--------|--------|
| Category | Accessibility |
| Metric | WCAG 2.1 AA compliance |

**Description / Mô tả:**
- **EN:** Login form should be accessible via keyboard navigation. Form fields should have proper labels and ARIA attributes.
- **VI:** Form đăng nhập phải có thể truy cập bằng keyboard navigation. Các trường form phải có labels và ARIA attributes phù hợp.

**Requirements:**
- Keyboard navigable form
- Proper label associations
- Focus indicators visible
- Error messages announced to screen readers

---

### NFR-004: Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Compatibility |
| Metric | Modern browsers support |

**Description / Mô tả:**
- **EN:** Login page should work on all modern browsers (Chrome, Firefox, Safari, Edge) and be responsive for mobile devices.
- **VI:** Trang đăng nhập phải hoạt động trên tất cả các trình duyệt hiện đại và responsive cho thiết bị mobile.

**Requirements:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design (mobile, tablet, desktop)
- No JavaScript errors in console

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-hepper

| Aspect | Detail |
|--------|--------|
| Changes | Add auth configuration, login page, dashboard placeholder |
| Sync Type | N/A (single root) |

**New Files / Files Mới:**

| Path | Purpose |
|------|---------|
| `src/lib/auth/config.ts` | NextAuth configuration |
| `src/lib/auth/auth.ts` | Auth handlers export |
| `src/app/api/auth/[...nextauth]/route.ts` | API route |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/login/_components/login-form.tsx` | Login form component |
| `src/app/(dashboard)/page.tsx` | Dashboard placeholder |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout |
| `src/types/next-auth.d.ts` | Type extensions |

**Modified Files / Files Chỉnh sửa:**

| Path | Change |
|------|--------|
| `src/lib/auth/index.ts` | Export auth functions |
| `package.json` | Add next-auth dependency |

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- None (new feature)

**Integration Points / Điểm Tích hợp:**
- Prisma client for user lookup
- `verifyPassword()` for password verification

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### 5.1 Session User Type

```typescript
interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
}
```

### 5.2 Login Credentials

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

### 5.3 Auth Error Response

```typescript
interface AuthError {
  error: "CredentialsSignin" | "Configuration" | "AccessDenied";
  message: string;
}
```

### 5.4 NextAuth Callbacks Data Flow

```
authorize(credentials) → { id, email, name, role } | null
     ↓
jwt({ token, user }) → token with user data
     ↓
session({ session, token }) → session with user object
```

---

## 6. UI/UX Specifications / Đặc tả UI/UX

### 6.1 Login Page Layout

```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────────────────────┐         │
│     │     SGS CS Helper       │         │
│     │                         │         │
│     │  ┌───────────────────┐  │         │
│     │  │ Email             │  │         │
│     │  └───────────────────┘  │         │
│     │                         │         │
│     │  ┌───────────────────┐  │         │
│     │  │ Password ●●●●●●   │  │         │
│     │  └───────────────────┘  │         │
│     │                         │         │
│     │  ┌───────────────────┐  │         │
│     │  │      Login        │  │         │
│     │  └───────────────────┘  │         │
│     │                         │         │
│     │  [Error message area]   │         │
│     └─────────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

### 6.2 Component States

| State | UI Behavior |
|-------|-------------|
| Initial | Form enabled, button says "Login" |
| Loading | Button shows spinner, disabled |
| Error | Red error message below form |
| Success | Redirect to /dashboard |

### 6.3 Dashboard Placeholder Layout

```
┌─────────────────────────────────────────┐
│  SGS CS Helper            [Logout]      │
├─────────────────────────────────────────┤
│                                         │
│   Welcome, {name}!                      │
│   Role: {role}                          │
│                                         │
│   Dashboard content coming soon...      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Email with leading/trailing spaces | Trim before validation |
| EC-002 | Email in different case | Case-insensitive match |
| EC-003 | Empty email submitted | Show "Email is required" |
| EC-004 | Empty password submitted | Show "Password is required" |
| EC-005 | User has no passwordHash | Return "Invalid credentials" |
| EC-006 | Database connection error | Show generic error, log details |

---

## 8. Dependencies / Phụ thuộc

| Dependency | Type | Status | Version |
|------------|------|--------|---------|
| `next-auth` | Package | New | ^5.x (beta) |
| `bcrypt` | Package | Existing | ^6.0.0 |
| `prisma` | Package | Existing | ^7.3.0 |
| `verifyPassword()` | Utility | Existing | N/A |
| Super Admin seeded | Data | Existing | US-0.3.2 |

---

## 9. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| NextAuth v5 breaking changes | Medium | Low | Pin version, test thoroughly |
| Password brute force attacks | High | Medium | Rate limiting in future US |
| Session token theft | High | Low | httpOnly cookies, HTTPS |
| Database unavailable | Medium | Low | Error handling, retry logic |

---

## 10. Test Scenarios (Preview) / Kịch bản Test

| ID | Scenario | Expected |
|----|----------|----------|
| TS-001 | Valid Super Admin login | Redirect to /dashboard |
| TS-002 | Invalid email format | Error message |
| TS-003 | Non-existent email | "Invalid credentials" |
| TS-004 | Wrong password | "Invalid credentials" |
| TS-005 | Empty email | "Email is required" |
| TS-006 | Empty password | "Password is required" |
| TS-007 | Dashboard shows user info | Name and role visible |
| TS-008 | Logout clears session | Redirect to /login |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-05 |
| Reviewer | ⏳ Pending | |

---

*Created: 2026-02-05 | US-0.2.1 | Phase 1*
