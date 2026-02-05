# Decision Log — US-0.2.1 Super Admin Seeded Login

> Key decisions and rationale for Phase 0 Analysis

---

## D-001: Authentication Framework

| Aspect | Value |
|--------|-------|
| Decision | Use NextAuth.js v5 (Auth.js) |
| Date | 2026-02-05 |
| Status | ✅ Accepted |

### Context
Need to implement authentication for Super Admin login.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **NextAuth.js v5** | Official, well-maintained, built-in security | Setup required |
| Custom JWT | Full control | Security risks, more code |
| Lucia Auth | Lightweight | Less ecosystem |

### Rationale
NextAuth.js is the de-facto standard for Next.js authentication. Version 5 (Auth.js) is designed for Next.js App Router and provides built-in CSRF protection, session management, and type safety.

---

## D-002: Session Strategy

| Aspect | Value |
|--------|-------|
| Decision | JWT session strategy |
| Date | 2026-02-05 |
| Status | ✅ Accepted |

### Context
Need to choose between JWT and Database sessions for NextAuth.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **JWT** | Stateless, scalable, no DB hit | Token size, can't invalidate |
| Database | Can invalidate, audit | DB query per request |

### Rationale
For a simple internal tool with limited users, JWT is sufficient. Database sessions add complexity without significant benefit. JWT keeps the architecture simple and scalable.

---

## D-003: Login Form Architecture

| Aspect | Value |
|--------|-------|
| Decision | Client Component for form, Server Component for page |
| Date | 2026-02-05 |
| Status | ✅ Accepted |

### Context
Next.js App Router defaults to Server Components. Login form needs interactivity.

### Rationale
- Page wrapper as Server Component for optimal performance
- Form as Client Component for state management (loading, errors)
- Follows Next.js best practices for hybrid rendering

---

## D-004: Error Message Strategy

| Aspect | Value |
|--------|-------|
| Decision | Generic "Invalid credentials" for all auth failures |
| Date | 2026-02-05 |
| Status | ✅ Accepted |

### Context
Need to decide error messaging for failed login attempts.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Specific errors | Better UX | User enumeration attack |
| **Generic errors** | Security | Less helpful for debugging |

### Rationale
Security best practice - never reveal whether an email exists in the system. "Invalid credentials" for both wrong email and wrong password.

---

## D-005: Dashboard Scope

| Aspect | Value |
|--------|-------|
| Decision | Placeholder dashboard only |
| Date | 2026-02-05 |
| Status | ✅ Accepted |

### Context
AC3 requires redirect to dashboard after login. Dashboard features are in later user stories.

### Rationale
- US-0.2.1 scope is login only
- Dashboard features (orders, settings) in future US
- Simple placeholder with welcome message and logout button

---

*Last Updated: 2026-02-05*
