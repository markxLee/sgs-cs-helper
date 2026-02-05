# Work Description — US-0.2.1 Super Admin Seeded Login

> Captured from Flow 1 (roadmap-to-delivery) handoff

---

## Overview

| Field | Value |
|-------|-------|
| User Story ID | US-0.2.1 |
| Title | Super Admin Seeded Login |
| Work Type | FEATURE |
| Phase | 0: Foundation |
| Epic | 0.2: Authentication System |
| Product Slug | sgs-cs-helper |
| Branch | feature/sgs-cs-helper-us-0.2.1 |

---

## Problem Statement

Super Admin cần có khả năng đăng nhập vào hệ thống bằng email và password đã được seed trong database để có thể quản lý ứng dụng.

As a Super Admin, I can log in with my seeded username and password so that I can access the system and manage it.

---

## Goals

1. Create a login page at `/login`
2. Implement NextAuth.js with Credentials provider
3. Verify Super Admin credentials against seeded user
4. Create and persist user session
5. Redirect to dashboard after successful login

---

## Non-Goals

- ❌ Google OAuth login (US-0.2.2)
- ❌ Staff shared code login (US-0.2.3)
- ❌ Role-based route protection (US-0.2.4)
- ❌ Password reset functionality
- ❌ Remember me / session extension

---

## Acceptance Criteria

- [ ] **AC1:** Login page exists at `/login`
- [ ] **AC2:** Super Admin credentials are seeded during database setup *(already done in US-0.3.2)*
- [ ] **AC3:** Successful login redirects to dashboard
- [ ] **AC4:** Invalid credentials show error message
- [ ] **AC5:** Session is created and persisted
- [ ] **AC6:** Super Admin role is correctly assigned

---

## Key User Flows

### Flow 1: Successful Login
1. User navigates to `/login`
2. User enters email and password
3. System verifies credentials against database
4. System creates session
5. User is redirected to `/dashboard`

### Flow 2: Failed Login
1. User navigates to `/login`
2. User enters invalid credentials
3. System shows error message
4. User remains on login page

---

## Affected Roots

| Root | Impact |
|------|--------|
| sgs-cs-hepper | New pages, API routes, auth config |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| US-0.1.1 — Project Structure | ✅ DONE | Next.js initialized |
| US-0.3.1 — Database Schema | ✅ DONE | User model exists |
| US-0.3.2 — Seed Data | ✅ DONE | Super Admin user seeded with hashed password |

---

## Technical Notes

- Use NextAuth.js (Auth.js v5) for authentication
- Use Credentials provider for email/password login
- Password verification using bcrypt (utility already created in US-0.3.2)
- Session stored in JWT or database (TBD in Phase 0)

---

*Created: 2026-02-05*
