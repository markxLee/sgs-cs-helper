# Decision Log — US-0.3.2 Seed Initial Data
<!-- Generated: 2026-02-05 -->

---

## Decisions Made / Các Quyết định

### D-001: Use bcrypt for password hashing

| Aspect | Value |
|--------|-------|
| Decision | Use `bcrypt` package (native) instead of `bcryptjs` (pure JS) |
| Rationale | Native performance, industry standard for password hashing, widely used |
| Alternatives Considered | bcryptjs (pure JS, slower), argon2 (newer but less common) |
| Trade-offs | Requires node-gyp for native compilation; may need rebuild on deploy |
| Date | 2026-02-05 |

---

### D-002: Use upsert pattern for idempotency

| Aspect | Value |
|--------|-------|
| Decision | Use Prisma `upsert` instead of `create` for seed operations |
| Rationale | Running seed multiple times should not fail or create duplicates |
| Alternatives Considered | findFirst + create (race conditions), deleteAll + create (data loss) |
| Trade-offs | Slightly more complex code, but much safer |
| Date | 2026-02-05 |

---

### D-003: Separate password utility from seed script

| Aspect | Value |
|--------|-------|
| Decision | Create `src/lib/auth/password.ts` as reusable utility |
| Rationale | Password hashing will be needed by auth system (US-0.2.x) |
| Alternatives Considered | Inline in seed.ts (simpler but not reusable) |
| Trade-offs | Extra file, but promotes code reuse |
| Date | 2026-02-05 |

---

### D-004: Use tsx for TypeScript seed execution

| Aspect | Value |
|--------|-------|
| Decision | Use `tsx` package to run seed.ts directly without compilation |
| Rationale | No need to compile to JS, faster development, matches Prisma 7.x patterns |
| Alternatives Considered | ts-node (heavier), compile to JS (extra step) |
| Trade-offs | Additional dev dependency |
| Date | 2026-02-05 |

---

### D-005: Store Super Admin credentials in environment variables

| Aspect | Value |
|--------|-------|
| Decision | Read `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` from env |
| Rationale | Security best practice, different values per environment |
| Alternatives Considered | Hardcode defaults (insecure), interactive prompt (not automatable) |
| Trade-offs | Requires env setup before seeding |
| Date | 2026-02-05 |

---

### D-006: Store staff_code as plain text in Config table

| Aspect | Value |
|--------|-------|
| Decision | Store staff_code value as plain text, not hashed |
| Rationale | Staff code is shared login code, not individual password; simpler verification |
| Alternatives Considered | Hash staff_code (more secure but complicates login logic) |
| Trade-offs | Less secure than hashing, but acceptable for shared team code |
| Date | 2026-02-05 |

---

## Summary / Tóm tắt

| ID | Decision | Status |
|----|----------|--------|
| D-001 | Use bcrypt | ✅ Approved |
| D-002 | Use upsert pattern | ✅ Approved |
| D-003 | Separate password utility | ✅ Approved |
| D-004 | Use tsx for seed | ✅ Approved |
| D-005 | Credentials from env vars | ✅ Approved |
| D-006 | Plain text staff_code | ✅ Approved |
