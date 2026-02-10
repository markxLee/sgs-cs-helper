# 📋 Work Description / Mô tả Công việc
<!-- Created: 2026-02-10 | US-1.3.6 -->

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Barcode Scanner Device Support (USB/Bluetooth Keyboard Input) |
| Affected Roots | sgs-cs-hepper |
| Base Branch | main |
| Requestor | Team (from US-1.3.4 delivery feedback) |
| Sources | User Stories Backlog (US-1.3.6) |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.3.6 |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** Staff members using desktop/laptop workstations with USB or Bluetooth barcode scanner devices cannot use the existing camera-based scan feature (US-1.3.4). These scanners act as HID keyboard devices — they "type" the barcode string rapidly and press Enter. The orders page needs a passive keyboard listener to detect this rapid input pattern and trigger the same order lookup + mark-done flow that camera scanning uses.

**VI:** Nhân viên dùng máy tính bàn với máy quét barcode USB hoặc Bluetooth không thể dùng tính năng camera scan hiện tại (US-1.3.4). Các máy quét này hoạt động như thiết bị HID bàn phím — "gõ" chuỗi barcode rất nhanh rồi nhấn Enter. Trang orders cần một keyboard listener ngầm để phát hiện pattern nhập nhanh này và kích hoạt flow lookup + mark-done giống camera scan.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** When a USB/Bluetooth barcode scanner scans a job document on the orders page, the system automatically detects the input, looks up the order by job number, and presents a confirmation dialog to mark it complete — without any button click or UI interaction needed.

**VI:** Khi máy quét barcode USB/Bluetooth quét hồ sơ trên trang orders, hệ thống tự động phát hiện input, tìm đơn theo job number, và hiện dialog xác nhận đánh dấu hoàn thành — không cần click nút hay tương tác UI nào.

---

## In Scope — Trong Phạm vi

- EN: Global keyboard listener on orders page detecting rapid keystroke patterns / VI: Keyboard listener toàn trang trên trang orders phát hiện pattern gõ phím nhanh
- EN: Speed-based discrimination between scanner input and human typing / VI: Phân biệt input máy quét và gõ tay dựa trên tốc độ
- EN: Reuse existing `GET /api/orders/lookup` and `POST /api/orders/[id]/mark-done` APIs / VI: Tái sử dụng API lookup và mark-done hiện có
- EN: Reuse ConfirmDialog for mark-done confirmation / VI: Tái sử dụng ConfirmDialog cho xác nhận
- EN: Result feedback (found, already completed, not found, error) / VI: Phản hồi kết quả (tìm thấy, đã hoàn thành, không tìm thấy, lỗi)
- EN: Permission gating (`canUpdateStatus`) / VI: Phân quyền (`canUpdateStatus`)
- EN: Conflict avoidance with camera scanner overlay / VI: Tránh xung đột với camera scanner overlay

## Out of Scope — Ngoài Phạm vi

- EN: Changes to camera scan feature (US-1.3.4) / VI: Thay đổi tính năng camera scan (US-1.3.4)
- EN: New API routes (reuse existing) / VI: API route mới (tái sử dụng hiện có)
- EN: Mobile-specific work / VI: Công việc cho mobile
- EN: Visible UI changes (scanner works passively) / VI: Thay đổi UI (scanner hoạt động ngầm)
- EN: Sound/haptic feedback / VI: Phản hồi âm thanh/rung

---

## Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Must not interfere with existing input fields (search, filter) — disable listener when input is focused |
| Technical / Kỹ thuật | Keystroke speed threshold ~50ms (scanner) vs >100ms (human typing) |
| Technical / Kỹ thuật | Must coexist with camera scan (AC8: disable when overlay is open) |
| Technical / Kỹ thuật | Debounce/cooldown after successful scan to prevent double-processing |
| Architecture | Reuse existing APIs — no new endpoints |
| Architecture | Next.js App Router, React 19, TypeScript strict |

---

## Assumptions — Giả định

- EN: USB/Bluetooth barcode scanners always end input with Enter key / VI: Máy quét USB/Bluetooth luôn kết thúc input bằng phím Enter
- EN: Scanner input is consistently fast (< 50ms between keystrokes) / VI: Input máy quét luôn nhanh (< 50ms giữa các phím)
- EN: The existing `GET /api/orders/lookup` API works for scanner-decoded text the same as camera-decoded text / VI: API lookup hiện có hoạt động với text từ máy quét giống như text từ camera
- EN: The orders page is the only page needing scanner support / VI: Trang orders là trang duy nhất cần hỗ trợ máy quét

---

## Missing Information — Thông tin Còn thiếu

> ✅ No missing information — all requirements are clear from the User Story.

---

## Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] AC1: Global keyboard listener detects rapid keystrokes (< 50ms apart) ending with Enter
- [ ] AC2: Scanner input distinguished from normal typing by speed threshold
- [ ] AC3: Captured barcode triggers `GET /api/orders/lookup` (reuse from US-1.3.4)
- [ ] AC4: Order found + IN_PROGRESS → ConfirmDialog with order details + "Mark Complete"
- [ ] AC5: Order found + COMPLETED → info message "Order already completed"
- [ ] AC6: Order not found → error message "Order not found"
- [ ] AC7: After mark complete success, listener remains active (batch workflow)
- [ ] AC8: Listener disabled when camera scanner overlay is open
- [ ] AC9: Permission-gated: only active for `canUpdateStatus` users
- [ ] AC10: Works on desktop browsers (Chrome, Edge, Firefox)
- [ ] AC11: No visible UI change — works passively on orders page
