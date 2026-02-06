# Flow Overview / Tổng quan Luồng (REVISED)

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[User visits /login] --> B[Login Form]
    B --> C[Enter email/password]
    C --> D[Submit credentials]
    D --> E[Validate Super Admin]
    E --> F[Success: Dashboard]
    E --> G[Error: Invalid credentials]
```

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    A[User visits /login] --> B[Login Form]
    B --> H{Login Type?}
    H -->|Admin/Super Admin| C[Enter email/password]
    H -->|Staff Quick Code| I[Enter personal code]
    C --> D[Submit credentials]
    I --> J[Submit code]
    D --> E[Validate Admin/Super Admin]
    J --> K[Find User by staffCode]
    K --> L{User found & ACTIVE?}
    L -->|Yes| M[Create session with permissions]
    L -->|No| N[Error: Invalid code]
    E --> F[Success: Dashboard]
    M --> F
    E --> G[Error: Invalid credentials]
```

## Staff Code Authentication Detail / Chi tiết Xác thực Mã Nhân viên

```mermaid
flowchart TD
    A[Staff enters code] --> B[Query User by staffCode]
    B --> C{User exists?}
    C -->|No| D[Return null - Invalid code]
    C -->|Yes| E{Status = ACTIVE?}
    E -->|No| F[Return null - Account inactive]
    E -->|Yes| G[Build session object]
    G --> H[Include: id, name, role, canUpload, canUpdateStatus]
    H --> I[Return user to NextAuth]
    I --> J[JWT created with permissions]
    J --> K[Redirect to dashboard]
```

## Changes Highlighted / Thay đổi Nổi bật

- **Added:** Login type selection (Admin vs Staff Quick Code)
- **Added:** Per-user staff code authentication
- **Added:** Permission fields in session (canUpload, canUpdateStatus)
- **Modified:** Login form to support both authentication methods
- **Schema:** staffCode now unique per user, new permission fields
