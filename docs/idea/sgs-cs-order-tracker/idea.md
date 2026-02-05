# Idea Analysis: SGS CS Order Tracker
<!-- Generated: 2026-02-05 | Idea Slug: sgs-cs-order-tracker -->

---

## 1. Problem Statement

### English

**What problem does this idea aim to solve?**

The Customer Service team at SGS Test Food department currently lacks visibility into order processing timelines. When customers submit test orders (via Excel files), the team has no centralized way to:
- Track how long each order has been in progress
- Identify orders approaching their deadlines
- Get proactive alerts before orders become overdue

This leads to missed deadlines, reactive firefighting, and poor customer experience.

**Why does this problem matter?**

- Customer satisfaction depends on timely delivery of test results
- Manual tracking is error-prone and time-consuming
- Late orders damage client relationships and SGS reputation
- Team stress increases when deadlines are discovered too late

---

### Tiếng Việt

**Ý tưởng này nhằm giải quyết vấn đề gì?**

Team Chăm sóc Khách hàng của phòng Test Food tại SGS hiện không có cách theo dõi tiến độ xử lý đơn hàng. Khi khách hàng gửi đơn test (qua file Excel), team không có hệ thống tập trung để:
- Theo dõi mỗi đơn đã xử lý được bao lâu
- Xác định các đơn sắp đến hạn
- Nhận cảnh báo chủ động trước khi đơn quá hạn

Điều này dẫn đến trễ deadline, xử lý bị động, và trải nghiệm khách hàng kém.

**Vì sao vấn đề này quan trọng?**

- Sự hài lòng của khách hàng phụ thuộc vào việc giao kết quả đúng hạn
- Theo dõi thủ công dễ sai sót và tốn thời gian
- Đơn trễ làm ảnh hưởng quan hệ khách hàng và uy tín SGS
- Nhân viên căng thẳng khi phát hiện deadline quá muộn

---

## 2. Target Users

### English

**Primary Users:**
| User | Role | Needs |
|------|------|-------|
| CS Staff (Nhân viên) | Daily operators | Upload orders, monitor progress, mark orders as done |
| Admin | Team leads/Supervisors | Configure time limits, manage system, oversee all orders |

**Secondary/Indirect Users:**
| User | Role | Needs |
|------|------|-------|
| Super Admin | System owner | Initial setup, invite admins, full system control |
| Customers (indirect) | SGS clients | Benefit from timely order completion |

---

### Tiếng Việt

**Người dùng chính:**
| Người dùng | Vai trò | Nhu cầu |
|------------|---------|---------|
| Nhân viên CS | Vận hành hàng ngày | Upload đơn, theo dõi tiến độ, đánh dấu hoàn thành |
| Admin | Trưởng nhóm/Giám sát | Cấu hình thời gian, quản lý hệ thống, giám sát tất cả đơn |

**Người dùng phụ/Gián tiếp:**
| Người dùng | Vai trò | Nhu cầu |
|------------|---------|---------|
| Super Admin | Chủ sở hữu hệ thống | Thiết lập ban đầu, mời admin, toàn quyền |
| Khách hàng (gián tiếp) | Khách hàng SGS | Hưởng lợi từ việc hoàn thành đơn đúng hạn |

---

## 3. Value Proposition

### English

**What value does this idea deliver?**

1. **Visibility**: Real-time dashboard showing all orders in progress with clear progress indicators
2. **Proactive Alerts**: Notification system warns before deadlines, not after
3. **Efficiency**: Batch upload multiple files at once, automatic parsing eliminates manual data entry
4. **Accountability**: Clear tracking of order status and completion
5. **Simplicity**: Easy login for staff (shared code), no complex authentication barriers

**How does it improve the user's situation?**

| Before | After |
|--------|-------|
| Manual tracking in spreadsheets | Centralized dashboard with live updates |
| Discover overdue orders reactively | Get warned at configurable % thresholds |
| No visibility into team workload | See all orders and their progress at a glance |
| Time wasted on data entry | Automatic parsing from Excel template |

---

### Tiếng Việt

**Ý tưởng này mang lại giá trị gì?**

1. **Minh bạch**: Dashboard real-time hiển thị tất cả đơn đang xử lý với chỉ báo tiến độ rõ ràng
2. **Cảnh báo chủ động**: Hệ thống thông báo cảnh báo TRƯỚC deadline, không phải sau
3. **Hiệu quả**: Upload nhiều file cùng lúc, tự động parse loại bỏ nhập liệu thủ công
4. **Trách nhiệm**: Theo dõi rõ ràng trạng thái và hoàn thành đơn
5. **Đơn giản**: Đăng nhập dễ dàng cho nhân viên (mã chung), không rào cản xác thực phức tạp

