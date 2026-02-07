# Work Description — US-1.2.1: Display Orders List + Progress Bar
<!-- Phase 0 | Generated: 2026-02-07 | Branch: feature/sgs-cs-helper-us-1.2.1 -->

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.2.1 (merged with US-1.2.2) |
| Product | sgs-cs-helper |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status | IN_PROGRESS (updated from PLANNED) |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

## 📋 Work Description / Mô tả Công việc

### Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Work Type / Loại | FEATURE |
| Title / Tiêu đề | Display Orders List + Progress Bar (Public Dashboard) |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Requestor | User (from roadmap-to-delivery) |
| Sources | User Stories Backlog, Product Checklist, User clarifications |

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:**
After orders are uploaded and stored in the database, there is no way to view them. Staff and stakeholders need a dashboard to monitor all orders with their progress status. The dashboard should be publicly accessible (no login required) for read-only viewing, but any update actions (like marking orders as done) require authenticated users with appropriate permissions.

**VI:**
Sau khi orders được upload và lưu vào database, không có cách nào để xem chúng. Nhân viên và các bên liên quan cần một dashboard để theo dõi tất cả orders với trạng thái tiến độ. Dashboard nên được truy cập công khai (không cần đăng nhập) để xem chỉ đọc, nhưng các hành động cập nhật (như đánh dấu order hoàn thành) yêu cầu user đã xác thực với quyền phù hợp.

---

### Expected Outcome — Kết quả Mong đợi

**EN:**
A public dashboard page displaying all orders in a list/table format with:
- Order details (Job Number, dates, priority, status)
- Visual progress bars showing time urgency with color coding
- Fast loading with proper loading/error states
- No authentication required to view

**VI:**
Một trang dashboard công khai hiển thị tất cả orders dạng danh sách/bảng với:
- Chi tiết order (Job Number, ngày tháng, priority, status)
- Progress bars trực quan hiển thị mức độ khẩn cấp với mã màu
- Tải nhanh với loading/error states phù hợp
- Không yêu cầu xác thực để xem

---

### In Scope — Trong Phạm vi

**Orders List:**
- EN: Display orders in table/list view (public, no login required) / VI: Hiển thị orders dạng bảng/danh sách (công khai, không cần đăng nhập)
- EN: Show Job Number, Registered Date, Required Date, Priority, Status / VI: Hiển thị Job Number, Ngày đăng ký, Ngày yêu cầu, Priority, Status
- EN: Default sort by Required Date (soonest first) / VI: Mặc định sắp xếp theo Ngày yêu cầu (sớm nhất trước)
- EN: Empty state message when no orders / VI: Thông báo khi không có orders
- EN: Loading skeleton/spinner while fetching / VI: Loading skeleton/spinner khi đang tải
- EN: Error state with retry option / VI: Error state với tùy chọn thử lại
- EN: Performance: < 2 seconds for 100 orders / VI: Hiệu suất: < 2 giây cho 100 orders

**Progress Bar (merged from US-1.2.2):**
- EN: Show % of time elapsed from Received Date / VI: Hiển thị % thời gian đã trôi qua từ Received Date
- EN: **Duration based on Priority** (if no admin config) / VI: **Thời gian dựa trên Priority** (nếu chưa có config admin)
  - Priority = 0 → 15 minutes / 15 phút
  - Priority = 1 → 1 hour / 1 tiếng
  - Priority = 2 → 2.5 hours / 2.5 tiếng
  - Priority >= 3 → 3 hours / 3 tiếng
- EN: **Lunch break excluded (12:00-13:00)**: If order started before 12:00, skip 1 hour lunch / VI: **Bỏ qua giờ nghỉ trưa (12:00-13:00)**: Nếu order bắt đầu trước 12h, bỏ qua 1 tiếng nghỉ trưa
- EN: Color-coded: ⬜ 0-40%, 🟢 41-65%, 🟡 66-80%, 🔴 >80%/overdue / VI: Mã màu: ⬜ 0-40%, 🟢 41-65%, 🟡 66-80%, 🔴 >80%/quá hạn
- EN: Display percentage number alongside bar / VI: Hiển thị số phần trăm cạnh bar
- EN: Overdue orders show 100%+ with red indicator / VI: Orders quá hạn hiển thị 100%+ với chỉ báo đỏ

