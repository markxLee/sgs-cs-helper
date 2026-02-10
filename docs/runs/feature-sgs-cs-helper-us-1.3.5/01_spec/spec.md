# Specification: Completion Tracking — Log Completed By & Show Actual Duration

# Đặc tả: Theo dõi Hoàn thành — Ghi nhận Người Hoàn thành & Hiển thị Thời gian Thực tế

## 📋 TL;DR

| Aspect              | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| Feature             | Completion Tracking — Log Completed By & Show Actual Duration |
| Phase 0 Analysis    | [Link](../00_analysis/solution-design.md)                     |
| Functional Reqs     | 4                                                             |
| Non-Functional Reqs | 5                                                             |
| Affected Roots      | sgs-cs-helper                                                 |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt

**EN:**
Add the ability to track which user completed each order and display the actual processing duration in the Completed tab, including overdue/on-time indicators. This supports staff performance reporting and improves transparency for completed orders.

**VI:**
Bổ sung khả năng ghi nhận người hoàn thành đơn hàng và hiển thị thời gian xử lý thực tế trong tab Đã hoàn thành, bao gồm chỉ báo đúng/trễ hạn. Điều này hỗ trợ báo cáo hiệu suất nhân viên và tăng minh bạch cho các đơn đã hoàn thành.

### 1.2 Scope / Phạm vi

**In Scope / Trong phạm vi:**

- Schema changes to Order model for completedById and completedBy relation
- UI changes to Completed tab for new columns and indicators
- Logic to record user on completion and clear on undo
- Sorting/filtering by Completed By

**Out of Scope / Ngoài phạm vi:**

- Staff performance analytics dashboard
- Changes to order upload or parsing logic
- Changes to authentication or user management

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Record Completed By

| Aspect         | Detail        |
| -------------- | ------------- |
| Priority       | Must          |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

- **EN:** When an order is marked as complete, the system must record the user (Name and email) who performed the action in the Order record (completedById, completedBy relation).
- **VI:** Khi đánh dấu đơn hoàn thành, hệ thống phải ghi nhận người thực hiện (Tên và email) vào bản ghi Order (completedById, quan hệ completedBy).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] AC1: completedById (current user ID) is recorded in the Order record
- [ ] AC2: completedBy relation is established

---

### FR-002: Display Completed By and Actual Duration

| Aspect         | Detail        |
| -------------- | ------------- |
| Priority       | Must          |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

- **EN:** The Completed tab must display a "Completed By" column showing Name (email) and an "Actual Duration" column showing elapsed time from receivedDate to completedAt in hours and minutes. If overdue, also show overdue hours and minutes.
- **VI:** Tab Đã hoàn thành phải hiển thị cột "Người hoàn thành" dạng Tên (email) và cột "Thời gian thực tế" tính từ receivedDate đến completedAt theo giờ-phút. Nếu quá hạn, hiển thị thêm quá hạn giờ-phút.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] AC1: Completed tab shows Name (email) of user who completed the order
- [ ] AC2: Completed tab shows actual duration in hours and minutes
- [ ] AC3: If overdue, also show overdue hours and minutes

---

### FR-003: Overdue/On-Time Indicators

| Aspect         | Detail        |
| -------------- | ------------- |
| Priority       | Must          |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

- **EN:** The Completed tab must use color indicators for overdue/on-time status (consistent with In Progress tab, but overdue uses a distinct color, e.g., purple).
- **VI:** Tab Đã hoàn thành phải dùng màu sắc để chỉ báo đúng/trễ hạn (giống tab Đang xử lý, nhưng trễ hạn dùng màu khác, ví dụ tím).

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] AC1: On-time and overdue indicators use correct color logic
- [ ] AC2: Overdue uses a distinct color (e.g., purple)

---

### FR-004: Undo and QR Scan Completion

| Aspect         | Detail        |
| -------------- | ------------- |
| Priority       | Must          |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**

- **EN:** Undoing completion must clear completedById. QR scan completion must also log completedById.
- **VI:** Hoàn tác phải xóa completedById. Hoàn thành qua quét QR cũng phải ghi nhận completedById.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**

