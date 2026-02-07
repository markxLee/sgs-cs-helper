# Work Description — US-0.2.4: Admin Credentials Login

## Work type
feature

## Product slug
sgs-cs-helper

## User Story ID
US-0.2.4

## Phase
0.2 (Authentication System)

## Epic
Authentication System

## Problem statement
Enable Admin users to log in using credentials (email/password) instead of Google OAuth, supporting secure, role-based access for admins who do not use Google accounts.

## Acceptance criteria
- Admin can log in with email and password
- Credentials are securely stored and validated
- Only users with ADMIN or SUPER_ADMIN roles can use this method
- Error messages for invalid credentials
- Audit log for login attempts (if required by NFR)

## Non-goals
- Staff login (handled by other US)
- Google OAuth login (handled by US-0.2.3)
- Password reset flows (unless specified)

## Dependencies already satisfied
- US-0.2.2 (Admin invitation) is DONE
