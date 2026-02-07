# Sequence: Admin Credentials Login

```mermaid
sequenceDiagram
    participant U as Admin User
    participant LF as LoginForm
    participant CP as CredentialsProvider
    participant DB as Database
    participant NA as NextAuth

    U->>LF: Enter email/password
    LF->>CP: Submit credentials
    CP->>DB: Find Admin by email
    CP->>DB: Verify password (bcrypt)
    DB-->>CP: User record
    CP-->>LF: Success/failure
    CP->>NA: Create session
    NA-->>U: Session active, redirect
```

## Notes / Ghi chú
- Step 1: Admin enters credentials
- Step 2: LoginForm submits to CredentialsProvider
- Step 3: Provider validates against database
- Step 4: Session created, user redirected
- Step 5: Errors handled with generic messages
