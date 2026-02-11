# Product Checklist: SGS CS Order Tracker

<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-helper -->

---

## Product Checklist Overview / Tổng quan Checklist

| Field             | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| **Product Name**  | SGS CS Order Tracker                                         |
| **Product Slug**  | `sgs-cs-helper`                                              |
| **Purpose**       | Track execution state across phases, epics, and user stories |
| **Total Stories** | 28                                                           |
| **Status Legend** | `PLANNED` → `IN_PROGRESS` → `DONE`                           |

---

## Execution Rules

```yaml
RULES:
  - A story may start (IN_PROGRESS) ONLY when ALL "Blocked By" stories are DONE
  - This checklist is the SINGLE SOURCE of execution state
  - Status changes must be explicit and documented
```

---

# English

---

## Phase 0: Foundation

### Epic 0.1: Project Setup

- [x] **US-0.1.1** — Initialize Project Structure
  - Status: `DONE`
  - Blocked By: None
  - ✅ Completed: 2026-02-05

- [x] **US-0.1.2** — Configure Development Environment
  - Status: `DONE`
  - Blocked By: ~~US-0.1.1~~ ✅
  - ✅ Completed: 2026-02-05

---

### Epic 0.2: Authentication System

- [x] **US-0.2.1** — Super Admin Seeded Login
  - Status: `DONE`
  - Blocked By: ~~US-0.1.1~~ ✅, ~~US-0.3.1~~ ✅
  - ✅ Completed: 2026-02-05

- [x] **US-0.2.2** — Super Admin Dashboard & Admin Invitation
  - Status: `DONE`
  - Blocked By: ~~US-0.2.1~~ ✅, ~~US-0.3.1~~ ✅
  - ✅ Completed: 2026-02-05

- [ ] **US-0.2.3** — Admin Google OAuth Login
  - Status: `PLANNED`
  - Blocked By: ~~US-0.2.2~~ ✅

- [x] **US-0.2.4** — Admin Credentials Login
  - Status: `DONE`
  - Blocked By: ~~US-0.2.2~~ ✅
  - ✅ Completed: 2026-02-07
  - Branch: `feature/sgs-cs-helper-us-0.2.4`
  - Notes: Email/password login with audit logging, account lockout, IP tracking

- [x] **US-0.2.5** — Staff Code Login (Per-User)
  - Status: `DONE`
  - Blocked By: ~~US-0.2.1~~ ✅, ~~US-0.3.1~~ ✅
  - ✅ Completed: 2026-02-06
  - Branch: `feature/sgs-cs-helper-us-0.2.5`

- [ ] **US-0.2.6** — Role-Based Route Protection
  - Status: `PLANNED`
  - Blocked By: ~~US-0.2.1~~ ✅, US-0.2.3, ~~US-0.2.4~~ ✅, ~~US-0.2.5~~ ✅

- [x] **US-0.2.7** — Staff User Management
  - Status: `DONE`
  - Blocked By: ~~US-0.2.2~~ ✅
  - ✅ Completed: 2026-02-06
  - Branch: `feature/sgs-cs-helper-us-0.2.7`
  - Notes: Admin/Super Admin can create staff users with unique codes

- [ ] **US-0.2.8** — Login Mode Configuration
  - Status: `PLANNED`
  - Blocked By: ~~US-0.2.2~~ ✅
  - Notes: System-wide setting for quick code vs full login

---

### Epic 0.3: Database Schema

- [x] **US-0.3.1** — Create Core Database Schema
  - Status: `DONE`
  - Blocked By: ~~US-0.1.1~~ ✅
  - ✅ Completed: 2026-02-05

- [x] **US-0.3.2** — Seed Initial Data
  - Status: `DONE`
  - Blocked By: ~~US-0.3.1~~ ✅
  - ✅ Completed: 2026-02-05

---

## Phase 1: MVP (Minimum Viable Product)

### Epic 1.1: Order Upload & Parsing

- [x] **US-1.1.1** — Upload Excel Files UI
  - Status: `DONE`
  - Blocked By: ~~US-0.2.5~~ ✅, ~~US-0.3.1~~ ✅
  - ✅ Completed: 2026-02-07

