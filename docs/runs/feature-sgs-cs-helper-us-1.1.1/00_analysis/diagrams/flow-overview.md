# Flow Overview: Upload Excel Files
<!-- US-1.1.1 | Created: 2026-02-07 -->

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[User wants to upload orders] --> B[❌ No upload page exists]
    B --> C[Cannot proceed]
    
    style B fill:#ffcccc
    style C fill:#ffcccc
```

**Current State:** No upload mechanism exists in the application.

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    A[User navigates to /orders/upload] --> B{Authenticated?}
    B -->|No| C[Redirect to /login]
    B -->|Yes| D{Has permission?}
    
    D -->|ADMIN/SUPER_ADMIN| E[✅ Show Upload Page]
    D -->|STAFF + canUpload=true| E
    D -->|STAFF + canUpload=false| F[Redirect to / - Access Denied]
    
    E --> G[User selects file]
    G --> H{Valid extension?}
    H -->|No| I[Show error: Invalid file type]
    H -->|Yes .xlsx/.xls| J[Display file info]
    
    J --> K[User clicks Upload]
    K --> L[Show loading spinner]
    L --> M[Server Action: uploadExcel]
    
    M --> N{Server validation?}
    N -->|Invalid MIME/Size| O[Return error]
    N -->|Valid| P[Prepare UploadResult]
    
    O --> Q[Show error toast]
    P --> R[Show success toast]
    
    R --> S[Ready for next file]
    Q --> G
    I --> G
    
    style E fill:#ccffcc
    style R fill:#ccffcc
    style O fill:#ffcccc
    style I fill:#ffcccc
    style F fill:#ffcccc
```

---

## Auth Flow Detail / Chi tiết Luồng Auth

```mermaid
flowchart LR
    subgraph Layout ["layout.tsx (Server)"]
        A[auth()] --> B{session?}
        B -->|No| C[redirect /login]
        B -->|Yes| D{Check role}
        D -->|SUPER_ADMIN| E[✅ Allow]
        D -->|ADMIN| E
        D -->|STAFF| F{canUpload?}
        F -->|true| E
        F -->|false| G[redirect /]
    end
    
    E --> H[Render children]
```

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới
- ✅ `/orders/upload` route with auth protection
- ✅ `UploadForm` client component
- ✅ `uploadExcel` server action
- ✅ File validation utilities
- ✅ Permission check: ADMIN/SUPER_ADMIN full access, STAFF needs canUpload

### Modified / Thay đổi
- None (new feature)

### Removed / Xóa
- None

---

## File Structure / Cấu trúc File

```
src/
├── app/
│   └── (orders)/
│       └── upload/
│           ├── layout.tsx      ← NEW: Auth protection
│           └── page.tsx        ← NEW: Upload page
├── components/
│   └── orders/
│       └── upload-form.tsx     ← NEW: Upload form component
└── lib/
    ├── actions/
    │   └── upload.ts           ← NEW: Server action
    └── upload/
        └── validation.ts       ← NEW: File validation
```
