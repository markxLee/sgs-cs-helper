# Work Description: US-0.2.2 — Super Admin Dashboard & Admin Invitation
<!-- Generated: 2026-02-05 | Branch: feature/sgs-cs-helper-us-0.2.2 -->

---

## Work Type

**FEATURE**

---

## Summary

| Field | Value |
|-------|-------|
| User Story ID | US-0.2.2 |
| Title | Super Admin Dashboard & Admin Invitation |
| Phase | Phase 0: Foundation |
| Epic | Epic 0.2: Authentication System |
| Product Slug | sgs-cs-helper |
| Branch | `feature/sgs-cs-helper-us-0.2.2` |

---

## Problem Statement

As a Super Admin, I need a dashboard to manage Admin users by inviting them via email. Currently, there is no way for Super Admin to grant Admin access to other users. This story creates the Admin invitation system that enables two subsequent login methods:
- US-0.2.3: Admin Google OAuth Login (for Gmail users)
- US-0.2.4: Admin Credentials Login (email/password)

---

## Goals

1. Create Super Admin dashboard at `/admin/users`
2. Implement "Invite Admin" form with email input
3. Allow Super Admin to choose auth method: Google OAuth or Email/Password
4. If Email/Password, allow Super Admin to create initial password
5. Store invited Admin in database with role and auth method
6. Display list of all invited/active Admin users
7. Allow Super Admin to revoke/delete Admin access

---

## Non-Goals

- Admin login functionality (handled by US-0.2.3 and US-0.2.4)
- Staff login (handled by US-0.2.5)
- Role-based route protection middleware (handled by US-0.2.6)
- Admin self-registration
- Password reset for Admin (future enhancement)
- Email notification to invited Admin (future enhancement)

---

## Scope Boundaries

**In Scope:**
- Super Admin dashboard UI (`/admin/users`)
- Invite Admin form (email + auth method + optional password)
- Database storage for invited Admins
- Admin list view with status (pending/active)
- Delete/revoke Admin functionality
- Email validation

**Out of Scope:**
- Admin login flows (separate US)
- Email invitations/notifications
- Bulk import of Admins
- Admin profile editing

---

## Key User Flows

### Flow 1: Invite Admin with Google OAuth
1. Super Admin logs in
2. Navigates to `/admin/users`
3. Clicks "Invite Admin"
4. Enters Admin email (must be Gmail)
5. Selects "Google OAuth" as auth method
6. Clicks "Invite"
7. Admin record created with `pending` status
8. Admin appears in list

### Flow 2: Invite Admin with Email/Password
1. Super Admin logs in
2. Navigates to `/admin/users`
3. Clicks "Invite Admin"
4. Enters Admin email
5. Selects "Email/Password" as auth method
6. Enters initial password for Admin
7. Clicks "Invite"
8. Admin record created with hashed password and `pending` status
9. Admin appears in list

### Flow 3: Revoke Admin Access
1. Super Admin views Admin list
2. Clicks "Revoke" on an Admin
3. Confirmation dialog appears
4. Super Admin confirms
5. Admin record deleted or marked inactive
6. Admin can no longer log in

---

## Acceptance Criteria

- [ ] **AC1:** Super Admin dashboard exists at `/admin/users`
- [ ] **AC2:** "Invite Admin" form with email input field
- [ ] **AC3:** Super Admin can choose auth method: "Google OAuth" or "Email/Password"
- [ ] **AC4:** If "Email/Password" chosen, Super Admin creates initial password for Admin
- [ ] **AC5:** Invited Admin is stored in database with `ADMIN` role and `pending` status
- [ ] **AC6:** Super Admin can see list of all invited/active Admin users
- [ ] **AC7:** Super Admin can revoke/delete Admin access
- [ ] **AC8:** Email validation ensures valid email format

---

## Affected Roots

| Root | Impact |
|------|--------|
| sgs-cs-hepper | Primary - All code changes |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| US-0.2.1 Super Admin Login | ✅ DONE | Super Admin can log in |
| US-0.3.1 Core Database Schema | ✅ DONE | User model exists |

---

## Technical Notes

### Database Schema Changes
User model needs additional fields:
- `authMethod`: enum `GOOGLE` | `CREDENTIALS` (default: `CREDENTIALS`)
- `status`: enum `PENDING` | `ACTIVE` (default: `PENDING`)
- `password`: nullable (only for CREDENTIALS auth)

### UI Components
- `/admin/users` page (Server Component)
- `InviteAdminForm` component
- `AdminList` component
- `AdminListItem` with revoke action

### Server Actions
- `inviteAdmin(email, authMethod, password?)` - Create Admin record
- `revokeAdmin(userId)` - Delete/deactivate Admin
- `getAdmins()` - List all Admins

---

## Open Questions

1. **Soft delete vs hard delete**: Should revoking Admin soft-delete (mark inactive) or hard-delete?
   - Recommendation: Soft delete with `status: REVOKED` for audit trail

2. **Password requirements**: Minimum password requirements for Admin?
   - Recommendation: Same as Super Admin (min 8 chars for MVP)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Super Admin accidentally deletes themselves | Prevent self-deletion in backend |
| Duplicate email invitations | Unique constraint on email |
| XSS in Admin list | Sanitize all displayed data |

---

## Related User Stories

| US ID | Title | Relationship |
|-------|-------|--------------|
| US-0.2.3 | Admin Google OAuth Login | Depends on this US |
| US-0.2.4 | Admin Credentials Login | Depends on this US |

