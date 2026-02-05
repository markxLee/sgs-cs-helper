# Solution Design: US-0.2.2 — Super Admin Dashboard & Admin Invitation
<!-- Phase 0 Analysis | Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.2.2 -->

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** Super Admin needs a dashboard to invite and manage Admin users. Currently, the only way to create Admin users is via database seeding. This blocks the Admin login features (US-0.2.3, US-0.2.4) which require invited Admin records to exist.

**VI:** Super Admin cần dashboard để mời và quản lý Admin users. Hiện tại, cách duy nhất để tạo Admin là qua database seeding. Điều này chặn các tính năng đăng nhập Admin (US-0.2.3, US-0.2.4) vì cần có Admin record đã được mời.

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Admin Creation | Database seed only | Super Admin UI to invite |
| Auth Methods | Credentials only | Credentials + Google OAuth |
| User Status | Not tracked | Pending → Active lifecycle |
| Admin List | Not visible | Viewable and manageable |

### Gap Analysis / Phân tích Khoảng cách

| Gap | Description |
|-----|-------------|
| No Admin dashboard | Need `/admin/users` route with Super Admin protection |
| No invitation flow | Need form to create Admin with email + auth method |
| No auth method tracking | User model lacks `authMethod` field |
| No status tracking | User model lacks `status` field for pending/active |
| No revoke capability | No way to remove Admin access |

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | `prisma/schema.prisma` | Add `AuthMethod`, `UserStatus` enums and fields |
| sgs-cs-hepper | `src/app/admin/users/` | New page for Admin management |
| sgs-cs-hepper | `src/components/admin/` | New components for invite form, list |
| sgs-cs-hepper | `src/lib/actions/` | New Server Actions for CRUD |
| sgs-cs-hepper | `src/lib/auth/config.ts` | Update to check status on login |

### Open Questions / Câu hỏi Mở

1. **Answered**: Soft delete vs hard delete → Soft delete with `REVOKED` status
2. **Answered**: Password requirements → Min 8 chars (same as Super Admin)

### Assumptions / Giả định

1. Super Admin is always seeded and cannot be revoked
2. Only Super Admin can access `/admin/*` routes
3. Prisma migrate will handle schema changes
4. No email notifications for MVP

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| [src/lib/auth/config.ts](src/lib/auth/config.ts) | Credentials provider | Yes | Reuse for Admin login |
| [src/lib/auth/password.ts](src/lib/auth/password.ts) | Password hashing | Yes | Reuse for Admin passwords |
| [src/app/(auth)/login/_components/login-form.tsx](src/app/(auth)/login/_components/login-form.tsx) | Form pattern | Partial | Reference for invite form |
| [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) | Auth check pattern | Yes | Reference for Admin route protection |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| `login-form.tsx` | Client form with loading state | Use similar UX patterns |
| `dashboard/layout.tsx` | Session check with redirect | Add role check for admin routes |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| `next-auth@5.0.0-beta.30` | Authentication | Existing |
| `bcrypt@6.0.0` | Password hashing | Existing |
| `prisma@7.3.0` | Database ORM | Existing |
| `zod` | Form validation | Existing |

### Reusable Components / Component Tái sử dụng

- `src/lib/auth/password.ts`: `hashPassword()`, `verifyPassword()`
- `src/lib/db/index.ts`: Prisma client singleton
- `src/app/(dashboard)/layout.tsx`: Auth check pattern

### New Components Needed / Component Cần tạo Mới

| Component | Purpose |
|-----------|---------|
| `/admin/users/page.tsx` | Admin management page |
| `InviteAdminForm` | Form to invite new Admin |
| `AdminList` | List of all Admins |
| `AdminListItem` | Individual Admin row with actions |
| `inviteAdmin` action | Server Action to create Admin |
| `revokeAdmin` action | Server Action to revoke Admin |
| `getAdmins` action | Server Action to list Admins |

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Create a protected Admin dashboard at `/admin/users` accessible only by Super Admin. The page displays a form to invite new Admins (with email, auth method, optional password) and a list of existing Admins with revoke actions. Server Actions handle all mutations with Prisma transactions. Schema updates add `authMethod` and `status` fields to the User model.

**VI:** Tạo Admin dashboard được bảo vệ tại `/admin/users` chỉ Super Admin truy cập được. Trang hiển thị form để mời Admin mới (với email, auth method, password tùy chọn) và danh sách Admin hiện có với action revoke. Server Actions xử lý các mutations với Prisma transactions. Schema updates thêm fields `authMethod` và `status` vào User model.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Server Actions + Server Components** | Type-safe, no API routes, built-in validation | Requires form state management | ✅ Selected |
| API Routes + Client fetch | Familiar REST pattern | Extra boilerplate, manual validation | ❌ More code |
| tRPC | End-to-end types | Heavy setup for simple CRUD | ❌ Overkill |

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | Schema Update | prisma | Add AuthMethod, UserStatus enums and fields |
| 2 | Admin Layout | src/app/admin | Route protection for Super Admin only |
| 3 | UsersPage | src/app/admin/users | Main page for Admin management |
| 4 | InviteAdminForm | src/components/admin | Form to invite new Admin |
| 5 | AdminList | src/components/admin | Display all Admins |
| 6 | Server Actions | src/lib/actions/admin | inviteAdmin, revokeAdmin, getAdmins |

