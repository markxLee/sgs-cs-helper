# Solution Design — US-0.2.1 Super Admin Seeded Login

> Phase 0 Analysis & Design | Created: 2026-02-05

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** The application currently has no authentication system. Super Admin users cannot log in to manage the system. We need to implement a secure login flow using NextAuth.js with Credentials provider that verifies against the seeded Super Admin user in the database.

**VI:** Ứng dụng hiện tại chưa có hệ thống xác thực. Super Admin không thể đăng nhập để quản lý hệ thống. Cần triển khai luồng đăng nhập an toàn bằng NextAuth.js với Credentials provider để xác thực với Super Admin đã được seed trong database.

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Authentication | None | NextAuth.js Credentials provider |
| Login Page | Empty `(auth)/` folder | Login form at `/login` |
| Session | None | JWT-based session via NextAuth |
| Password Verification | Utility exists (`verifyPassword`) | Used in NextAuth authorize |
| Dashboard | Empty `(dashboard)/` folder | Redirect target after login |

### Gap Analysis / Phân tích Khoảng cách

- **EN:** Missing NextAuth.js configuration and setup
- **VI:** Thiếu cấu hình và cài đặt NextAuth.js

- **EN:** No login page UI exists
- **VI:** Chưa có giao diện trang login

- **EN:** No session management or protected routes
- **VI:** Chưa có quản lý session hoặc route được bảo vệ

- **EN:** No dashboard placeholder for redirect
- **VI:** Chưa có trang dashboard placeholder để redirect

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | `src/lib/auth/` | Add NextAuth config |
| sgs-cs-hepper | `src/app/(auth)/login/` | Create login page |
| sgs-cs-hepper | `src/app/(dashboard)/` | Create dashboard placeholder |
| sgs-cs-hepper | `src/app/api/auth/` | NextAuth API route |
| sgs-cs-hepper | `middleware.ts` | Auth middleware (optional for US-0.2.4) |

### Open Questions / Câu hỏi Mở

1. **EN:** Session strategy - JWT or Database sessions?
   **VI:** Chiến lược session - JWT hay Database sessions?
   **Decision:** JWT (simpler, stateless, sufficient for this app)

2. **EN:** Should we create a full dashboard or just placeholder?
   **VI:** Tạo dashboard đầy đủ hay chỉ placeholder?
   **Decision:** Placeholder page (dashboard features in future US)

### Assumptions / Giả định

1. **EN:** Super Admin is already seeded via `pnpm db:seed` (US-0.3.2 completed)
   **VI:** Super Admin đã được seed qua `pnpm db:seed` (US-0.3.2 hoàn thành)

2. **EN:** Using latest Auth.js v5 (next-auth@beta) for Next.js 16 compatibility
   **VI:** Sử dụng Auth.js v5 mới nhất để tương thích với Next.js 16

3. **EN:** Login page should be simple - email and password only
   **VI:** Trang login đơn giản - chỉ email và password

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| `src/lib/auth/password.ts` | bcrypt password verification | ✅ Yes | `verifyPassword()` ready to use |
| `src/lib/db/index.ts` | Prisma client singleton | ✅ Yes | Reuse for user lookup |
| `src/lib/auth/index.ts` | Barrel export | ✅ Yes | Extend with auth config |
| `prisma/schema.prisma` | User model with passwordHash | ✅ Yes | Query for authentication |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| N/A | No auth exists yet | Following Auth.js v5 official docs |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `next-auth` | Authentication framework | Need to add |
| `@auth/prisma-adapter` | Prisma adapter (optional, for DB sessions) | Not needed (JWT strategy) |
| `bcrypt` | Password hashing | ✅ Existing |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| N/A | N/A | N/A | Single-root feature |

### Reusable Components / Component Tái sử dụng

- `src/lib/auth/password.ts`: `verifyPassword()` function
- `src/lib/db/index.ts`: Prisma client for user lookup
- `src/generated/prisma/client`: Generated Prisma types

### New Components Needed / Component Cần tạo Mới

1. **EN:** NextAuth configuration (`src/lib/auth/config.ts`)
   **VI:** Cấu hình NextAuth

2. **EN:** Auth API route handler (`src/app/api/auth/[...nextauth]/route.ts`)
   **VI:** API route handler cho auth

3. **EN:** Login page with form (`src/app/(auth)/login/page.tsx`)
   **VI:** Trang login với form

4. **EN:** Dashboard placeholder (`src/app/(dashboard)/page.tsx`)
   **VI:** Trang dashboard placeholder

5. **EN:** Auth session provider wrapper (optional, for client components)
   **VI:** Provider wrapper cho session

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Implement NextAuth.js v5 with Credentials provider for email/password authentication. The login page will be a Server Component with a Client Component form for handling submissions. On successful login, users are redirected to `/dashboard`. The auth configuration will use JWT strategy for session management, and the existing `verifyPassword()` utility will verify credentials against the database.

**VI:** Triển khai NextAuth.js v5 với Credentials provider cho xác thực email/password. Trang login sẽ là Server Component với Client Component form để xử lý submit. Khi đăng nhập thành công, user được redirect đến `/dashboard`. Cấu hình auth sử dụng JWT strategy cho quản lý session, và utility `verifyPassword()` hiện có sẽ xác thực credentials với database.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **NextAuth.js v5 + Credentials** | Official solution, built-in CSRF, session handling, Next.js 16 compatible | Requires setup | ✅ Selected |
| Custom JWT implementation | Full control | Security risks, more code, reinventing wheel | ❌ Rejected: Security risks |
| Lucia Auth | Lightweight | Less ecosystem support, less docs | ❌ Rejected: NextAuth is standard |