- [x] **US-1.1.2** — Parse Excel and Extract Order Data
  - Status: `DONE`
  - Blocked By: ~~US-1.1.1~~ ✅
  - ✅ Completed: 2026-02-07

- [x] **US-1.1.3** — Store Order with Upsert by Job Number
  - Status: `DONE`
  - Blocked By: ~~US-1.1.2~~ ✅
  - ✅ Completed: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.1.3`

- [x] **US-1.1.4** — Batch Upload Processing — Client-Side Chunking
  - Status: `DONE`
  - Started: 2026-02-11
  - Branch: `feature/sgs-cs-helper-us-1.1.4`
  - Blocked By: ~~US-1.1.3~~ ✅
  - ✅ Completed: 2026-02-11
  - Notes: Client-side batching (10 orders/batch), batch progress UI, server action N+1→batch optimization

- [ ] **US-1.1.5** — Parse Test Request Samples & Display Total Samples
  - Status: `PLANNED`
  - Blocked By: ~~US-1.1.3~~ ✅
  - Notes: Parse "Phiếu yêu cầu test" from row 10+, new OrderSample table, display Total Samples column

---

### Epic 1.2: Order Dashboard

- [x] **US-1.2.1** — Display Orders List + Progress Bar ✅
  - Status: `DONE` (2026-02-07)
  - Blocked By: ~~US-1.1.3~~ ✅
  - Note: Merged with US-1.2.2 (Progress Bar) | Public read-only access
  - Features: Tabs (In Progress/Completed), Remaining time, Realtime SSE

- [x] **US-1.2.2** — Display Progress Bar
  - Status: `DONE`
  - Blocked By: ~~US-1.2.1~~ ✅
  - ✅ Merged into US-1.2.1

- [ ] **US-1.2.3** — Priority Color Coding
  - Status: `PLANNED`
  - Blocked By: ~~US-1.2.1~~ ✅

- [ ] **US-1.2.4** — Filter Orders by Status
  - Status: `PLANNED`
  - Blocked By: ~~US-1.2.1~~ ✅

- [ ] **US-1.2.5** — Sort Orders
  - Status: `PLANNED`
  - Blocked By: ~~US-1.2.1~~ ✅

- [x] **US-1.2.6** — Show Registered By, Filter/Sort, Priority ETA
  - Status: `DONE`
  - Started: 2026-02-07
  - ✅ Completed: 2026-02-08
  - Branch: `feature/sgs-cs-helper-us-1.2.6`
  - Blocked By: US-1.1.3, US-1.2.1
  - Notes: Add `Registered By` column, filters for `Registered By` and `Required Date`, sorting, and show ETA per priority from config

- [x] **US-1.2.7** — Multi-Select Registered By Filter with Dedicated Lookup Table
  - Status: `DONE`
  - Blocked By: ~~US-1.2.6~~ ✅
  - Started: 2026-02-10
  - ✅ Completed: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.2.7`
  - Notes: New `Registrant` lookup table, multi-select filter on both tabs, seed script from existing orders

---

### Epic 1.3: Order Completion

- [x] **US-1.3.1** — Mark Order as Done
  - Status: `DONE`
  - Blocked By: ~~US-1.2.1~~ ✅
  - ✅ Completed: 2026-02-07
  - Branch: `feature-sgs-cs-helper-us-1.3.1`

- [x] **US-1.3.2** — Visual Distinction for Completed Orders
  - Status: `DONE`
  - Blocked By: ~~US-1.3.1~~ ✅
  - ✅ Completed: 2026-02-09
  - Branch: `feature/sgs-cs-helper-us-1.3.2`

- [x] **US-1.3.3** — Undo Order Completion
  - Status: `DONE`
  - Blocked By: ~~US-1.3.1~~ ✅
  - ✅ Completed: 2026-02-09 (covered by US-1.3.2)

