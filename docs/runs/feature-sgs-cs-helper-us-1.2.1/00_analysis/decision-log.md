# Decision Log — US-1.2.1: Display Orders List + Progress Bar
<!-- Phase 0 | 2026-02-07 -->

---

## Summary Table / Bảng Tổng hợp

| ID | Date | Decision | Rationale |
|----|------|----------|-----------|
| D-001 | 2026-02-07 | Merge US-1.2.2 into US-1.2.1 | Progress bar is integral part of orders list |
| D-002 | 2026-02-07 | Public read-only access | All users should see order progress |
| D-003 | 2026-02-07 | Color scheme: ⬜ 0-40%, 🟢 41-65%, 🟡 66-80%, 🔴 >80% | User-defined urgency thresholds |
| D-004 | 2026-02-07 | Use receivedDate for progress start | More accurate than registeredDate |
| D-005 | 2026-02-07 | Design extensible for order types | Future admin config capability |
| D-006 | 2026-02-07 | Exclude lunch 12:00-13:00 | Staff not working during lunch |
| D-007 | 2026-02-07 | Duration by Priority | Higher priority = shorter deadline |
| D-008 | 2026-02-07 | Server Components for public page | SEO-friendly, simple architecture |
| D-009 | 2026-02-07 | Route: /orders (public) | Separate from /dashboard (auth required) |

---

## Decision Details / Chi tiết Quyết định

### D-001: Merge US-1.2.2 into US-1.2.1

🇻🇳 
**Bối cảnh:** US-1.2.1 (Orders List) và US-1.2.2 (Progress Bar) là hai user stories riêng biệt trong backlog.
**Các lựa chọn:** (A) Làm riêng, (B) Gộp lại
**Quyết định:** Gộp lại thành một US
**Lý do:** Progress bar là phần không thể thiếu của orders list, không có lý do để hiển thị list mà không có progress.

🇬🇧
**Context:** US-1.2.1 (Orders List) and US-1.2.2 (Progress Bar) were separate user stories in backlog.
**Options:** (A) Implement separately, (B) Merge
**Decision:** Merge into single US
**Rationale:** Progress bar is integral part of orders list, no reason to display list without progress.

---

### D-002: Public Read-Only Access

🇻🇳 
**Bối cảnh:** Dashboard hiện tại yêu cầu đăng nhập.
**Các lựa chọn:** (A) Yêu cầu login, (B) Public access
**Quyết định:** Public access cho read-only view
**Lý do:** Tất cả stakeholders cần theo dõi progress, không chỉ users đã đăng nhập. Actions như mark done vẫn yêu cầu auth.

🇬🇧
**Context:** Current dashboard requires login.
**Options:** (A) Require login, (B) Public access
**Decision:** Public access for read-only view
**Rationale:** All stakeholders need to monitor progress, not just logged-in users. Actions like mark done still require auth.

---

### D-003: Color Scheme Thresholds

🇻🇳 
**Bối cảnh:** Cần mã màu trực quan cho progress bar.
**Quyết định:** ⬜ White 0-40%, 🟢 Green 41-65%, 🟡 Yellow 66-80%, 🔴 Red >80%
**Lý do:** User-defined thresholds phản ánh mức độ khẩn cấp trong quy trình làm việc thực tế.

🇬🇧
**Context:** Need visual color coding for progress bar.
**Decision:** ⬜ White 0-40%, 🟢 Green 41-65%, 🟡 Yellow 66-80%, 🔴 Red >80%
**Rationale:** User-defined thresholds reflecting urgency levels in actual workflow.

---

### D-004: Use receivedDate for Progress Start

🇻🇳 
**Bối cảnh:** Order có cả registeredDate và receivedDate.
**Quyết định:** Sử dụng receivedDate làm điểm bắt đầu tính progress.
**Lý do:** receivedDate là thời điểm thực sự bắt đầu xử lý, chính xác hơn registeredDate.

🇬🇧
**Context:** Order has both registeredDate and receivedDate.
**Decision:** Use receivedDate as progress start point.
**Rationale:** receivedDate is when processing actually starts, more accurate than registeredDate.

---

### D-005: Extensible Design for Order Types

🇻🇳 
**Bối cảnh:** Tương lai có thể có nhiều loại order với duration khác nhau.
**Quyết định:** Thiết kế code để dễ mở rộng, sử dụng hardcoded defaults hiện tại.
**Lý do:** Chuẩn bị cho future admin config mà không over-engineer trong phase này.

🇬🇧
**Context:** Future may have different order types with different durations.
**Decision:** Design code for extensibility, use hardcoded defaults for now.
**Rationale:** Prepare for future admin config without over-engineering this phase.

---

### D-006: Exclude Lunch Break 12:00-13:00

🇻🇳 
**Bối cảnh:** Nhân viên nghỉ trưa từ 12h-13h.
**Quyết định:** Nếu order bắt đầu trước 12h và hiện tại sau 13h, trừ 1 tiếng từ elapsed time.
**Lý do:** Không công bằng khi tính thời gian nghỉ trưa vào progress.

🇬🇧
**Context:** Staff have lunch break from 12:00-13:00.
**Decision:** If order started before 12:00 and current time is after 13:00, deduct 1 hour from elapsed time.
**Rationale:** Not fair to count lunch time in progress.

---

### D-007: Duration by Priority

🇻🇳 
**Bối cảnh:** Các priority khác nhau có deadline khác nhau.
**Quyết định:** 
- Priority 0: 15 phút (0.25h) - Khẩn cấp
- Priority 1: 1 tiếng - Cao
- Priority 2: 2.5 tiếng - Trung bình
- Priority 3+: 3 tiếng - Bình thường
**Lý do:** Phản ánh thực tế quy trình xử lý: priority cao hơn = deadline ngắn hơn.

🇬🇧
**Context:** Different priorities have different deadlines.
**Decision:** 
- Priority 0: 15 minutes (0.25h) - Urgent
- Priority 1: 1 hour - High
- Priority 2: 2.5 hours - Medium
- Priority 3+: 3 hours - Normal
**Rationale:** Reflects actual processing workflow: higher priority = shorter deadline.

---

### D-008: Server Components for Public Page

🇻🇳 
**Bối cảnh:** Cần chọn cách render cho public page.
**Các lựa chọn:** (A) Server Components, (B) Client-side với SWR
**Quyết định:** Server Components
**Lý do:** SEO-friendly, đơn giản, hiệu quả. Progress không cần real-time, user có thể refresh.

🇬🇧
**Context:** Need to choose rendering approach for public page.
**Options:** (A) Server Components, (B) Client-side with SWR
**Decision:** Server Components
**Rationale:** SEO-friendly, simple, performant. Progress doesn't need real-time, user can refresh.

---

### D-009: Route /orders (Public)

🇻🇳 
**Bối cảnh:** Cần quyết định route cho orders list.
**Các lựa chọn:** (A) /dashboard/orders (auth), (B) /orders (public)
**Quyết định:** /orders (public)
**Lý do:** Tách biệt khỏi dashboard yêu cầu auth, cho phép bookmark/share link công khai.

🇬🇧
**Context:** Need to decide route for orders list.
**Options:** (A) /dashboard/orders (auth), (B) /orders (public)
**Decision:** /orders (public)
**Rationale:** Separate from auth-required dashboard, allows bookmarking/sharing public link.

---

## Change Log / Nhật ký Thay đổi

| Date | Change | Affected Decisions |
|------|--------|-------------------|
| 2026-02-07 | Initial decision log created | All |
