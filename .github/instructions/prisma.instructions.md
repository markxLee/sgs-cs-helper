---
applyTo: '**/prisma/**,**/*.prisma,**/generated/prisma/**'
---
# Prisma Instructions - SGS CS Helper
# Generated: 2026-02-07
# Based on: Prisma 7.3.0, PostgreSQL, Custom output path

---

## ⚠️ CRITICAL: Import Patterns (ĐỌC KỸ TRƯỚC KHI CODE)

### Prisma Client Location

Project này sử dụng **custom output path** cho Prisma Client:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"  // ← Custom path
}
```

### ✅ Correct Imports (SỬ DỤNG CÁC CÁCH NÀY)

```typescript
// 1. Import PrismaClient for type declarations
import type { PrismaClient } from "@/generated/prisma/client";

// 2. Import enums (Role, UserStatus, etc.)
import { Role, UserStatus, AuthMethod, OrderStatus, LoginResult } from "@/generated/prisma/client";

// 3. Import types for specific models (WhereInput, CreateInput, etc.)
import type { AuditLogWhereInput } from "@/generated/prisma/models";
import type { UserWhereInput, UserCreateInput } from "@/generated/prisma/models";

// 4. Use the prisma instance (already configured)
import { prisma } from "@/lib/db";
```

### ❌ Wrong Imports (KHÔNG SỬ DỤNG)

```typescript
// ❌ WRONG - Package export không có types bạn cần
import { Prisma } from "@prisma/client";
import type { AuditLogWhereInput } from "@prisma/client";

// ❌ WRONG - Path không tồn tại
import { PrismaClient } from "@/generated/prisma";

// ❌ WRONG - Tạo instance mới (singleton đã có)
const prisma = new PrismaClient();
```

---

## 📁 Generated Files Structure

```
src/generated/prisma/
├── client.ts           # PrismaClient class + enums re-exported
├── enums.ts            # All enums (Role, UserStatus, etc.)
├── models.ts           # Barrel export for all model types
├── models/
│   ├── AuditLog.ts     # AuditLogWhereInput, AuditLogCreateInput, etc.
│   ├── User.ts         # UserWhereInput, UserCreateInput, etc.
│   ├── Order.ts        # OrderWhereInput, OrderCreateInput, etc.
│   └── Config.ts       # ConfigWhereInput, ConfigCreateInput, etc.
├── commonInputTypes.ts # Shared input types (StringFilter, DateTimeFilter, etc.)
└── browser.ts          # Client-safe exports (no server code)
```

---

## 🔧 Import By Use Case

### Use Case 1: Query with type-safe where clause

```typescript
import { prisma } from "@/lib/db";
import type { UserWhereInput } from "@/generated/prisma/models";

async function findUsers(filters: UserWhereInput) {
  return prisma.user.findMany({ where: filters });
}
```

### Use Case 2: Create record with typed input

```typescript
import { prisma } from "@/lib/db";
import type { UserCreateInput } from "@/generated/prisma/models";
import { Role, UserStatus } from "@/generated/prisma/client";

async function createUser(data: UserCreateInput) {
  return prisma.user.create({
    data: {
      ...data,
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
  });
}
```

### Use Case 3: Use enums in components/types

```typescript
// In type definitions
import { Role, UserStatus } from "@/generated/prisma/client";

interface UserWithRole {
  id: string;
  role: Role;
  status: UserStatus;
}
```

### Use Case 4: Build complex filters

```typescript
import { prisma } from "@/lib/db";
import type { AuditLogWhereInput } from "@/generated/prisma/models";
import { LoginResult } from "@/generated/prisma/client";

async function getAuditLogs(userId?: string, result?: LoginResult) {
  const where: AuditLogWhereInput = {};
  
  if (userId) where.userId = userId;
  if (result) where.result = result;
  
  return prisma.auditLog.findMany({ where });
}
```

---

## 🗄️ Database Instance

### Singleton Pattern (Đã được setup)

```typescript
// src/lib/db/index.ts - Đã có sẵn, KHÔNG cần tạo lại
import { prisma } from "@/lib/db";

// Sử dụng trực tiếp trong Server Components, API Routes, Server Actions
```

### Tại sao dùng Singleton?

- Tránh tạo nhiều connections trong development (hot reload)
- Centralized configuration (adapter, logging)
- Type-safe access từ một nơi

---

## 📋 Schema Conventions

### Model Naming

```prisma
// ✅ PascalCase for model names
model User { ... }
model AuditLog { ... }

// ✅ camelCase for field names
model User {
  id        String
  createdAt DateTime
  updatedAt DateTime
}
```

### Required Fields Pattern

```prisma
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Business fields
  email     String?  @unique
  role      Role     @default(STAFF)
}
```

### Relations

```prisma
model AuditLog {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, timestamp])  // Composite index for common queries
}
```

---

## 🔄 Migration Commands

```bash
# Generate client after schema changes
pnpm db:generate

# Create migration (development)
pnpm db:migrate

# Apply migrations (production)
pnpm db:migrate:deploy

# Reset database (DEVELOPMENT ONLY)
pnpm db:reset

# Open Prisma Studio
pnpm db:studio
```

---

## ⚡ Common Patterns in This Project

### 1. Check user role

```typescript
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

const session = await auth();
if (session?.user?.role === Role.SUPER_ADMIN) {
  // Super admin logic
}
```

### 2. Filter with pagination

```typescript
import { prisma } from "@/lib/db";

async function getUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  
  return { users, total, page, limit };
}
```

### 3. Transaction

```typescript
import { prisma } from "@/lib/db";

async function transferData() {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: '1' }, data: { ... } });
    await tx.auditLog.create({ data: { ... } });
  });
}
```

---

## 🚨 Troubleshooting

### "Module has no exported member 'Prisma'"

```typescript
// ❌ This won't work with custom output
import { Prisma } from "@prisma/client";

// ✅ Import from generated models instead
import type { UserWhereInput } from "@/generated/prisma/models";
```

### Types not updating after schema change

```bash
# Regenerate Prisma client
pnpm db:generate

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### "Cannot find module '@/generated/prisma'"

```bash
# Ensure Prisma client is generated
pnpm db:generate
```

---

## 📌 Quick Reference

| Need | Import From |
|------|-------------|
| `prisma` instance | `@/lib/db` |
| `PrismaClient` type | `@/generated/prisma/client` |
| Enums (Role, etc.) | `@/generated/prisma/client` |
| WhereInput types | `@/generated/prisma/models` |
| CreateInput types | `@/generated/prisma/models` |
| Filter types (StringFilter, etc.) | `@/generated/prisma/commonInputTypes` |