- [x] **US-1.3.4** — Scan QR/Barcode to Mark Order Complete
  - Status: `DONE`
  - Started: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.4`
  - Blocked By: ~~US-1.3.1~~ ✅
  - ✅ Completed: 2026-02-10
  - Notes: Use `@yudiel/react-qr-scanner`, camera-based scan on mobile, HTTPS required

- [x] **US-1.3.5** — Completion Tracking — Log Completed By & Show Actual Duration
  - Status: `DONE`
  - Blocked By: ~~US-1.3.1~~ ✅, ~~US-1.3.2~~ ✅
  - ✅ Completed: 2026-02-10
  - Notes: Add `completedById` to schema, show "Completed By" + "Actual Duration" columns in Completed tab, overdue indicator

- [x] **US-1.3.6** — Barcode Scanner Device Support (USB/Bluetooth Keyboard Input)
  - Status: `DONE`
  - ✅ Completed: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.6`
  - Blocked By: ~~US-1.3.4~~ ✅
  - Notes: USB/Bluetooth scanner as HID keyboard input, reuse lookup API + mark-done flow, passive listener on orders page

- [x] **US-1.3.7** — Completed Tab UI Polish — Email Display & Early Completion Indicator
  - Status: `DONE`
  - Blocked By: ~~US-1.3.5~~ ✅
  - ✅ Completed: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.7`
  - Notes: Hide empty `()` when user has no email, show "Early: {time}" sub-line for early completions (mirrors overdue)

---

## Phase 2: Reporting & Analytics

### Epic 2.1: Performance Dashboard

- [x] **US-2.1.1** — Performance Dashboard with Chart Visualization
  - Status: `DONE`
  - Blocked By: ~~US-1.3.5~~ ✅
  - Branch: `feature/sgs-cs-helper-us-2.1.1`
  - ✅ Completed: 2026-02-11
  - Notes: Dashboard with KPI cards (On-Time Rate, Overdue), stacked charts, per-user breakdown, date filters

- [ ] **US-2.1.2** — Export Performance Report & Orders to Excel
  - Status: `PLANNED`
  - Blocked By: ~~US-2.1.1~~ ✅
  - Notes: Export summary report (.xlsx) with team avg comparison + export filtered orders, server-side generation

---

## Quick Stats

| Phase     | Epic                      | Stories | Ready to Start                   |
| --------- | ------------------------- | ------- | -------------------------------- |
| 0         | 0.1 Project Setup         | 2       | ✅ US-0.1.1 done, US-0.1.2 ready |
| 0         | 0.2 Authentication        | 4       | ⏳ Blocked by US-0.3.1           |
| 0         | 0.3 Database Schema       | 2       | ✅ US-0.3.1 ready                |
| 1         | 1.1 Upload & Parsing      | 3       | ⏳ Blocked                       |
| 1         | 1.2 Dashboard             | 6       | ⏳ Blocked                       |
| 1         | 1.3 Completion            | 5       | ⏳ Blocked                       |
| 2         | 2.1 Performance Dashboard | 2       | ⏳ Blocked                       |
| **Total** |                           | **22**  | **2 ready**                      |

---

## Parallelization Guide

| When Completed      | Can Start                                        |
| ------------------- | ------------------------------------------------ |
| US-0.1.1            | US-0.1.2, US-0.3.1                               |
| US-0.3.1            | US-0.2.1, US-0.3.2                               |
| US-0.2.1            | US-0.2.2, US-0.2.3                               |
| US-0.2.3 + US-0.3.1 | US-1.1.1                                         |
| US-1.2.1            | US-1.2.2, US-1.2.3, US-1.2.4, US-1.2.5, US-1.3.1 |

---

# Tiếng Việt

---

## Phase 0: Nền tảng

### Epic 0.1: Thiết lập Dự án

- [x] **US-0.1.1** — Khởi tạo Cấu trúc Dự án
  - Trạng thái: `DONE`
  - Bị chặn bởi: None
  - ✅ Hoàn thành: 2026-02-05

- [x] **US-0.1.2** — Cấu hình Môi trường Phát triển
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-0.1.1~~ ✅
  - ✅ Hoàn thành: 2026-02-05

---

### Epic 0.2: Hệ thống Xác thực

- [ ] **US-0.2.1** — Đăng nhập Super Admin (Seeded)
  - Trạng thái: `IN_PROGRESS`
  - Bị chặn bởi: ~~US-0.1.1~~ ✅, ~~US-0.3.1~~ ✅
  - 🔄 Đang triển khai

- [ ] **US-0.2.2** — Đăng nhập Admin bằng Google OAuth
  - Trạng thái: `IN_PROGRESS`
  - Bị chặn bởi: US-0.2.1, US-0.3.1

- [ ] **US-0.2.3** — Đăng nhập Nhân viên bằng Mã chung
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.2.1, US-0.3.1

- [ ] **US-0.2.4** — Bảo vệ Route theo Role
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.2.1, US-0.2.2, US-0.2.3

---

### Epic 0.3: Schema Cơ sở dữ liệu

- [ ] **US-0.3.1** — Tạo Schema Database Cốt lõi
  - Trạng thái: `IN_PROGRESS`
  - Bị chặn bởi: ~~US-0.1.1~~ ✅
  - 🔄 Đang triển khai

- [ ] **US-0.3.2** — Seed Dữ liệu Ban đầu
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.3.1

---

## Phase 1: MVP

### Epic 1.1: Upload & Phân tích Đơn hàng

- [x] **US-1.1.1** — Giao diện Upload File Excel
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-0.2.3~~ ✅, ~~US-0.3.1~~ ✅
  - ✅ Hoàn thành: 2026-02-07

- [x] **US-1.1.2** — Phân tích Excel và Trích xuất Dữ liệu
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.1.1~~ ✅
  - ✅ Hoàn thành: 2026-02-07

- [x] **US-1.1.3** — Lưu Đơn hàng với Upsert theo Job Number
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.1.2~~ ✅
  - ✅ Hoàn thành: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.1.3`

