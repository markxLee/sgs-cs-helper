# Decision Log — US-0.2.7 Staff User Management

## Purpose

This log records all significant design decisions made during Phase 0 Analysis for US-0.2.7.

---

## Decision List

### D-001: Reuse Admin Management Pattern

| Aspect | Detail |
|--------|--------|
| **ID** | D-001 |
| **Date** | 2026-02-06 |
| **Decision** | Reuse the existing Admin Management pattern from `/admin/users` (US-0.2.2) |
| **Rationale** | Pattern is proven, well-tested, and familiar to developers. Consistency > reinvention. |
| **Alternatives Considered** | Build from scratch, unified user management page |
| **Rejected Because** | No benefit from deviating; unified page increases complexity |
| **Impact** | High — Affects all components and structure |
| **Status** | ✅ Approved |

---

### D-002: Extend Admin Layout for ADMIN Role

| Aspect | Detail |
|--------|--------|
| **ID** | D-002 |
| **Date** | 2026-02-06 |
| **Decision** | Modify `/admin/layout.tsx` to allow both ADMIN and SUPER_ADMIN roles |
| **Rationale** | AC10 requires both roles to manage staff. Current layout only allows SUPER_ADMIN. |
| **Current Code** | `if (session.user.role !== "SUPER_ADMIN")` |
| **New Code** | `if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role))` |
| **Risk** | Low — Existing `/admin/users` page already checks SUPER_ADMIN in Server Actions |
| **Mitigation** | Test `/admin/users` after change to ensure it still works |
| **Impact** | Medium — Shared layout change |
| **Status** | ✅ Approved |

---

### D-003: Auto-Generate Staff Codes Only

| Aspect | Detail |
|--------|--------|
| **ID** | D-003 |
| **Date** | 2026-02-06 |
| **Decision** | Staff codes are ALWAYS auto-generated, never manually specified |
| **Rationale** | Security - prevents weak/predictable codes, ensures uniqueness |
| **Alternatives Considered** | Allow manual input with validation |
| **Rejected Because** | Adds complexity, security risk, no benefit |
| **Impact** | Medium — Affects form design and Server Action |
| **Status** | ✅ Approved |

---

### D-004: 6-Character Alphanumeric Codes

| Aspect | Detail |
|--------|--------|
| **ID** | D-004 |
| **Date** | 2026-02-06 |
| **Decision** | Staff codes are 6 characters, uppercase, [A-Z0-9] |
| **Rationale** | 36^6 = 2.1B combinations, low collision rate, easy to communicate |
| **Math** | With 10,000 staff: collision probability < 0.002% |
| **Alternatives Considered** | 4 chars (too few), 8 chars (too long), include lowercase (confusion) |
| **Rejected Because** | 4 chars = high collision, 8 chars = overkill, lowercase = O/0 confusion |
| **Impact** | High — Core algorithm |
| **Status** | ✅ Approved |

---

### D-005: Retry Logic for Collisions

| Aspect | Detail |
|--------|--------|
| **ID** | D-005 |
| **Date** | 2026-02-06 |
| **Decision** | Retry up to 10 times if code collision occurs |
| **Rationale** | With 2.1B combinations, 10 retries = >99.9999% success |
| **Alternatives Considered** | No retry (fail immediately), infinite retry (risky) |
| **Rejected Because** | No retry = poor UX, infinite retry = potential infinite loop |
| **Implementation** | `for (let i = 0; i < 10; i++)` with early return on success |
| **Failure Behavior** | After 10 failures, return error: "Unable to generate code, try again" |
| **Impact** | Medium — Code generation logic |
| **Status** | ✅ Approved |

---

### D-006: Email Optional for Staff

| Aspect | Detail |
|--------|--------|
| **ID** | D-006 |
| **Date** | 2026-02-06 |
| **Decision** | Email is optional for staff users |
| **Rationale** | Staff login with code only, email not needed for authentication |
| **Alternatives Considered** | Require email for all users |
| **Rejected Because** | Unnecessary friction, staff may not have company email |
| **Database** | User.email is already nullable in schema |
| **Validation** | If provided, must be valid email format |
| **Impact** | Low — Form field, validation |
| **Status** | ✅ Approved |

---

### D-007: Permissions Default to True

| Aspect | Detail |
|--------|--------|
| **ID** | D-007 |
| **Date** | 2026-02-06 |
| **Decision** | `canUpload` and `canUpdateStatus` default to `true` |
| **Rationale** | Most staff need both permissions, easier UX to uncheck than check |
| **Database** | Schema default is `false` — overridden in form default |
| **Alternatives Considered** | Default false (more restrictive) |
| **Rejected Because** | Poor UX, most staff need permissions |
| **Impact** | Low — Form default values |
| **Status** | ✅ Approved |

---

### D-008: Regeneration Invalidates Old Code Immediately

| Aspect | Detail |
|--------|--------|
| **ID** | D-008 |
| **Date** | 2026-02-06 |
| **Decision** | When staff code is regenerated, old code becomes invalid immediately |
| **Rationale** | Security - prevents sharing old codes, forces admin to communicate new code |
| **Alternatives Considered** | Grace period (old code works for 1 hour) |
| **Rejected Because** | Adds complexity, security risk, no real benefit |
| **Database** | Single `staffCode` field - updating it invalidates old |
| **UX** | Confirmation dialog warns: "This will invalidate the old code" |
| **Impact** | Medium — Code regeneration flow |
| **Status** | ✅ Approved |

---

### D-009: Case-Insensitive Login, Uppercase Storage

| Aspect | Detail |
|--------|--------|
| **ID** | D-009 |
| **Date** | 2026-02-06 |
| **Decision** | Store codes in UPPERCASE, accept case-insensitive login |
| **Rationale** | Prevents confusion (0 vs O, 1 vs I), easier for staff to type |
| **Storage** | Database: `staffCode = "ABC123"` (uppercase) |
| **Login** | Staff types `abc123` → converted to `ABC123` → lookup succeeds |
| **Alternatives Considered** | Case-sensitive, lowercase storage |
| **Rejected Because** | Case-sensitive = poor UX, lowercase = harder to read |
| **Implementation** | `staffCode.toUpperCase()` before database query |
| **Impact** | Low — Login logic |
| **Status** | ✅ Approved |

---

### D-010: Single Page with Form + List

| Aspect | Detail |
|--------|--------|
| **ID** | D-010 |
| **Date** | 2026-02-06 |
| **Decision** | `/admin/staff` page contains both Create Form and Staff List |
| **Rationale** | Matches Admin Management pattern, single-page workflow |
| **Alternatives Considered** | Separate pages for create vs list |
| **Rejected Because** | Extra navigation, worse UX |
| **Layout** | Form at top, List below (like `/admin/users`) |
| **Impact** | Low — Page structure |
| **Status** | ✅ Approved |

---

## Summary

| Decision | Impact | Confidence |
|----------|--------|------------|
| D-001: Reuse pattern | High | ✅ High |
| D-002: Extend layout | Medium | ✅ High |
| D-003: Auto-generate only | Medium | ✅ High |
| D-004: 6-char codes | High | ✅ High |
| D-005: Retry logic | Medium | ✅ High |
| D-006: Email optional | Low | ✅ High |
| D-007: Permissions default true | Low | ✅ High |
| D-008: Immediate invalidation | Medium | ✅ High |
| D-009: Case-insensitive | Low | ✅ High |
| D-010: Single page | Low | ✅ High |

**Overall Confidence:** ✅ **HIGH** — All decisions well-reasoned with clear rationale.

---

**Created:** 2026-02-06  
**Last Updated:** 2026-02-06
