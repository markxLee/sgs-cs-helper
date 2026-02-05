# Product Checklist: SGS CS Order Tracker
<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-order-tracker -->

---

## Product Checklist Overview / Tổng quan Checklist

| Field | Value |
|-------|-------|
| **Product Name** | SGS CS Order Tracker |
| **Product Slug** | `sgs-cs-order-tracker` |
| **Purpose** | Track execution state across phases, epics, and user stories |
| **Total Stories** | 17 |
| **Status Legend** | `PLANNED` → `IN_PROGRESS` → `DONE` |

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

- [ ] **US-0.1.1** — Initialize Project Structure
  - Status: `PLANNED`
  - Blocked By: None
  - ✅ Ready to start

- [ ] **US-0.1.2** — Configure Development Environment
  - Status: `PLANNED`
  - Blocked By: US-0.1.1

---

### Epic 0.2: Authentication System

- [ ] **US-0.2.1** — Super Admin Seeded Login
  - Status: `PLANNED`
  - Blocked By: US-0.1.1, US-0.3.1

- [ ] **US-0.2.2** — Admin Google OAuth Login
  - Status: `PLANNED`
  - Blocked By: US-0.2.1, US-0.3.1

- [ ] **US-0.2.3** — Staff Shared Code Login
  - Status: `PLANNED`
  - Blocked By: US-0.2.1, US-0.3.1

- [ ] **US-0.2.4** — Role-Based Route Protection
  - Status: `PLANNED`
  - Blocked By: US-0.2.1, US-0.2.2, US-0.2.3

---

### Epic 0.3: Database Schema

- [ ] **US-0.3.1** — Create Core Database Schema
  - Status: `PLANNED`
  - Blocked By: US-0.1.1

- [ ] **US-0.3.2** — Seed Initial Data
  - Status: `PLANNED`
  - Blocked By: US-0.3.1

---

## Phase 1: MVP (Minimum Viable Product)

### Epic 1.1: Order Upload & Parsing

- [ ] **US-1.1.1** — Upload Excel Files UI
  - Status: `PLANNED`
  - Blocked By: US-0.2.3, US-0.3.1

- [ ] **US-1.1.2** — Parse Excel and Extract Order Data
  - Status: `PLANNED`
  - Blocked By: US-1.1.1

- [ ] **US-1.1.3** — Store Order with Duplicate Detection
  - Status: `PLANNED`
  - Blocked By: US-1.1.2

---

### Epic 1.2: Order Dashboard

- [ ] **US-1.2.1** — Display Orders List
  - Status: `PLANNED`
  - Blocked By: US-1.1.3

- [ ] **US-1.2.2** — Display Progress Bar
  - Status: `PLANNED`
  - Blocked By: US-1.2.1

- [ ] **US-1.2.3** — Priority Color Coding
  - Status: `PLANNED`
  - Blocked By: US-1.2.1

- [ ] **US-1.2.4** — Filter Orders by Status
  - Status: `PLANNED`
  - Blocked By: US-1.2.1

- [ ] **US-1.2.5** — Sort Orders
  - Status: `PLANNED`
  - Blocked By: US-1.2.1

---

### Epic 1.3: Order Completion

- [ ] **US-1.3.1** — Mark Order as Done
  - Status: `PLANNED`
  - Blocked By: US-1.2.1

- [ ] **US-1.3.2** — Visual Distinction for Completed Orders
  - Status: `PLANNED`
  - Blocked By: US-1.3.1

- [ ] **US-1.3.3** — Undo Order Completion
  - Status: `PLANNED`
  - Blocked By: US-1.3.1

---

## Quick Stats

| Phase | Epic | Stories | Ready to Start |
|-------|------|---------|----------------|
| 0 | 0.1 Project Setup | 2 | ✅ US-0.1.1 |
| 0 | 0.2 Authentication | 4 | ⏳ Blocked |
| 0 | 0.3 Database Schema | 2 | ⏳ Blocked |
| 1 | 1.1 Upload & Parsing | 3 | ⏳ Blocked |
| 1 | 1.2 Dashboard | 5 | ⏳ Blocked |
| 1 | 1.3 Completion | 3 | ⏳ Blocked |
| **Total** | | **17** | **1 ready** |

---

## Parallelization Guide

| When Completed | Can Start |
|----------------|-----------|
| US-0.1.1 | US-0.1.2, US-0.3.1 |
| US-0.3.1 | US-0.2.1, US-0.3.2 |
| US-0.2.1 | US-0.2.2, US-0.2.3 |
| US-0.2.3 + US-0.3.1 | US-1.1.1 |
| US-1.2.1 | US-1.2.2, US-1.2.3, US-1.2.4, US-1.2.5, US-1.3.1 |

---

# Tiếng Việt

---

## Phase 0: Nền tảng

### Epic 0.1: Thiết lập Dự án

- [ ] **US-0.1.1** — Khởi tạo Cấu trúc Dự án
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: None
  - ✅ Sẵn sàng bắt đầu

- [ ] **US-0.1.2** — Cấu hình Môi trường Phát triển
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.1.1

---

### Epic 0.2: Hệ thống Xác thực

- [ ] **US-0.2.1** — Đăng nhập Super Admin (Seeded)
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.1.1, US-0.3.1

- [ ] **US-0.2.2** — Đăng nhập Admin bằng Google OAuth
  - Trạng thái: `PLANNED`
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
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.1.1

- [ ] **US-0.3.2** — Seed Dữ liệu Ban đầu
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.3.1

---

## Phase 1: MVP

### Epic 1.1: Upload & Phân tích Đơn hàng

- [ ] **US-1.1.1** — Giao diện Upload File Excel
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-0.2.3, US-0.3.1

- [ ] **US-1.1.2** — Phân tích Excel và Trích xuất Dữ liệu
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.1.1

- [ ] **US-1.1.3** — Lưu Đơn hàng với Phát hiện Trùng lặp
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.1.2

---

### Epic 1.2: Dashboard Đơn hàng

- [ ] **US-1.2.1** — Hiển thị Danh sách Đơn hàng
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.1.3

- [ ] **US-1.2.2** — Hiển thị Progress Bar
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.2.1

- [ ] **US-1.2.3** — Mã màu theo Priority
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.2.1

- [ ] **US-1.2.4** — Lọc Đơn theo Trạng thái
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.2.1

- [ ] **US-1.2.5** — Sắp xếp Đơn hàng
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.2.1

---

### Epic 1.3: Hoàn thành Đơn hàng

- [ ] **US-1.3.1** — Đánh dấu Đơn Hoàn thành
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.2.1

- [ ] **US-1.3.2** — Phân biệt Trực quan Đơn Hoàn thành
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.3.1

- [ ] **US-1.3.3** — Hoàn tác Hoàn thành Đơn
  - Trạng thái: `PLANNED`
  - Bị chặn bởi: US-1.3.1

---

## Thống kê

| Phase | Epic | Stories | Sẵn sàng |
|-------|------|---------|----------|
| 0 | 0.1 Thiết lập | 2 | ✅ US-0.1.1 |
| 0 | 0.2 Xác thực | 4 | ⏳ Đang chặn |
| 0 | 0.3 Database | 2 | ⏳ Đang chặn |
| 1 | 1.1 Upload | 3 | ⏳ Đang chặn |
| 1 | 1.2 Dashboard | 5 | ⏳ Đang chặn |
| 1 | 1.3 Hoàn thành | 3 | ⏳ Đang chặn |
| **Tổng** | | **17** | **1 sẵn sàng** |

---

**Next Step**: `/roadmap-to-delivery` — Select a user story to start delivery
