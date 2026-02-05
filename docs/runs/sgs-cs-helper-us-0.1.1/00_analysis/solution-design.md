# Phase 0: Solution Design — US-0.1.1 Initialize Project Structure
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.1.1 -->

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:** We need to initialize a Next.js 16.0.10 project with the correct folder structure, dependencies, and configuration so that subsequent features (authentication, file upload, dashboard) can be built on a solid foundation. Currently, no project exists in the workspace.

**VI:** Cần khởi tạo dự án Next.js 16.0.10 với cấu trúc thư mục, dependencies và cấu hình đúng để các tính năng tiếp theo (xác thực, upload file, dashboard) có thể được xây dựng trên nền tảng vững chắc. Hiện tại chưa có dự án nào trong workspace.

---

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Project | None - empty workspace | Next.js 16.0.10 App Router project |
| TypeScript | N/A | Strict mode enabled |
| Styling | N/A | Tailwind CSS + shadcn/ui |
| Database | N/A | Prisma configured (PostgreSQL) |
| Package Manager | N/A | pnpm |
| Deployment | N/A | Vercel-compatible |

---

### Gap Analysis / Phân tích Khoảng cách

| Gap | Description EN | Description VI |
|-----|----------------|----------------|
| No project | Need to create from scratch | Cần tạo từ đầu |
| No dependencies | Need to install all required packages | Cần cài đặt tất cả packages |
| No folder structure | Need to create per tech stack instructions | Cần tạo theo hướng dẫn tech stack |
| No configuration | Need TypeScript, ESLint, Tailwind configs | Cần cấu hình TypeScript, ESLint, Tailwind |
| No environment template | Need .env.example for team onboarding | Cần .env.example cho team |

---

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | `/` (root) | New Next.js project created |
| sgs-cs-hepper | `src/` | Application source code structure |
| sgs-cs-hepper | `prisma/` | Database schema and migrations |
| a-z-copilot-flow | None | No changes (tooling only) |

---

### Open Questions / Câu hỏi Mở

1. **Database provider**: Vercel Postgres or Supabase?
   - **Decision**: Document both options in `.env.example`; actual choice deferred to deployment time

2. **shadcn/ui components**: Which to install initially?
   - **Decision**: Install only core components (button, card, input, toast); add more as needed

---

### Assumptions / Giả định

1. **pnpm** is available globally or will be installed
2. **Node.js 20+** is installed (required for Next.js 16)
3. **PostgreSQL** will be available (locally or via cloud provider)
4. Project will be deployed to **Vercel** (serverless environment)

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| Tech stack instructions | Full architecture defined | ✅ Yes | Follow exactly |
| WORKSPACE_CONTEXT.md | docs_root = sgs-cs-hepper | ✅ Yes | Project goes here |

---

### Similar Implementations / Triển khai Tương tự

| Source | What it provides | Learnings |
|--------|------------------|-----------|
| `create-next-app` | Official Next.js scaffolding | Use with `--typescript --tailwind --eslint --app --src-dir` flags |
| `shadcn/ui init` | Component library setup | Run after project creation |
| `prisma init` | Database ORM setup | Creates `prisma/schema.prisma` |

---

### Dependencies / Phụ thuộc