- [ ] AC1: Undo sets completedById to null
- [ ] AC2: QR scan completion logs completedById

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Performance

| Aspect   | Detail                  |
| -------- | ----------------------- |
| Category | Performance             |
| Metric   | UI updates within 500ms |

**Description / Mô tả:**

- **EN:** UI updates for Completed tab must occur within 500ms after marking complete/undo.
- **VI:** UI tab Đã hoàn thành phải cập nhật trong vòng 500ms sau khi hoàn thành/hoàn tác.

---

### NFR-002: Security

| Aspect   | Detail                                            |
| -------- | ------------------------------------------------- |
| Category | Security                                          |
| Metric   | Only authenticated users can complete/undo orders |

**Description / Mô tả:**

- **EN:** Only authenticated users can mark orders complete or undo completion.
- **VI:** Chỉ người dùng đã xác thực mới được hoàn thành/hoàn tác đơn hàng.

---

### NFR-003: Maintainability

| Aspect   | Detail                           |
| -------- | -------------------------------- |
| Category | Maintainability                  |
| Metric   | Follows project coding standards |

**Description / Mô tả:**

- **EN:** All changes must follow project coding standards and be reviewed.
- **VI:** Mọi thay đổi phải tuân thủ chuẩn code dự án và được review.

---

### NFR-004: Compatibility

| Aspect   | Detail                                        |
| -------- | --------------------------------------------- |
| Category | Compatibility                                 |
| Metric   | Works on latest Chrome, Firefox, Edge, Safari |

**Description / Mô tả:**

- **EN:** UI must work on latest versions of Chrome, Firefox, Edge, Safari.
- **VI:** UI phải hoạt động trên các trình duyệt Chrome, Firefox, Edge, Safari mới nhất.

---

### NFR-005: Accessibility

| Aspect   | Detail            |
| -------- | ----------------- |
| Category | Accessibility     |
| Metric   | Meets WCAG 2.1 AA |

**Description / Mô tả:**

- **EN:** UI must meet WCAG 2.1 AA accessibility standards.
- **VI:** UI phải đáp ứng tiêu chuẩn truy cập WCAG 2.1 AA.

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect    | Detail                                        |
| --------- | --------------------------------------------- |
| Changes   | Schema, UI, and logic for completion tracking |
| Sync Type | immediate                                     |

**Integration Points / Điểm Tích hợp:**

- None (single root)

**Dependencies Affected / Phụ thuộc Ảnh hưởng:**

- None

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### Data Schema: Order (prisma/schema.prisma)

- Add: completedById: String? (FK to User)
- Add: completedBy: User? @relation("CompletedBy", ...)
- Update: completedAt, status, etc. as needed

---

## 6. Edge Cases / Trường hợp Biên

| ID     | Scenario                                               | Expected Behavior               |
| ------ | ------------------------------------------------------ | ------------------------------- |
| EC-001 | User tries to complete order while not authenticated   | Show error, block action        |
| EC-002 | Undo fails due to DB error                             | Show error, keep previous state |
| EC-003 | User info missing at completion                        | Show error, do not update order |
| EC-004 | Overdue calculation edge (completedAt == requiredDate) | Show as on-time                 |

---

## 7. Dependencies / Phụ thuộc

| Dependency  | Type      | Status   |
| ----------- | --------- | -------- |
| Prisma      | Package   | Existing |
| Next.js 16+ | Framework | Existing |
| TypeScript  | Language  | Existing |

---

## 8. Risks & Mitigations / Rủi ro & Giảm thiểu

| Risk                            | Impact | Mitigation                              |
| ------------------------------- | ------ | --------------------------------------- |
| Schema migration error          | Medium | Test migration in dev, backup data      |
| UI confusion on indicator color | Low    | Use clear legend, match In Progress tab |
| Performance regression          | Low    | Optimize queries, test with large data  |

---

## Approval / Phê duyệt

| Role        | Status     | Date       |
| ----------- | ---------- | ---------- |
| Spec Author | ✅ Done    | 2026-02-10 |
| Reviewer    | ⏳ Pending |            |
