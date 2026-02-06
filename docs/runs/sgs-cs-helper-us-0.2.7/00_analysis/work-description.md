# Work Description — Staff User Management
<!-- Created: 2026-02-06 | User Story: US-0.2.7 -->

---

## Meta Information

| Field | Value |
|-------|-------|
| **Work Type** | FEATURE |
| **Product Slug** | sgs-cs-helper |
| **User Story ID** | US-0.2.7 |
| **Phase** | Phase 0 — Foundation |
| **Epic** | Epic 0.2 — Authentication System |
| **Branch** | feature/sgs-cs-helper-us-0.2.7 |
| **Status** | IN_PROGRESS |

---

## Problem Statement / Vấn đề cần giải quyết

### English

Admins and Super Admins need a way to create and manage staff users with unique login codes and individual permissions. Currently, there's no UI to create staff users, assign codes, or manage their permissions (canUpload, canUpdateStatus).

**Current Situation:**
- Staff users can be created manually in the database
- No UI for admins to manage staff
- No way to generate unique staff codes
- No way to view or edit staff permissions
- No way to activate/deactivate staff accounts

**Desired Outcome:**
- Admins can create staff users through a dedicated UI
- System auto-generates unique 6-character alphanumeric codes
- Admins can view all staff with their codes and permissions
- Admins can edit staff permissions and status
- Admins can regenerate staff codes when needed

### Tiếng Việt

Admin và Super Admin cần cách tạo và quản lý nhân viên với mã đăng nhập unique và quyền cá nhân. Hiện tại chưa có UI để tạo nhân viên, gán mã, hoặc quản lý quyền (canUpload, canUpdateStatus).

**Tình trạng hiện tại:**
- Nhân viên chỉ có thể tạo thủ công trong database
- Không có UI cho admin quản lý nhân viên
- Không có cách tự động tạo mã nhân viên unique
- Không có cách xem hoặc chỉnh sửa quyền nhân viên
- Không có cách kích hoạt/vô hiệu hóa tài khoản nhân viên

**Kết quả mong muốn:**
- Admin có thể tạo nhân viên qua UI chuyên dụng
- Hệ thống tự động tạo mã 6 ký tự alphanumeric unique
- Admin có thể xem tất cả nhân viên với mã và quyền
- Admin có thể chỉnh sửa quyền và trạng thái nhân viên
- Admin có thể tạo lại mã nhân viên khi cần

---

## Goals / Mục tiêu

### English

1. **Staff Creation UI:** Provide form to create new staff users
2. **Auto-Code Generation:** System generates unique 6-char codes automatically
3. **Permission Management:** Set canUpload and canUpdateStatus per user
4. **Staff List View:** Display all staff with their details
5. **Edit Capabilities:** Modify staff permissions and status
6. **Code Regeneration:** Allow code regeneration for security

### Tiếng Việt

1. **UI Tạo Nhân viên:** Cung cấp form tạo nhân viên mới
2. **Tự động Tạo Mã:** Hệ thống tự tạo mã 6 ký tự unique
3. **Quản lý Quyền:** Set canUpload và canUpdateStatus cho từng user
4. **Danh sách Nhân viên:** Hiển thị tất cả nhân viên với chi tiết
5. **Chỉnh sửa:** Sửa quyền và trạng thái nhân viên
6. **Tạo lại Mã:** Cho phép tạo lại mã để bảo mật

---

## Non-Goals / Không nằm trong phạm vi

### English

1. ❌ **Staff self-registration** — Only Admin/Super Admin can create staff
2. ❌ **Password management for staff** — Staff use code-only login
3. ❌ **Bulk staff import** — Only individual creation
4. ❌ **Permission history/audit trail** — No tracking of permission changes
5. ❌ **Email notifications** — No automated emails to staff
6. ❌ **Staff profile editing** — Staff cannot edit their own info

### Tiếng Việt

