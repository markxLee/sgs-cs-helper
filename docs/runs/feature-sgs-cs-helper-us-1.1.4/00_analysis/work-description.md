# Work Description — US-1.1.4: Batch Upload Processing
<!-- Created: 2026-02-11 | Work Intake -->

---

## 📋 Work Description / Mô tả Công việc

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Batch Upload Processing — Client-Side Chunking |
| Title (VN) | Xử lý Upload theo Batch — Chia chunk phía Client |
| Affected Roots | sgs-cs-hepper |
| Base Branch | main |
| Requestor | Team (performance improvement request) |
| Sources | Product Backlog US-1.1.4 |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.1.4 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |
| Branch | feature/sgs-cs-helper-us-1.1.4 |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:** When uploading many Excel files at once, the request can timeout because all files are sent in a single request. This causes poor UX and lost work. We need to split uploads into smaller batches to prevent timeouts and improve reliability.

**VI:** Khi upload nhiều file Excel cùng lúc, request có thể bị timeout vì tất cả file được gửi trong một request duy nhất. Điều này gây trải nghiệm kém và mất dữ liệu đã xử lý. Cần chia upload thành các batch nhỏ hơn để tránh timeout và cải thiện độ tin cậy.

---

### Expected Outcome — Kết quả Mong đợi

**EN:** Staff can upload any number of files without timeout. Files are processed in batches of 5, with clear progress indication and aggregated results at the end.

**VI:** Nhân viên có thể upload bao nhiêu file cũng được mà không bị timeout. Các file được xử lý theo batch 5 file, với chỉ báo tiến độ rõ ràng và kết quả tổng hợp ở cuối.

---

### In Scope — Trong Phạm vi

- EN: Client-side file batching (max 5 files per batch) / VI: Chia batch file phía client (tối đa 5 file/batch)
- EN: Sequential batch requests to server / VI: Gửi request tuần tự theo batch
- EN: Batch progress indicator / VI: Chỉ báo tiến độ batch
- EN: Error handling per batch (continue on error) / VI: Xử lý lỗi từng batch (tiếp tục khi lỗi)
- EN: Aggregated summary of all batches / VI: Tổng kết kết quả tất cả batch

### Out of Scope — Ngoài Phạm vi

- EN: Server-side API changes / VI: Thay đổi API phía server
- EN: Parallel batch processing / VI: Xử lý batch song song
- EN: Resume failed uploads / VI: Tiếp tục upload bị lỗi
- EN: Persistent upload queue / VI: Queue upload lưu trữ

---

### Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Client-side only change to UploadArea component |
| Technical / Kỹ thuật | Must use existing upload API endpoint (no changes) |
| Technical / Kỹ thuật | React 19.2.3, Next.js 16.1.6 |
| UX | UI must remain responsive during batch processing |

---

### Assumptions — Giả định

- EN: Existing upload API handles single batch requests correctly / VI: API upload hiện tại xử lý đúng request đơn batch
- EN: Network latency per batch is acceptable (no retry needed initially) / VI: Độ trễ mạng mỗi batch chấp nhận được (chưa cần retry)
- EN: 5 files per batch is optimal balance (can be adjusted later) / VI: 5 file/batch là tối ưu (có thể điều chỉnh sau)

---

### Missing Information — Thông tin Còn thiếu

> ✅ No missing information. All requirements are clear from US-1.1.4.

---

### Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: Client-side batching splits files into chunks of max 5 files each
  - VI: Chia file thành các chunk tối đa 5 file mỗi chunk phía client
- [ ] AC2: Each batch is sent as a separate request to the server
  - VI: Mỗi batch được gửi như một request riêng đến server
- [ ] AC3: Progress shows current batch (e.g., "Processing batch 2/4...")
  - VI: Progress hiển thị batch hiện tại (vd: "Đang xử lý batch 2/4...")
- [ ] AC4: If one batch fails, error is shown but remaining batches continue
  - VI: Nếu một batch lỗi, hiển thị lỗi nhưng các batch còn lại vẫn tiếp tục
- [ ] AC5: Final summary aggregates results from all batches (total created, updated, unchanged)
  - VI: Tổng kết cuối cùng gom kết quả từ tất cả batch
- [ ] AC6: UI remains responsive during batch processing (no blocking)
  - VI: UI vẫn responsive trong khi xử lý batch

---

## Technical Context / Ngữ cảnh Kỹ thuật

### Current Upload Flow
1. User selects files in UploadArea
2. All files sent in single FormData request
3. Server processes all files, returns aggregated result
4. UI shows success/failure

### New Batch Flow
1. User selects files in UploadArea
2. Client splits files into batches of 5
3. For each batch:
   - Send FormData with batch files
   - Show "Processing batch X/Y..."
   - Collect result (created, updated, unchanged, errors)
4. After all batches: Show aggregated summary
5. If any batch failed: Show errors but don't block other batches

### Key File
- `src/components/upload/upload-area.tsx` — Main component to modify
