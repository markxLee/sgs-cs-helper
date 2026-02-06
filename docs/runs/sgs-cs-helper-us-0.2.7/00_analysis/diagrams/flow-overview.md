# Flow Overview — Staff User Management

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[Admin wants to create staff] --> B[Manual database INSERT]
    B --> C[Generate random code manually]
    C --> D[Check uniqueness manually]
    D --> E[Staff can login]
    
    style B fill:#ffcccc
    style C fill:#ffcccc
    style D fill:#ffcccc
```

**Problems with current flow:**
- ❌ No UI - must use database directly
- ❌ Manual code generation - error prone
- ❌ No permission management UI
- ❌ Can't view staff list easily

---

## Proposed Flow / Luồng Đề xuất

### Create Staff Flow

```mermaid
flowchart TD
    Start[Admin navigates to /admin/staff] --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to /login]
    CheckAuth -->|Yes| CheckRole{Role?}
    
    CheckRole -->|STAFF| Deny[Redirect to dashboard]
    CheckRole -->|ADMIN or SUPER_ADMIN| Allow[Show Staff Management Page]
    
    Allow --> Form[Fill Create Staff Form]
    Form --> Submit[Submit Form]
    Submit --> Validate[Server Action: Validate Input]
    Validate -->|Invalid| FormError[Show validation errors]
    FormError --> Form
    
    Validate -->|Valid| GenCode[Generate Unique Code]
    GenCode --> CheckUnique{Code Unique?}
    CheckUnique -->|No - Retry < 10| GenCode
    CheckUnique -->|No - Max Retries| Error[Show Error: Try Again]
    CheckUnique -->|Yes| CreateDB[Create User in Database]
    
    CreateDB --> Revalidate[revalidatePath /admin/staff]
    Revalidate --> Success[Show Success + Code]
    Success --> Display[Staff appears in list]
    
    style Start fill:#e1f5fe
    style Allow fill:#c8e6c9
    style GenCode fill:#fff9c4
    style CreateDB fill:#f8bbd0
    style Success fill:#c8e6c9
```

### Edit Permissions Flow

```mermaid
flowchart TD
    Start[Staff List Loaded] --> Click[Admin clicks Edit]
    Click --> Dialog[Edit Dialog Opens]
    Dialog --> Toggle[Toggle canUpload / canUpdateStatus]
    Toggle --> Save[Click Save]
    Save --> Action[Server Action: updateStaffPermissions]
    Action --> Auth{Authorized?}
    Auth -->|No| Error[Show Error]
    Auth -->|Yes| Update[Update Database]
    Update --> Revalidate[revalidatePath]
    Revalidate --> Success[Show Success]
    Success --> Refresh[List Refreshes]
    
    style Start fill:#e1f5fe
    style Dialog fill:#fff9c4
    style Update fill:#f8bbd0
    style Success fill:#c8e6c9
```

### Regenerate Code Flow

```mermaid
flowchart TD
    Start[Staff List] --> Click[Click Regenerate Code]
    Click --> Confirm{Confirm Dialog}
    Confirm -->|Cancel| Cancel[Close Dialog]
    Confirm -->|Confirm| Action[Server Action: regenerateStaffCode]
    Action --> Auth{Authorized?}
    Auth -->|No| Error[Show Error]
    Auth -->|Yes| GenNew[Generate New Unique Code]
    GenNew --> CheckUnique{Code Unique?}
    CheckUnique -->|No| GenNew
    CheckUnique -->|Yes| UpdateDB[Update staffCode in DB]
    UpdateDB --> OldInvalid[Old Code Invalidated]
    OldInvalid --> Revalidate[revalidatePath]
    Revalidate --> Success[Show New Code to Admin]
    Success --> AdminShare[Admin shares new code with staff]
    
    style Start fill:#e1f5fe
    style Confirm fill:#fff9c4
    style UpdateDB fill:#f8bbd0
    style Success fill:#c8e6c9
    style OldInvalid fill:#ffccbc
```

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới
- ✅ `/admin/staff` route với UI đầy đủ
- ✅ Auto code generation với uniqueness check
- ✅ Permission management UI (canUpload, canUpdateStatus)
- ✅ Staff list with all details
- ✅ Edit và Regenerate Code workflows
- ✅ Server Actions với auth/validation
- ✅ Extended Admin Layout cho ADMIN role

### Modified / Sửa đổi
- ⚠️ Admin Layout: Now allows ADMIN + SUPER_ADMIN (was SUPER_ADMIN only)

### Removed / Loại bỏ
- None

---

**Key Improvements:**
1. **Self-service UI** — No more manual database edits
2. **Automatic code generation** — No human error
3. **Built-in uniqueness** — Retry logic handles collisions
4. **Permission management** — Toggle permissions easily
5. **Security** — Codes only visible at creation/regeneration