1. ❌ **Tự đăng ký nhân viên** — Chỉ Admin/Super Admin tạo được
2. ❌ **Quản lý mật khẩu** — Nhân viên chỉ dùng mã login
3. ❌ **Import hàng loạt** — Chỉ tạo từng cá nhân
4. ❌ **Lịch sử quyền** — Không theo dõi thay đổi quyền
5. ❌ **Email tự động** — Không gửi email cho nhân viên
6. ❌ **Chỉnh sửa profile** — Nhân viên không tự sửa thông tin

---

## Scope / Phạm vi

### In Scope / Trong phạm vi

**English:**
- Staff management page at `/admin/staff`
- Create Staff form with name, email (optional), permissions
- Auto-generate unique 6-character alphanumeric staff codes
- List all staff users with codes and permissions
- Edit staff permissions (canUpload, canUpdateStatus)
- Deactivate/reactivate staff (change status to PENDING/REVOKED/ACTIVE)
- Regenerate staff code functionality
- Both Admin and Super Admin access

**Tiếng Việt:**
- Trang quản lý nhân viên tại `/admin/staff`
- Form Tạo Nhân viên với tên, email (tùy chọn), quyền
- Tự động tạo mã nhân viên unique 6 ký tự alphanumeric
- Liệt kê tất cả nhân viên với mã và quyền
- Chỉnh sửa quyền nhân viên (canUpload, canUpdateStatus)
- Vô hiệu hóa/kích hoạt nhân viên (đổi status sang PENDING/REVOKED/ACTIVE)
- Chức năng tạo lại mã nhân viên
- Cả Admin và Super Admin đều truy cập được

### Out of Scope / Ngoài phạm vi

See Non-Goals section above.

---

## Acceptance Criteria / Tiêu chí Nghiệm thu

- [ ] **AC1:** Staff management page exists at `/admin/staff`
  - Both Admin and Super Admin can access
  - Staff users cannot access

- [ ] **AC2:** "Create Staff" form includes:
  - Name (required, text input)
  - Email (optional, email input)
  - canUpload checkbox (default: true)
  - canUpdateStatus checkbox (default: true)
  - Submit button

- [ ] **AC3:** Staff code is auto-generated:
  - 6 characters long
  - Alphanumeric (A-Z, 0-9)
  - Case-insensitive (stored uppercase)
  - Unique (enforced by database)

- [ ] **AC4:** Staff code uniqueness is enforced:
  - Database constraint prevents duplicates
  - Form shows error if duplicate (edge case)
  - Auto-retry generation if collision

- [ ] **AC5:** Permissions can be set:
  - canUpload: Allow upload Excel files
  - canUpdateStatus: Allow mark orders as done
  - Both default to true
  - Both are toggleable via checkboxes

- [ ] **AC6:** Staff list displays:
  - All staff users (role = STAFF)
  - Columns: Name, Email, Staff Code, canUpload, canUpdateStatus, Status
  - Sorted by creation date (newest first)

- [ ] **AC7:** Can edit staff permissions:
  - Edit button opens form
  - Can toggle canUpload and canUpdateStatus
  - Changes save immediately
  - Success confirmation shown

- [ ] **AC8:** Can deactivate/reactivate staff:
  - Status dropdown: ACTIVE, PENDING, REVOKED
  - ACTIVE: Can login
  - PENDING: Cannot login (waiting approval)
  - REVOKED: Cannot login (access removed)
  - Status change reflected immediately

- [ ] **AC9:** Can regenerate staff code:
  - "Regenerate Code" button per staff
  - Confirmation dialog shown
  - New unique code generated
  - Old code becomes invalid
  - New code displayed to admin

- [ ] **AC10:** Both Admin and Super Admin can manage staff:
  - Route protection allows ADMIN and SUPER_ADMIN roles
  - All features work for both roles
  - STAFF role denied access

---

## User Flows / Luồng Người dùng

### Flow 1: Create Staff User

**English:**
1. Admin navigates to `/admin/staff`
2. Clicks "Create Staff" button
3. Enters name (e.g., "John Doe")
4. Optionally enters email (e.g., "john@example.com")
5. Sets permissions (canUpload: true, canUpdateStatus: true)
6. Clicks "Create"
7. System generates unique 6-char code (e.g., "ABC123")
8. Success message shows: "Staff created. Code: ABC123"
9. Staff appears in list with code visible

