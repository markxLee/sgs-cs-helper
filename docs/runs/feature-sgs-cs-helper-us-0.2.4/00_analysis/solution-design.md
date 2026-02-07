# Solution Design — US-0.2.4: Admin Credentials Login

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề
**EN:** Enable Admin users to log in using credentials (email/password) instead of Google OAuth, supporting secure, role-based access for admins who do not use Google accounts. Current system only supports Super Admin seeded login and Google OAuth (US-0.2.3), so Admins without Google accounts cannot log in.

**VI:** Cho phép Admin đăng nhập bằng email và mật khẩu thay vì chỉ Google OAuth, đảm bảo truy cập an toàn cho Admin không dùng tài khoản Google. Hệ thống hiện chỉ hỗ trợ Super Admin seeded login và Google OAuth, Admin không có Google account chưa đăng nhập được.

### Context / Ngữ cảnh

| Aspect           | Current / Hiện tại                  | Desired / Mong muốn                      |
|------------------|-------------------------------------|------------------------------------------|
| Behavior         | Only Super Admin seeded login, Google OAuth (pending) | Admin can log in with email/password     |
| Data flow        | Admins invited, but no credentials login | Admins invited, credentials stored, login via form |
| User experience  | Admins without Google account cannot log in | Admins can log in securely with credentials |

### Gap Analysis / Phân tích Khoảng cách
- EN: Admin credentials login is missing; only Super Admin seeded login and Google OAuth are available.
- VI: Đăng nhập bằng email/mật khẩu cho Admin chưa có; chỉ có Super Admin seeded và Google OAuth.

### Affected Areas / Vùng Ảnh hưởng

| Root         | Component/Module           | Impact                                  |
|--------------|----------------------------|------------------------------------------|
| sgs-cs-helper| NextAuth config            | Add Credentials provider for Admin login |
| sgs-cs-helper| Login page                 | Add/extend form for email/password       |
| sgs-cs-helper| Prisma Admin model         | Ensure password field, bcrypt hash       |
| sgs-cs-helper| Server Actions (auth)      | Validate credentials, update status      |

### Open Questions / Câu hỏi Mở
1. EN: Should password reset be supported for Admins? / VI: Có cần hỗ trợ reset mật khẩu cho Admin không?
2. EN: Should login attempts be logged for security/audit? / VI: Có cần log lại các lần đăng nhập cho bảo mật/audit không?
3. EN: Should Super Admin be able to change Admin passwords? / VI: Super Admin có quyền đổi mật khẩu Admin không?
4. EN: Is there a max retry limit for failed logins? / VI: Có giới hạn số lần đăng nhập sai không?

### Assumptions / Giả định
1. EN: Admin password is set by Super Admin during invitation. / VI: Mật khẩu Admin được Super Admin tạo khi mời.
2. EN: Passwords are hashed with bcrypt. / VI: Mật khẩu được hash bằng bcrypt.
3. EN: NextAuth is already configured for session management. / VI: NextAuth đã cấu hình quản lý session.
4. EN: Admin role is correctly assigned after login. / VI: Role Admin được gán đúng sau khi đăng nhập.

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location                        | Pattern                                  | Applicable | Notes                                  |
|----------------------------------|------------------------------------------|------------|----------------------------------------|
| src/lib/auth/config.ts           | NextAuth CredentialsProvider, bcrypt     | Yes        | Used for Super Admin, extend for Admin |
| prisma/schema.prisma             | Admin.passwordHash field, bcrypt comment | Yes        | Password-based auth for ADMIN          |
| src/app/(auth)/login/page.tsx    | LoginForm component                      | Yes        | Form exists, can be extended           |

### Similar Implementations / Triển khai Tương tự

| Location                        | What it does                             | Learnings                                  |
|----------------------------------|------------------------------------------|--------------------------------------------|
| src/lib/auth/config.ts           | Auth config for Super Admin login        | CredentialsProvider, password validation   |
| prisma/schema.prisma             | Admin model with passwordHash            | Passwords stored securely, bcrypt used     |
| src/app/(auth)/login/page.tsx    | Login page with LoginForm                | UI pattern for login, reusable component   |

### Dependencies / Phụ thuộc

| Dependency      | Purpose                        | Status     |
|-----------------|-------------------------------|------------|
| bcrypt          | Password hashing/validation    | Existing   |
| NextAuth.js     | Auth/session management        | Existing   |
| Prisma          | Database ORM                   | Existing   |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From         | To           | Type         | Impact         |
|--------------|--------------|--------------|----------------|
| N/A          | N/A          | N/A          | Single root    |

### Reusable Components / Component Tái sử dụng
- LoginForm (`src/app/(auth)/login/page.tsx`): EN: Can be extended for Admin credentials login / VI: Có thể mở rộng cho đăng nhập Admin bằng mật khẩu
- CredentialsProvider in NextAuth config: EN: Already used for Super Admin, can be extended for Admin / VI: Đã dùng cho Super Admin, có thể mở rộng cho Admin

### New Components Needed / Component Cần tạo Mới
- May need to extend LoginForm to support Admin credentials login (if not already supported)
- May need to add audit logging for login attempts (if required by NFR)

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Extend NextAuth CredentialsProvider to support Admin login via email/password. When an Admin is invited, Super Admin sets their password (hashed with bcrypt). The login page will allow Admins to enter their credentials, which are validated against the database. On successful login, session is created and role assigned. First login updates status from PENDING to ACTIVE. Error messages are shown for invalid credentials. Audit logging can be added if required.

