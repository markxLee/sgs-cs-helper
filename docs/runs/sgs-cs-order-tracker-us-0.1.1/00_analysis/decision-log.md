# Decision Log — US-0.1.1 Initialize Project Structure
<!-- Generated: 2026-02-05 -->

---

## Decisions / Quyết định

### D-001: Use create-next-app for scaffolding

| Field | Value |
|-------|-------|
| **Decision** | Use official `create-next-app` CLI tool |
| **Date** | 2026-02-05 |
| **Status** | ✅ Approved |

**Context / Ngữ cảnh:**
Need to create Next.js 16.0.10 project from scratch.

**Options Considered / Các lựa chọn:**
1. `create-next-app` (official)
2. Custom template
3. Copy from existing project

**Rationale / Lý do:**
- Official tooling is well-maintained
- Includes latest Next.js 16 features
- Generates proper TypeScript, ESLint, Tailwind configs
- Community support and documentation

---

### D-002: Use pnpm as package manager

| Field | Value |
|-------|-------|
| **Decision** | Use pnpm instead of npm/yarn |
| **Date** | 2026-02-05 |
| **Status** | ✅ Approved |

**Context / Ngữ cảnh:**
Need to choose package manager for the project.

**Options Considered / Các lựa chọn:**
1. npm (default)
2. yarn
3. pnpm

**Rationale / Lý do:**
- Faster installation
- Disk-efficient (shared dependencies)
- Strict dependency resolution
- Recommended by Vercel for Next.js

---

### D-003: Install minimal shadcn/ui components initially

| Field | Value |
|-------|-------|
| **Decision** | Only install button, card, input, toast initially |
| **Date** | 2026-02-05 |
| **Status** | ✅ Approved |

**Context / Ngữ cảnh:**
shadcn/ui has many components, need to decide which to include.

**Options Considered / Các lựa chọn:**
1. Install all components
2. Install only needed components
3. Install minimal set, add more later

**Rationale / Lý do:**
- Reduces initial bundle size
- Avoids unused code
- Easy to add more via `pnpm dlx shadcn-ui@latest add <component>`
- Follows YAGNI principle

---

### D-004: Create placeholder folders for future features

| Field | Value |
|-------|-------|
| **Decision** | Create empty folders with .gitkeep for auth, excel, dashboard |
| **Date** | 2026-02-05 |
| **Status** | ✅ Approved |

**Context / Ngữ cảnh:**
Tech stack defines folder structure, but features come later.

**Options Considered / Các lựa chọn:**
1. Create all folders now with placeholders
2. Create folders only when implementing features
3. Create only src/app folders, others later

**Rationale / Lý do:**
- Establishes consistent structure from start
- Makes tech stack expectations clear
- Easy for team to navigate
- Minimal overhead (just empty folders)

---

### D-005: Database schema as placeholder

| Field | Value |
|-------|-------|
| **Decision** | Include User, Order, Config models but don't run migrations |
| **Date** | 2026-02-05 |
| **Status** | ✅ Approved |

**Context / Ngữ cảnh:**
US-0.1.1 focuses on project structure, not database setup.

**Options Considered / Các lựa chọn:**
1. Full schema + migrations
2. Schema only, no migrations
3. Empty schema file

**Rationale / Lý do:**
- Schema defines data models for team understanding
- Migrations require DATABASE_URL (not available yet)
- US-0.3.1 will handle actual database setup
- Keeps US-0.1.1 scope focused

---

## Open Items / Mục Còn mở

| Item | Owner | Status |
|------|-------|--------|
| Database provider choice | User | Deferred to deployment |
| Actual DATABASE_URL | User | Required for US-0.3.1 |
| Google OAuth credentials | User | Required for US-0.2.2 |
