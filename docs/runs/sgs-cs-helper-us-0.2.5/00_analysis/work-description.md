# Work Description: US-0.2.5 — Staff Shared Code Login
<!-- Created: 2026-02-06 | Product: sgs-cs-helper -->

## Overview

| Field | Value |
|-------|-------|
| **User Story ID** | US-0.2.5 |
| **Title** | Staff Shared Code Login |
| **Phase** | 0 (Foundation) |
| **Epic** | 0.2 Authentication System |
| **Work Type** | feature |
| **Status** | Ready for Review |

---

## Problem Statement

Staff members need a quick way to access the order tracking dashboard without individual accounts. A shared team code provides simple authentication while maintaining minimal security.

---

## Acceptance Criteria

- [ ] AC1: Simple code input field exists on login page
- [ ] AC2: Correct code grants access with STAFF role
- [ ] AC3: Incorrect code shows error message
- [ ] AC4: Staff session is created (can be anonymous/shared user)
- [ ] AC5: Staff can access dashboard after login

---

## Non-Goals

- Individual staff accounts
- Staff user management
- Staff activity tracking per person
- Password reset for staff

---

## Dependencies

| Dependency | Status |
|------------|--------|
| US-0.2.1 — Super Admin Seeded Login | ✅ Done (login page exists) |
| US-0.3.1 — Core Database Schema | ✅ Done (Config model for staff_code) |
| US-0.3.2 — Seed Initial Data | ✅ Done (staff_code seeded in Config) |

---

## Affected Roots

| Root | Impact |
|------|--------|
| sgs-cs-helper | Primary - Next.js app with authentication logic |

---

## Scope Boundaries

- **In Scope**: Simple code input on existing login page, validation against Config table
- **Out of Scope**: Individual staff accounts, password management, activity tracking

---

## Success Criteria

- Staff can log in with shared code
- Access granted to dashboard
- Error handling for invalid codes
- Session management works correctly

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Shared code security | Medium | Short-lived sessions, no sensitive data access |
| Code exposure | Low | Config-based, can be changed easily |

---

## Notes

- Login page already exists from US-0.2.1
- Staff code stored in Config table (key: 'staff_code')
- Use NextAuth.js Credentials provider for STAFF role
- Anonymous/shared user session (no individual user record needed)
