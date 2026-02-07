# Flow Overview: US-1.1.2 Parse Excel and Extract Order Data
<!-- Phase 0 Diagram | Generated: 2026-02-07 -->

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[User selects file] --> B[File validation]
    B -->|Valid| C[Upload to server]
    C --> D[Server stores buffer]
    D --> E[Return success message]
    E --> F[End - No parsing]
    
    B -->|Invalid| G[Show error]
```

**EN:** Current flow uploads file to server but doesn't parse or extract data.
**VI:** Flow hiện tại upload file lên server nhưng không parse hay extract data.

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    A[User selects multiple Excel files] --> B{All files valid?}
    B -->|No| C[Show validation errors per file]
    C --> A
    
    B -->|Yes| D[Parse all files with xlsx.js<br/>Promise.all - parallel]
    D --> E[Collect ParseResult array]
    
    E --> F{Any parse errors?}
    F -->|Some failed| G[Show mixed results<br/>Success + Error per file]
    F -->|All success| H[Show all ParsedOrders]
    G --> H
    
    H --> I[Preview UI - List all orders]
    
    I --> J{User reviews each order}
    J -->|Edit needed| K[Edit individual order]
    K --> L[User updates fields]
    L --> J
    
    J -->|Remove failed| M[Remove from list]
    M --> J
    
    J -->|Confirm all| N[Submit JSON array to server]
    N --> O{Server validates each}
    
    O -->|Some invalid| P[Show per-order errors]
    P --> K
    
    O -->|All valid| Q[Batch create Orders in DB<br/>prisma.order.createMany]
    Q --> R[Show batch results<br/>X created, Y failed]
    R --> S[Reset form]
```

**EN:** New flow parses multiple files in parallel, shows list preview, allows individual editing, then submits JSON array for batch insert.
**VI:** Flow mới parse nhiều file song song, hiển thị preview dạng list, cho phép edit từng order, rồi submit JSON array để batch insert.

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới
- ✅ Client-side Excel parsing with xlsx.js
- ✅ Date serial to JavaScript Date conversion
- ✅ Preview UI for parsed data
- ✅ Editable form before submission
- ✅ JSON submission instead of file upload
- ✅ Server-side Zod validation
- ✅ Order creation in database

### Modified / Chỉnh sửa
- 🔄 `upload-form.tsx`: Add parser integration
- 🔄 Upload page: Add preview/edit steps

### Removed / Loại bỏ
- ❌ File upload to server (for this US)
- ❌ Server-side file handling

---

## Component Flow / Luồng Component

```mermaid
flowchart LR
    subgraph Browser
        A[upload-form.tsx] --> B[parser.ts<br/>parseExcelFiles]
        B --> C[date-utils.ts]
        B --> D[order-preview.tsx<br/>List view]
        D --> E[order-edit-form.tsx<br/>Per-order edit]
    end
    
    subgraph Server
        E -->|JSON Array| F[order.ts action<br/>createOrders]
        F --> G[Zod array validation]
        G --> H[Prisma createMany<br/>or transaction]
        H --> I[(PostgreSQL)]
    end
```

---

## Multi-File Data Structure / Cấu trúc Dữ liệu Nhiều File

```typescript
// Client sends array of orders
interface CreateOrderInput[] {
  jobNumber: string;
  registeredDate: string; // ISO string
  registeredBy?: string;
  receivedDate: string;   // Required
  checkedBy?: string;
  requiredDate: string;
  priority: number;
  note?: string;
  sourceFileName: string; // Track which file
}

// Server returns batch result
interface BatchCreateResult {
  success: boolean;
  created: Order[];
  failed: { order: CreateOrderInput; error: string }[];
}
```
