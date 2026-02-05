# Flow Overview — US-0.1.1 Initialize Project Structure
<!-- Generated: 2026-02-05 -->

---

## Current State / Trạng thái Hiện tại

```mermaid
flowchart TD
    A[Empty Workspace] --> B[No Project]
    B --> C[Cannot Start Development]
    
    style A fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style B fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style C fill:#ff6b6b,stroke:#c92a2a,color:#fff
```

**EN:** Currently, the workspace has no Next.js project. Development cannot begin.

**VI:** Hiện tại, workspace không có dự án Next.js. Không thể bắt đầu phát triển.

---

## Proposed Flow / Luồng Đề xuất

```mermaid
flowchart TD
    subgraph Setup["Project Initialization"]
        A[Start] --> B[create-next-app]
        B --> C[Initialize shadcn/ui]
        C --> D[Add Prisma]
        D --> E[Create Folder Structure]
        E --> F[Configure Environment]
        F --> G[Verify Build]
    end
    
    subgraph Validation["Acceptance Criteria"]
        G --> H{Build Success?}
        H -->|Yes| I[✅ US-0.1.1 Complete]
        H -->|No| J[Fix Errors]
        J --> G
    end
    
    I --> K[Ready for US-0.1.2 / US-0.3.1]
    
    style A fill:#4dabf7,stroke:#1971c2
    style I fill:#51cf66,stroke:#2f9e44,color:#fff
    style K fill:#ffd43b,stroke:#f59f00
```

---

## Detailed Steps / Các bước Chi tiết

```mermaid
flowchart LR
    subgraph Step1["1. Scaffold"]
        A1[pnpm create next-app]
    end
    
    subgraph Step2["2. UI Library"]
        A2[shadcn-ui init]
        A2a[Add button, card, input, toast]
    end
    
    subgraph Step3["3. Database"]
        A3[pnpm add prisma]
        A3a[prisma init]
        A3b[Define schema]
    end
    
    subgraph Step4["4. Structure"]
        A4[Create src/lib/*]
        A4a[Create src/components/*]
        A4b[Create src/types/*]
    end
    
    subgraph Step5["5. Config"]
        A5[.env.example]
        A5a[Prisma client singleton]
    end
    
    subgraph Step6["6. Verify"]
        A6[pnpm build]
        A6a[Check for errors]
    end
    
    Step1 --> Step2 --> Step3 --> Step4 --> Step5 --> Step6
```

---

## Folder Structure Visualization / Cấu trúc Thư mục

```mermaid
flowchart TD
    subgraph Root["sgs-cs-order-tracker/"]
        direction TB
        SRC[src/]
        PRISMA[prisma/]
        PUBLIC[public/]
        CONFIG[Config Files]
    end
    
    subgraph SourceCode["src/"]
        APP[app/]
        COMP[components/]
        LIB[lib/]
        TYPES[types/]
        HOOKS[hooks/]
    end
    
    subgraph AppRouter["app/"]
        LAYOUT[layout.tsx]
        PAGE[page.tsx]
        AUTH["(auth)/"]
        DASH["(dashboard)/"]
        API[api/]
    end
    
    subgraph Library["lib/"]
        DB[db/]
        AUTHLIB[auth/]
        EXCEL[excel/]
        UTILS[utils/]
    end
    
    SRC --> APP
    SRC --> COMP
    SRC --> LIB
    SRC --> TYPES
    SRC --> HOOKS
    
    APP --> LAYOUT
    APP --> PAGE
    APP --> AUTH
    APP --> DASH
    APP --> API
    
    LIB --> DB
    LIB --> AUTHLIB
    LIB --> EXCEL
    LIB --> UTILS
    
    style SRC fill:#4dabf7,stroke:#1971c2
    style APP fill:#74c0fc,stroke:#339af0
    style LIB fill:#74c0fc,stroke:#339af0
```

---

## Dependencies Flow / Luồng Dependencies

```mermaid
flowchart LR
    subgraph Core["Core Dependencies"]
        NEXT[Next.js 16.0.10]
        REACT[React 19]
        TS[TypeScript 5]
    end
    
    subgraph UI["UI Layer"]
        TAILWIND[Tailwind CSS]
        SHADCN[shadcn/ui]
        LUCIDE[lucide-react]
    end
    
    subgraph Data["Data Layer"]
        PRISMA[Prisma ORM]
        PG[(PostgreSQL)]
    end
    
    subgraph Utils["Utilities"]
        ZOD[zod]
        DATEFNS[date-fns]
    end
    
    NEXT --> REACT
    NEXT --> TS
    TAILWIND --> SHADCN
    SHADCN --> LUCIDE
    PRISMA --> PG
    
    style NEXT fill:#000,stroke:#333,color:#fff
    style PRISMA fill:#2d3748,stroke:#1a202c,color:#fff
    style PG fill:#336791,stroke:#1a202c,color:#fff
```

---

## Changes Highlighted / Thay đổi Nổi bật

| Change Type | Details EN | Details VI |
|-------------|------------|------------|
| ➕ Added | Complete Next.js 16.0.10 project | Toàn bộ dự án Next.js 16.0.10 |
| ➕ Added | Prisma schema with models | Prisma schema với models |
| ➕ Added | shadcn/ui component library | Thư viện shadcn/ui |
| ➕ Added | Environment template | Template biến môi trường |
| ➕ Added | Folder structure per tech stack | Cấu trúc thư mục theo tech stack |

---

## Success Criteria / Tiêu chí Thành công

```mermaid
flowchart TD
    subgraph AC["Acceptance Criteria Checklist"]
        AC1[✅ Next.js 16.0.10 + App Router]
        AC2[✅ TypeScript strict mode]
        AC3[✅ Tailwind + shadcn/ui]
        AC4[✅ Prisma installed]
        AC5[✅ .env.example exists]
        AC6[✅ pnpm build succeeds]
        AC7[✅ Folder structure correct]
    end
    
    AC1 --> DONE[🎉 US-0.1.1 Complete]
    AC2 --> DONE
    AC3 --> DONE
    AC4 --> DONE
    AC5 --> DONE
    AC6 --> DONE
    AC7 --> DONE
    
    style DONE fill:#51cf66,stroke:#2f9e44,color:#fff
```