- [x] **US-1.1.4** — Xử lý Upload theo Batch — Chia chunk phía Client
  - Trạng thái: `DONE`
  - Bắt đầu: 2026-02-11
  - Branch: `feature/sgs-cs-helper-us-1.1.4`
  - Bị chặn bởi: ~~US-1.1.3~~ ✅
  - ✅ Hoàn thành: 2026-02-11
  - Ghi chú: Client-side batching (10 orders/batch), batch progress UI, server action N+1→batch optimization

- [ ] **US-1.1.5** — Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.1.3~~ ✅
  - Ghi chú: Parse "Phiếu yêu cầu test" từ dòng 10+, bảng OrderSample mới, hiển thị cột Tổng Samples

---

### Epic 1.2: Dashboard Đơn hàng

- [x] **US-1.2.1** — Hiển thị Danh sách Đơn hàng + Progress Bar ✅
  - Trạng thái: `DONE` (2026-02-07)
  - Bị chặn bởi: ~~US-1.1.3~~ ✅
  - Ghi chú: Đã gộp với US-1.2.2 (Progress Bar) | Truy cập công khai chỉ đọc
  - Tính năng: Tabs (Đang xử lý/Hoàn thành), Thời gian còn lại, Realtime SSE

- [x] **US-1.2.2** — Hiển thị Progress Bar
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.2.1~~ ✅
  - ✅ Đã gộp vào US-1.2.1

- [ ] **US-1.2.3** — Mã màu theo Priority
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.2.1~~ ✅

- [ ] **US-1.2.4** — Lọc Đơn theo Trạng thái
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.2.1~~ ✅

- [ ] **US-1.2.5** — Sắp xếp Đơn hàng
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.2.1~~ ✅

- [ ] **US-1.2.7** — Bộ lọc Registered By Multi-Select với Bảng Tra cứu Riêng
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.2.6~~ ✅
  - Ghi chú: Bảng tra cứu `Registrant` mới, bộ lọc multi-select trên cả 2 tab, script seed từ đơn hiện có

---

### Epic 1.3: Hoàn thành Đơn hàng

- [ ] **US-1.3.1** — Đánh dấu Đơn Hoàn thành
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-1.2.1~~ ✅

- [x] **US-1.3.2** — Phân biệt Trực quan Đơn Hoàn thành
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.3.1~~ ✅
  - ✅ Hoàn thành: 2026-02-09
  - Branch: `feature/sgs-cs-helper-us-1.3.2`

