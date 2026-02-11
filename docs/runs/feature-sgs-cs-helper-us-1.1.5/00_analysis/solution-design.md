# Analysis & Solution Design — Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample
<!-- US-1.1.5 | Created: 2026-02-11 | Revised: 2026-02-11 | Contract: v1.0 -->

---

## TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample |
| Status | Approved (Revised) |
| Affected Roots | sgs-cs-hepper |
| Complexity | Medium-High |
| Estimated Effort | 2-3 days |

---

## 1. Problem Statement

### Current Behavior

🇻🇳 Hiện tại khi upload file Excel, system chỉ parse dữ liệu order (rows 0-3) nhưng không đọc dữ liệu "Phiếu yêu cầu test" từ row 10+. Field `Order.sampleCount` có default=1 và không được cập nhật với số sample thực tế. Không có bảng lưu chi tiết từng sample. Màn hình Orders table không hiển thị tổng số sample.

🇬🇧 Currently when uploading Excel files, the system only parses order data (rows 0-3) but doesn't read "Test Request" data from row 10+. The `Order.sampleCount` field has default=1 and is not updated with actual sample count. There is no table to store individual sample details. The Orders table doesn't display total samples.

### Desired Behavior

🇻🇳 Khi upload Excel, system parse rows 10+ với đầy đủ 9 cột, lưu từng sample vào bảng `OrderSample` mới. Tổng sample tính từ max `.NNN` suffix, lưu vào `Order.sampleCount`. Cả 2 tab hiển thị cột "Total Samples". Upload lại thì thay thế toàn bộ samples.

🇬🇧 When uploading Excel, system parses rows 10+ with all 9 columns, stores each sample in a new `OrderSample` table. Total calculated from max `.NNN` suffix, stored in `Order.sampleCount`. Both tabs display "Total Samples" column. Re-upload replaces all samples.

---

## 2. Affected Areas

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | `prisma/schema.prisma` | Add OrderSample model + relation to Order |
| sgs-cs-hepper | `src/lib/excel/types.ts` | Add ParsedSample, update ParsedOrder & CreateOrderInput |
| sgs-cs-hepper | `src/lib/excel/parser.ts` | Add sample parsing logic for rows 10+ (9 columns) |
| sgs-cs-hepper | `src/lib/actions/order.ts` | Add sample upsert in transaction |
| sgs-cs-hepper | `src/components/orders/orders-table.tsx` | Add Total Samples column |
| sgs-cs-hepper | `src/components/orders/completed-orders-table.tsx` | Add Total Samples column |

---

## 3. Solution Design

### Chosen Approach: OrderSample Table + sampleCount Denormalized Field

🇻🇳 Tạo bảng `OrderSample` mới để lưu chi tiết từng sample row (9 cột từ Excel). Giữ field `Order.sampleCount` làm denormalized count để UI đọc nhanh. Khi upload: parse tất cả rows 10+, tính max `.NNN`, lưu samples + cập nhật sampleCount trong cùng transaction.

🇬🇧 Create new `OrderSample` table to store individual sample row details (9 columns from Excel). Keep `Order.sampleCount` as denormalized count for fast UI reads. On upload: parse all rows 10+, calculate max `.NNN`, store samples + update sampleCount in same transaction.

### Data Model

```prisma
model OrderSample {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  section      String?  // Column A
  sampleId     String   // Column B - e.g., "XXXX.001"
  description  String?  // Column C
  analyte      String?  // Column D
  method       String?  // Column E
  lod          String?  // Column F
  loq          String?  // Column G
  unit         String?  // Column H
  requiredDate String?  // Column I (stored as string from Excel)

  createdAt    DateTime @default(now())

  @@index([orderId])
}
```

