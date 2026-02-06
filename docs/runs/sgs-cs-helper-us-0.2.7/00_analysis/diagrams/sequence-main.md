# Sequence Diagram — Staff User Management

## Create Staff Sequence

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Browser as Browser
    participant Page as StaffPage (Server)
    participant Form as CreateStaffForm (Client)
    participant Action as createStaff() Server Action
    participant CodeGen as generateUniqueStaffCode()
    participant DB as PostgreSQL
    
    Admin->>Browser: Navigate to /admin/staff
    Browser->>Page: GET /admin/staff
    Page->>Page: await auth() - check session
    Page->>Page: Check role: ADMIN or SUPER_ADMIN
    Page-->>Browser: Render page with Form + List
    
    Admin->>Form: Fill name, email, permissions
    Admin->>Form: Click "Create Staff"
    Form->>Action: createStaff(input)
    
    Action->>Action: await auth()
    Action->>Action: Check role: ADMIN or SUPER_ADMIN
    Action->>Action: Zod validate input
    
    Action->>DB: findUnique({ where: { email }})
    DB-->>Action: existingUser or null
    
    alt Email already exists
        Action-->>Form: { success: false, error }
        Form-->>Admin: Show error message
    else Email available
        Action->>CodeGen: generateUniqueStaffCode(prisma)
        
        loop Retry up to 10 times
            CodeGen->>CodeGen: generateStaffCode() random
            CodeGen->>DB: findUnique({ where: { staffCode }})
            DB-->>CodeGen: exists: true/false
            
            alt Code exists
                CodeGen->>CodeGen: Retry with new code
            else Code unique
                CodeGen-->>Action: Return unique code
            end
        end
        
        Action->>DB: create({ role: STAFF, staffCode, ... })
        DB-->>Action: Created user
        
        Action->>Action: revalidatePath("/admin/staff")
        Action-->>Form: { success: true, code: "ABC123" }
        Form-->>Admin: Success: "Staff created. Code: ABC123"
        Form->>Browser: Auto-refresh (revalidation)
        Browser-->>Admin: Updated staff list with new staff
    end
```

## Edit Permissions Sequence

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant List as StaffList (Client)
    participant Dialog as EditStaffDialog (Client)
    participant Action as updateStaffPermissions()
    participant DB as PostgreSQL
    
    Admin->>List: Click "Edit" on staff row
    List->>Dialog: Open with current permissions
    Dialog-->>Admin: Show checkboxes
    
    Admin->>Dialog: Toggle canUpload: true → false
    Admin->>Dialog: Click "Save"
    Dialog->>Action: updateStaffPermissions({ userId, canUpload: false, ... })
    
    Action->>Action: await auth()
    Action->>Action: Check role: ADMIN or SUPER_ADMIN
    Action->>Action: Zod validate
    
    Action->>DB: findUnique({ where: { id: userId }})
    DB-->>Action: user or null
    
    alt User not found
        Action-->>Dialog: { success: false, error }
        Dialog-->>Admin: Show error
    else User found
        Action->>DB: update({ where: { id }, data: { canUpload: false }})
        DB-->>Action: Updated user
        
        Action->>Action: revalidatePath("/admin/staff")
        Action-->>Dialog: { success: true }
        Dialog-->>Admin: Success message
        Dialog->>List: Auto-refresh
        List-->>Admin: Updated permissions displayed
    end
```

## Regenerate Code Sequence

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant List as StaffList (Client)
    participant Confirm as ConfirmDialog (Client)
    participant Action as regenerateStaffCode()
    participant CodeGen as generateUniqueStaffCode()
    participant DB as PostgreSQL
    participant Staff as Staff Member
    
    Admin->>List: Click "Regenerate Code"
    List->>Confirm: Show "This will invalidate old code"
    Confirm-->>Admin: Confirmation dialog
    
    alt Admin cancels
        Admin->>Confirm: Click "Cancel"
        Confirm-->>List: Close dialog
    else Admin confirms
        Admin->>Confirm: Click "Confirm"
        Confirm->>Action: regenerateStaffCode(userId)
        
        Action->>Action: await auth()
        Action->>Action: Check role: ADMIN or SUPER_ADMIN
        
        Action->>CodeGen: generateUniqueStaffCode(prisma)
        
        loop Retry up to 10 times
            CodeGen->>CodeGen: generateStaffCode()
            CodeGen->>DB: findUnique({ where: { staffCode }})
            DB-->>CodeGen: exists: true/false
            alt Code unique
                CodeGen-->>Action: newCode
            end
        end
        
        Action->>DB: update({ where: { id: userId }, data: { staffCode: newCode }})
        DB-->>Action: Updated user
        Note over DB: Old code no longer valid
        
        Action->>Action: revalidatePath("/admin/staff")
        Action-->>Confirm: { success: true, code: "XYZ789" }
        Confirm-->>Admin: "New code: XYZ789"
        Confirm->>List: Auto-refresh
        
        Admin->>Staff: Share new code (out of system)
        Staff->>Staff: Can now login with XYZ789
    end
```

---

## Notes / Ghi chú

### Authentication Pattern
All Server Actions follow this pattern:
1. `await auth()` — Get session
2. Check `session?.user?.role`
3. Allow if ADMIN or SUPER_ADMIN
4. Reject if STAFF or unauthenticated

### Code Generation Pattern
1. Generate random 6-char alphanumeric
2. Check database for uniqueness
3. If collision, retry (max 10 attempts)
4. If 10 failures, return error
5. Success probability: >99.9999%

### Revalidation Pattern
All mutations end with:
```typescript
revalidatePath("/admin/staff")
```
This triggers Next.js to:
- Invalidate cache
- Re-fetch data
- Re-render components
- Display updated state

### Error Handling
All Server Actions return:
```typescript
{ success: true, data?: T } | { success: false, error: string }
```
Client components check `success` and display:
- Success: Show confirmation
- Failure: Show error message
