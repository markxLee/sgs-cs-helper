# Analysis & Solution Design — Staff User Management (US-0.2.7)
<!-- Template Version: 1.0 | Contract: v1.0 | Created: 2026-02-06 -->
<!-- 🇻🇳 Vietnamese first, 🇬🇧 English follows — for easy scanning -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Staff User Management |
| User Story | US-0.2.7 |
| Status | Awaiting Review |
| Affected Roots | sgs-cs-helper only |
| Complexity | Medium |
| Estimated Effort | 12-16 hours (8 tasks) |
| Pattern | Follows existing Admin Management pattern |

---

## 1. Problem Statement

### Current Behavior / Hành vi Hiện tại

🇻🇳
- Nhân viên (STAFF) có thể đăng nhập bằng staff code (US-0.2.5 đã hoàn thành)
- Database có trường `staffCode`, `canUpload`, `canUpdateStatus` trong User model
- **KHÔNG có UI** để Admin/Super Admin tạo nhân viên
- **KHÔNG có UI** để quản lý quyền nhân viên (canUpload, canUpdateStatus)
- **KHÔNG có UI** để xem danh sách nhân viên với mã và quyền
- Chỉ có thể tạo nhân viên thủ công qua database hoặc seed script

🇬🇧
- Staff (STAFF) can login with staff code (US-0.2.5 completed)
- Database has `staffCode`, `canUpload`, `canUpdateStatus` fields in User model
- **NO UI** for Admin/Super Admin to create staff users
- **NO UI** to manage staff permissions (canUpload, canUpdateStatus)
- **NO UI** to view staff list with codes and permissions
- Can only create staff manually via database or seed script

### Desired Behavior / Hành vi Mong muốn

🇻🇳
- Admin và Super Admin có trang `/admin/staff` để quản lý nhân viên
- Form tạo nhân viên với tên, email (tùy chọn), quyền
- Hệ thống tự động tạo mã unique 6 ký tự alphanumeric
- Xem danh sách tất cả nhân viên với: tên, email, mã, quyền, trạng thái
- Chỉnh sửa quyền nhân viên (canUpload, canUpdateStatus)
- Vô hiệu hóa/kích hoạt nhân viên (đổi status)
- Tạo lại mã nhân viên khi cần

🇬🇧
- Admin and Super Admin have `/admin/staff` page to manage staff
- Create staff form with name, email (optional), permissions
- System auto-generates unique 6-char alphanumeric code
- View list of all staff with: name, email, code, permissions, status
- Edit staff permissions (canUpload, canUpdateStatus)
- Deactivate/reactivate staff (change status)
- Regenerate staff code when needed

### Gap Analysis / Phân tích Khoảng cách

🇻🇳
**Thiếu UI layer hoàn toàn** cho việc quản lý nhân viên. Database schema đã sẵn sàng từ US-0.2.5, nhưng chỉ có thể tạo/sửa nhân viên qua database trực tiếp. Cần xây dựng:
1. **Route `/admin/staff`** với layout bảo vệ (ADMIN + SUPER_ADMIN)
2. **Server Actions** cho CRUD operations (create, get, update, regenerate)
3. **UI Components** (form, list, edit dialog, confirmation)
4. **Code generation logic** với uniqueness enforcement

🇬🇧
**Complete lack of UI layer** for staff management. Database schema is ready from US-0.2.5, but can only create/edit staff via direct database access. Need to build:
1. **Route `/admin/staff`** with protected layout (ADMIN + SUPER_ADMIN)
2. **Server Actions** for CRUD operations (create, get, update, regenerate)
3. **UI Components** (form, list, edit dialog, confirmation)
4. **Code generation logic** with uniqueness enforcement

---

## 2. Clarifying Questions

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | Should ADMIN and SUPER_ADMIN both have full access? | Yes - both can create/edit/revoke staff | ✅ Resolved |
| 2 | Should staff code be case-sensitive? | No - store uppercase, login case-insensitive | ✅ Resolved |
| 3 | How to handle code collision? | Retry up to 10 times, then fail with error | ✅ Resolved |
| 4 | Should email be required? | No - email optional for staff | ✅ Resolved |
| 5 | Can staff code be manually specified? | No - always auto-generated for security | ✅ Resolved |
| 6 | Should old code work after regeneration? | No - old code invalid immediately | ✅ Resolved |