**Nó cải thiện điều gì cho người dùng?**

| Trước | Sau |
|-------|-----|
| Theo dõi thủ công bằng spreadsheet | Dashboard tập trung cập nhật real-time |
| Phát hiện đơn quá hạn bị động | Được cảnh báo tại ngưỡng % có thể cấu hình |
| Không thấy khối lượng công việc của team | Xem tất cả đơn và tiến độ trong nháy mắt |
| Tốn thời gian nhập liệu | Tự động parse từ template Excel |

---

## 4. In-Scope

### English

**Core Features (Phase 1):**

1. **Authentication & Authorization**
   - Super Admin: seeded credentials in database
   - Admin: Google OAuth (invited by Super Admin)
   - Staff: shared simple code for quick login

2. **Order Management**
   - Upload single or multiple .xls files
   - Parse Excel files following SGS template format
   - Extract: Job Number, Registered Date, Required Date, Priority
   - Detect duplicates by Job Number (skip if exists)

3. **Progress Tracking**
   - Deadline = `Required Date` from Excel file
   - Progress bar = % time elapsed from `Registered Date` → `Required Date`
   - Admin configures warning threshold (e.g., 80%)
   - Filter orders: in-progress, completed, overdue
   - **Priority color coding**:
     - 🟢 Green: Low priority / On track
     - 🟡 Yellow: Medium priority / Approaching threshold
     - 🟠 Orange: High priority / Near deadline
     - 🔴 Red: Critical / Overdue

4. **Notifications**
   - Notification block for orders reaching % threshold
   - Threshold configurable by Admin

5. **Order Completion**
   - Staff can mark orders as "Done"
   - Track completion timestamp

---

### Tiếng Việt

**Tính năng cốt lõi (Giai đoạn 1):**

1. **Xác thực & Phân quyền**
   - Super Admin: thông tin đăng nhập seed sẵn trong database
   - Admin: Google OAuth (được Super Admin mời)
   - Nhân viên: mã code chung để đăng nhập nhanh

2. **Quản lý Đơn hàng**
   - Upload một hoặc nhiều file .xls
   - Parse file Excel theo format template SGS
   - Trích xuất: Job Number, Registered Date, Required Date, Priority
   - Phát hiện trùng lặp theo Job Number (bỏ qua nếu đã tồn tại)

3. **Theo dõi Tiến độ**
   - Deadline = `Required Date` từ file Excel
   - Progress bar = % thời gian từ `Registered Date` → `Required Date`
   - Admin cấu hình ngưỡng cảnh báo (VD: 80%)
   - Lọc đơn: đang xử lý, hoàn thành, quá hạn
   - **Màu sắc theo Priority**:
     - 🟢 Xanh: Ưu tiên thấp / Đang tốt
     - 🟡 Vàng: Ưu tiên trung bình / Gần ngưỡng
     - 🟠 Cam: Ưu tiên cao / Gần deadline
     - 🔴 Đỏ: Khẩn cấp / Quá hạn

4. **Thông báo**
   - Block thông báo cho đơn đạt ngưỡng %
   - Ngưỡng có thể cấu hình bởi Admin

5. **Hoàn thành Đơn**
   - Nhân viên có thể đánh dấu đơn "Done"
   - Ghi nhận thời gian hoàn thành

---

## 5. Out-of-Scope / Non-Goals

### English

**NOT included in this idea:**

1. ❌ Integration with SGS internal systems (LIMS, ERP)
2. ❌ Customer-facing portal or notifications
3. ❌ Detailed sample-level tracking (only order-level)
4. ❌ Reporting or analytics dashboards
5. ❌ Mobile app (web-only for now)
6. ❌ Email/SMS notifications (in-app only)
7. ❌ Editing order data after upload
8. ❌ Workflow automation or order routing

---

### Tiếng Việt

**KHÔNG bao gồm trong ý tưởng này:**

1. ❌ Tích hợp với hệ thống nội bộ SGS (LIMS, ERP)
2. ❌ Portal hoặc thông báo cho khách hàng
3. ❌ Theo dõi chi tiết cấp mẫu (chỉ cấp đơn hàng)
4. ❌ Dashboard báo cáo hoặc phân tích
5. ❌ Ứng dụng mobile (chỉ web)
6. ❌ Thông báo Email/SMS (chỉ trong app)
7. ❌ Chỉnh sửa dữ liệu đơn sau khi upload
8. ❌ Tự động hóa workflow hoặc điều phối đơn

---

## 6. Assumptions

### English

**Key assumptions being made:**