| Category | Packages | Status |
|----------|----------|--------|
| Core | next, react, react-dom, typescript | Need to install |
| Database | prisma, @prisma/client | Need to install |
| Auth | next-auth@beta, bcryptjs | Need to install |
| UI | tailwindcss, @radix-ui/*, lucide-react | Need to install |
| Data | xlsx, swr, zod, date-fns, date-fns-tz | Need to install |
| Dev | eslint, prettier, vitest, @testing-library/react | Need to install |

---

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| sgs-cs-hepper | a-z-copilot-flow | tooling-consumer | Uses workflow prompts only |

No runtime dependencies between roots.

---

### Reusable Components / Component Tái sử dụng

None yet - this is the foundation story.

---

### New Components Needed / Component Cần tạo Mới

| Component | Purpose EN | Purpose VI |
|-----------|------------|------------|
| `src/app/layout.tsx` | Root layout with providers | Layout gốc với providers |
| `src/app/page.tsx` | Landing page (placeholder) | Trang chủ (placeholder) |
| `src/lib/db/index.ts` | Prisma client singleton | Prisma client singleton |
| `prisma/schema.prisma` | Database schema | Schema cơ sở dữ liệu |
| `.env.example` | Environment template | Template biến môi trường |

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** 
Use `create-next-app` with recommended flags to scaffold a Next.js 16.0.10 project with TypeScript, Tailwind CSS, ESLint, and App Router. Then:
1. Initialize shadcn/ui for component library
2. Add Prisma for database access
3. Create folder structure per tech stack instructions
4. Configure environment variables template
5. Verify build succeeds

**VI:**
Sử dụng `create-next-app` với các flags được khuyến nghị để tạo dự án Next.js 16.0.10 với TypeScript, Tailwind CSS, ESLint và App Router. Sau đó:
1. Khởi tạo shadcn/ui cho thư viện component
2. Thêm Prisma cho truy cập database
3. Tạo cấu trúc thư mục theo hướng dẫn tech stack
4. Cấu hình template biến môi trường
5. Xác minh build thành công

---

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **create-next-app + manual setup** | Official tooling, customizable | More steps | ✅ Selected |
| Custom template | Faster if exists | No template exists | ❌ N/A |
| Copy from another project | Quick | May have unwanted code | ❌ Not clean |

---

### Components / Các Component

| # | Name | Location | Purpose |
|---|------|----------|---------|
| 1 | Next.js App | `src/app/` | Application routes and pages |
| 2 | Prisma Schema | `prisma/schema.prisma` | Database models |
| 3 | Prisma Client | `src/lib/db/index.ts` | Database connection singleton |
| 4 | UI Components | `src/components/ui/` | shadcn/ui base components |
| 5 | Environment Template | `.env.example` | Required variables documentation |

---

### Component Details / Chi tiết Component

#### Component 1: Next.js App Structure

| Aspect | Detail |
|--------|--------|
| Location | `src/app/` |
| Purpose | EN: App Router routes / VI: Routes cho App Router |
| Key Files | `layout.tsx`, `page.tsx`, `globals.css` |

#### Component 2: Prisma Schema

| Aspect | Detail |
|--------|--------|
| Location | `prisma/schema.prisma` |
| Purpose | EN: Define database models / VI: Định nghĩa models database |
| Models | User, Order, Config (placeholder definitions) |

#### Component 3: Prisma Client

| Aspect | Detail |
|--------|--------|
| Location | `src/lib/db/index.ts` |
| Purpose | EN: Singleton pattern for Prisma / VI: Singleton pattern cho Prisma |
| Pattern | Global singleton to prevent connection exhaustion |

#### Component 4: Environment Template

| Aspect | Detail |
|--------|--------|
| Location | `.env.example` |
| Purpose | EN: Document required env vars / VI: Tài liệu biến môi trường cần thiết |
| Variables | DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_*, etc. |

---

### Folder Structure / Cấu trúc Thư mục

```
sgs-cs-helper/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   ├── (auth)/            # Auth route group (placeholder)
│   │   ├── (dashboard)/       # Dashboard route group (placeholder)
│   │   └── api/               # API routes (placeholder)
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts       # Prisma client
│   │   ├── auth/              # Auth utilities (placeholder)
│   │   ├── excel/             # Excel parsing (placeholder)
│   │   └── utils/             # General utilities
│   ├── types/                 # TypeScript types
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .env.example               # Environment template
├── .env.local                 # Local environment (gitignored)
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

---

### Implementation Steps / Các bước Triển khai

| Step | Command/Action | Purpose |
|------|----------------|---------|
| 1 | `pnpm create next-app@latest sgs-cs-helper --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` | Scaffold project |
| 2 | `cd sgs-cs-helper && pnpm dlx shadcn-ui@latest init` | Initialize shadcn/ui |
| 3 | `pnpm add prisma @prisma/client` | Add Prisma |
| 4 | `pnpm prisma init` | Create Prisma schema |
| 5 | Create folder structure | Per tech stack instructions |
| 6 | Create `.env.example` | Document env vars |
| 7 | Create `src/lib/db/index.ts` | Prisma singleton |
| 8 | Update `prisma/schema.prisma` | Add models (User, Order, Config) |
| 9 | Add dev dependencies | vitest, prettier, testing-library |
| 10 | `pnpm build` | Verify build succeeds |

---

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| pnpm not installed | Provide install command | Must install pnpm first |
| Node.js version too old | Provide upgrade command | Must upgrade Node.js |
| Build fails | Check TypeScript errors | Fix before proceeding |

---

### Rollback Plan / Kế hoạch Rollback

**EN:** Since this is project initialization, rollback means deleting the created folder and re-running the setup commands.

**VI:** Vì đây là khởi tạo dự án, rollback có nghĩa là xóa thư mục đã tạo và chạy lại các lệnh setup.

---

## 0.4 Diagrams / Sơ đồ

See: [diagrams/flow-overview.md](./diagrams/flow-overview.md)

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Problem | No project exists, need Next.js 16.0.10 foundation |
| Solution | create-next-app + shadcn/ui + Prisma + folder structure |
| Components | 5 main components to create |
| Estimated Steps | 10 implementation steps |
| Risk Level | Low (standard setup) |

---

## Key Decisions / Quyết định Chính

1. **D-001**: Use `create-next-app` official tooling for scaffolding
   - Rationale: Official, well-maintained, includes best practices

2. **D-002**: Use pnpm as package manager
   - Rationale: Faster, disk-efficient, recommended for Next.js

3. **D-003**: Install minimal shadcn/ui components initially
   - Rationale: Add components as needed, avoid bloat

4. **D-004**: Create placeholder folders for future features
   - Rationale: Establishes structure without implementing features

---

**Next Step**: `/phase-1-spec` (after approval)
