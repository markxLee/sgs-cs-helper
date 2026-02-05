# Product Roadmap: SGS CS Order Tracker
<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-helper -->

---

## Product Roadmap Overview / Tổng quan Lộ trình

| Field | Value |
|-------|-------|
| **Product Name** | SGS CS Order Tracker |
| **Product Slug** | `sgs-cs-helper` |
| **Roadmap Scope** | Milestone-based (MVP → Production) |
| **Target Users** | CS Staff, Admin, Super Admin |
| **Primary Goal** | Track order progress with proactive alerts |

---

# English

---

## Phase 0 — Foundation
> **Goal**: Set up project infrastructure and core authentication

### Epics

#### Epic 0.1: Project Setup
- Initialize Next.js 16.0.10 project with App Router
- Configure TypeScript, Tailwind CSS, shadcn/ui
- Set up Prisma with PostgreSQL
- Configure environment variables and Vercel deployment
- Establish folder structure per tech stack instructions

#### Epic 0.2: Authentication System
- Implement NextAuth.js v5 with multiple providers
- Super Admin: seeded credentials login
- Admin: Google OAuth login (invite-only)
- Staff: shared code login
- Role-based middleware protection
- Session management

#### Epic 0.3: Database Schema
- Create User model with roles (SUPER_ADMIN, ADMIN, STAFF)
- Create Order model with all required fields
- Create Config model for system settings
- Seed initial Super Admin and default configs
- Set up database indexes

---

## Phase 1 — MVP (Minimum Viable Product)
> **Goal**: Enable CS team to upload orders and track progress on a dashboard

### Epics

#### Epic 1.1: Order Upload & Parsing
- File upload interface (single/multiple .xls files)
- Server-side Excel parsing with xlsx library
- Extract: Job Number, Registered Date, Required Date, Priority
- Validate file format and data integrity
- Duplicate detection by Job Number
- Error handling and user feedback

#### Epic 1.2: Order Dashboard
- Display all orders in a list/table view
- Show order details: Job Number, dates, priority, status
- Calculate and display progress bar (% time elapsed)
- Priority color coding: 🟢 → 🟡 → 🟠 → 🔴
- Filter orders by status: In Progress, Completed, Overdue
- Sort by priority, deadline, or upload date

#### Epic 1.3: Order Completion
- Mark order as "Done" button for staff
- Record completion timestamp
- Update order status to COMPLETED
- Visual distinction for completed orders
- Undo completion (within time window)

---

## Phase 2 — Notifications & Admin Features
> **Goal**: Proactive alerts and admin configuration capabilities

### Epics

#### Epic 2.1: Notification System
- Notification block/panel on dashboard
- Alert orders reaching warning threshold (default 80%)
- Visual highlighting for urgent orders
- Auto-refresh dashboard (polling every 30s)
- Sound/visual notification for new alerts

#### Epic 2.2: Admin Configuration
- Admin settings page
- Configure warning threshold percentage
- Update shared staff code
- View system statistics (orders count, completion rate)
- Manage notification preferences

#### Epic 2.3: User Management (Super Admin)
- Invite new admins via email
- View all users list
- Deactivate/reactivate users
- Reset staff shared code

---

## Phase 3 — Enhancement (Future)
> **Goal**: Improve UX and add convenience features

### Epics

#### Epic 3.1: Dashboard Improvements
- Search orders by Job Number
- Date range filters
- Bulk actions (mark multiple as done)
- Export order list to CSV
- Keyboard shortcuts

#### Epic 3.2: Data Retention & History
- Archive completed orders after X days
- Order history view
- Basic statistics/reports
- Data cleanup automation

#### Epic 3.3: Mobile Responsiveness
- Responsive design for tablet/mobile
- Touch-friendly interactions
- Progressive Web App (PWA) support

---

## Roadmap Summary

| Phase | Goal | Epics | Priority |
|-------|------|-------|----------|
| Phase 0 | Foundation | 3 | 🔴 Must Have |
| Phase 1 | MVP | 3 | 🔴 Must Have |
| Phase 2 | Notifications & Admin | 3 | 🟠 Should Have |
| Phase 3 | Enhancement | 3 | 🟢 Nice to Have |

---

## Delivery Recommendation

**Recommended approach**: Complete Phase 0 + Phase 1 first for initial launch, then iterate with Phase 2.

| Milestone | Phases | Outcome |
|-----------|--------|---------|
| **v0.1 - Internal Alpha** | Phase 0 | Infrastructure ready, auth working |
| **v1.0 - MVP Launch** | Phase 0 + 1 | Core functionality, team can start using |
| **v1.5 - Notifications** | + Phase 2 | Proactive alerts, admin controls |
| **v2.0 - Enhanced** | + Phase 3 | Polish, mobile, history |

---

# Tiếng Việt

---

## Phase 0 — Nền tảng
> **Mục tiêu**: Thiết lập hạ tầng dự án và hệ thống xác thực cốt lõi

### Epics

