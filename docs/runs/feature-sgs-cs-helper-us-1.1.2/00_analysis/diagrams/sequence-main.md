# Sequence Diagram: Parse Excel and Create Order
<!-- Phase 0 Diagram | Generated: 2026-02-07 -->

## Main Flow / Luồng Chính

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UploadForm
    participant P as parser.ts
    participant DU as date-utils.ts
    participant PV as OrderPreview (List)
    participant EF as OrderEditForm
    participant SA as createOrders (Server)
    participant Z as Zod
    participant DB as Prisma/PostgreSQL
    
    U->>UI: Select multiple Excel files
    UI->>UI: Validate each file type/size
    
    alt Any invalid file
        UI-->>U: Show validation errors per file
    else All files valid
        UI->>P: parseExcelFiles(files[])
        
        par Parse in parallel
            P->>P: Parse file 1 with xlsx.js
            P->>DU: Convert dates
        and
            P->>P: Parse file 2 with xlsx.js
            P->>DU: Convert dates
        and
            P->>P: Parse file N with xlsx.js
            P->>DU: Convert dates
        end
        
        P-->>UI: Return ParseResult[] array
        
        UI->>PV: Display list of parsed orders
        PV-->>U: Show order list (success/error per file)
        
        loop For each order needing edit
            U->>EF: Click "Edit" on order
            EF-->>U: Show editable form
            U->>EF: Update fields
            EF->>PV: Update order in list
        end
        
        U->>UI: Click "Submit All"
        UI->>SA: POST JSON array of orders
        
        SA->>Z: Validate each order with schema
        
        alt Some validation fails
            Z-->>SA: Per-order validation errors
            SA-->>UI: Return partial errors
            UI-->>U: Highlight failed orders
        else All validation passes
            SA->>DB: prisma.order.createMany() or transaction
            DB-->>SA: Orders created
            SA-->>UI: Return BatchResult {created, failed}
            UI-->>U: Show "X created, Y failed"
            UI->>UI: Reset form
        end
    end
```

---

## Notes / Ghi chú

### Step Details / Chi tiết các Bước

| Step | Description EN | Description VI |
|------|----------------|----------------|
| 1 | User selects multiple Excel files | User chọn nhiều file Excel |
| 2 | Client-side file validation (type, size) per file | Validate file ở client (loại, kích thước) từng file |
| 3 | xlsx.js parses all files in parallel | xlsx.js parse tất cả file song song |
| 4 | Extract jobNumber from Row 0 or Row 1 each file | Extract jobNumber từ Row 0/1 mỗi file |
| 5 | Convert Excel date serials to JS Dates | Chuyển Excel date serial sang JS Date |
| 6 | Extract all Row 2 fields per file | Extract tất cả field Row 2 mỗi file |
| 7 | Extract note from Row 3 per file | Extract note từ Row 3 mỗi file |
| 8 | Display list preview with status per file | Hiển thị preview list với status từng file |
| 9 | User optionally edits individual orders | User chỉnh sửa từng order nếu cần |
| 10 | Submit JSON array to server action | Submit JSON array lên server action |
| 11 | Server validates each order with Zod | Server validate từng order với Zod |
| 12 | Batch create Orders in database | Batch tạo Orders trong database |
| 13 | Return batch result (created/failed) | Trả kết quả batch (thành công/thất bại) |

---

## Error Scenarios / Các Trường hợp Lỗi

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI
    participant SA as Server
    participant DB as Database
    
    Note over U,DB: Scenario 1: Some files have duplicate jobNumber
    U->>SA: Submit array with duplicates
    SA->>DB: Attempt createMany
    DB-->>SA: Partial failure - duplicates rejected
    SA-->>UI: BatchResult {created: 3, failed: 2}
    UI-->>U: Show "3 created, 2 failed (duplicate)"
    
    Note over U,DB: Scenario 2: Mixed parse results
    U->>UI: Select 5 files
    UI->>UI: Parse all files
    UI-->>U: Show list: 4 success, 1 parse error
    U->>UI: Remove failed, submit 4
    UI->>SA: Submit array of 4
    SA-->>UI: All 4 created
    
    Note over U,DB: Scenario 3: Some orders missing receivedDate
    U->>UI: Submit without receivedDate on some
    UI->>UI: Client-side validation
    UI-->>U: Highlight orders missing receivedDate
    U->>UI: Fix and resubmit
```
