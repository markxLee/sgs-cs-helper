# Sequence Diagram: Upload Excel File
<!-- US-1.1.1 | Created: 2026-02-07 -->

## Main Upload Sequence / Luồng Tải lên Chính

```mermaid
sequenceDiagram
    actor User
    participant Page as upload/page.tsx<br/>(Server)
    participant Layout as upload/layout.tsx<br/>(Server)
    participant Form as UploadForm<br/>(Client)
    participant Action as uploadExcel<br/>(Server Action)
    participant Validate as validateExcelFile<br/>(Utility)
    participant Auth as auth()<br/>(NextAuth)

    Note over User,Auth: 1. Page Load with Auth Check
    User->>Page: Navigate to /orders/upload
    Page->>Layout: Render layout first
    Layout->>Auth: auth()
    Auth-->>Layout: Session { user, role, canUpload }
    
    alt Not Authenticated
        Layout-->>User: redirect("/login")
    else STAFF without canUpload
        Layout-->>User: redirect("/")
    else Authorized (ADMIN/SUPER_ADMIN or STAFF+canUpload)
        Layout->>Page: Render page
        Page->>Form: Render UploadForm
        Form-->>User: Display upload UI
    end

    Note over User,Auth: 2. File Selection
    User->>Form: Select file (.xlsx/.xls)
    Form->>Form: Validate extension (client-side)
    
    alt Invalid Extension
        Form-->>User: Show error message
    else Valid Extension
        Form-->>User: Display file name + size
    end

    Note over User,Auth: 3. Upload Process
    User->>Form: Click "Upload" button
    Form->>Form: setIsPending(true)
    Form-->>User: Show loading spinner
    Form->>Action: uploadExcel(formData)
    
    Action->>Auth: auth()
    Auth-->>Action: Session
    
    alt Not Authenticated
        Action-->>Form: { success: false, error: "Unauthorized" }
    else Check Permission
        Action->>Action: Check role + canUpload
        alt No Permission
            Action-->>Form: { success: false, error: "Access denied" }
        else Has Permission
            Action->>Action: Extract file from FormData
            Action->>Validate: validateExcelFile(file)
            
            alt Invalid File
                Validate-->>Action: { valid: false, error: "..." }
                Action-->>Form: { success: false, error: "..." }
            else Valid File
                Validate-->>Action: { valid: true }
                Action->>Action: Convert to Buffer
                Action-->>Form: { success: true, data: UploadResult }
            end
        end
    end

    Note over User,Auth: 4. Result Handling
    Form->>Form: setIsPending(false)
    
    alt Upload Failed
        Form-->>User: Show error message (red)
    else Upload Succeeded
        Form-->>User: Show success message (green)
        Form->>Form: Reset file input
    end
```

---

## Error Handling Sequence / Luồng Xử lý Lỗi

```mermaid
sequenceDiagram
    actor User
    participant Form as UploadForm
    participant Action as uploadExcel
    
    Note over User,Action: File Too Large (>10MB)
    User->>Form: Select large file
    Form->>Action: uploadExcel(formData)
    Action->>Action: Check file.size > 10MB
    Action-->>Form: { success: false, error: "File must be 10MB or less" }
    Form-->>User: Display error toast

    Note over User,Action: Invalid MIME Type
    User->>Form: Select .txt renamed to .xlsx
    Form->>Action: uploadExcel(formData)
    Action->>Action: Check MIME type
    Action-->>Form: { success: false, error: "Invalid file format" }
    Form-->>User: Display error toast

    Note over User,Action: Server Error
    User->>Form: Upload valid file
    Form->>Action: uploadExcel(formData)
    Action->>Action: Processing throws error
    Action-->>Form: { success: false, error: "Upload failed" }
    Form-->>User: Display error toast
```

---

## Notes / Ghi chú

### Authentication Flow
1. `layout.tsx` runs first on every request
2. Calls `auth()` to get session
3. Checks role and permissions before rendering page
4. This ensures page never loads for unauthorized users

### Permission Logic
```
SUPER_ADMIN → Always allowed (no permission check)
ADMIN → Always allowed (no permission check)  
STAFF → Check user.canUpload === true
```

### File Validation Layers
1. **Client-side (UX):** Check file extension before enabling upload
2. **Server-side (Security):** Check MIME type + extension + size

### UploadResult Interface
```typescript
interface UploadResult {
  fileName: string;   // Original file name
  fileSize: number;   // File size in bytes
  buffer: Buffer;     // File content for US-1.1.2 parser
}
```
