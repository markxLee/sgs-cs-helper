# Flow Overview — US-0.3.2 Seed Initial Data
<!-- Generated: 2026-02-05 -->

## Seed Execution Flow / Luồng Thực thi Seed

```mermaid
flowchart TD
    A[Start: pnpm prisma db seed] --> B[Load Environment Variables]
    B --> C{Env Vars Valid?}
    C -->|No| D[Error: Missing env vars]
    D --> E[Exit 1]
    C -->|Yes| F[Hash Super Admin Password]
    F --> G[Connect to Database via Prisma]
    G --> H[Upsert Super Admin User]
    H --> I[Upsert Config: warning_threshold]
    I --> J[Upsert Config: staff_code]
    J --> K[Disconnect from Database]
    K --> L[Success: Seed Complete]
    L --> M[Exit 0]
```

## Component Interaction / Tương tác Component

```mermaid
flowchart LR
    subgraph ENV[Environment]
        E1[SUPER_ADMIN_EMAIL]
        E2[SUPER_ADMIN_PASSWORD]
        E3[STAFF_CODE]
    end
    
    subgraph SEED[prisma/seed.ts]
        S1[Load env vars]
        S2[Call hashPassword]
        S3[Upsert User]
        S4[Upsert Config]
    end
    
    subgraph LIB[src/lib/auth]
        L1[password.ts]
        L2[hashPassword function]
    end
    
    subgraph DB[PostgreSQL]
        D1[User table]
        D2[Config table]
    end
    
    E1 --> S1
    E2 --> S1
    E3 --> S1
    S1 --> S2
    S2 --> L2
    L2 --> S3
    S3 --> D1
    S4 --> D2
```

## Data Created / Dữ liệu Được Tạo

```mermaid
erDiagram
    User ||--o{ Order : "uploads"
    User {
        string id PK "cuid()"
        string email "SUPER_ADMIN_EMAIL"
        string name "Super Admin"
        Role role "SUPER_ADMIN"
        string passwordHash "bcrypt hash"
    }
    
    Config {
        string id PK "cuid()"
        string key UK "warning_threshold"
        string value "80"
    }
    
    Config {
        string id PK "cuid()"
        string key UK "staff_code"
        string value "STAFF_CODE env"
    }
```

## Idempotency Pattern / Pattern Idempotent

```mermaid
flowchart TD
    A[Upsert Request] --> B{Record Exists?}
    B -->|Yes| C[Update existing record]
    B -->|No| D[Create new record]
    C --> E[Return record]
    D --> E
    
    style B fill:#f9f,stroke:#333
    style C fill:#bbf,stroke:#333
    style D fill:#bfb,stroke:#333
```

## Notes / Ghi chú

1. **Upsert Pattern**: Uses Prisma's `upsert` with `where` clause on unique fields (email, key)
2. **Password Hashing**: bcrypt with cost factor 10 (default, ~100ms)
3. **Transaction**: Each upsert is atomic; no explicit transaction needed for seed
4. **Idempotent**: Running `pnpm prisma db seed` multiple times is safe
