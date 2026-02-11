# Solution Design — US-1.1.4: Batch Upload Processing
<!-- Phase 0: Analysis & Design | Created: 2026-02-11 -->

---

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề
**EN:** Uploading many Excel files at once can cause request timeouts because all files are sent in a single request. This leads to poor user experience and potential data loss. The solution is to split uploads into smaller batches to prevent timeouts and improve reliability.

**VI:** Khi upload nhiều file Excel cùng lúc, request có thể bị timeout vì tất cả file được gửi trong một request duy nhất. Điều này gây trải nghiệm kém và mất dữ liệu đã xử lý. Cần chia upload thành các batch nhỏ hơn để tránh timeout và cải thiện độ tin cậy.

### Context / Ngữ cảnh

| Aspect | Current / Hiện tại | Desired / Mong muốn |
|--------|-------------------|---------------------|
| Behavior | All files sent in one request | Files sent in batches of 5 |
| Data flow | Single FormData, single API call | Multiple FormData, sequential API calls |
| User experience | Timeout risk, no progress per batch | No timeout, progress per batch, summary at end |

### Gap Analysis / Phân tích Khoảng cách
- EN: Current approach risks timeouts and poor feedback. Needs batching, progress, and error resilience.
- VI: Cách hiện tại dễ bị timeout, thiếu feedback. Cần chia batch, hiển thị tiến độ, và chống lỗi tốt hơn.

### Affected Areas / Vùng Ảnh hưởng

| Root | Component | Impact |
|------|-----------|--------|
| sgs-cs-hepper | UploadArea | Add client-side batching, progress, error handling |

### Open Questions / Câu hỏi Mở
1. EN: Is 5 files per batch optimal for all users? / VI: 5 file/batch có tối ưu cho mọi user không?
2. EN: Should failed batches be retryable? / VI: Có cần cho phép retry batch lỗi không?

### Assumptions / Giả định
1. EN: Existing upload API can handle 5 files per request. / VI: API upload hiện tại xử lý được 5 file/request.
2. EN: Sequential batch processing is sufficient for UX. / VI: Xử lý tuần tự batch là đủ cho UX.

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location | Pattern | Applicable | Notes |
|----------|---------|------------|-------|
| src/components/upload/upload-area.tsx | Single-request upload | Partial | Needs batching logic added |

### Similar Implementations / Triển khai Tương tự

| Location | What it does | Learnings |
|----------|--------------|-----------|
| N/A | N/A | EN: No batching found; must implement. / VI: Không có batching; cần tự làm. |

### Dependencies / Phụ thuộc

| Dependency | Purpose | Status |
|------------|---------|--------|
| React | UI framework | Existing |
| Next.js | App framework | Existing |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From | To | Type | Impact |
|------|----|------|--------|
| N/A | N/A | N/A | N/A |

### Reusable Components / Component Tái sử dụng
- src/components/upload/upload-area.tsx: EN: Main upload logic, can be extended. / VI: Logic upload chính, có thể mở rộng.

### New Components Needed / Component Cần tạo Mới
- EN: None; extend existing UploadArea. / VI: Không cần mới; mở rộng UploadArea.

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:** Enhance the UploadArea component to split selected files into batches of up to 5 files. For each batch, send a separate FormData request to the server sequentially. Display progress for each batch (e.g., "Processing batch 2/4..."). If a batch fails, show an error but continue with the next batch. After all batches, aggregate and display a summary of results. The UI must remain responsive throughout.

**VI:** Nâng cấp component UploadArea để chia file thành các batch tối đa 5 file. Mỗi batch gửi một FormData riêng lên server theo thứ tự. Hiển thị tiến độ từng batch (vd: "Đang xử lý batch 2/4..."). Nếu batch lỗi, hiển thị lỗi nhưng vẫn tiếp tục batch tiếp theo. Sau khi xong, tổng hợp và hiển thị kết quả. UI phải luôn responsive.

### Approach Comparison / So sánh Phương pháp

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Chosen:** Sequential client-side batching | Simple, reliable, easy to implement | Slower for large uploads | ✅ Selected |
| Alternative 1: Parallel batch uploads | Faster overall | Higher risk of server overload, more complex error handling | ❌ Rejected: Not needed for current scale |
| Alternative 2: Server-side chunking | Offloads work from client | Requires API changes, out of scope | ❌ Rejected: Out of scope |

### Components / Các Component

| # | Name | Root | Purpose |
|---|------|------|---------|
| 1 | UploadArea | sgs-cs-hepper | EN: Handle file selection, batching, upload, progress, error. / VI: Xử lý chọn file, chia batch, upload, tiến độ, lỗi. |

### Component Details / Chi tiết Component

#### Component 1: `UploadArea`

| Aspect | Detail |
|--------|--------|
| Root | sgs-cs-hepper |
| Location | src/components/upload/upload-area.tsx |
| Purpose | EN: Main upload UI and logic. / VI: UI và logic upload chính. |
| Inputs | FileList, user actions |
| Outputs | Upload requests, progress, summary |
| Dependencies | React, Next.js |

### Data Flow / Luồng Dữ liệu

| Step | From | To | Data | Action |
|------|------|----|------|--------|
| 1 | User | UploadArea | FileList | Select files |
| 2 | UploadArea | Server | FormData (5 files) | POST batch |
| 3 | UploadArea | UI | Progress info | Show batch progress |
| 4 | UploadArea | UI | Summary | Show final results |

### Error Handling / Xử lý Lỗi

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Batch upload fails | Show error, continue with next batch | User sees which batch failed, rest continue |
| All batches fail | Show summary of all errors | User sees all failed |
| Network error | Show error, allow retry (future) | User sees error, can retry later |

### Rollback Plan / Kế hoạch Rollback

**EN:** Revert UploadArea to previous single-request logic if batching causes issues.

**VI:** Nếu batching có vấn đề, hoàn tác UploadArea về logic upload 1 request như cũ.

---

## 0.4 Diagrams / Sơ đồ

See [Flow Overview](./diagrams/flow-overview.md) for main execution flow.

---

# End of Solution Design