| # | Assumption | Impact if Wrong |
|---|------------|-----------------|
| A1 | All order files follow the same SGS template format | Parser will fail or produce incorrect data |
| A2 | Job Number is unique across all orders | Duplicate detection will not work correctly |
| A3 | Registered Date in file is accurate and reliable | Time calculations will be wrong |
| A4 | Team is comfortable with web-based tools | Low adoption if team prefers other methods |
| A5 | Shared login code is acceptable security level for staff | May need individual accounts later |
| A6 | Required Date from file is THE deadline (not Admin override) | ✅ CONFIRMED |

**What must be true for this idea to succeed?**

- Team consistently uploads orders to the system
- Template format remains stable (or changes are communicated)
- Admin actively configures and monitors thresholds
- Internet access is reliable at workplace

---

### Tiếng Việt

**Các giả định chính đang được đặt ra:**

| # | Giả định | Ảnh hưởng nếu sai |
|---|----------|-------------------|
| A1 | Tất cả file đơn theo cùng format template SGS | Parser sẽ lỗi hoặc dữ liệu sai |
| A2 | Job Number là duy nhất cho tất cả đơn | Phát hiện trùng lặp sẽ không hoạt động |
| A3 | Registered Date trong file chính xác và đáng tin cậy | Tính toán thời gian sẽ sai |
| A4 | Team quen với công cụ web | Tỷ lệ sử dụng thấp nếu team thích cách khác |
| A5 | Mã đăng nhập chung là mức bảo mật chấp nhận được cho nhân viên | Có thể cần tài khoản riêng sau |
| A6 | Required Date từ file có thể dùng HOẶC Admin đặt giới hạn riêng | Cần làm rõ cái nào ưu tiên |

**Điều gì cần đúng để ý tưởng thành công?**

- Team nhất quán upload đơn vào hệ thống
- Format template ổn định (hoặc thay đổi được thông báo)
- Admin chủ động cấu hình và theo dõi ngưỡng
- Internet tại nơi làm việc ổn định

---

## 7. Risks & Unknowns

### English

**Product Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Template format changes | Medium | High | Build flexible parser, document expected format |
| Low adoption by team | Low | High | Simple UX, shared login, demonstrate value early |
| Data quality issues in Excel | Medium | Medium | Validation and error reporting on upload |

**Open Questions:**

1. ~~**Time Limit Source**~~: ✅ RESOLVED
   - `Required Date` from file = deadline
   - Progress bar = % from `Registered Date` → `Required Date`
   - Admin configs warning threshold (default 80%)

2. ~~**Notification Threshold**~~: ✅ RESOLVED
   - Configurable by Admin, default 80%

3. ~~**Priority Field**~~: ✅ RESOLVED
   - Color coding: 🟢 Green → 🟡 Yellow → 🟠 Orange → 🔴 Red
   - Higher priority = more urgent color

4. **Historical Data**: Should completed orders be archived? For how long?

5. **Multiple Uploads of Same File**: What if same file is uploaded twice by different people?

---

### Tiếng Việt

**Rủi ro về sản phẩm:**

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|--------|----------|----------|------------|
| Format template thay đổi | Trung bình | Cao | Xây parser linh hoạt, tài liệu hóa format |
| Team ít sử dụng | Thấp | Cao | UX đơn giản, đăng nhập chung, demo giá trị sớm |
| Vấn đề chất lượng dữ liệu trong Excel | Trung bình | Trung bình | Validate và báo lỗi khi upload |

**Các câu hỏi còn bỏ ngỏ:**

1. **Nguồn giới hạn thời gian**: Hệ thống nên dùng `Required Date` từ file, hay giới hạn Admin cấu hình, hay cả hai?
   - *Gợi ý*: Dùng Required Date làm mặc định, cho phép Admin ghi đè

2. **Ngưỡng thông báo**: Giá trị % nào hợp lý? (70%? 80%? 90%?)
   - *Gợi ý*: Cho phép cấu hình, mặc định 80%

3. **Field Priority**: Priority (1-6?) ảnh hưởng hiển thị hoặc sắp xếp thế nào?
   - *Gợi ý*: Priority cao hơn = hiển thị trước, có thể màu khác

4. **Dữ liệu lịch sử**: Đơn hoàn thành có nên lưu trữ không? Bao lâu?

5. **Upload cùng file nhiều lần**: Nếu cùng file được upload bởi nhiều người?

---

## Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| Idea Slug | `sgs-cs-order-tracker` |
| Primary Problem | Lack of visibility into order processing progress |
| Primary Users | CS Staff, Admin |
| Key Value | Real-time tracking, proactive alerts, efficiency |
| Main Risk | Template format changes, adoption |
| Status | Ready for Review |

---

**Next Step**: `/idea-analysis-review` or `/idea-to-tech-stack`
