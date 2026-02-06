# Sequence: Staff Code Login (REVISED - Per-User)

```mermaid
sequenceDiagram
    participant U as Staff User
    participant LF as Login Form
    participant NA as NextAuth
    participant SP as Staff Provider
    participant DB as Database (User)
    participant R as Router

    U->>LF: Select "Staff Quick Code"
    LF->>LF: Show code input field
    U->>LF: Enter personal code (e.g., "ABC123")
    U->>LF: Click "Sign In"
    LF->>NA: signIn("staff-code", { code: "ABC123" })
    NA->>SP: authorize({ code: "ABC123" })
    SP->>DB: SELECT * FROM User WHERE staffCode = 'ABC123'
    DB-->>SP: Return User record (or null)
    
    alt User not found or inactive
        SP-->>NA: Return null
        NA-->>LF: Error response
        LF->>U: Show "Invalid code" message
    else User found and ACTIVE
        SP->>SP: Build user object with permissions
        SP-->>NA: Return { id, name, role, canUpload, canUpdateStatus }
        NA->>NA: Create JWT with permissions
        NA-->>LF: Success response
        LF->>R: router.push("/dashboard")
        R->>U: Redirect to dashboard
    end
```

## Notes / Ghi chú

- **Per-User Code:** Each staff has unique code in User.staffCode
- **Individual Session:** Session tracks specific user, not anonymous
- **Permissions in JWT:** canUpload, canUpdateStatus included for access control
- **Status Check:** Only ACTIVE users can login (PENDING/REVOKED blocked)
- **Traceable:** All actions can be attributed to specific staff user
