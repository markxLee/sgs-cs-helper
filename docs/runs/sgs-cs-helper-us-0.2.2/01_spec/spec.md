# Specification: Super Admin Dashboard & Admin Invitation
# Đặc tả: Dashboard Super Admin & Mời Admin
<!-- Phase 1 Spec | US-0.2.2 | Generated: 2026-02-05 -->

---

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Super Admin Dashboard & Admin Invitation |
| User Story | US-0.2.2 |
| Phase 0 Analysis | [Solution Design](../00_analysis/solution-design.md) |
| Functional Reqs | 6 |
| Non-Functional Reqs | 4 |
| Affected Roots | sgs-cs-hepper |
| Edge Cases | 6 |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:** This feature provides Super Admin with a dashboard to manage Admin users. Super Admin can invite new Admins by email, choosing between Google OAuth or Email/Password authentication methods. Invited Admins are stored with a PENDING status until first login. Super Admin can also view the list of all Admins and revoke their access.

**VI:** Tính năng này cung cấp cho Super Admin một dashboard để quản lý Admin users. Super Admin có thể mời Admin mới bằng email, chọn giữa phương thức xác thực Google OAuth hoặc Email/Password. Admin được mời sẽ được lưu với trạng thái PENDING cho đến khi đăng nhập lần đầu. Super Admin cũng có thể xem danh sách tất cả Admin và thu hồi quyền truy cập.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**
- Admin dashboard at `/admin/users`
- Invite Admin form with email and auth method selection
- Password input for Email/Password auth method
- Admin list with status display
- Revoke Admin functionality
- Database schema updates (AuthMethod, UserStatus enums)
- Route protection for Super Admin only

**Out of Scope / Ngoài phạm vi:**
- Admin login flows (US-0.2.3, US-0.2.4)
- Staff login (US-0.2.5)
- Email notifications to invited Admins
- Password reset functionality
- Bulk import of Admins
- Admin profile editing

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Admin Dashboard Access

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Super Admin can access the Admin management dashboard at `/admin/users`. Only users with role `SUPER_ADMIN` can access this route. Other roles are redirected or shown "Access Denied".
- **VI:** Super Admin có thể truy cập dashboard quản lý Admin tại `/admin/users`. Chỉ users có role `SUPER_ADMIN` mới truy cập được route này. Các role khác sẽ bị redirect hoặc hiển thị "Access Denied".

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Route `/admin/users` exists and renders correctly
- [ ] AC2: Super Admin can access the page after login
- [ ] AC3: ADMIN role users are redirected to dashboard or shown "Access Denied"
- [ ] AC4: STAFF role users are redirected to dashboard or shown "Access Denied"
- [ ] AC5: Unauthenticated users are redirected to `/login`

---

### FR-002: Invite Admin Form

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Super Admin can invite a new Admin by filling out a form with email address and authentication method. The form has two auth method options: "Google OAuth" and "Email/Password".
- **VI:** Super Admin có thể mời Admin mới bằng cách điền form với địa chỉ email và phương thức xác thực. Form có hai tùy chọn auth method: "Google OAuth" và "Email/Password".

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: "Invite Admin" form is visible on `/admin/users` page
- [ ] AC2: Form has email input field with validation
- [ ] AC3: Form has auth method selector with options: "Google OAuth", "Email/Password"
- [ ] AC4: Form has "Invite" submit button
- [ ] AC5: Form shows loading state during submission
- [ ] AC6: Form resets after successful submission

---

### FR-003: Conditional Password Input

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** When "Email/Password" auth method is selected, a password input field appears. Super Admin must enter an initial password (minimum 8 characters) for the new Admin. When "Google OAuth" is selected, the password field is hidden.
- **VI:** Khi chọn phương thức "Email/Password", một trường nhập password xuất hiện. Super Admin phải nhập password ban đầu (tối thiểu 8 ký tự) cho Admin mới. Khi chọn "Google OAuth", trường password được ẩn.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Password field is hidden by default (when Google OAuth selected)
- [ ] AC2: Password field appears when "Email/Password" is selected
- [ ] AC3: Password field has minimum length validation (8 chars)
- [ ] AC4: Password is required when "Email/Password" is selected
- [ ] AC5: Validation error shows if password is too short