---

## 3. Assumptions & Constraints

### Assumptions / Giả định

🇻🇳
1. **Database schema đã hoàn chỉnh** — Không cần migration mới, schema từ US-0.2.5 đủ
2. **Pattern Admin Management** — Có thể tái sử dụng pattern từ `/admin/users` (US-0.2.2)
3. **Authentication system hoạt động** — NextAuth session có role/status
4. **6 ký tự đủ unique** — Với 36^6 = 2 tỷ combinations, collision rate thấp
5. **Staff không tự chỉnh sửa** — Chỉ Admin/Super Admin quản lý staff

🇬🇧
1. **Database schema complete** — No new migration needed, US-0.2.5 schema sufficient
2. **Admin Management pattern exists** — Can reuse pattern from `/admin/users` (US-0.2.2)
3. **Authentication system working** — NextAuth session has role/status
4. **6 chars sufficient for uniqueness** — With 36^6 = 2B combinations, low collision rate
5. **Staff cannot self-edit** — Only Admin/Super Admin manage staff

### Constraints / Ràng buộc

🇻🇳
1. **Route protection** — Chỉ ADMIN và SUPER_ADMIN access `/admin/staff`
2. **Database uniqueness** — staffCode @unique constraint đã có
3. **No SSO for staff** — Staff chỉ login bằng code (not email/password or OAuth)
4. **No bulk operations** — Tạo từng nhân viên một (no CSV import)
5. **Tech stack** — Next.js 16, React Server Components, Server Actions, Prisma

🇬🇧
1. **Route protection** — Only ADMIN and SUPER_ADMIN access `/admin/staff`
2. **Database uniqueness** — staffCode @unique constraint exists
3. **No SSO for staff** — Staff login only with code (not email/password or OAuth)
4. **No bulk operations** — Create one staff at a time (no CSV import)
5. **Tech stack** — Next.js 16, React Server Components, Server Actions, Prisma

---

## 4. Existing Patterns Found

| Location | Pattern | Reusable | Notes |
|----------|---------|----------|-------|
| `/admin/users` | Admin Management Page | ✅ Yes | Same structure: layout + form + list |
| `src/lib/actions/admin.ts` | Server Actions pattern | ✅ Yes | Auth check → Validate → Query → Revalidate |
| `src/components/admin/invite-admin-form.tsx` | Form component | ⚠️ Partial | Use similar structure, different fields |
| `src/components/admin/admin-list.tsx` | List component with actions | ✅ Yes | Table, status badges, action buttons |
| `src/app/admin/layout.tsx` | Admin layout protection | ✅ Yes | But need to extend for ADMIN role too |
| `prisma.user.findUnique({ where: { staffCode }})` | Uniqueness check | ✅ Yes | Use for collision detection |

### Key Learnings from Existing Code

🇻🇳
1. **Server Actions pattern**:
   - Auth check first (`await auth()`)
   - Role check (`session.user.role !== "SUPER_ADMIN"`)
   - Validation with Zod schema
   - Database operation with Prisma
   - `revalidatePath()` to refresh UI
   - Return `{ success: true/false }` with data/error

2. **Component pattern**:
   - Client Components for forms/lists (`"use client"`)
   - Server Components for pages
   - `useTransition` for pending states
   - State management with `useState`
   - Form submission calls Server Action

3. **Route protection**:
   - Layout at `/admin/*` checks role
   - Redirect if not authorized
   - Currently only allows SUPER_ADMIN

🇬🇧
1. **Server Actions pattern**:
   - Auth check first (`await auth()`)
   - Role check (`session.user.role !== "SUPER_ADMIN"`)
   - Validation with Zod schema
   - Database operation with Prisma
   - `revalidatePath()` to refresh UI
   - Return `{ success: true/false}` with data/error

2. **Component pattern**:
   - Client Components for forms/lists (`"use client"`)
   - Server Components for pages
   - `useTransition` for pending states
   - State management with `useState`
   - Form submission calls Server Action

