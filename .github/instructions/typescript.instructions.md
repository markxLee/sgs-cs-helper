---
applyTo: '**/*.ts,**/*.tsx'
---
# TypeScript Instructions - SGS CS Helper
# Generated: 2026-02-07
# Based on: TypeScript 5.x, Strict mode, Next.js 16

---

## ⚙️ Compiler Settings

This project uses **strict mode**. Key settings:

```jsonc
{
  "compilerOptions": {
    "strict": true,           // All strict checks enabled
    "noEmit": true,           // Type checking only
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]      // Alias imports
    }
  }
}
```

---

## 📦 Import Patterns

### Path Aliases (ALWAYS USE)

```typescript
// ✅ Correct - Use @/ alias
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import type { UserWhereInput } from "@/generated/prisma/models";

// ❌ Wrong - Relative paths
import { prisma } from "../../../lib/db";
```

### Import Grouping (Preferred Order)

```typescript
// 1. External libraries
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 2. Internal modules
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 3. Types (use 'import type' for types only)
import type { UserWhereInput } from "@/generated/prisma/models";
import { Role } from "@/generated/prisma/client";

// 4. Components
import { Button } from "@/components/ui/button";
```

### Type-Only Imports

```typescript
// ✅ Use 'import type' for type-only imports (better tree-shaking)
import type { PrismaClient } from "@/generated/prisma/client";
import type { Session } from "next-auth";

// ❌ Avoid importing values when only types needed
import { PrismaClient } from "@/generated/prisma/client"; // Only using as type
```

---

## 🏷️ Type Definitions

### Interface vs Type

```typescript
// ✅ Interface for object shapes (extendable)
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type for unions, intersections, utilities
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
type PartialUser = Partial<User>;
type UserWithRole = User & { role: UserRole };
```

### Function Types

```typescript
// ✅ Typed function parameters and return
async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// ✅ Arrow function with types
const formatDate = (date: Date): string => {
  return date.toISOString();
};
```

### Generic Types

```typescript
// ✅ Generic response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Usage
function respond<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}
```

---

## 🔒 Strict Mode Patterns

### Null/Undefined Handling

```typescript
// ✅ Use optional chaining
const userName = session?.user?.name;

// ✅ Nullish coalescing for defaults
const displayName = userName ?? 'Guest';

// ✅ Type guards
if (session?.user) {
  // TypeScript knows session.user is defined here
  console.log(session.user.name);
}
```

### Non-null Assertion (Use Sparingly)

```typescript
// ⚠️ Only use when you're 100% certain
const userId = session!.user!.id; // Dangerous

// ✅ Prefer type guards
if (!session?.user) {
  throw new Error('Unauthorized');
}
const userId = session.user.id; // Safe
```

### Type Assertions

```typescript
// ✅ Use 'as' for known types
const body = await request.json() as LoginInput;

// ✅ Use 'unknown' for safer assertions
const data = JSON.parse(str) as unknown;
if (isValidUser(data)) {
  // data is now typed as User
}
```

---

## 📋 Zod Integration

### Schema-First Types

```typescript
import { z } from "zod";

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']),
});

// Infer type from schema
type UserInput = z.infer<typeof userSchema>;

// Use in function
function createUser(input: UserInput) {
  const validated = userSchema.parse(input);
  // validated is type-safe
}
```

### Validation Pattern

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  // result.error contains ZodError
  return { error: result.error.flatten() };
}

// result.data is fully typed
const { email, name } = result.data;
```

---

## 🧩 React Component Types

### Function Components

```typescript
// ✅ Typed props
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

### Event Handlers

```typescript
// ✅ Typed event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFile(e.target.files?.[0] ?? null);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};
```

### Children Props

```typescript
interface LayoutProps {
  children: React.ReactNode;  // Any valid React child
}

// For only one child element
interface CardProps {
  children: React.ReactElement;
}
```

---

## 🎯 Common Patterns

### Discriminated Unions

```typescript
type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: ApiResult<T>) {
  if (result.success) {
    // TypeScript knows result.data exists
    console.log(result.data);
  } else {
    // TypeScript knows result.error exists
    console.error(result.error);
  }
}
```

### Exhaustive Checks

```typescript
function handleRole(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'STAFF':
      return 'Staff';
    default:
      // TypeScript error if not all cases handled
      const _exhaustive: never = role;
      return _exhaustive;
  }
}
```

### Record Types

```typescript
// ✅ Type-safe object with known keys
const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  STAFF: 'Staff Member',
};
```

---

## 🚨 Common Errors & Fixes

### "Object is possibly 'undefined'"

```typescript
// ❌ Error
const name = user.name; // user might be undefined

// ✅ Fix with optional chaining
const name = user?.name;

// ✅ Or with type guard
if (user) {
  const name = user.name;
}
```

### "Type 'X' is not assignable to type 'Y'"

```typescript
// ❌ Error
const role: Role = 'admin'; // lowercase

// ✅ Fix - use exact enum value
const role: Role = 'ADMIN';

// ✅ Or import enum
import { Role } from "@/generated/prisma/client";
const role = Role.ADMIN;
```

### "Argument of type 'unknown' is not assignable"

```typescript
// ❌ Error
const body = await request.json();
processUser(body); // body is unknown

// ✅ Fix with Zod validation
const result = userSchema.safeParse(body);
if (result.success) {
  processUser(result.data);
}
```

---

## 📌 Quick Reference

| Pattern | Example |
|---------|---------|
| Optional property | `name?: string` |
| Readonly | `readonly id: string` |
| Array type | `users: User[]` |
| Promise type | `Promise<User>` |
| Partial | `Partial<User>` |
| Pick | `Pick<User, 'id' \| 'name'>` |
| Omit | `Omit<User, 'password'>` |
| Record | `Record<string, number>` |
| Type guard | `function isUser(x: unknown): x is User` |
