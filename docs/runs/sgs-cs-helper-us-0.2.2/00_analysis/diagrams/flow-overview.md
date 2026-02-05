# Flow Overview / Tổng quan Luồng
<!-- US-0.2.2: Super Admin Dashboard & Admin Invitation -->

---

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[Super Admin Login] --> B[Dashboard]
    B --> C[No Admin Management]
    
    D[Create Admin] --> E[Database Seed Only]
    E --> F[Requires Dev Access]
```

**Problem:** No UI for Super Admin to manage Admins.

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    subgraph Auth["Authentication"]
        A[Super Admin Login] --> B{Role Check}
        B -->|SUPER_ADMIN| C[Dashboard]
        B -->|Other| D[Access Denied]
    end
    
    subgraph AdminMgmt["Admin Management"]
        C --> E[Navigate to /admin/users]
        E --> F[Admin Dashboard]
        
        F --> G[View Admin List]
        F --> H[Invite Admin Form]
        
        H --> I{Auth Method?}
        I -->|Google OAuth| J[Enter Email Only]
        I -->|Email/Password| K[Enter Email + Password]
        
        J --> L[Create Admin]
        K --> L
        
        L --> M{Validation}
        M -->|Pass| N[Save to DB with PENDING status]
        M -->|Fail| O[Show Error]
        
        N --> P[Refresh Admin List]
        
        G --> Q[Click Revoke]
        Q --> R{Confirm?}
        R -->|Yes| S[Set status = REVOKED]
        R -->|No| G
        S --> P
    end
```

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới
- `/admin/users` page
- `InviteAdminForm` component
- `AdminList` component
- `inviteAdmin` Server Action
- `revokeAdmin` Server Action
- `getAdmins` Server Action
- Admin layout with role protection

### Modified / Chỉnh sửa
- `prisma/schema.prisma`: Add `AuthMethod`, `UserStatus` enums
- `User` model: Add `authMethod`, `status` fields

### Removed / Xóa bỏ
- None

---

## User Journey / Hành trình Người dùng

```mermaid
journey
    title Super Admin Invites New Admin
    section Login
      Navigate to /login: 5: Super Admin
      Enter credentials: 5: Super Admin
      Click Submit: 5: Super Admin
    section Dashboard
      View Dashboard: 5: Super Admin
      Navigate to Admin Users: 5: Super Admin
    section Invite
      Click Invite Admin: 5: Super Admin
      Fill email: 5: Super Admin
      Select auth method: 5: Super Admin
      Enter password (if needed): 3: Super Admin
      Click Invite: 5: Super Admin
      See success message: 5: Super Admin
      View updated list: 5: Super Admin
```

