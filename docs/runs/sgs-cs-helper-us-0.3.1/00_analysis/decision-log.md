# Decision Log — US-0.3.1 Create Core Database Schema
# Nhật ký Quyết định — US-0.3.1 Tạo Schema Database Cốt lõi
<!-- Generated: 2026-02-05 -->

---

## Decisions Made / Quyết định Đã đưa ra

### D-001: Follow Tech Stack Instructions Schema Exactly

| Aspect | Detail |
|--------|--------|
| Decision | Use exact schema from `docs/tech-stack/sgs-cs-helper/instructions.md` |
| Alternatives | Design custom schema, Use different field names |
| Rationale | Tech Stack Instructions is the authoritative source, ensures consistency |
| Impact | Schema matches documentation, no surprises for future development |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

### D-002: Use OrderStatus Enum Instead of String

| Aspect | Detail |
|--------|--------|
| Decision | Change `Order.status` from `String` to `OrderStatus` enum |
| Alternatives | Keep as String with validation, Use integer codes |
| Rationale | Type safety, IDE autocomplete, database constraint enforcement |
| Impact | Prisma generates typed enums, invalid values rejected at DB level |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

### D-003: Store OVERDUE as Status Value

| Aspect | Detail |
|--------|--------|
| Decision | `OVERDUE` is stored in database, not computed at runtime |
| Alternatives | Compute OVERDUE from requiredDate < now() |
| Rationale | Background job can update status, simpler queries, dashboard filters work |
| Impact | Need periodic job to mark orders as OVERDUE (future story) |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

### D-004: User-Order Relation with Required Foreign Key

| Aspect | Detail |
|--------|--------|
| Decision | `Order.uploadedById` is required (not optional) |
| Alternatives | Make uploadedById optional for anonymous uploads |
| Rationale | Every order must have an uploader for audit trail |
| Impact | Staff users must exist before uploading orders |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

### D-005: Add Three Indexes for Query Performance

| Aspect | Detail |
|--------|--------|
| Decision | Add `@@index` on status, registeredDate, requiredDate |
| Alternatives | No indexes (rely on primary key), Add more indexes |
| Rationale | These are the most common filter/sort fields per dashboard requirements |
| Impact | Faster dashboard queries, slightly slower inserts (acceptable trade-off) |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

### D-006: Optional staffCode on User Model

| Aspect | Detail |
|--------|--------|
| Decision | `User.staffCode` is optional (`String?`) |
| Alternatives | Make required, Store in Config instead |
| Rationale | Only STAFF users use staffCode, ADMIN/SUPER_ADMIN use email auth |
| Impact | Flexible user model supporting multiple auth methods |
| Made By | Phase 0 Analysis |
| Date | 2026-02-05 |

---

## Open Questions Resolved / Câu hỏi Mở Đã giải quyết

| # | Question | Resolution |
|---|----------|------------|
| 1 | Should staffCode be on User model? | ✅ Yes, per tech stack instructions |
| 2 | Is OVERDUE computed or stored? | ✅ Stored (enables background job updates) |
| 3 | Should uploadedById be required? | ✅ Yes (audit trail) |