3. **Route protection**:
   - Layout at `/admin/*` checks role
   - Redirect if not authorized
   - Currently only allows SUPER_ADMIN

---

## 5. Solution Options

### Option A: Extend Admin Management Pattern (CHOSEN ✅)

🇻🇳
Tái sử dụng pattern từ `/admin/users` và mở rộng cho staff management. Tạo route mới `/admin/staff` với cấu trúc tương tự.

**Ưu điểm:**
- Consistency với codebase hiện tại
- Đã có pattern proven hoạt động tốt
- Tái sử dụng được layout, Server Actions structure
- Developer quen thuộc với pattern

**Nhược điểm:**
- Cần extend Admin Layout để cho phép cả ADMIN và SUPER_ADMIN
- Duplicate một số code (nhưng có thể refactor sau)

**Verdict:** ✅ **Selected** — Consistency và proven pattern quan trọng hơn

🇬🇧
Reuse pattern from `/admin/users` and extend for staff management. Create new route `/admin/staff` with similar structure.

**Pros:**
- Consistency with current codebase
- Pattern is proven to work well
- Can reuse layout, Server Actions structure
- Developers familiar with pattern

**Cons:**
- Need to extend Admin Layout to allow both ADMIN and SUPER_ADMIN
- Some code duplication (but can refactor later)

**Verdict:** ✅ **Selected** — Consistency and proven pattern more important

### Option B: Unified User Management Page

🇻🇳
Kết hợp Admin và Staff management trong một trang `/admin/users` với tabs.

**Ưu điểm:**
- Single source of truth
- Less routes to maintain
- Can reuse more components

**Nhược điểm:**
- Page becomes complex
- Admin và Staff có workflows khác nhau (admin invitation vs staff creation)
- Mixing concerns
- User Story scope creep

**Verdict:** ❌ **Rejected** — Violates separation of concerns, increases complexity

🇬🇧
Combine Admin and Staff management in one page `/admin/users` with tabs.

**Pros:**
- Single source of truth
- Less routes to maintain
- Can reuse more components

**Cons:**
- Page becomes complex
- Admin and Staff have different workflows (invitation vs creation)
- Mixing concerns
- User Story scope creep

**Verdict:** ❌ **Rejected** — Violates separation of concerns, increases complexity

### Option C: Build from Scratch with New Patterns

🇻🇳
Tạo hoàn toàn mới không follow existing pattern.

**Verdict:** ❌ **Rejected** — No good reason to deviate from working patterns

🇬🇧
Build completely new without following existing patterns.

**Verdict:** ❌ **Rejected** — No good reason to deviate from working patterns

---

## 6. Solution Design

### Solution Overview / Tổng quan Giải pháp

🇻🇳
Xây dựng hệ thống quản lý nhân viên theo pattern đã proven từ Admin Management (US-0.2.2). Tạo route mới `/admin/staff` với:
1. **Layout protection** — Extend Admin Layout để cho phép cả ADMIN và SUPER_ADMIN
2. **Server Actions** — Tạo `src/lib/actions/staff.ts` với CRUD operations
3. **UI Components** — Form, List, Edit Dialog tương tự Admin Management
4. **Code Generation** — Utility function tạo mã unique 6 ký tự alphanumeric

**Flow chính:**
- Admin vào `/admin/staff` → Layout check role → Pass if ADMIN/SUPER_ADMIN
- Create Staff Form → Submit → Server Action → Generate code → Create in DB → Refresh
- Staff List → Display all with codes → Click Edit → Update permissions → Refresh
- Click Regenerate Code → Confirm → Generate new → Old invalid → Refresh

🇬🇧
Build staff management system following proven pattern from Admin Management (US-0.2.2). Create new route `/admin/staff` with:
1. **Layout protection** — Extend Admin Layout to allow both ADMIN and SUPER_ADMIN
2. **Server Actions** — Create `src/lib/actions/staff.ts` with CRUD operations
3. **UI Components** — Form, List, Edit Dialog similar to Admin Management
4. **Code Generation** — Utility function to generate unique 6-char alphanumeric code

