---
applyTo: '**/*.tsx,**/*.ts'
---
# Next.js Instructions - SGS CS Helper
# Generated: 2026-02-07
# Based on: Next.js 16.1.6, App Router, React 19, NextAuth 5

---

## 🏗️ Project Structure

```
src/app/
├── (auth)/           # Auth group (login, etc.)
├── (dashboard)/      # Dashboard group
├── (orders)/         # Orders group (upload, etc.)
├── admin/            # Admin pages
├── api/              # API routes
├── globals.css       # Global styles
└── layout.tsx        # Root layout

src/components/       # React components
src/lib/              # Utilities, actions, auth
src/hooks/            # Custom React hooks
src/types/            # TypeScript type definitions
```

---

## 📄 File Conventions

### Page Files

```typescript
// src/app/admin/page.tsx
export default function AdminPage() {
  return <div>Admin</div>;
}
```

### Layout Files

```typescript
// src/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-layout">{children}</div>;
}
```

### Route Groups

```typescript
// (groupName)/ - Group routes without affecting URL
// src/app/(dashboard)/page.tsx → URL: /
// src/app/(auth)/login/page.tsx → URL: /login
```

---

## 🔧 Server vs Client Components

### Server Components (Default)

```typescript
// src/app/admin/page.tsx
// Server Component by default - can use async/await directly
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const users = await prisma.user.findMany();
  return <UserList users={users} />;
}
```

### Client Components

```typescript
// src/components/orders/UploadExcelUI.tsx
'use client';  // ← MUST be first line

import { useState } from 'react';

export function UploadExcelUI() {
  const [file, setFile] = useState<File | null>(null);
  // ... interactive logic
}
```

### When to Use What

| Use Server Component | Use Client Component |
|---------------------|---------------------|
| Data fetching | User interactions (onClick, onChange) |
| Access backend resources | useState, useEffect, hooks |
| Sensitive logic | Browser APIs |
| Large dependencies | Real-time updates |

---

## 🔐 Authentication (NextAuth v5)

### Get Session in Server Components

```typescript
import { auth } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <div>Welcome {session.user.name}</div>;
}
```

### Get Session in API Routes

```typescript
// src/app/api/protected/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ user: session.user });
}
```

### Session User Type

```typescript
// Session user includes custom fields:
session.user.id          // string
session.user.role        // Role enum
session.user.status      // UserStatus enum
session.user.canUpload   // boolean
session.user.canUpdateStatus // boolean
session.user.staffCode   // string | null
```

---

## 📡 API Routes

### Basic Pattern

```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Handle request
  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ...
}
```

### Dynamic Routes

```typescript
// src/app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

---

## 🎨 Styling (Tailwind CSS v4)

### Class Usage

```tsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Conditional Classes

```tsx
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</button>
```

---

## 🧩 UI Components (shadcn/ui)

### Import Pattern

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
```

### Adding New Components

```bash
pnpm dlx shadcn@latest add <component-name>
# Example: pnpm dlx shadcn@latest add dialog
```

---

## ✅ Form Validation (Zod)

### Schema Definition

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Validation in API Route

```typescript
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const { email, password } = result.data;
  // ...
}
```

---

## 🔄 Data Fetching Patterns

### Server Component (Preferred)

```typescript
// Direct database access in Server Components
export default async function UsersPage() {
  const users = await prisma.user.findMany();
  return <UserTable users={users} />;
}
```

### Client Component (When needed)

```typescript
'use client';

import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.users));
  }, []);
  
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 🚨 Common Patterns

### Redirect

```typescript
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  // ...
}
```

### Error Handling in API

```typescript
export async function POST(request: NextRequest) {
  try {
    // ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Loading States

```typescript
// src/app/admin/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}
```

---

## 📌 Quick Reference

| Task | Approach |
|------|----------|
| Get session | `const session = await auth()` |
| Redirect | `import { redirect } from "next/navigation"` |
| Database access | `import { prisma } from "@/lib/db"` |
| Form validation | Zod schema + `safeParse` |
| UI components | Import from `@/components/ui/*` |
| Utility classes | `cn()` from `@/lib/utils` |