- [x] **US-1.3.3** — Hoàn tác Hoàn thành Đơn
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.3.1~~ ✅
  - ✅ Hoàn thành: 2026-02-09 (bao gồm trong US-1.3.2)

- [x] **US-1.3.4** — Quét QR/Barcode để Đánh dấu Đơn Hoàn thành
  - Trạng thái: `DONE`
  - Bắt đầu: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.4`
  - Bị chặn bởi: ~~US-1.3.1~~ ✅
  - ✅ Hoàn thành: 2026-02-10
  - Ghi chú: Dùng `@yudiel/react-qr-scanner`, quét bằng camera trên mobile, yêu cầu HTTPS

- [x] **US-1.3.5** — Theo dõi Hoàn thành — Ghi nhận Người Hoàn thành & Thời gian Thực tế
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.3.1~~ ✅, ~~US-1.3.2~~ ✅
  - ✅ Hoàn thành: 2026-02-10
  - Ghi chú: Thêm `completedById` vào schema, hiển thị cột "Người Hoàn thành" + "Thời gian Thực tế" trong tab Hoàn Thành, chỉ báo quá hạn

- [x] **US-1.3.6** — Hỗ trợ Máy quét Barcode (USB/Bluetooth — Nhập qua Bàn phím)
  - Trạng thái: `DONE`
  - ✅ Hoàn thành: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.6`
  - Bị chặn bởi: ~~US-1.3.4~~ ✅
  - Ghi chú: Máy quét USB/Bluetooth nhập qua bàn phím, tái sử dụng API lookup + flow mark-done, listener ngầm trên trang orders

- [x] **US-1.3.7** — Cải thiện UI tab Hoàn thành — Hiển thị Email & Chỉ báo Hoàn thành Sớm
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.3.5~~ ✅
  - ✅ Hoàn thành: 2026-02-10
  - Branch: `feature/sgs-cs-helper-us-1.3.7`
  - Ghi chú: Ẩn `()` khi user không có email, hiển thị "Early: {time}" cho đơn hoàn thành sớm (giống overdue)

---

## Phase 2: Báo cáo & Phân tích

### Epic 2.1: Dashboard Hiệu suất

- [x] **US-2.1.1** — Dashboard Hiệu suất với Biểu đồ Trực quan
  - Trạng thái: `DONE`
  - Bị chặn bởi: ~~US-1.3.5~~ ✅
  - Branch: `feature/sgs-cs-helper-us-2.1.1`
  - ✅ Hoàn thành: 2026-02-11
  - Ghi chú: Dashboard với thẻ KPI (On-Time Rate, Overdue), biểu đồ stacked, phân tích theo user, bộ lọc ngày

- [ ] **US-2.1.2** — Xuất Báo cáo Hiệu suất & Đơn hàng ra Excel
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: ~~US-2.1.1~~ ✅
  - Ghi chú: Xuất báo cáo tổng hợp (.xlsx) so sánh TB team + xuất đơn theo bộ lọc, tạo file phía server

---

## Thống kê

| Phase    | Epic                    | Stories | Sẵn sàng                            |
| -------- | ----------------------- | ------- | ----------------------------------- |
| 0        | 0.1 Thiết lập           | 2       | ✅ US-0.1.1 xong, US-0.1.2 sẵn sàng |
| 0        | 0.2 Xác thực            | 4       | ⏳ Chờ US-0.3.1                     |
| 0        | 0.3 Database            | 2       | ✅ US-0.3.1 sẵn sàng                |
| 1        | 1.1 Upload              | 3       | ⏳ Đang chặn                        |
| 1        | 1.2 Dashboard           | 6       | ⏳ Đang chặn                        |
| 1        | 1.3 Hoàn thành          | 5       | ⏳ Đang chặn                        |
| 2        | 2.1 Dashboard Hiệu suất | 2       | ⏳ Đang chặn                        |
| **Tổng** |                         | **22**  | **2 sẵn sàng**                      |

---

**Next Step**: `/roadmap-to-delivery` — Select a user story to start delivery