### Session Strategy / Chiến lược Session

| Strategy | Pros | Cons | Verdict |
|----------|------|------|---------|
| **JWT** | Stateless, scalable, no DB queries per request | Token size, can't invalidate easily | ✅ Selected |
| Database | Can invalidate, audit trail | DB query per request, more complex | ❌ Overkill for this app |

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | `auth.config.ts` | sgs-cs-hepper | NextAuth.js configuration |
| 2 | `auth.ts` | sgs-cs-hepper | Auth handlers export |
| 3 | `[...nextauth]/route.ts` | sgs-cs-hepper | API route handler |
| 4 | `LoginPage` | sgs-cs-hepper | Server Component wrapper |
| 5 | `LoginForm` | sgs-cs-hepper | Client Component form |
| 6 | `DashboardPage` | sgs-cs-hepper | Placeholder dashboard |
| 7 | `SessionProvider` | sgs-cs-hepper | Client session context (optional) |

### Component Details / Chi tiết Component

#### Component 1: `auth.config.ts`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-hepper` |
| Location | `src/lib/auth/config.ts` |
| Purpose | EN: NextAuth configuration with Credentials provider / VI: Cấu hình NextAuth với Credentials provider |
| Inputs | `email`, `password` from login form |
| Outputs | Session with user info and role |
| Dependencies | `verifyPassword`, `prisma`, `User` type |

#### Component 2: `LoginForm`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-hepper` |
| Location | `src/app/(auth)/login/_components/login-form.tsx` |
| Purpose | EN: Client-side login form with error handling / VI: Form đăng nhập client-side với xử lý lỗi |
| Inputs | User email and password |
| Outputs | Submit to NextAuth signIn |
| Dependencies | `next-auth/react` signIn function |

#### Component 3: `DashboardPage`

| Aspect | Detail |
|--------|--------|
| Root | `sgs-cs-hepper` |
| Location | `src/app/(dashboard)/page.tsx` |
| Purpose | EN: Placeholder dashboard showing logged-in user / VI: Dashboard placeholder hiển thị user đã đăng nhập |
| Inputs | Session from auth |
| Outputs | Welcome message, logout button |
| Dependencies | `auth()` from NextAuth |

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | LoginForm | email, password | Enter credentials |
| 2 | LoginForm | NextAuth API | credentials | signIn() call |
| 3 | NextAuth | authorize() | credentials | Validate format |
| 4 | authorize() | Prisma | email | Find user by email |
| 5 | authorize() | verifyPassword | password, hash | Verify password |
| 6 | NextAuth | Browser | JWT cookie | Set session |
| 7 | Browser | /dashboard | redirect | Navigate after login |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Invalid email format | Client validation + NextAuth reject | EN: "Invalid email" / VI: "Email không hợp lệ" |
| User not found | Return null in authorize | EN: "Invalid credentials" / VI: "Thông tin đăng nhập không đúng" |
| Wrong password | Return null in authorize | EN: "Invalid credentials" / VI: "Thông tin đăng nhập không đúng" |
| Database error | Catch and log, return null | EN: "An error occurred" / VI: "Đã xảy ra lỗi" |
| Network error | Client-side retry UI | EN: "Network error" / VI: "Lỗi mạng" |

### Security Considerations / Bảo mật

| Aspect | Implementation |
|--------|----------------|
| Password | Never logged, bcrypt verified |
| CSRF | Built into NextAuth |
| Session | JWT with secure, httpOnly cookie |
| Error messages | Generic "Invalid credentials" (no user enumeration) |
| Rate limiting | Future enhancement (US-0.2.4 or later) |

### Rollback Plan / Kế hoạch Rollback

**EN:** 
1. Revert the git commit adding auth
2. Remove `next-auth` package
3. Delete auth-related files in `src/lib/auth/` (keep password.ts)
4. Delete login page and dashboard
5. No database schema changes required

**VI:**
1. Revert commit thêm auth
2. Gỡ package `next-auth`
3. Xóa các file auth trong `src/lib/auth/` (giữ password.ts)
4. Xóa trang login và dashboard
5. Không cần thay đổi schema database

---

## 0.4 File Structure / Cấu trúc File

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth layout (optional, minimal)
│   │   └── login/
│   │       ├── page.tsx          # Login page (Server Component)
│   │       └── _components/
│   │           └── login-form.tsx # Login form (Client Component)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout
│   │   └── page.tsx              # Dashboard placeholder
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts      # NextAuth API handler
├── lib/
│   └── auth/
│       ├── index.ts              # Updated barrel export
│       ├── password.ts           # Existing (unchanged)
│       ├── config.ts             # NextAuth config
│       └── auth.ts               # Auth handlers (signIn, signOut, auth)
└── types/
    └── next-auth.d.ts            # NextAuth type extensions
```

---

## Decisions / Quyết định

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Use NextAuth.js v5 (Auth.js) | Official, well-maintained, Next.js 16 compatible |
| D-002 | JWT session strategy | Simpler, stateless, sufficient for this app |
| D-003 | Client Component for form | Need interactivity for form state and error display |
| D-004 | Generic error messages | Security - prevent user enumeration attacks |
| D-005 | Placeholder dashboard | Full dashboard features in later user stories |

---

## Risks / Rủi ro

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NextAuth v5 breaking changes | Low | Medium | Pin version, test thoroughly |
| Session token exposure | Low | High | Use httpOnly cookies (default) |
| Password brute force | Medium | High | Rate limiting in future US |

---

*Next: Phase 1 Specification*