**Main flow:**
- Admin goes to `/admin/staff` → Layout checks role → Pass if ADMIN/SUPER_ADMIN
- Create Staff Form → Submit → Server Action → Generate code → Create in DB → Refresh
- Staff List → Display all with codes → Click Edit → Update permissions → Refresh
- Click Regenerate Code → Confirm → Generate new → Old invalid → Refresh

### Component Architecture / Kiến trúc Component

| # | Name | Type | Location | Purpose |
|---|------|------|----------|---------|
| 1 | Admin Layout (modified) | Server | `src/app/admin/layout.tsx` | Extend to allow ADMIN + SUPER_ADMIN |
| 2 | Staff Page | Server | `src/app/admin/staff/page.tsx` | Container page |
| 3 | Create Staff Form | Client | `src/components/admin/create-staff-form.tsx` | Form to create staff |
| 4 | Staff List | Client | `src/components/admin/staff-list.tsx` | Display all staff with actions |
| 5 | Edit Staff Dialog | Client | `src/components/admin/edit-staff-dialog.tsx` | Edit permissions |
| 6 | Staff Server Actions | Server | `src/lib/actions/staff.ts` | CRUD operations |
| 7 | Code Generation Utility | Server | `src/lib/utils/staff-code.ts` | Generate unique codes |

### Component Details / Chi tiết Component

#### Component 1: Admin Layout (Modified)

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/app/admin/layout.tsx` |
| Type | Server Component |
| Purpose | Extend role check to allow ADMIN + SUPER_ADMIN |
| Changes | `session.user.role !== "SUPER_ADMIN"` → `!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)` |

#### Component 2: Staff Page

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/app/admin/staff/page.tsx` |
| Type | Server Component |
| Purpose | Container for staff management UI |
| Content | Title + CreateStaffForm + StaffList |

#### Component 3: Create Staff Form

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/components/admin/create-staff-form.tsx` |
| Type | Client Component (`"use client"`) |
| Inputs | name (required), email (optional), canUpload (boolean), canUpdateStatus (boolean) |
| Action | Calls `createStaff()` Server Action |
| Output | Success message with generated code |

#### Component 4: Staff List

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/components/admin/staff-list.tsx` |
| Type | Client Component (`"use client"`) |
| Data Source | `getStaff()` Server Action |
| Displays | Table with: Name, Email, Staff Code, canUpload, canUpdateStatus, Status, Actions |
| Actions | Edit (permissions), Regenerate Code, Change Status |

#### Component 5: Edit Staff Dialog

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/components/admin/edit-staff-dialog.tsx` |
| Type | Client Component |
| Purpose | Modal to edit staff permissions |
| Inputs | canUpload (checkbox), canUpdateStatus (checkbox) |
| Action | Calls `updateStaffPermissions()` Server Action |

#### Component 6: Staff Server Actions

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/lib/actions/staff.ts` |
| Type | Server Actions module |
| Functions | `createStaff()`, `getStaff()`, `updateStaffPermissions()`, `updateStaffStatus()`, `regenerateStaffCode()` |
| Auth | All functions check session.user.role is ADMIN or SUPER_ADMIN |
| Validation | Zod schemas for inputs |

#### Component 7: Code Generation Utility

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-helper |
| Location | `src/lib/utils/staff-code.ts` |
| Purpose | Generate unique 6-char alphanumeric codes |
| Algorithm | Random from [A-Z0-9], uppercase, check uniqueness, retry if collision |
| Max Retries | 10 attempts |

---

## 7. Data Flow

### Create Staff Flow / Luồng Tạo Nhân viên

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | CreateStaffForm | name, email, permissions | Fill form |
| 2 | Form | createStaff() | input data | Submit |
| 3 | createStaff() | Auth | session | Check ADMIN/SUPER_ADMIN |
| 4 | createStaff() | generateUniqueStaffCode() | - | Request code |
| 5 | generateUniqueStaffCode() | Database | staffCode | Check uniqueness |
| 6 | Database | generateUniqueStaffCode() | exists: true/false | Response |
| 7 | generateUniqueStaffCode() | createStaff() | unique code | Return code |
| 8 | createStaff() | Database | user data + code | prisma.user.create() |
| 9 | Database | createStaff() | created user | Response |
| 10 | createStaff() | revalidatePath | "/admin/staff" | Refresh |
| 11 | createStaff() | Form | { success, code } | Response |
| 12 | Form | User | Success message + code | Display |

