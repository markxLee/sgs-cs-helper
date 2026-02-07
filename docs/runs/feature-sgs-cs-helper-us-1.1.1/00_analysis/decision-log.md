# Decision Log: US-1.1.1 Upload Excel Files UI
<!-- Phase 0: Analysis & Design | Created: 2026-02-07 -->

## Decisions / Quyết định

### D-001: Use Server Action instead of API Route

| Aspect | Detail |
|--------|--------|
| **Decision** | Use Next.js Server Action with FormData for file upload |
| **Alternatives** | API Route (/api/upload), Client-side processing |
| **Rationale** | Server Actions are type-safe, integrated with Next.js, support progressive enhancement, and follow project patterns (see staff.ts) |
| **Trade-offs** | Requires client component for interactivity, but this is acceptable |
| **Status** | ✅ Approved |

---

### D-002: File validation on both client and server

| Aspect | Detail |
|--------|--------|
| **Decision** | Validate file extension client-side, validate MIME + extension + size server-side |
| **Alternatives** | Client-only (insecure), Server-only (poor UX) |
| **Rationale** | Client validation provides instant feedback (good UX), server validation is security boundary (source of truth) |
| **Trade-offs** | Slight code duplication, but necessary for security |
| **Status** | ✅ Approved |

---

### D-003: Use FormData for file transfer

| Aspect | Detail |
|--------|--------|
| **Decision** | Use standard FormData API to send file to Server Action |
| **Alternatives** | Base64 encoding, ArrayBuffer |
| **Rationale** | FormData is standard browser API, works natively with Server Actions, no encoding overhead |
| **Trade-offs** | None significant |
| **Status** | ✅ Approved |

---

### D-004: In-memory file processing (no disk storage)

| Aspect | Detail |
|--------|--------|
| **Decision** | Process file in-memory using Buffer, no temporary disk storage |
| **Alternatives** | Write to /tmp, use blob storage (Vercel Blob) |
| **Rationale** | Files ≤10MB are small enough for in-memory processing; Vercel serverless functions have limited disk; no need for persistence |
| **Trade-offs** | Memory usage during processing, but acceptable for 10MB limit |
| **Status** | ✅ Approved |

---

### D-005: Export interface for parser (US-1.1.2)

| Aspect | Detail |
|--------|--------|
| **Decision** | Export `UploadResult` interface that parser will consume |
| **Alternatives** | Direct coupling, shared types package |
| **Rationale** | Clean separation between upload and parse steps; US-1.1.2 will implement parsing logic |
| **Trade-offs** | Interface may evolve, but this is expected |
| **Status** | ✅ Approved |

---

### D-006: Auth check in layout (not page)

| Aspect | Detail |
|--------|--------|
| **Decision** | Put auth/permission check in `layout.tsx`, not `page.tsx` |
| **Alternatives** | Check in page, use middleware |
| **Rationale** | Layout runs before page, prevents unauthorized page render; follows existing pattern (admin/layout.tsx) |
| **Trade-offs** | Layout can't be bypassed for this route |
| **Status** | ✅ Approved |

---

### D-007: ADMIN/SUPER_ADMIN have full upload access

| Aspect | Detail |
|--------|--------|
| **Decision** | ADMIN and SUPER_ADMIN can always upload, regardless of canUpload field |
| **Alternatives** | Check canUpload for all roles |
| **Rationale** | Admin roles should have full system access; canUpload is specifically for STAFF granular control |
| **Trade-offs** | Slightly more complex permission logic |
| **Status** | ✅ Approved (per user request) |

---

## Open Items / Mục Mở

| ID | Item | Status | Notes |
|----|------|--------|-------|
| O-001 | Excel parser interface | Pending US-1.1.2 | Will be consumed by parser |
| O-002 | Toast notification library | TBD | May use sonner or react-hot-toast |

---

## Change Log / Lịch sử Thay đổi

| Date | Change | Author |
|------|--------|--------|
| 2026-02-07 | Initial decisions documented | Copilot |
