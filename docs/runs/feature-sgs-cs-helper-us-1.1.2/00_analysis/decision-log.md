# Decision Log: US-1.1.2 Parse Excel and Extract Order Data
<!-- Phase 0 | Generated: 2026-02-07 -->

## Decisions / Quyết định

### D-001: Client-side Excel Parsing

| Aspect | Value |
|--------|-------|
| Decision | Parse Excel files in browser using xlsx.js |
| Status | ✅ Approved (from Flow 1) |
| Date | 2026-02-07 |
| Rationale | Vercel deployment has bandwidth limits; client-side parsing avoids file upload overhead |
| Alternatives Considered | Server-side parsing (rejected: bandwidth), Hybrid (rejected: complexity) |
| Impact | No file upload to server; trust client data |

---

### D-002: Preview Before Submit

| Aspect | Value |
|--------|-------|
| Decision | Show parsed data in preview UI before database submission |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | Users can verify extracted data is correct; catch parsing errors early |
| Alternatives Considered | Direct submit (rejected: no verification), Modal confirm (rejected: less visible) |
| Impact | Additional UI component; better UX |

---

### D-003: Server-side Zod Validation

| Aspect | Value |
|--------|-------|
| Decision | Validate submitted JSON with Zod schema on server |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | Defense in depth; even trusted client data should be validated |
| Alternatives Considered | Client-only validation (rejected: security) |
| Impact | Consistent with existing actions (staff.ts pattern) |

---

### D-004: Separate Parser Module

| Aspect | Value |
|--------|-------|
| Decision | Create dedicated `src/lib/excel/parser.ts` module |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | Reusable for future batch processing; testable in isolation |
| Alternatives Considered | Inline in component (rejected: not reusable) |
| Impact | Clean separation of concerns |

---

### D-005: Keep Existing Upload Validation

| Aspect | Value |
|--------|-------|
| Decision | Continue using `validation.ts` for file type/size checks |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | Still useful to reject invalid files before attempting parse |
| Alternatives Considered | Remove (rejected: still needed) |
| Impact | First-line defense before parsing |

---

### D-006: receivedDate as Required Field

| Aspect | Value |
|--------|-------|
| Decision | `receivedDate` is a required field in both client form and server validation |
| Status | ✅ Approved (from Flow 1) |
| Date | 2026-02-07 |
| Rationale | Critical for processing time calculation; business requirement |
| Alternatives Considered | Optional (rejected: business need) |
| Impact | Form validation; cannot submit without receivedDate |

---

### D-007: Excel Date Serial Conversion

| Aspect | Value |
|--------|-------|
| Decision | Use dedicated utility to convert Excel serial numbers to JavaScript Dates |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | xlsx.js returns date serials; need proper conversion with timezone handling |
| Alternatives Considered | Use xlsx built-in (limited), moment.js (heavy) |
| Impact | Dedicated `date-utils.ts` module |

---

### D-008: Multi-file Parallel Parsing

| Aspect | Value |
|--------|-------|
| Decision | Support multiple file selection and parse all files in parallel using Promise.all |
| Status | ✅ Approved |
| Date | 2026-02-07 |
| Rationale | Keep consistent UX with US-1.1.1 multiple file upload; batch processing is more efficient |
| Alternatives Considered | Single file only (rejected: poor UX), Sequential parsing (rejected: slower) |
| Impact | Parser returns array; Preview shows list; Server action handles batch insert |

---

## Pending Decisions / Quyết định Chờ xử lý

None at this phase.

---

## Decision History / Lịch sử Quyết định

| Date | Decision | By |
|------|----------|-----|
| 2026-02-07 | D-001 through D-007 approved | Flow 1 → Flow 2 handoff |

---

**Created:** 2026-02-07