---

### FR-004: Create Admin Record

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** When the invite form is submitted, a new User record is created in the database with role=ADMIN, status=PENDING, and the selected authMethod. For Email/Password auth, the password is hashed and stored. For Google OAuth, no password is stored.
- **VI:** Khi form invite được submit, một User record mới được tạo trong database với role=ADMIN, status=PENDING, và authMethod đã chọn. Với auth Email/Password, password được hash và lưu. Với Google OAuth, không lưu password.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: User record created with role=ADMIN
- [ ] AC2: User record created with status=PENDING
- [ ] AC3: User record created with correct authMethod (CREDENTIALS or GOOGLE)
- [ ] AC4: Password is hashed with bcrypt (for CREDENTIALS auth)
- [ ] AC5: No password stored for GOOGLE auth method
- [ ] AC6: Email is stored (case-insensitive uniqueness enforced)
- [ ] AC7: Success message shown after creation
- [ ] AC8: Admin list refreshes after creation

---

### FR-005: Admin List Display

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Super Admin can see a list of all Admin users (not Super Admin, not Staff). The list shows email, name (if available), status (PENDING/ACTIVE/REVOKED), auth method, and created date. Each row has a "Revoke" action button.
- **VI:** Super Admin có thể xem danh sách tất cả Admin users (không bao gồm Super Admin và Staff). Danh sách hiển thị email, name (nếu có), status (PENDING/ACTIVE/REVOKED), auth method, và ngày tạo. Mỗi row có nút action "Revoke".

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Admin list is visible on `/admin/users` page
- [ ] AC2: List shows only users with role=ADMIN
- [ ] AC3: Each row displays: email, name, status, auth method, created date
- [ ] AC4: Status is displayed with visual indicator (badge/color)
- [ ] AC5: "Revoke" button is visible for each Admin
- [ ] AC6: Empty state shows "No admins invited yet" message
- [ ] AC7: List is sorted by created date (newest first)

---

### FR-006: Revoke Admin Access

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** Super Admin can revoke an Admin's access by clicking the "Revoke" button. A confirmation dialog appears before the action is executed. Revoking sets the Admin's status to REVOKED (soft delete). Revoked Admins cannot log in.
- **VI:** Super Admin có thể thu hồi quyền truy cập của Admin bằng cách click nút "Revoke". Một dialog xác nhận xuất hiện trước khi thực hiện action. Revoke sẽ set status của Admin thành REVOKED (soft delete). Admin đã bị revoke không thể đăng nhập.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Clicking "Revoke" shows confirmation dialog
- [ ] AC2: Confirmation dialog has "Cancel" and "Confirm" buttons
- [ ] AC3: Cancel closes dialog without action
- [ ] AC4: Confirm sets Admin status to REVOKED
- [ ] AC5: Admin row is updated in list (shows REVOKED status or removed)
- [ ] AC6: Super Admin cannot revoke themselves (self-protection)
- [ ] AC7: Success message shown after revocation

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Response Time

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | < 500ms for page load, < 300ms for actions |

**Description / Mô tả:**
- **EN:** The Admin dashboard page should load within 500ms. Invite and revoke actions should complete within 300ms (excluding network latency).
- **VI:** Trang Admin dashboard phải load trong vòng 500ms. Các action invite và revoke phải hoàn thành trong 300ms (không tính network latency).

---

### NFR-002: Security - Password Hashing

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | bcrypt with 10 rounds |

**Description / Mô tả:**
- **EN:** Admin passwords must be hashed using bcrypt with 10 salt rounds before storing in the database. Plain text passwords must never be stored or logged.
- **VI:** Password của Admin phải được hash bằng bcrypt với 10 salt rounds trước khi lưu vào database. Password plain text không bao giờ được lưu hoặc log.

---

