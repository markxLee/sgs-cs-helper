# Decision Log — US-1.1.3: Store Order with Upsert by Job Number
<!-- Created: 2026-02-09 -->

---

## Summary / Tóm tắt

| ID | Date | Decision | Rationale |
|----|------|----------|-----------|
| D1 | 2026-02-09 | findUnique + compare over Prisma upsert | Need 3-way categorization |
| D2 | 2026-02-09 | `findFirst` with `mode: "insensitive"` | Case-insensitive jobNumber matching |
| D3 | 2026-02-09 | `prisma.$transaction()` for batch | Data integrity (AC9) |
| D4 | 2026-02-09 | Compare 7 fields only | Only fields from CreateOrderInput |
| D5 | 2026-02-09 | `unchanged` as separate result array | Clear 3-way reporting for users |

---

## D1: findUnique + Compare vs Prisma upsert

🇻🇳
**Bối cảnh:** Prisma có `upsert()` native nhưng không phân biệt giữa create vs update.
**Các lựa chọn:**
- (A) `prisma.order.upsert()` — simple, nhưng không biết create hay update, luôn ghi kể cả data giống
- (B) `findUnique` → compare → create/update — đầy đủ 3 loại, chỉ ghi khi cần
- (C) Raw SQL `INSERT ON CONFLICT` — performance tốt nhưng mất type safety

**Quyết định:** Option B
**Lý do:** AC4 yêu cầu báo "X created, Y updated, Z unchanged" — chỉ Option B đáp ứng. Performance chấp nhận được (< 100 orders/batch).

🇬🇧
**Context:** Prisma has native `upsert()` but doesn't distinguish create vs update.
**Options:**
- (A) `prisma.order.upsert()` — simple, but can't tell create vs update, always writes even when data is same
- (B) `findUnique` → compare → create/update — full 3-way categorization, only writes when needed
- (C) Raw SQL `INSERT ON CONFLICT` — best performance but loses type safety

**Decision:** Option B
**Rationale:** AC4 requires reporting "X created, Y updated, Z unchanged" — only Option B supports this. Performance is acceptable (< 100 orders/batch).

---

## D2: Case-insensitive Matching via `findFirst`

🇻🇳
**Bối cảnh:** AC1 yêu cầu case-insensitive matching. `findUnique` không hỗ trợ `mode: "insensitive"` trực tiếp.
**Các lựa chọn:**
- (A) `.toUpperCase()` trước khi query `findUnique` — nhưng DB lưu giá trị gốc, nên so sánh string sẽ fail
- (B) `findFirst` với `where: { jobNumber: { equals: input, mode: "insensitive" } }` — Prisma hỗ trợ native trên PostgreSQL
- (C) Raw SQL `ILIKE` — mất type safety

**Quyết định:** Option B — `findFirst` with `mode: "insensitive"`
**Lý do:** Native Prisma support, type safe, PostgreSQL CITEXT-like behavior.

🇬🇧
**Context:** AC1 requires case-insensitive matching. `findUnique` doesn't support `mode: "insensitive"` directly.
**Options:**
- (A) `.toUpperCase()` before `findUnique` query — but DB stores original value, so string comparison would fail
- (B) `findFirst` with `where: { jobNumber: { equals: input, mode: "insensitive" } }` — native Prisma support on PostgreSQL
- (C) Raw SQL `ILIKE` — loses type safety

**Decision:** Option B — `findFirst` with `mode: "insensitive"`
**Rationale:** Native Prisma support, type safe, PostgreSQL CITEXT-like behavior.

---

## D3: `prisma.$transaction()` for Batch Operations

🇻🇳
**Bối cảnh:** Hiện tại `createOrders` xử lý từng order riêng lẻ — nếu server crash giữa chừng, một số order đã create, một số chưa.
**Quyết định:** Wrap toàn bộ batch trong `prisma.$transaction()` interactive transaction.
**Lý do:** AC9 yêu cầu data integrity. Transaction đảm bảo all-or-nothing cho batch.
**Timeout:** Mặc định 5s, có thể tăng nếu cần: `$transaction(fn, { timeout: 10000 })`.

🇬🇧
**Context:** Currently `createOrders` processes each order individually — if server crashes mid-batch, some orders are created, some aren't.
**Decision:** Wrap entire batch in `prisma.$transaction()` interactive transaction.
**Rationale:** AC9 requires data integrity. Transaction ensures all-or-nothing for batch.
**Timeout:** Default 5s, can increase if needed: `$transaction(fn, { timeout: 10000 })`.

---

## D4: Compare 7 Fields Only

🇻🇳
**Bối cảnh:** Order model có 15+ fields, nhưng chỉ một số fields đến từ Excel upload.
**Quyết định:** So sánh chỉ 7 fields có trong `CreateOrderInput`: registeredDate, receivedDate, requiredDate, priority, registeredBy, checkedBy, note.
**Loại trừ:**
- `status` — preserved on update (AC6)
- `completedAt` — preserved
- `sampleCount`, `description` — không có trong CreateOrderInput
- `id`, `createdAt`, `updatedAt` — system fields
- `uploadedAt`, `uploadedById`, `sourceFileName` — always updated on re-upload (metadata, not data comparison)

🇬🇧
**Context:** Order model has 15+ fields, but only some come from Excel upload.
**Decision:** Compare only 7 fields present in `CreateOrderInput`: registeredDate, receivedDate, requiredDate, priority, registeredBy, checkedBy, note.
**Excluded:**
- `status` — preserved on update (AC6)
- `completedAt` — preserved
- `sampleCount`, `description` — not in CreateOrderInput
- `id`, `createdAt`, `updatedAt` — system fields
- `uploadedAt`, `uploadedById`, `sourceFileName` — always updated on re-upload (metadata, not data comparison)

---

## D5: `unchanged` as Separate Result Array

🇻🇳
**Bối cảnh:** Cần quyết định cách report đơn hàng không thay đổi — merge vào `created`? Vào `failed`? Hay mảng riêng?
**Quyết định:** Mảng riêng `unchanged: UnchangedOrder[]` với `{ id, jobNumber }`.
**Lý do:** User cần biết chính xác: bao nhiêu đơn mới, bao nhiêu đã update, bao nhiêu không đổi. Merge vào category khác sẽ gây nhầm lẫn (AC4).

🇬🇧
**Context:** Need to decide how to report unchanged orders — merge into `created`? Into `failed`? Or separate array?
**Decision:** Separate array `unchanged: UnchangedOrder[]` with `{ id, jobNumber }`.
**Rationale:** Users need to know exactly: how many new, how many updated, how many unchanged. Merging into another category would cause confusion (AC4).
