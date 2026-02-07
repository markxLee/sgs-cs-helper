# Flow Overview / Tổng quan Luồng

## Current Flow / Luồng Hiện tại
```mermaid
flowchart TD
    A[Admin invited] --> B[No credentials login]
    B --> C[Cannot log in]
    C --> D[Blocked]
```

## Proposed Flow / Luồng Đề xuất
```mermaid
flowchart TD
    A[Admin invited] --> B[Password set by Super Admin]
    B --> C[Admin enters email/password]
    C --> D[CredentialsProvider validates]
    D -->|Valid| E[Session created, status ACTIVE]
    D -->|Invalid| F[Show error]
    E --> G[Redirect to dashboard]
    F --> H[Show error message]
```

## Changes Highlighted / Thay đổi Nổi bật
- Added: CredentialsProvider for Admin login
- Modified: LoginForm to support Admin credentials
- Removed: Blocked login for Admins without Google account
