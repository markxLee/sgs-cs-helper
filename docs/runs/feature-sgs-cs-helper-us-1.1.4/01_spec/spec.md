# Specification: Batch Upload Processing — Client-Side Chunking
# Đặc tả: Xử lý Upload theo Batch — Chia chunk phía Client

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Batch Upload Processing — Client-Side Chunking |
| Phase 0 Analysis | [Link](../00_analysis/solution-design.md) |
| Functional Reqs | 2 |
| Non-Functional Reqs | 5 |
| Affected Roots | sgs-cs-hepper |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt
**EN:** Enhance the UploadArea component to split selected files into batches of up to 5 files, uploading each batch sequentially to prevent timeouts and improve reliability. Show progress and summary, handle errors per batch, and keep the UI responsive.

**VI:** Nâng cấp component UploadArea để chia file thành các batch tối đa 5 file, upload từng batch tuần tự để tránh timeout và tăng độ tin cậy. Hiển thị tiến độ, tổng kết, xử lý lỗi từng batch, UI luôn responsive.

### 1.2 Scope / Phạm vi
**In Scope / Trong phạm vi:**
- Client-side batching (max 5 files/batch)
- Sequential upload requests per batch
- Progress indicator per batch
- Error handling per batch (continue on error)
- Aggregated summary after all batches

**Out of Scope / Ngoài phạm vi:**
- Server-side API changes
- Parallel batch processing
- Retry/resume failed uploads
- Persistent upload queue

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Client-Side File Batching and Upload

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The system must split selected files into batches of up to 5 files and upload each batch sequentially to the server using the existing API endpoint.
- **VI:** Hệ thống phải chia file được chọn thành các batch tối đa 5 file và upload từng batch tuần tự lên server qua API hiện tại.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: Files are split into batches of max 5 files each
- [ ] AC2: Each batch is sent as a separate request to the server
- [ ] AC3: If a batch fails, error is shown but remaining batches continue

---

### FR-002: Batch Progress and Result Summary

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-hepper |

**Description / Mô tả:**
- **EN:** The system must display progress for each batch (e.g., "Processing batch 2/4..."), and after all batches, show an aggregated summary of results (created, updated, unchanged, errors). UI must remain responsive throughout.
- **VI:** Hệ thống phải hiển thị tiến độ từng batch (vd: "Đang xử lý batch 2/4..."), và sau khi xong, tổng hợp kết quả (tạo mới, cập nhật, không đổi, lỗi). UI luôn responsive.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC4: Progress shows current batch (e.g., "Processing batch 2/4...")
- [ ] AC5: Final summary aggregates results from all batches
- [ ] AC6: UI remains responsive during batch processing

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Performance

| Aspect | Detail |
|--------|--------|
| Category | Performance |
| Metric | Each batch upload completes within 10 seconds under normal network conditions |

**Description / Mô tả:**
- **EN:** Batch uploads should not cause noticeable delays or UI freezing.
- **VI:** Upload batch không được gây trễ rõ rệt hoặc đứng UI.

---

### NFR-002: Security

| Aspect | Detail |
|--------|--------|
| Category | Security |
| Metric | No sensitive data exposed in client logs or errors |

**Description / Mô tả:**
- **EN:** Errors and logs must not leak sensitive file or user data.
- **VI:** Lỗi/log không được lộ dữ liệu nhạy cảm.

---

### NFR-003: Scalability

| Aspect | Detail |
|--------|--------|
| Category | Scalability |
| Metric | Solution works for up to 100 files per upload session |

**Description / Mô tả:**
- **EN:** The batching logic must handle large file sets without crashing.
- **VI:** Logic batch phải xử lý được nhiều file mà không crash.

---

### NFR-004: Maintainability

| Aspect | Detail |
|--------|--------|
| Category | Maintainability |
| Metric | Code follows project conventions and is well-commented |

**Description / Mô tả:**
- **EN:** Code must be readable, modular, and follow project standards.
- **VI:** Code phải dễ đọc, tách module, theo chuẩn dự án.

---

### NFR-005: Compatibility

| Aspect | Detail |
|--------|--------|
| Category | Compatibility |
| Metric | Works on latest Chrome, Edge, Firefox, Safari |

**Description / Mô tả:**
- **EN:** Feature must work on all major browsers used by staff.
- **VI:** Tính năng phải chạy trên các browser chính mà nhân viên dùng.

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-hepper

| Aspect | Detail |
|--------|--------|
| Changes | UploadArea component: add batching, progress, error handling |
| Sync Type | immediate |

**Integration Points / Điểm Tích hợp:**
- UploadArea → existing upload API endpoint

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**
- None (no API or shared library changes)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### API: /api/upload (existing)
- No changes to API contract; each batch uses the same payload format as current single-request upload.

### Data Schema: Upload Result
- { created: number, updated: number, unchanged: number, errors: string[] }

---

## 6. UI/UX Specifications / Đặc tả UI/UX
- Progress indicator: Shows current batch (e.g., "Processing batch 2/4...")
- Error display: Shows error per batch if any
- Summary: Shows total created, updated, unchanged, errors after all batches
- UI must remain interactive (no blocking overlays)

---

## 7. Edge Cases & Error Handling / Trường hợp Biên & Xử lý Lỗi

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-001 | User uploads <5 files | All files sent in one batch |
| EC-002 | User uploads 0 files | No upload triggered, show warning |
| EC-003 | Network error on batch | Show error for that batch, continue |
| EC-004 | All batches fail | Show summary of all errors |
| EC-005 | User cancels upload mid-way | Stop further batches, show partial summary |

---

## 8. Dependencies / Phụ thuộc

| Dependency | Type | Status |
|------------|------|--------|
| React | Package | Existing |
| Next.js | Package | Existing |

---

## 9. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large uploads still slow | Medium | Consider parallelism in future if needed |
| API rate limits | Low | Batches are small, unlikely to hit limits |
| Unexpected API errors | Medium | Show clear error, allow retry in future |

---

## Approval / Phê duyệt

| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-11 |
| Reviewer | ⏳ Pending | |
