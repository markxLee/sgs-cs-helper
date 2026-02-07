# Flow Overview / Tổng quan Luồng

## Current Flow / Luồng Hiện tại
```mermaid
flowchart TD
    A[Staff views orders] --> B[Order list displayed]
    B --> C[No way to mark as Done]
```

## Proposed Flow / Luồng Đề xuất
```mermaid
flowchart TD
    A[Staff views orders] --> B[Order list displayed]
    B --> C[Mark Done button]
    C --> D[Confirmation modal]
    D --> E[Server action: set COMPLETED]
    E --> F[SSE broadcast to clients]
    F --> G[Order moves to Completed]
    E --> H[Audit/log event]
```

## Changes Highlighted / Thay đổi Nổi bật
- Added: Mark Done button, confirmation modal, server action, SSE update, audit/log util
- Modified: OrderRow, API, SSE broadcaster
- Removed: N/A