#### Epic 0.1: Thiết lập Dự án
- Khởi tạo Next.js 16.0.10 với App Router
- Cấu hình TypeScript, Tailwind CSS, shadcn/ui
- Thiết lập Prisma với PostgreSQL
- Cấu hình biến môi trường và deploy Vercel
- Xây dựng cấu trúc thư mục theo hướng dẫn tech stack

#### Epic 0.2: Hệ thống Xác thực
- Triển khai NextAuth.js v5 với nhiều provider
- Super Admin: đăng nhập bằng credentials seed sẵn
- Admin: đăng nhập Google OAuth (được mời)
- Nhân viên: đăng nhập bằng mã chung
- Middleware bảo vệ theo role
- Quản lý session

#### Epic 0.3: Schema Cơ sở dữ liệu
- Tạo model User với roles (SUPER_ADMIN, ADMIN, STAFF)
- Tạo model Order với các trường cần thiết
- Tạo model Config cho cài đặt hệ thống
- Seed Super Admin ban đầu và config mặc định
- Thiết lập database indexes

---

## Phase 1 — MVP (Sản phẩm Khả thi Tối thiểu)
> **Mục tiêu**: Cho phép team CS upload đơn và theo dõi tiến độ trên dashboard

### Epics

#### Epic 1.1: Upload & Phân tích Đơn hàng
- Giao diện upload file (một/nhiều file .xls)
- Phân tích Excel phía server với thư viện xlsx
- Trích xuất: Job Number, Registered Date, Required Date, Priority
- Validate format file và tính toàn vẹn dữ liệu
- Phát hiện trùng lặp theo Job Number
- Xử lý lỗi và phản hồi người dùng

#### Epic 1.2: Dashboard Đơn hàng
- Hiển thị tất cả đơn dạng list/table
- Hiển thị chi tiết: Job Number, ngày, priority, trạng thái
- Tính toán và hiển thị progress bar (% thời gian đã qua)
- Mã màu theo priority: 🟢 → 🟡 → 🟠 → 🔴
- Lọc đơn theo trạng thái: Đang xử lý, Hoàn thành, Quá hạn
- Sắp xếp theo priority, deadline, hoặc ngày upload

#### Epic 1.3: Hoàn thành Đơn hàng
- Nút "Hoàn thành" cho nhân viên
- Ghi nhận thời gian hoàn thành
- Cập nhật trạng thái sang COMPLETED
- Phân biệt trực quan đơn đã hoàn thành
- Hoàn tác hoàn thành (trong khoảng thời gian cho phép)

---

## Phase 2 — Thông báo & Tính năng Admin
> **Mục tiêu**: Cảnh báo chủ động và khả năng cấu hình cho admin

### Epics

#### Epic 2.1: Hệ thống Thông báo
- Block/panel thông báo trên dashboard
- Cảnh báo đơn đạt ngưỡng (mặc định 80%)
- Highlight trực quan cho đơn khẩn cấp
- Tự động refresh dashboard (polling 30s)
- Thông báo âm thanh/hình ảnh cho alert mới

#### Epic 2.2: Cấu hình Admin
- Trang cài đặt admin
- Cấu hình ngưỡng cảnh báo %
- Cập nhật mã đăng nhập chung cho nhân viên
- Xem thống kê hệ thống (số đơn, tỷ lệ hoàn thành)
- Quản lý tùy chọn thông báo

#### Epic 2.3: Quản lý Người dùng (Super Admin)
- Mời admin mới qua email
- Xem danh sách tất cả users
- Vô hiệu hóa/kích hoạt lại users
- Reset mã đăng nhập chung cho nhân viên

---

## Phase 3 — Hoàn thiện (Tương lai)
> **Mục tiêu**: Cải thiện UX và thêm tính năng tiện ích

### Epics

#### Epic 3.1: Cải thiện Dashboard
- Tìm kiếm đơn theo Job Number
- Lọc theo khoảng thời gian
- Thao tác hàng loạt (đánh dấu nhiều đơn hoàn thành)
- Xuất danh sách đơn ra CSV
- Phím tắt

#### Epic 3.2: Lưu trữ Dữ liệu & Lịch sử
- Lưu trữ đơn hoàn thành sau X ngày
- Xem lịch sử đơn hàng
- Thống kê/báo cáo cơ bản
- Tự động dọn dẹp dữ liệu

#### Epic 3.3: Responsive Mobile
- Thiết kế responsive cho tablet/mobile
- Tương tác thân thiện touch
- Hỗ trợ Progressive Web App (PWA)

---

## Tóm tắt Lộ trình

| Phase | Mục tiêu | Epics | Độ ưu tiên |
|-------|----------|-------|------------|
| Phase 0 | Nền tảng | 3 | 🔴 Bắt buộc |
| Phase 1 | MVP | 3 | 🔴 Bắt buộc |
| Phase 2 | Thông báo & Admin | 3 | 🟠 Nên có |
| Phase 3 | Hoàn thiện | 3 | 🟢 Tốt nếu có |

---

**Next Step**: `/product-roadmap-review` or `/roadmap-to-user-stories`