Order model updated with relation:
```prisma
model Order {
  // ... existing fields ...
  samples      OrderSample[]
}
```

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Excel File Upload                      │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   parseExcelFile()                        │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │ Parse Rows 0-3      │  │ Parse Rows 10+             │ │
│  │ Order Metadata      │  │ 9 columns per row          │ │
│  │ (existing logic)    │  │ → ParsedSample[]           │ │
│  └─────────┬───────────┘  │ → sampleCount = max .NNN   │ │
│            │              └──────────┬─────────────────┘ │
│            └──────┬──────────────────┘                    │
│                   ▼                                       │
│        ParsedOrder { samples[], sampleCount }             │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│               createOrders() Server Action                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Transaction:                                         │ │
│  │ 1. Upsert Order (metadata + sampleCount)            │ │
│  │ 2. Delete existing OrderSamples (if re-upload)      │ │
│  │ 3. CreateMany new OrderSamples                      │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    Database                               │
│  ┌──────────┐     ┌───────────────┐                      │
│  │  Order    │──1:N──│ OrderSample │                      │
│  │sampleCount│     │ 9 columns    │                      │
│  └──────────┘     └───────────────┘                      │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Orders Tables (Both Tabs)                    │
│  Job# | Reg Date | ... | Priority | Total Samples | ...  │
└──────────────────────────────────────────────────────────┘
```

### Sequence Diagram

```
User → Parser: Upload Excel file
Parser → Parser: Parse rows 0-3 (metadata)
Parser → Parser: Parse rows 10+ (9 columns per row, skip empty)
Parser → Parser: Calculate sampleCount = max .NNN suffix
Parser → Action: ParsedOrder { ...metadata, samples[], sampleCount }
Action → DB: BEGIN TRANSACTION
Action → DB: Upsert Order (with sampleCount)
Action → DB: DELETE FROM OrderSample WHERE orderId = ?
Action → DB: INSERT INTO OrderSample (batch createMany)
Action → DB: COMMIT
DB → UI: Query orders with sampleCount
UI → User: Display "Total Samples" column in both tabs
```

---

## 4. Upsert Strategy (D4)

🇻🇳 Khi upload lại cùng order (cùng jobNumber):
1. So sánh order metadata (7 fields) — nếu khác thì update order
2. **Luôn** delete toàn bộ OrderSample cũ + tạo mới từ Excel mới
3. Cập nhật sampleCount từ data mới
4. Tất cả trong 1 transaction

🇬🇧 When re-uploading same order (same jobNumber):
1. Compare order metadata (7 fields) — update if different
2. **Always** delete all existing OrderSamples + create new from new Excel
3. Update sampleCount from new data
4. All in 1 transaction

Rationale: Delete+recreate is simpler and safer than diffing individual sample rows.

---

## 5. Excel Column Mapping (Rows 10+)

| Column | Index | Field | Type | Required |
|--------|-------|-------|------|----------|
| A | 0 | section | String? | No |
| B | 1 | sampleId | String | Yes (skip row if empty) |
| C | 2 | description | String? | No |
| D | 3 | analyte | String? | No |
| E | 4 | method | String? | No |
| F | 5 | lod | String? | No |
| G | 6 | loq | String? | No |
| H | 7 | unit | String? | No |
| I | 8 | requiredDate | String? | No |

**Row validity rule:** A row is valid if column B (Sample ID) is not empty.

**sampleCount calculation:** Extract numeric suffix from Sample ID format `XXXX.NNN`, take the max NNN value across all samples for this order.

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sample ID format inconsistency | Medium | Low | Store raw string, regex fallback to count |
| Large Excel files (>1000 samples) | Low | Medium | Batch createMany, transaction timeout config |
| Migration on existing data | Low | Low | No existing OrderSample data to migrate |
| Existing orders have sampleCount=1 | High | Low | Acceptable — only new uploads get real count |

---

## 7. Decision Log Reference

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Use OrderSample table (revised from sampleCount-only) | AC3 requires storing samples, enables future features |
| D2 | Parse all 9 columns (A-I) | AC1 explicitly requires all columns |
| D3 | Total Samples column after Priority, before Progress | Logical UI grouping |
| D4 | Delete+recreate samples on re-upload | Simpler than diffing, atomic in transaction |

→ Full decision log: [decision-log.md](./decision-log.md)

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Author | AI Assistant | ✅ Done | 2026-02-11 |
| Reviewer | User | ✅ Approved (Revised) | 2026-02-11 |
