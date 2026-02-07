# Flow Overview — Orders List + Progress Bar
<!-- US-1.2.1 | 2026-02-07 -->

## Current Flow / Luồng Hiện tại

```mermaid
flowchart TD
    A[User] --> B{Logged in?}
    B -->|Yes| C[Dashboard Page]
    B -->|No| D[Login Page]
    C --> E[Quick Actions Only]
    E --> F[No Order List View]
    
    style F fill:#ff6b6b,color:#fff
```

**Issue / Vấn đề:**
- 🇻🇳 Không có cách nào xem danh sách orders đã upload
- 🇬🇧 No way to view uploaded orders list

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    A[User] --> B{Which page?}
    
    B -->|/orders| C[Orders Page - PUBLIC]
    B -->|/dashboard| D{Logged in?}
    
    C --> E[Fetch Orders from DB]
    E --> F[Calculate Progress for Each]
    F --> G[Render Table with Progress Bars]
    
    D -->|No| H[Login Page]
    D -->|Yes| I[Dashboard with Actions]
    
    subgraph Public["No Auth Required"]
        C
        E
        F
        G
    end
    
    subgraph Protected["Auth Required"]
        D
        H
        I
    end
    
    style C fill:#4ade80,color:#000
    style G fill:#4ade80,color:#000
```

---

## Progress Calculation Flow / Luồng Tính Progress

```mermaid
flowchart TD
    A[Start: Order Data] --> B[Get receivedDate]
    B --> C[Get priority]
    C --> D[Get current time]
    
    D --> E{Priority level?}
    E -->|0| F[duration = 0.25h]
    E -->|1| G[duration = 1h]
    E -->|2| H[duration = 2.5h]
    E -->|3+| I[duration = 3h]
    
    F --> J[Calculate elapsed time]
    G --> J
    H --> J
    I --> J
    
    J --> K{receivedDate < 12:00?}
    K -->|Yes| L{now > 13:00?}
    K -->|No| M[lunchDeduction = 0]
    L -->|Yes| N[lunchDeduction = 1h]
    L -->|No| M
    
    M --> O[elapsedHours = now - receivedDate]
    N --> P[elapsedHours = now - receivedDate - 1h]
    
    O --> Q[percentage = elapsed / duration * 100]
    P --> Q
    
    Q --> R{Percentage range?}
    R -->|0-40%| S[⬜ White]
    R -->|41-65%| T[🟢 Green]
    R -->|66-80%| U[🟡 Yellow]
    R -->|>80%| V[🔴 Red]
    
    S --> W[Render Progress Bar]
    T --> W
    U --> W
    V --> W
```

---

## Changes Highlighted / Thay đổi Nổi bật

### Added / Thêm mới:
- `/orders` public route (no auth)
- `OrdersTable` component
- `OrderProgressBar` component
- `calculateOrderProgress()` utility
- `getPriorityDuration()` helper
- `getLunchBreakDeduction()` helper

### Modified / Chỉnh sửa:
- `src/lib/actions/order.ts` - Add `getOrders()` function

### Unchanged / Giữ nguyên:
- Dashboard page (auth required)
- Order model
- Existing upload flow