**VI:** Mở rộng NextAuth CredentialsProvider để hỗ trợ Admin đăng nhập bằng email/mật khẩu. Khi Admin được mời, Super Admin tạo mật khẩu (hash bằng bcrypt). Trang đăng nhập cho phép Admin nhập thông tin, xác thực với database. Đăng nhập thành công tạo session và gán role. Lần đăng nhập đầu chuyển trạng thái từ PENDING sang ACTIVE. Hiển thị lỗi khi nhập sai. Có thể thêm log audit nếu cần.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Chosen:** Extend CredentialsProvider | Reuses existing pattern, secure, minimal code | Needs careful role checks | ✅ Selected |
| Alternative 1: Separate Provider | Clear separation, easier to test | More code, duplicate logic | ❌ Rejected: Redundant |
| Alternative 2: Custom Auth Flow | Full control, flexible | High complexity, more risk | ❌ Rejected: Overkill |

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | CredentialsProvider | sgs-cs-helper | EN: Auth for Admin login / VI: Xác thực đăng nhập Admin |
| 2 | LoginForm | sgs-cs-helper | EN: UI for email/password login / VI: UI đăng nhập email/mật khẩu |
| 3 | Prisma Admin model | sgs-cs-helper | EN: Store password hash / VI: Lưu hash mật khẩu |
| 4 | Server Actions (auth) | sgs-cs-helper | EN: Validate credentials, update status / VI: Xác thực, cập nhật trạng thái |

### Component Details / Chi tiết Component

#### Component 1: CredentialsProvider
| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | src/lib/auth/config.ts |
| Purpose | EN: Auth for Admin login / VI: Xác thực đăng nhập Admin |
| Inputs | email, password |
| Outputs | session, role |
| Dependencies | bcrypt, Prisma |

#### Component 2: LoginForm
| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | src/app/(auth)/login/page.tsx |
| Purpose | EN: UI for email/password login / VI: UI đăng nhập email/mật khẩu |
| Inputs | email, password |
| Outputs | login request |
| Dependencies | NextAuth |

#### Component 3: Prisma Admin model
| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | prisma/schema.prisma |
| Purpose | EN: Store password hash / VI: Lưu hash mật khẩu |
| Inputs | passwordHash |
| Outputs | user record |
| Dependencies | bcrypt |

#### Component 4: Server Actions (auth)
| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | src/lib/actions/auth.ts |
| Purpose | EN: Validate credentials, update status / VI: Xác thực, cập nhật trạng thái |
| Inputs | email, password |
| Outputs | login result |
| Dependencies | Prisma, bcrypt |

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | Admin | LoginForm | email, password | Submit login |
| 2 | LoginForm | CredentialsProvider | email, password | Validate |
| 3 | CredentialsProvider | Prisma | email | Find user |
| 4 | CredentialsProvider | bcrypt | password, passwordHash | Verify |
| 5 | CredentialsProvider | NextAuth | user | Create session |
| 6 | CredentialsProvider | Prisma | user | Update status (PENDING→ACTIVE) |
| 7 | CredentialsProvider | LoginForm | result | Show error/success |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Invalid credentials | Show generic error | User sees "Invalid email or password" |
| Inactive user | Block login, show error | User sees "Account not active" |
| Missing password | Block login, show error | User sees "Password required" |
| Database error | Log error, show generic error | User sees "Login failed" |

### Rollback Plan / Kế hoạch Rollback
**EN:** If issues arise, revert CredentialsProvider changes and restore previous login flow. Remove password field from Admin if needed.
**VI:** Nếu có vấn đề, hoàn tác thay đổi CredentialsProvider và khôi phục luồng đăng nhập cũ. Xóa trường mật khẩu khỏi Admin nếu cần.

---

## 0.4 Diagrams

See [diagrams/flow-overview.md](./diagrams/flow-overview.md) and [diagrams/sequence-main.md](./diagrams/sequence-main.md) for visual flows.

---

## Key Decisions / Quyết định Chính
1. Extend CredentialsProvider for Admin login (reuse pattern)
2. Use bcrypt for password hashing/validation
3. Update Admin status on first login
4. Show generic error for invalid credentials

---

## ⏸️ Phase 0 Complete / Hoàn thành Phase 0

### Summary / Tóm tắt
| Aspect | Value |
|--------|-------|
| Problem | Admins cannot log in with credentials |
| Solution | Extend CredentialsProvider, update login form, use bcrypt |
| Components | 4 components in 1 root (sgs-cs-helper) |
| Diagrams | 2 diagrams created |

### Artifacts Created / Artifact Đã tạo
- [Solution Design](./solution-design.md)
- [Flow Overview](./diagrams/flow-overview.md)
- [Sequence Diagram](./diagrams/sequence-main.md)

### Key Decisions / Quyết định Chính
1. Extend CredentialsProvider for Admin login
2. Use bcrypt for password hashing/validation
3. Update Admin status on first login
4. Show generic error for invalid credentials

---

**⏸️ STOP: Awaiting Approval / Chờ Phê duyệt**

Please review the analysis and diagrams.
Vui lòng review phân tích và sơ đồ.

Reply / Trả lời:
- `approved` / `duyệt` → Proceed to Phase 1: Specification
- `feedback: <your feedback>` → Revise analysis
