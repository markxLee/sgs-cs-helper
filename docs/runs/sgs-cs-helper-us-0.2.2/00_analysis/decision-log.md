# Decision Log: US-0.2.2
<!-- Super Admin Dashboard & Admin Invitation -->

---

## Decisions / Quyết định

### D-001: Server Actions over API Routes

| Aspect | Detail |
|--------|--------|
| **Decision** | Use Next.js Server Actions instead of API routes |
| **Alternatives** | API Routes, tRPC |
| **Rationale** | Type-safe, less boilerplate, built-in form handling, progressive enhancement |
| **Trade-offs** | Requires form state management in client components |
| **Date** | 2026-02-05 |

---

### D-002: Soft Delete with REVOKED Status

| Aspect | Detail |
|--------|--------|
| **Decision** | Use `UserStatus.REVOKED` instead of hard delete |
| **Alternatives** | Hard delete (DELETE FROM users) |
| **Rationale** | Audit trail, ability to restore, prevent accidental data loss |
| **Trade-offs** | Slightly more complex queries (filter by status) |
| **Date** | 2026-02-05 |

---

### D-003: Conditional Password Field

| Aspect | Detail |
|--------|--------|
| **Decision** | Show password field only when "Email/Password" auth method selected |
| **Alternatives** | Always show, use modal for password |
| **Rationale** | Cleaner UX, reduces confusion, validates only when needed |
| **Trade-offs** | Requires dynamic form state |
| **Date** | 2026-02-05 |

---

### D-004: Separate Admin Layout

| Aspect | Detail |
|--------|--------|
| **Decision** | Create dedicated `admin/layout.tsx` for role protection |
| **Alternatives** | Middleware, per-page checks |
| **Rationale** | Clean separation, reusable for future admin pages, co-located with routes |
| **Trade-offs** | Another layout file |
| **Date** | 2026-02-05 |

---

### D-005: Schema Enums for Auth Method and Status

| Aspect | Detail |
|--------|--------|
| **Decision** | Add `AuthMethod` and `UserStatus` as Prisma enums |
| **Alternatives** | String fields, separate table |
| **Rationale** | Type safety, database-level validation, clear documentation |
| **Trade-offs** | Migration required to add new values |
| **Date** | 2026-02-05 |

---

### D-006: PENDING Status for New Admins

| Aspect | Detail |
|--------|--------|
| **Decision** | New invited Admins start with `PENDING` status, switch to `ACTIVE` on first login |
| **Alternatives** | Always ACTIVE, email confirmation |
| **Rationale** | Track who has actually logged in, no email infrastructure needed for MVP |
| **Trade-offs** | Need to update status in auth flow (US-0.2.3, US-0.2.4) |
| **Date** | 2026-02-05 |

