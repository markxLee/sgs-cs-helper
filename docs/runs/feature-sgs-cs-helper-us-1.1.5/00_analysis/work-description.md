# 📋 Work Description / Mô tả Công việc
<!-- US-1.1.5 | Created: 2026-02-11 -->

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.1.5 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Parse Test Request Samples & Display Total Samples |
| Affected Roots | sgs-cs-hepper |
| Base Branch | main |
| Branch | feature/sgs-cs-helper-us-1.1.5 |
| Requestor | User (Flow 1 → US-1.1.5) |
| Sources | User Story US-1.1.5, User feedback on architecture |

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** Staff members currently cannot see the total number of test samples per order. Excel files contain "Phiếu yêu cầu test" data from row 10+ with Sample IDs (format: `XXXX.NNN`), but this data is not parsed during upload. The total sample count needs to be calculated during upload and stored directly on the Order record for efficient display.

**VI:** Hiện tại nhân viên không thể thấy tổng số sample của mỗi order. File Excel chứa dữ liệu "Phiếu yêu cầu test" từ dòng 10+ với Sample ID (format: `XXXX.NNN`), nhưng dữ liệu này chưa được parse khi upload. Cần tính tổng sample khi upload và lưu trực tiếp vào bảng Order để hiển thị hiệu quả.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** During Excel upload, rows from row 10+ are scanned for Sample IDs. The largest `.NNN` suffix determines total samples. This count is stored in `Order.sampleCount` (field already exists, default=1). The Orders table displays a "Total Samples" column on both In Progress and Completed tabs.

**VI:** Khi upload Excel, các dòng từ dòng 10+ được quét để tìm Sample ID. Số `.NNN` lớn nhất xác định tổng sample. Số lượng này được lưu vào `Order.sampleCount` (field đã có sẵn, default=1). Bảng Orders hiển thị cột "Total Samples" ở cả tab In Progress và Completed.

---

## In Scope — Trong Phạm vi

- EN: Parse row 10+ to extract Sample IDs / VI: Parse dòng 10+ để trích xuất Sample ID
- EN: Calculate total from Sample ID `.NNN` suffix / VI: Tính tổng từ suffix `.NNN` của Sample ID
- EN: Store total in existing `Order.sampleCount` field / VI: Lưu tổng vào field `Order.sampleCount` có sẵn
- EN: Display "Total Samples" column on both tabs / VI: Hiển thị cột "Tổng Samples" ở cả 2 tab
- EN: Handle re-upload (update sampleCount on upsert) / VI: Xử lý re-upload (cập nhật sampleCount khi upsert)
- EN: Handle missing samples (sampleCount = 0) / VI: Xử lý không có sample (sampleCount = 0)

## Out of Scope — Ngoài Phạm vi

- EN: No separate `OrderSample` table (simplified approach) / VI: Không tạo bảng `OrderSample` riêng (cách tiếp cận đơn giản hóa)
- EN: No individual sample detail view / VI: Không hiển thị chi tiết từng sample
- EN: No per-sample status tracking / VI: Không theo dõi trạng thái từng sample
- EN: No sample analytics or reporting / VI: Không phân tích hoặc báo cáo sample
- EN: No parsing of other sample columns (Description, Analyte, Method, etc.) / VI: Không parse các cột sample khác

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | `Order.sampleCount` field already exists (Int, default=1). No schema migration needed. |
| Technical / Kỹ thuật | Parser is client-side (xlsx.js). Sample count calculation must happen in parser. |
| Technical / Kỹ thuật | Sample ID format: `XXXX.NNN` — `.NNN` suffix is the sample number |
| Technical / Kỹ thuật | Batch upload via `submitOrdersInBatches()` → `createOrders()` pipeline |
| Process / Quy trình | Must pass through `ParsedOrder` type → `CreateOrderInput` type → server action |

---

## Assumptions — Giả định

- EN: `Order.sampleCount` default(1) can be changed to default(0) since actual count will be parsed / VI: `Order.sampleCount` default(1) có thể đổi thành default(0) vì số thực tế sẽ được parse
- EN: Sample ID column is column B (index 1) in row 10+ / VI: Cột Sample ID là cột B (index 1) ở dòng 10+
- EN: Sample ID format is consistent: `XXXX.NNN` where NNN is sequential / VI: Format Sample ID nhất quán: `XXXX.NNN` với NNN là số thứ tự
- EN: If no valid Sample IDs found, sampleCount = 0 / VI: Nếu không tìm thấy Sample ID hợp lệ, sampleCount = 0
- EN: No need to store individual sample rows — only the total count matters / VI: Không cần lưu từng dòng sample — chỉ cần tổng số

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information — all requirements are clear from the User Story + user feedback.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: Parse Excel rows from row 10+ to find Sample IDs in column B
- [ ] AC2: Empty rows are skipped (no data in Sample ID column)
- [ ] AC3: Calculate total samples from Sample ID format `XXXX.NNN` — largest NNN = total
- [ ] AC4: Store total in `Order.sampleCount` during upload (no separate table)
- [ ] AC5: Display "Total Samples" column in Orders table (In Progress tab)
- [ ] AC6: Display "Total Samples" column in Completed Orders table (Completed tab)
- [ ] AC7: On re-upload of same order, sampleCount is updated
- [ ] AC8: If no samples found (row 10+ empty or no valid IDs), sampleCount = 0

---

## Architecture Decision / Quyết định Kiến trúc

**Original US-1.1.5 spec:** Create new `OrderSample` table, store individual sample rows.

**Revised approach (user decision):** Calculate total during upload, store directly in `Order.sampleCount`. No new table needed.

**Rationale:** 
- Simpler — no schema migration, no new model
- More performant — no JOIN needed to display count
- `sampleCount` field already exists on Order model
- Individual sample details are not needed for the current use case