### Edit Permissions Flow / Luồng Sửa Quyền

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | StaffList | - | Click "Edit" |
| 2 | StaffList | EditStaffDialog | staff data | Open modal |
| 3 | User | EditStaffDialog | new permissions | Toggle checkboxes |
| 4 | EditStaffDialog | updateStaffPermissions() | userId, permissions | Submit |
| 5 | updateStaffPermissions() | Auth | session | Check role |
| 6 | updateStaffPermissions() | Database | userId, data | prisma.user.update() |
| 7 | Database | updateStaffPermissions() | updated user | Response |
| 8 | updateStaffPermissions() | revalidatePath | "/admin/staff" | Refresh |
| 9 | updateStaffPermissions() | Dialog | { success } | Response |
| 10 | Dialog | User | Success message | Display |

### Regenerate Code Flow / Luồng Tạo lại Mã

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | StaffList | - | Click "Regenerate" |
| 2 | StaffList | ConfirmDialog | staff name | Show confirmation |
| 3 | User | ConfirmDialog | - | Confirm |
| 4 | ConfirmDialog | regenerateStaffCode() | userId | Submit |
| 5 | regenerateStaffCode() | generateUniqueStaffCode() | - | Request new code |
| 6 | generateUniqueStaffCode() | regenerateStaffCode() | new code | Return |
| 7 | regenerateStaffCode() | Database | userId, new code | update staffCode |
| 8 | Database | regenerateStaffCode() | updated user | Response |
| 9 | regenerateStaffCode() | revalidatePath | "/admin/staff" | Refresh |
| 10 | regenerateStaffCode() | Dialog | { success, code } | Response |
| 11 | Dialog | User | New code message | Display |

---

## 8. Code Generation Algorithm

### generateStaffCode()

```typescript
/**
 * Generate a random 6-character alphanumeric staff code
 * @returns Uppercase 6-char string (A-Z, 0-9)
 */
function generateStaffCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### generateUniqueStaffCode()

```typescript
/**
 * Generate a unique staff code with collision detection
 * @param prisma - Prisma client instance
 * @returns Promise<string> - Unique staff code
 * @throws Error if unable to generate unique code after 10 attempts
 */
