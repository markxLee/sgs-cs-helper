# Decision Log: US-0.2.5 — Staff Code Login (REVISED)

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1 | 2026-02-06 | Original: Anonymous shared code |
| 2 | 2026-02-06 | **REVISED:** Per-user code with permissions |

---

## Key Decisions / Quyết định Chính

### D-001: Per-User Staff Code (REVISED)
**Decision:** Each staff user has their own unique code stored in User.staffCode field.

**Rationale:**
- Individual accountability and audit trail
- Enables per-user permissions
- Actions traceable to specific staff
- Admin can revoke individual access

**Alternatives Considered:**
- Shared code for all staff (original approach) - rejected: no tracking, no permissions

**Impact:** Requires User.staffCode to be unique, staff management UI (future).

### D-002: Permission Fields on User Model
**Decision:** Add `canUpload` and `canUpdateStatus` boolean fields directly to User model.

**Rationale:**
- Simple and clear - only 2 permissions needed
- Fast database queries
- Easy to extend later if needed
- Default both to true for backward compatibility

**Alternatives Considered:**
- Permission groups/roles table - overkill for 2 permissions
- JSON field for flexible permissions - harder to query

**Impact:** Schema migration required, session extended with permissions.

### D-003: Individual Staff Sessions (REVISED)
**Decision:** Staff authentication creates individual sessions with their User record.

**Rationale:**
- Matches per-user code approach
- Enables permission checking per user
- Actions attributable to specific staff
- Session contains user ID for audit

**Alternatives Considered:**
- Anonymous sessions (original) - rejected: can't track actions

**Impact:** Session contains full user info including permissions.

### D-004: Login Type Selection with Radio Buttons
**Decision:** Use radio buttons in the login form to choose between "Admin/Super Admin" and "Staff Quick Code" login types.

**Rationale:**
- Simple and clear UX
- Fits existing form layout
- Accessible (proper labels)
- Quick toggle between methods

**Alternatives Considered:**
- Separate login pages - too complex
- Tabs - similar but radio is simpler

**Impact:** Minimal UI changes, maintains single login page.

### D-005: Permissions in JWT Session
**Decision:** Include `canUpload` and `canUpdateStatus` in JWT token for client-side access control.

**Rationale:**
- Fast permission checks without DB query
- Consistent across server and client components
- JWT refreshed on session update

**Alternatives Considered:**
- Query DB on each protected action - slow
- Separate permission API - over-engineered

**Impact:** Extend NextAuth types, update JWT callback.

### D-006: Generic Error Messages
**Decision:** Use generic error messages for authentication failures.

**Rationale:**
- Security best practice (no information leakage)
- Consistent with existing error handling
- Prevents user enumeration

**Impact:** Same UX pattern as Super Admin login.
