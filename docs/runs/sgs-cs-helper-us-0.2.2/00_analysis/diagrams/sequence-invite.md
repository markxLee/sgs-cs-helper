# Sequence: Invite Admin
<!-- US-0.2.2: Super Admin Dashboard & Admin Invitation -->

---

## Invite Admin with Email/Password

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant Form as InviteAdminForm
    participant Action as inviteAdmin
    participant Prisma as Prisma Client
    participant DB as PostgreSQL
    
    SA->>Form: Fill email, select "Email/Password"
    Form->>Form: Show password field
    SA->>Form: Enter password (min 8 chars)
    SA->>Form: Click "Invite"
    
    Form->>Form: Validate with Zod
    alt Validation fails
        Form-->>SA: Show error message
    else Validation passes
        Form->>Action: Call inviteAdmin(email, CREDENTIALS, password)
        
        Action->>Prisma: Check existing email
        Prisma->>DB: SELECT * FROM User WHERE email = ?
        DB-->>Prisma: Result
        
        alt Email exists
            Prisma-->>Action: User found
            Action-->>Form: Error: "Email already exists"
            Form-->>SA: Show error
        else Email available
            Action->>Action: hashPassword(password)
            Action->>Prisma: Create user
            Prisma->>DB: INSERT INTO User (email, role, authMethod, status, passwordHash)
            DB-->>Prisma: Created user
            Prisma-->>Action: User object
            Action->>Action: revalidatePath("/admin/users")
            Action-->>Form: Success
            Form-->>SA: Show success toast
            Form->>Form: Reset form
        end
    end
```

---

## Invite Admin with Google OAuth

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant Form as InviteAdminForm
    participant Action as inviteAdmin
    participant Prisma as Prisma Client
    participant DB as PostgreSQL
    
    SA->>Form: Fill email, select "Google OAuth"
    Form->>Form: Hide password field
    SA->>Form: Click "Invite"
    
    Form->>Form: Validate email only
    Form->>Action: Call inviteAdmin(email, GOOGLE, null)
    
    Action->>Prisma: Check existing email
    Prisma->>DB: SELECT * FROM User WHERE email = ?
    DB-->>Prisma: Result
    
    alt Email exists
        Action-->>Form: Error: "Email already exists"
        Form-->>SA: Show error
    else Email available
        Action->>Prisma: Create user (no password)
        Prisma->>DB: INSERT INTO User (email, role, authMethod, status)
        DB-->>Prisma: Created user
        Action-->>Form: Success
        Form-->>SA: Show success toast
    end
```

---

## Revoke Admin

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant List as AdminList
    participant Dialog as ConfirmDialog
    participant Action as revokeAdmin
    participant Prisma as Prisma Client
    participant DB as PostgreSQL
    
    SA->>List: Click "Revoke" on Admin row
    List->>Dialog: Open confirmation
    
    alt User cancels
        SA->>Dialog: Click "Cancel"
        Dialog-->>List: Close
    else User confirms
        SA->>Dialog: Click "Confirm"
        Dialog->>Action: Call revokeAdmin(userId)
        
        Action->>Action: Check if userId === currentUser.id
        alt Self-revoke attempt
            Action-->>List: Error: "Cannot revoke yourself"
            List-->>SA: Show error
        else Valid revoke
            Action->>Prisma: Update user status
            Prisma->>DB: UPDATE User SET status = 'REVOKED' WHERE id = ?
            DB-->>Prisma: Updated
            Action->>Action: revalidatePath("/admin/users")
            Action-->>List: Success
            List-->>SA: Remove row from list (optimistic)
        end
    end
```

---

## Notes / Ghi chú

1. **Password hashing**: Uses bcrypt with 10 rounds (same as Super Admin)
2. **Validation**: Zod schema validates email format and password length
3. **Optimistic updates**: List updates immediately, reverts on error
4. **Revalidation**: `revalidatePath` ensures fresh data on next visit
5. **Self-protection**: Backend prevents Super Admin from revoking themselves