async function generateUniqueStaffCode(prisma: PrismaClient): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateStaffCode();
    
    // Check if code already exists
    const existingUser = await prisma.user.findUnique({
      where: { staffCode: code },
      select: { id: true },
    });
    
    if (!existingUser) {
      return code;
    }
    
    // Code collision, retry
    console.warn(`Staff code collision: ${code}, attempt ${attempt + 1}/${MAX_ATTEMPTS}`);
  }
  
  throw new Error('Unable to generate unique staff code after 10 attempts');
}
```

### Collision Probability

🇻🇳
- Tổng số combinations: 36^6 = 2,176,782,336
- Với 1,000 nhân viên: xác suất collision < 0.00002%
- Với 10,000 nhân viên: xác suất collision < 0.002%
- Retry logic đảm bảo an toàn 100%

🇬🇧
- Total combinations: 36^6 = 2,176,782,336
- With 1,000 staff: collision probability < 0.00002%
- With 10,000 staff: collision probability < 0.002%
- Retry logic ensures 100% safety

---

## 9. Error Handling

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Code collision after 10 retries | Return error, ask to try again | Rare - show error message |
| Database connection failure | Catch error, return generic message | "Failed to create staff" |
| Unauthorized access | Redirect to login or dashboard | No access to page |
| Invalid input (missing name) | Zod validation error | Form shows error message |
| Email format invalid | Zod validation error | Form shows error: "Invalid email" |
| Staff not found (edit/regenerate) | Return error | "Staff user not found" |
| Self-edit attempt | N/A (staff can't access page) | - |

---

## 10. Security Considerations

### Authentication & Authorization / Xác thực & Phân quyền

🇻🇳
1. **Route Protection**: Admin Layout kiểm tra session.user.role
2. **Server Actions**: Tất cả actions kiểm tra role trước khi thực thi
3. **No client-side bypasses**: Tất cả mutations qua Server Actions
4. **Session validation**: NextAuth JWT với role/status

🇬🇧
1. **Route Protection**: Admin Layout checks session.user.role
2. **Server Actions**: All actions verify role before execution
3. **No client-side bypasses**: All mutations via Server Actions
4. **Session validation**: NextAuth JWT with role/status

### Code Security / Bảo mật Mã

🇻🇳
1. **Auto-generated only**: Không cho phép admin nhập mã thủ công
2. **Uppercase storage**: Store uppercase để tránh confusion (0 vs O, 1 vs I)
3. **Case-insensitive login**: Login accept cả lowercase/uppercase
4. **Unique constraint**: Database level uniqueness enforcement
5. **Regeneration invalidates old**: Mã cũ không còn hoạt động

🇬🇧
1. **Auto-generated only**: Don't allow manual code input
2. **Uppercase storage**: Store uppercase to avoid confusion (0 vs O, 1 vs I)
3. **Case-insensitive login**: Login accepts both lowercase/uppercase
4. **Unique constraint**: Database level uniqueness enforcement
5. **Regeneration invalidates old**: Old code immediately invalid

---

## 11. Rollback Plan

### Trigger Conditions / Điều kiện Rollback

🇻🇳
- Code generation fails liên tục
- Admin không thể tạo nhân viên
- Nhân viên bị khóa không đúng
- Performance issues

🇬🇧
- Code generation consistently fails
- Admin cannot create staff
- Staff incorrectly locked
- Performance issues

### Rollback Steps / Bước Rollback

```bash
# 1. Revert code changes
git revert <commit-sha>

# 2. Remove /admin/staff route (optional - won't break existing system)
# No database changes needed - schema from US-0.2.5 stays

# 3. Rebuild
pnpm build

# 4. Verify existing features still work
# - /admin/users should work
# - Staff login with existing codes should work
```

### Verification / Xác minh

🇻🇳
1. Admin có thể access `/admin/users` ✅
2. Staff login với mã hiện có hoạt động ✅
3. Không có lỗi build ✅

🇬🇧
1. Admin can access `/admin/users` ✅
2. Staff login with existing codes works ✅
3. No build errors ✅

---

## 12. Open Questions

| # | Question | Impact | Resolution Needed By |
|---|----------|--------|---------------------|
| None | All questions resolved in Section 2 | - | - |

---

## 13. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Code collision | Low | Medium | Retry logic + 36^6 combinations |
| Admin Layout change breaks existing | Low | High | Test `/admin/users` after change |
| Performance with many staff | Low | Medium | Database indexed on staffCode |
| Code visibility security | Medium | High | Only show at creation/regeneration |
| Accidental status change | Medium | Low | Confirmation dialog before change |

---

## 14. Dependencies

### Existing Dependencies / Phụ thuộc Hiện có

✅ All satisfied:
- US-0.2.2: Admin Dashboard (pattern source)
- US-0.2.5: Staff Code Login (database schema)
- NextAuth.js authentication system
- Prisma ORM
- React Server Components

### External Dependencies / Phụ thuộc Ngoài

None - all work within sgs-cs-helper root.

---

## 15. Cross-Root Impact

| Root | Impact | Changes Required |
|------|--------|------------------|
| sgs-cs-helper | Primary | New route, components, actions |
| a-z-copilot-flow | None | Tooling only |

**No cross-root dependencies.**

---

## 16. Next Steps

After Phase 0 approval:
1. **Phase 1: Specification** — Detail all 10 acceptance criteria
2. **Phase 2: Task Planning** — Break down into 8 tasks
3. **Phase 3: Implementation** — Execute tasks in order
4. **Phase 4: Testing** — Unit tests + manual testing
5. **Phase 5: Done Check** — Verify all criteria met

---

**Status:** 📋 **Awaiting Review**  
**Created:** 2026-02-06  
**Last Updated:** 2026-02-06