### NFR-003: Security - Route Protection

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | 100% of /admin/* routes protected |

**Description / Mô tả:**
- **EN:** All routes under `/admin/*` must be protected. Server-side session validation must occur before rendering. No sensitive data should be exposed to unauthorized users.
- **VI:** Tất cả routes dưới `/admin/*` phải được bảo vệ. Validation session phía server phải xảy ra trước khi render. Không có dữ liệu nhạy cảm nào được expose cho unauthorized users.

---

### NFR-004: Data Integrity

| Aspect | Detail |
|--------|--------|
| Category | Reliability |
| Metric | Email uniqueness enforced at DB level |

**Description / Mô tả:**
- **EN:** Email uniqueness must be enforced at the database level with a unique constraint. Duplicate email submissions must be rejected with a clear error message.
- **VI:** Tính unique của email phải được enforce ở database level với unique constraint. Submissions với email trùng phải bị reject với error message rõ ràng.

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-hepper

| Aspect | Detail |
|--------|--------|
| Changes | Schema update, new pages, new components, new actions |
| Sync Type | N/A (single root) |

**Files Changed / Files Thay đổi:**

| File | Change Type | Description |
|------|-------------|-------------|
| `prisma/schema.prisma` | Modify | Add AuthMethod, UserStatus enums; add fields to User |
| `prisma/seed.ts` | Modify | Update seed to set status=ACTIVE for Super Admin |
| `src/app/admin/layout.tsx` | Create | Admin route protection layout |
| `src/app/admin/users/page.tsx` | Create | Admin management page |
| `src/components/admin/invite-admin-form.tsx` | Create | Invite form component |
| `src/components/admin/admin-list.tsx` | Create | Admin list component |
| `src/lib/actions/admin.ts` | Create | Server Actions for admin CRUD |
| `src/lib/auth/config.ts` | Modify | Check user status on login |

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Schema: User Model Updates

```prisma
enum AuthMethod {
  CREDENTIALS
  GOOGLE
}

enum UserStatus {
  PENDING
  ACTIVE
  REVOKED
}

model User {
  id           String      @id @default(cuid())
  email        String?     @unique
  name         String?
  role         Role        @default(STAFF)
  authMethod   AuthMethod  @default(CREDENTIALS)  // NEW
  status       UserStatus  @default(ACTIVE)       // NEW
  passwordHash String?
  staffCode    String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  orders       Order[]     @relation("UploadedBy")
}
```

### Server Action: inviteAdmin

```typescript
// Input
type InviteAdminInput = {
  email: string;              // Required, valid email
  authMethod: "CREDENTIALS" | "GOOGLE";
  password?: string;          // Required if authMethod === "CREDENTIALS"
}

// Output
type InviteAdminResult = 
  | { success: true; admin: { id: string; email: string } }
  | { success: false; error: string }
```

### Server Action: revokeAdmin

```typescript
// Input
type RevokeAdminInput = {
  userId: string;
}

// Output
type RevokeAdminResult =
  | { success: true }
  | { success: false; error: string }
```

### Server Action: getAdmins

```typescript
// Output
type Admin = {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  authMethod: "CREDENTIALS" | "GOOGLE";
  createdAt: Date;
}

type GetAdminsResult = Admin[]
```

---

## 6. Edge Cases / Trường hợp Biên

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | Duplicate email submitted | Show error "Email already exists", form not reset |
| EC-002 | Invalid email format | Show validation error, prevent submission |
| EC-003 | Password too short (< 8 chars) | Show validation error "Minimum 8 characters" |
| EC-004 | Super Admin tries to revoke themselves | Show error "Cannot revoke your own account" |
| EC-005 | No admins exist yet | Show empty state "No admins invited yet" |
| EC-006 | Session expires during action | Redirect to login page |

---

## 7. Dependencies / Phụ thuộc

| Dependency | Type | Status |
|------------|------|--------|
| `next-auth@5.0.0-beta.30` | Package | Existing |
| `bcrypt@6.0.0` | Package | Existing |
| `@prisma/client@7.3.0` | Package | Existing |
| `zod` | Package | Existing |

---

## 8. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema migration fails | High | Test migration on dev first; have rollback plan |
| Super Admin accidentally revokes all Admins | Medium | Self-protection prevents accidental self-revoke |
| Email uniqueness race condition | Low | Database-level unique constraint handles this |
| Password exposed in logs | High | Never log password values; hash immediately |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-05 |
| Reviewer | ⏳ Pending | |

