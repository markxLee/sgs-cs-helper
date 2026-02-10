# 📋 Work Description / Mô tả Công việc
<!-- Created: 2026-02-10 | US-1.3.4 -->

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Scan QR/Barcode to Mark Order Complete |
| Affected Roots | sgs-cs-hepper |
| Base Branch | main |
| Branch | feature/sgs-cs-helper-us-1.3.4 |
| Requestor | Product backlog (Flow 1) |
| Sources | User Stories Backlog — US-1.3.4 |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.3.4 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** Staff members currently must manually search the orders list to find a specific order and mark it as complete. When processing physical job documents that have QR codes or barcodes printed on them, this manual search is slow and error-prone — especially during batch processing of many completed orders. A camera-based scanning feature would allow staff to scan the document, instantly locate the order by Job Number, and mark it complete in one fluid action.

**VI:** Nhân viên hiện phải tìm kiếm thủ công trong danh sách đơn hàng để tìm và đánh dấu hoàn thành. Khi xử lý tài liệu vật lý có in QR/barcode, việc tìm kiếm thủ công chậm và dễ sai — đặc biệt khi xử lý hàng loạt nhiều đơn đã hoàn thành. Tính năng quét bằng camera cho phép nhân viên quét tài liệu, tìm đơn tức thì theo Job Number, và đánh dấu hoàn thành trong một thao tác liền mạch.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** Staff can tap a "Scan" button on the orders page, point their phone camera at a QR code or barcode on a physical document, and the system automatically finds the matching order by Job Number and offers a one-tap "Mark Complete" action. After completion, the scanner stays open for continuous batch scanning.

**VI:** Nhân viên có thể nhấn nút "Quét" trên trang đơn hàng, hướng camera điện thoại vào QR/barcode trên tài liệu, hệ thống tự động tìm đơn khớp theo Job Number và đưa ra nút "Đánh dấu Hoàn thành" một chạm. Sau khi hoàn thành, scanner giữ mở để quét hàng loạt tiếp.

---

## In Scope — Trong Phạm vi

- EN: Camera-based QR/barcode scanner UI component / VI: Component UI quét QR/barcode bằng camera
- EN: Rear camera default on mobile (`facingMode: 'environment'`) / VI: Camera sau mặc định trên mobile
- EN: Job Number lookup from decoded scan result (case-insensitive) / VI: Tìm Job Number từ kết quả quét (không phân biệt hoa thường)
- EN: Order status check and "Mark Complete" action / VI: Kiểm tra trạng thái đơn và hành động "Đánh dấu Hoàn thành"
- EN: Feedback messages for all outcomes (found+in-progress, found+completed, not found) / VI: Thông báo cho tất cả kết quả (tìm thấy+đang xử lý, tìm thấy+đã hoàn thành, không tìm thấy)
- EN: Continuous scanning (scanner stays open after completion) / VI: Quét liên tục (scanner giữ mở sau khi hoàn thành)
- EN: Permission gating (`canUpdateStatus` only) / VI: Kiểm soát quyền (chỉ `canUpdateStatus`)
- EN: Mobile browser support (iOS Safari 14.5+, Android Chrome 88+) / VI: Hỗ trợ trình duyệt mobile (iOS Safari 14.5+, Android Chrome 88+)

## Out of Scope — Ngoài Phạm vi

- EN: Offline scanning support / VI: Hỗ trợ quét offline
- EN: Barcode/QR code generation / VI: Tạo mã barcode/QR
- EN: Order editing from scan view / VI: Chỉnh sửa đơn từ màn hình quét
- EN: `completedById` tracking (US-1.3.5) / VI: Ghi nhận `completedById` (US-1.3.5)
- EN: Desktop webcam scanning / VI: Quét bằng webcam desktop
- EN: Haptic/sound feedback (nice-to-have, not required) / VI: Phản hồi rung/âm thanh (tốt nếu có, không bắt buộc)

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Must use `@yudiel/react-qr-scanner` v2.5.1 (React-first, TypeScript, actively maintained) |
| Technical / Kỹ thuật | Next.js SSR: Must use `dynamic(() => import(...), { ssr: false })` for scanner component |
| Technical / Kỹ thuật | HTTPS required for camera API (Vercel deploy satisfies this) |
| Technical / Kỹ thuật | Existing SSE broadcaster must be used for realtime updates after mark complete |
| Technical / Kỹ thuật | Must follow existing Server Action pattern for order status mutation |
| Process / Quy trình | Permission check: `canUpdateStatus` required, matching existing mark-complete flow |

---

## Assumptions — Giả định

- EN: Physical job documents already have QR/barcodes containing the Job Number / VI: Tài liệu vật lý đã có QR/barcode chứa Job Number
- EN: The decoded text from QR/barcode matches or contains the Job Number string / VI: Text giải mã từ QR/barcode khớp hoặc chứa chuỗi Job Number
- EN: Users will primarily use this on mobile devices / VI: Người dùng chủ yếu sử dụng trên thiết bị mobile
- EN: `localhost` works without HTTPS during development (camera API permits localhost) / VI: `localhost` hoạt động không cần HTTPS khi phát triển (camera API cho phép localhost)

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information — all requirements are clear from the User Story.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: "Scan" button/icon on orders page (visible only to `canUpdateStatus` users)
- [ ] AC2: Camera scanner opens using `@yudiel/react-qr-scanner`
- [ ] AC3: Rear camera default on mobile (`facingMode: 'environment'`)
- [ ] AC4: Decoded text → Job Number lookup (case-insensitive)
- [ ] AC5: `IN_PROGRESS` match → order details + "Mark Complete" button
- [ ] AC6: `COMPLETED` match → "Order already completed" message
- [ ] AC7: No match → "Order not found" error
- [ ] AC8: Scanner stays open after completion (batch workflow)
- [ ] AC9: Scanner dismissible at any time
- [ ] AC10: Works on mobile browsers (iOS Safari 14.5+, Android Chrome 88+) over HTTPS
- [ ] AC11: Permission-gated: `canUpdateStatus` only

---

## Dependencies Already Satisfied / Phụ thuộc đã Hoàn tất

- ~~US-1.3.1~~ ✅ — Mark Order as Done (completed 2026-02-07)
- ~~US-1.2.1~~ ✅ — Display Orders List + SSE realtime (completed 2026-02-07)
