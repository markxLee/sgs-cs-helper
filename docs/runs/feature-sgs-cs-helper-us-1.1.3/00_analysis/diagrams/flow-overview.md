# Flow Overview / Tổng quan Luồng
<!-- US-1.1.3 | Created: 2026-02-09 -->

---

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A["User uploads Excel files"] --> B["Parse & Validate (Zod)"]
    B --> C["Loop: each order"]
    C --> D{"findUnique\n(jobNumber)"}
    D -->|"Found"| E["Push to failed[]\n'Duplicate job number'"]
    D -->|"Not Found"| F["prisma.order.create()"]
    F --> G["Push to created[]"]
    E --> H{More orders?}
    G --> H
    H -->|Yes| C
    H -->|No| I["broadcastBulkUpdate\n(created only)"]
    I --> J["Return\n{created, failed}"]
```

### Issues / Vấn đề
- 🔴 Duplicates treated as failures — confuses users
- 🔴 No way to update existing orders via upload
- 🔴 No distinction between "duplicate/skip" and "real error"
- 🔴 No transaction — partial failures leave inconsistent state

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    A["User uploads Excel files"] --> B["Parse & Validate (Zod)"]
    B --> C["prisma.$transaction()"]
    C --> D["Loop: each order"]
    D --> E{"findFirst\n(jobNumber,\nmode: insensitive)"}
    
    E -->|"Not Found"| F["prisma.order.create()"]
    F --> G["Push to created[]"]
    
    E -->|"Found"| H{"hasOrderChanged()\nCompare 7 fields"}
    H -->|"Changed"| I["prisma.order.update()\nPreserve: status,\ncompletedAt"]
    I --> J["Push to updated[]"]
    H -->|"Unchanged"| K["Push to unchanged[]"]
    
    G --> L{More orders?}
    J --> L
    K --> L
    L -->|Yes| D
    L -->|No| M["Commit transaction"]
    M --> N["broadcastBulkUpdate\n(created + updated)"]
    N --> O["Return\n{created, updated,\nunchanged, failed}"]

    style F fill:#d4edda,stroke:#28a745
    style I fill:#cce5ff,stroke:#0d6efd
    style K fill:#e2e3e5,stroke:#6c757d
```

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới
- 🟢 `hasOrderChanged()` — field comparison helper (7 fields)
- 🟢 `updated[]` array in result — orders with changed data
- 🟢 `unchanged[]` array in result — orders with identical data
- 🟢 `prisma.$transaction()` wrapper — batch integrity
- 🟢 Case-insensitive matching via `findFirst` + `mode: "insensitive"`
- 🟢 Blue (updated) and gray (unchanged) result cards in UI

### Modified / Thay đổi
- 🔵 `createOrders()` — complete logic refactor (skip-duplicate → upsert)
- 🔵 `BatchCreateResult` type — add `updated`, `unchanged` fields
- 🔵 `SubmitResult` in upload-form — add updated/unchanged counts + arrays
- 🔵 Results UI — from 2 categories to 4 categories
- 🔵 SSE broadcast — include both created + updated orders

### Removed / Loại bỏ
- 🔴 "Duplicate job number" error message for existing orders (replaced by update/unchanged)

---

## Sequence Diagram / Sơ đồ Trình tự

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as upload-form.tsx
    participant A as createOrders()
    participant TX as $transaction
    participant DB as PostgreSQL
    participant SSE as SSE Broadcaster

    U->>F: Upload Excel files
    F->>F: Parse → CreateOrderInput[]
    F->>A: createOrders(inputs)
    A->>A: requireUploadPermission()
    A->>A: Zod validate
    A->>TX: prisma.$transaction(async tx => ...)

    loop Each order in batch
        TX->>DB: findFirst(jobNumber, mode: insensitive)
        alt Not found
            TX->>DB: tx.order.create(data)
            TX-->>TX: created.push(order)
        else Found + data changed
            TX->>TX: hasOrderChanged(existing, input)
            TX->>DB: tx.order.update(data, preserve status)
            TX-->>TX: updated.push(order)
        else Found + data same
            TX->>TX: hasOrderChanged(existing, input) = false
            TX-->>TX: unchanged.push({id, jobNumber})
        end
    end

    TX-->>A: Transaction committed
    A->>SSE: broadcastBulkUpdate(created + updated)
    A-->>F: BatchCreateResult
    F-->>U: Display 4-category results
```

---

## Field Comparison Detail / Chi tiết So sánh Fields

```mermaid
flowchart LR
    subgraph "hasOrderChanged(existing, input)"
        A["registeredDate\n.getTime()"] --> Z{Any\ndiff?}
        B["receivedDate\n.getTime()"] --> Z
        C["requiredDate\n.getTime()"] --> Z
        D["priority\n==="] --> Z
        E["registeredBy\n?? null ==="] --> Z
        F["checkedBy\n?? null ==="] --> Z
        G["note\n?? null ==="] --> Z
    end
    Z -->|"Yes"| Y["Return true\n→ UPDATE"]
    Z -->|"No"| X["Return false\n→ UNCHANGED"]

    style Y fill:#cce5ff,stroke:#0d6efd
    style X fill:#e2e3e5,stroke:#6c757d
```

---

## Notes / Ghi chú

🇻🇳
- Transaction timeout mặc định Prisma: 5s — đủ cho batch < 100 orders
- `sourceFileName` và `uploadedById` luôn cập nhật khi re-upload (kể cả unchanged detection dùng cho so sánh data)
- Unchanged orders **không** trigger SSE broadcast

🇬🇧
- Default Prisma transaction timeout: 5s — sufficient for batch < 100 orders
- `sourceFileName` and `uploadedById` always updated on re-upload (even though unchanged detection compares data fields only)
- Unchanged orders do **not** trigger SSE broadcast