**Extensibility (Future-proofing) / Khả năng mở rộng:**
- EN: Design for multiple order types with different progress durations / VI: Thiết kế cho nhiều loại order với thời gian progress khác nhau
- EN: Progress duration configurable by SUPER_ADMIN/ADMIN / VI: Thời gian progress có thể config bởi SUPER_ADMIN/ADMIN
- EN: Easy to add new order type configs in the future / VI: Dễ dàng thêm config cho loại order mới trong tương lai

---

### Out of Scope — Ngoài Phạm vi

- EN: Priority color coding (US-1.2.3) / VI: Mã màu theo Priority (US-1.2.3)
- EN: Filtering by status (US-1.2.4) / VI: Lọc theo status (US-1.2.4)
- EN: Sorting options UI (US-1.2.5) / VI: UI tùy chọn sắp xếp (US-1.2.5)
- EN: Mark order as done action (US-1.3.1 - requires auth) / VI: Hành động đánh dấu order hoàn thành (US-1.3.1 - yêu cầu xác thực)
- EN: Real-time WebSocket updates / VI: Cập nhật real-time qua WebSocket
- EN: Pagination (future enhancement if needed) / VI: Phân trang (cải tiến tương lai nếu cần)

---

### Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Next.js Server Components for initial data fetch |
| Technical / Kỹ thuật | Prisma ORM for database queries |
| Technical / Kỹ thuật | No authentication middleware on this route (public access) |
| Technical / Kỹ thuật | Must use existing Order model from database |
| UX | Progress bar must be visually clear at a glance |
| Performance | < 2 seconds load time for 100 orders |

---

### Assumptions — Giả định

- EN: Orders already exist in database (from US-1.1.2/US-1.1.3) / VI: Orders đã tồn tại trong database (từ US-1.1.2/US-1.1.3)
- EN: Order model has all required fields (jobNumber, registeredDate, requiredDate, priority, status) / VI: Order model có tất cả fields cần thiết
- EN: Progress calculation: (now - receivedDate - lunchBreak) / durationHours * 100 / VI: Tính progress: (now - receivedDate - lunchBreak) / durationHours * 100
- EN: lunchBreak = 1 hour if receivedDate < 12:00 AND now > 13:00, else 0 / VI: lunchBreak = 1 tiếng nếu receivedDate < 12:00 VÀ now > 13:00, ngược lại = 0
- EN: durationHours based on Priority: P0=0.25h, P1=1h, P2=2.5h, P3+=3h / VI: durationHours theo Priority: P0=0.25h, P1=1h, P2=2.5h, P3+=3h
- EN: Default order status is "pending" or similar / VI: Status mặc định của order là "pending" hoặc tương tự
- EN: Dashboard will be at /dashboard or / route / VI: Dashboard sẽ ở route /dashboard hoặc /

---

### Missing Information — Thông tin Còn thiếu

> ✅ No critical missing information. All requirements are clear.

---

### Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

**Orders List:**
- [ ] AC1: Orders displayed in table/list view accessible without login
- [ ] AC2: Each row shows: Job Number, Registered Date, Required Date, Priority, Status
- [ ] AC3: Orders sorted by Required Date (soonest first) by default
- [ ] AC4: Empty state shows "No orders" message
- [ ] AC5: List loads in < 2 seconds for 100 orders
- [ ] AC6: Loading skeleton/spinner shown while fetching data
- [ ] AC7: Error state shown if data fetch fails with retry option

**Progress Bar:**
- [ ] AC8: Progress bar shows % of time elapsed from Received Date (duration based on Priority)
- [ ] AC9: Progress bar color-coded: ⬜ White 0-40%, 🟢 Green 41-65%, 🟡 Yellow 66-80%, 🔴 Red >80%/overdue
- [ ] AC10: Percentage number displayed alongside bar
- [ ] AC11: Overdue orders show 100%+ with red indicator

**Extensibility:**
- [ ] AC12: Progress duration can vary by order type (design for future config)
- [ ] AC13: Default duration by Priority: P0=15min, P1=1h, P2=2.5h, P3+=3h

**Business Rules:**
- [ ] AC14: Lunch break (12:00-13:00) excluded from elapsed time if order started before 12:00

---

### Dependencies Satisfied — Phụ thuộc Đã Hoàn thành

| Dependency | Status |
|------------|--------|
| US-1.1.1: Upload Excel Files UI | ✅ DONE |
| US-1.1.2: Parse Excel and Extract Order Data | ✅ DONE |
| US-1.1.3: Store Order with Duplicate Detection | ✅ DONE |