### Component Details / Chi tiết Component

#### Component 1: Schema Update

| Aspect | Detail |
|--------|--------|
| Location | `prisma/schema.prisma` |
| Purpose | Add auth method and status tracking to User model |
| Changes | Add `AuthMethod` enum (CREDENTIALS, GOOGLE), `UserStatus` enum (PENDING, ACTIVE, REVOKED), fields to User |

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
  // Existing fields...
  authMethod AuthMethod @default(CREDENTIALS)
  status     UserStatus @default(ACTIVE)  // SUPER_ADMIN is always ACTIVE
}
```

#### Component 2: Admin Layout

| Aspect | Detail |
|--------|--------|
| Location | `src/app/admin/layout.tsx` |
| Purpose | Protect all `/admin/*` routes for Super Admin only |
| Inputs | Session from NextAuth |
| Outputs | Redirect to login or "Access Denied" |

#### Component 3: UsersPage

| Aspect | Detail |
|--------|--------|
| Location | `src/app/admin/users/page.tsx` |
| Purpose | Main Admin management page |
| Type | Server Component |
| Dependencies | `getAdmins` action |

#### Component 4: InviteAdminForm

| Aspect | Detail |
|--------|--------|
| Location | `src/components/admin/invite-admin-form.tsx` |
| Purpose | Form to invite new Admin |
| Type | Client Component |
| Inputs | email, authMethod, password (conditional) |
| Outputs | Calls `inviteAdmin` action |
| Validation | Zod schema |

#### Component 5: AdminList

| Aspect | Detail |
|--------|--------|
| Location | `src/components/admin/admin-list.tsx` |
| Purpose | Display all Admin users |
| Type | Client Component (for optimistic updates) |
| Inputs | Array of Admin users |
| Outputs | Calls `revokeAdmin` action |

#### Component 6: Server Actions

| Aspect | Detail |
|--------|--------|
| Location | `src/lib/actions/admin.ts` |
| Purpose | CRUD operations for Admin users |
| Functions | `inviteAdmin`, `revokeAdmin`, `getAdmins` |

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | Super Admin | UsersPage | GET request | Load page |
| 2 | UsersPage | getAdmins | - | Fetch Admin list |
| 3 | getAdmins | Prisma | Query | SELECT users WHERE role=ADMIN |
| 4 | Prisma | AdminList | User[] | Display in table |
| 5 | Super Admin | InviteAdminForm | Form data | Fill form |
| 6 | InviteAdminForm | inviteAdmin | {email, authMethod, password?} | Submit |
| 7 | inviteAdmin | Prisma | Insert | CREATE user |
| 8 | inviteAdmin | AdminList | Revalidate | Refresh list |
| 9 | Super Admin | AdminList | Click revoke | Trigger action |
| 10 | AdminList | revokeAdmin | userId | Update status |
| 11 | revokeAdmin | Prisma | Update | SET status=REVOKED |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Duplicate email | Return error, don't create | Show "Email already exists" |
| Invalid email format | Zod validation | Show validation error |
| Password too short | Zod validation | Show "Min 8 characters" |
| Self-revoke attempt | Backend check | Show "Cannot revoke yourself" |
| DB connection error | Try-catch, return error | Show generic error |
| Unauthorized access | Redirect in layout | Redirect to login |

### Rollback Plan / Kế hoạch Rollback

**EN:** 
1. Schema changes are additive (new fields with defaults) - safe to rollback
2. If issues, revert migration: `prisma migrate resolve --rolled-back`
3. Route changes are isolated to `/admin/*` - no impact on existing routes
4. Server Actions are new files - simply delete to rollback

**VI:**
1. Schema changes là additive (fields mới với defaults) - an toàn để rollback
2. Nếu có vấn đề, revert migration: `prisma migrate resolve --rolled-back`
3. Route changes được cô lập trong `/admin/*` - không ảnh hưởng routes hiện có
4. Server Actions là files mới - chỉ cần xóa để rollback

---

## 0.4 Diagrams / Sơ đồ

See:
- [Flow Overview](./diagrams/flow-overview.md)
- [Sequence: Invite Admin](./diagrams/sequence-invite.md)
- [Architecture](./diagrams/architecture.md)

---

## Decision Log / Nhật ký Quyết định

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D-001 | Use Server Actions instead of API routes | Type-safe, less boilerplate, built-in form handling | 2026-02-05 |
| D-002 | Soft delete (REVOKED status) instead of hard delete | Audit trail, ability to restore | 2026-02-05 |
| D-003 | Conditional password field based on auth method | Cleaner UX, only show when needed | 2026-02-05 |
| D-004 | Separate `/admin` layout for role check | Clean separation of concerns, reusable for future admin pages | 2026-02-05 |