**Tiếng Việt:**
1. Admin vào `/admin/staff`
2. Click "Tạo Nhân viên"
3. Nhập tên (vd: "Nguyễn Văn A")
4. Tùy chọn nhập email (vd: "nguyenvana@example.com")
5. Set quyền (canUpload: true, canUpdateStatus: true)
6. Click "Tạo"
7. Hệ thống tạo mã unique 6 ký tự (vd: "ABC123")
8. Thông báo thành công: "Đã tạo nhân viên. Mã: ABC123"
9. Nhân viên xuất hiện trong danh sách với mã hiển thị

### Flow 2: Edit Staff Permissions

**English:**
1. Admin views staff list
2. Clicks "Edit" on staff row
3. Edit form opens with current permissions
4. Toggles canUpload from true to false
5. Clicks "Save"
6. Permission updated in database
7. List refreshes with new permission state

**Tiếng Việt:**
1. Admin xem danh sách nhân viên
2. Click "Sửa" trên dòng nhân viên
3. Form sửa mở với quyền hiện tại
4. Đổi canUpload từ true sang false
5. Click "Lưu"
6. Quyền được cập nhật trong database
7. Danh sách refresh với trạng thái quyền mới

### Flow 3: Regenerate Staff Code

**English:**
1. Admin clicks "Regenerate Code" for a staff
2. Confirmation dialog: "This will invalidate the old code. Continue?"
3. Admin confirms
4. System generates new unique code
5. Old code marked invalid
6. New code displayed in success message
7. Admin shares new code with staff member

**Tiếng Việt:**
1. Admin click "Tạo lại Mã" cho nhân viên
2. Dialog xác nhận: "Mã cũ sẽ không còn dùng được. Tiếp tục?"
3. Admin xác nhận
4. Hệ thống tạo mã unique mới
5. Mã cũ bị vô hiệu
6. Mã mới hiển thị trong thông báo thành công
7. Admin chia sẻ mã mới cho nhân viên

---

## Affected Roots / Roots Ảnh hưởng

| Root | Impact | Changes |
|------|--------|---------|
| **sgs-cs-helper** | Primary | New route `/admin/staff`, UI components, Server Actions |

---

## Dependencies / Phụ thuộc

### Already Satisfied / Đã hoàn tất

- ✅ **US-0.2.2:** Super Admin Dashboard & Admin Invitation (DONE)
- ✅ **Database schema:** User model has staffCode @unique, canUpload, canUpdateStatus
- ✅ **Authentication:** NextAuth with role-based access
- ✅ **UI library:** shadcn/ui components available

### Required for This Work / Cần cho công việc này

- None (all dependencies satisfied)

---

## Technical Notes / Ghi chú Kỹ thuật

### Code Generation Algorithm
```typescript
// Generate 6-char alphanumeric code
function generateStaffCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Retry logic for uniqueness
async function generateUniqueStaffCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateStaffCode();
    const exists = await prisma.user.findUnique({ where: { staffCode: code } });
    if (!exists) return code;
    attempts++;
  }
  throw new Error('Failed to generate unique staff code');
}
```

### Route Protection
```typescript
// Middleware check
if (pathname.startsWith('/admin/staff')) {
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.redirect('/login');
  }
}
```

### Database Operations
- Create: `prisma.user.create({ data: { role: 'STAFF', staffCode, ... } })`
- Update: `prisma.user.update({ where: { id }, data: { canUpload, ... } })`
- List: `prisma.user.findMany({ where: { role: 'STAFF' } })`

---

## Risk Assessment / Đánh giá Rủi ro

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Code collision (duplicate) | Low | Medium | Retry logic + database unique constraint |
| Admin accidentally revokes staff mid-shift | Medium | Low | Confirmation dialog before status change |
| Code shared with wrong person | Medium | High | Code visible only at creation/regeneration |
| Mass regeneration causing confusion | Low | Medium | No bulk regenerate - one at a time only |

---

## Open Questions / Câu hỏi Mở

*None - all requirements clear from User Story*

---

**Created:** 2026-02-06  
**Last Updated:** 2026-02-06  
**Status:** Ready for Review
