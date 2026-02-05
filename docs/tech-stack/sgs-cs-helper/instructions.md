---
applyTo: "**/**"
---

# SGS CS Order Tracker — Tech Stack Instructions
<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-helper -->

---

## Overview

- **Product**: SGS CS Order Tracker - Order progress monitoring for CS team
- **Hosting**: Vercel (serverless)
- **Framework**: Next.js 16.0.10 with App Router
- **Architecture**: Full-stack Next.js with React 19
- **Database**: PostgreSQL via Vercel Postgres or Supabase
- **Auth**: NextAuth.js with multiple providers (credentials, Google OAuth)
- **File Processing**: Server-side Excel parsing with xlsx library
- **UI**: React with Tailwind CSS and shadcn/ui components

---

## Architecture & Patterns

### Application Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (serverless functions)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── orders/           # Order-specific components
│   └── notifications/    # Notification components
├── lib/                  # Utilities and helpers
│   ├── db/              # Database client and queries
│   ├── excel/           # Excel parsing logic
│   ├── auth/            # Auth configuration
│   └── utils/           # General utilities
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

### Key Patterns
- **Server Components** by default, Client Components only when needed (interactivity)
- **Server Actions** for mutations (upload, mark done, config updates)
- **Route Handlers** for API endpoints (file upload processing)
- **Middleware** for auth protection and role-based access
- **Repository Pattern** for database access (clean separation)

---

## Stack Best Practices

### Next.js / React
- Use App Router with Server Components for initial data fetching
- Implement loading.tsx and error.tsx for better UX
- Use `useOptimistic` for instant UI feedback on mutations
- Prefer Server Actions over API routes for form submissions
- Use dynamic imports for heavy components (Excel preview)

### Database (PostgreSQL)
- Use Prisma ORM for type-safe database access
- Define clear schema with relations (User, Order, Config)
- Use database transactions for multi-step operations
- Index frequently queried fields (jobNumber, status, registeredDate)
- Use connection pooling (Prisma Accelerate or PgBouncer)

### Authentication (NextAuth.js v5)
- Configure multiple providers in single auth config
- Use middleware for route protection
- Implement role-based access (SUPER_ADMIN, ADMIN, STAFF)
- Store sessions in database for better control
- Use JWT strategy for stateless auth

### File Upload & Processing
- Use Vercel Blob or uploadthing for file storage
- Process Excel files server-side with xlsx library
- Validate file format before parsing
- Extract only required fields from Excel
- Handle Excel date serial numbers correctly (timezone: Asia/Ho_Chi_Minh)

### UI/UX
- Use shadcn/ui for consistent, accessible components
- Implement progress bars with proper ARIA attributes
- Use color coding: 🟢 green → 🟡 yellow → 🟠 orange → 🔴 red
- Real-time updates with SWR or React Query (polling every 30s)
- Toast notifications for user feedback

---

## Anti-Patterns

### ❌ Avoid These
- Do NOT use `use client` unnecessarily - keep components server-side when possible
- Do NOT store files in local filesystem (Vercel is serverless/ephemeral)
- Do NOT parse Excel on client-side (security, performance)
- Do NOT use raw SQL queries - use Prisma for type safety
- Do NOT hardcode credentials - use environment variables
- Do NOT skip input validation on file uploads
- Do NOT block UI during file processing - use async patterns
- Do NOT use localStorage for auth state - use NextAuth session

### ⚠️ Common Pitfalls
- Excel dates are serial numbers, not ISO strings - convert properly
- Vercel serverless functions have 10s timeout (hobby) / 60s (pro) - handle large files
- PostgreSQL connections can exhaust - use connection pooling
- File uploads have size limits (4.5MB default on Vercel) - configure properly

---

## Data Models

### Prisma Schema
```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // For STAFF with shared code
  staffCode String?
  
  // Relations
  orders    Order[]  @relation("UploadedBy")
}

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
}

model Order {
  id              String      @id @default(cuid())
  jobNumber       String      @unique
  registeredDate  DateTime
  requiredDate    DateTime
  priority        Int         @default(0)
  status          OrderStatus @default(IN_PROGRESS)
  
  // Parsed data
  registeredBy    String?
  sampleCount     Int         @default(1)
  description     String?
  
  // Tracking
  completedAt     DateTime?
  uploadedAt      DateTime    @default(now())
  uploadedById    String
  uploadedBy      User        @relation("UploadedBy", fields: [uploadedById], references: [id])
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([status])
  @@index([registeredDate])
  @@index([requiredDate])
}

enum OrderStatus {
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

model Config {
  id              String   @id @default(cuid())
  key             String   @unique
  value           String
  updatedAt       DateTime @updatedAt
}
```

### Key Config Values
- `warning_threshold`: Default 80 (percentage)
- `staff_code`: Shared code for staff login
- `timezone`: Asia/Ho_Chi_Minh

---

## Security & Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For migrations

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth (for Admin)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# File Storage (optional - if using Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# App Config
STAFF_CODE="..."  # Initial shared code for staff
SUPER_ADMIN_EMAIL="..."
SUPER_ADMIN_PASSWORD="..."  # Hashed at runtime
```

### Security Measures
- Hash passwords with bcrypt (cost factor 12)
- Validate file MIME types and extensions
- Sanitize parsed Excel data before database insertion
- Use CSRF protection (built into NextAuth)
- Implement rate limiting on login endpoints
- Use HttpOnly cookies for session

### Role-Based Access
| Route | STAFF | ADMIN | SUPER_ADMIN |
|-------|-------|-------|-------------|
| Dashboard (view) | ✅ | ✅ | ✅ |
| Upload orders | ✅ | ✅ | ✅ |
| Mark as done | ✅ | ✅ | ✅ |
| Configure thresholds | ❌ | ✅ | ✅ |
| Invite admins | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Commands & Scripts

### Development
```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma generate
pnpm prisma db push

# Seed super admin
pnpm prisma db seed

# Run development server
pnpm dev
```

### Database
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema changes (development)
pnpm prisma db push

# Create migration (production)
pnpm prisma migrate dev --name <migration-name>

# Deploy migrations (production)
pnpm prisma migrate deploy

# Open Prisma Studio
pnpm prisma studio
```

### Build & Deploy
```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

### Testing
```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

---

## Dependencies

### Core
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x"
}
```

### Auth & Security
```json
{
  "next-auth": "^5.x",
  "bcryptjs": "^2.x",
  "@types/bcryptjs": "^2.x"
}
```

### UI
```json
{
  "tailwindcss": "^3.x",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "lucide-react": "latest"
}
```

### Data & Files
```json
{
  "xlsx": "^0.18.x",
  "swr": "^2.x",
  "zod": "^3.x",
  "date-fns": "^3.x",
  "date-fns-tz": "^2.x"
}
```

### Dev
```json
{
  "eslint": "^8.x",
  "prettier": "^3.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x"
}
```
