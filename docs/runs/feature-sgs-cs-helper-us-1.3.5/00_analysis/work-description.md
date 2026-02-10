## 📋 Work Description / Mô tả Công việc

### Flow 1 Context / Ngữ cảnh từ Flow 1

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| User Story ID  | US-1.3.5                                |
| Product        | sgs-cs-helper                           |
| Checklist Path | docs/product/sgs-cs-helper/checklist.md |
| Status         | IN_PROGRESS (updated from PLANNED)      |

> ℹ️ When Phase 5 completes, checklist.md will be updated to mark this US as DONE.

---

### Summary / Tóm tắt

| Aspect           | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Work Type / Loại | FEATURE                                                            |
| Title / Tiêu đề  | Completion Tracking — Log Completed By & Show Actual Duration      |
| Affected Roots   | sgs-cs-helper                                                      |
| Base Branch      | main                                                               |
| Requestor        | User Story Intake                                                  |
| Sources          | checklist.md, user-stories.md, roadmap.md, tech-stack instructions |

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:**
The system does not track which user completed an order or display the actual processing duration in the Completed tab. This limits staff performance reporting and makes it difficult to identify overdue completions.

**VI:**
Hệ thống chưa ghi nhận người hoàn thành đơn hàng và chưa hiển thị thời gian xử lý thực tế trong tab Đã hoàn thành. Điều này hạn chế việc báo cáo hiệu suất nhân viên và khó xác định các đơn hoàn thành trễ hạn.

---

### Expected Outcome — Kết quả Mong đợi

**EN:**

- When an order is marked complete, the user who performed the action is recorded.
- The Completed tab displays both the name of the user who completed the order and the actual processing duration.
- Overdue completions are clearly indicated.

**VI:**

- Khi đánh dấu đơn hoàn thành, hệ thống ghi nhận người thực hiện.
- Tab Đã hoàn thành hiển thị tên người hoàn thành và thời gian xử lý thực tế.
- Đơn hoàn thành trễ được hiển thị cảnh báo rõ ràng.

---

### In Scope — Trong Phạm vi

- EN: Schema changes to Order model for completedById and relation / VI: Thay đổi schema Order để thêm completedById và quan hệ
- EN: UI changes to Completed tab for new columns and indicators / VI: Thay đổi UI tab Đã hoàn thành để thêm cột và chỉ báo mới
- EN: Logic to record user on completion and clear on undo / VI: Ghi nhận người hoàn thành khi hoàn thành đơn, xóa khi hoàn tác
- EN: Sorting/filtering by Completed By / VI: Sắp xếp/lọc theo Người hoàn thành

### Out of Scope — Ngoài Phạm vi

- EN: Staff performance analytics dashboard / VI: Dashboard phân tích hiệu suất nhân viên
- EN: Changes to order upload or parsing logic / VI: Thay đổi logic upload hoặc phân tích đơn hàng
- EN: Changes to authentication or user management / VI: Thay đổi xác thực hoặc quản lý người dùng

---

### Constraints — Ràng buộc

| Type                 | Constraint                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Technical / Kỹ thuật | Must use Prisma for schema and data access; Next.js 16+; TypeScript strict mode; Server Actions for mutations |
| Time / Thời gian     | Target: Next milestone (0.3.x)                                                                                |
| Process / Quy trình  | Must follow governed workflow; All changes must be reviewed                                                   |

---

### Assumptions — Giả định

- EN: User performing completion is always authenticated / VI: Người hoàn thành luôn đã đăng nhập
- EN: Undo completion is available and clears completedById / VI: Có thể hoàn tác và sẽ xóa completedById
- EN: Order data model is extensible for new fields / VI: Model Order có thể mở rộng thêm trường mới

---

### Missing Information — Thông tin Còn thiếu

> ⚠️ These questions MUST be answered before proceeding
> ⚠️ Các câu hỏi này PHẢI được trả lời trước khi tiếp tục

**Answers:**

- EN: "Completed By" should display as Name (email) / VI: "Người hoàn thành" hiển thị dạng Tên (email)
- EN: "Actual Duration" should display in hours and minutes (e.g., 2h 15m). If overdue, also show overdue hours and minutes. / VI: "Thời gian thực tế" hiển thị giờ - phút, nếu quá hạn thì hiển thị thêm quá hạn giờ - phút
- EN: Overdue/on-time indicators should use color (same as In Progress tab), but overdue should use a distinct color (e.g., purple). / VI: Chỉ báo trễ hạn/đúng hạn dùng màu như tab Đang xử lý, nếu quá hạn dùng màu khác (ví dụ tím)

---

### Refined Acceptance Criteria — Tiêu chí Nghiệm thu (Đã làm rõ)

- [ ] AC1: EN: When marking an order as complete, the completedById (current user ID) is recorded in the Order record / VI: Khi đánh dấu đơn hoàn thành, completedById (ID người dùng hiện tại) được ghi vào bản ghi Order
- [ ] AC2: EN: Schema change: add completedById (optional FK → User) and completedBy relation to Order model / VI: Thay đổi schema: thêm completedById (FK tùy chọn → User) và quan hệ completedBy vào model Order
- [ ] AC3: EN: Completed tab displays a "Completed By" column showing Name (email) of the user who completed the order / VI: Tab Đã hoàn thành hiển thị cột "Người hoàn thành" dạng Tên (email)
- [ ] AC4: EN: Completed tab displays an "Actual Duration" column showing elapsed time from receivedDate to completedAt in hours and minutes (e.g., 2h 15m). If overdue, also show overdue hours and minutes. / VI: Tab Đã hoàn thành hiển thị cột "Thời gian thực tế" tính từ receivedDate đến completedAt theo giờ-phút, nếu quá hạn hiển thị thêm quá hạn giờ-phút
- [ ] AC5: EN: If the order was completed after requiredDate (overdue): display overdue indicator with how long past deadline, using a distinct color (e.g., purple) / VI: Nếu đơn hoàn thành sau requiredDate (trễ): hiển thị chỉ báo trễ hạn với thời gian vượt quá, dùng màu khác (ví dụ tím)
- [ ] AC6: EN: If the order was completed before or on requiredDate: display on-time indicator using color consistent with In Progress tab / VI: Nếu đơn hoàn thành đúng hạn: hiển thị chỉ báo đúng hạn, dùng màu giống tab Đang xử lý
- [ ] AC7: EN: Undo completion must also clear completedById (set to null) / VI: Hoàn tác phải xóa completedById (đặt về null)
- [ ] AC8: EN: "Completed By" is sortable and filterable in the Completed tab / VI: "Người hoàn thành" có thể sắp xếp và lọc trong tab Đã hoàn thành
- [ ] AC9: EN: QR scan completion must also log completedById / VI: Hoàn thành qua quét QR cũng phải ghi nhận completedById

- [ ] AC1: EN: When marking an order as complete, the completedById (current user ID) is recorded in the Order record / VI: Khi đánh dấu đơn hoàn thành, completedById (ID người dùng hiện tại) được ghi vào bản ghi Order
- [ ] AC2: EN: Schema change: add completedById (optional FK → User) and completedBy relation to Order model / VI: Thay đổi schema: thêm completedById (FK tùy chọn → User) và quan hệ completedBy vào model Order
- [ ] AC3: EN: Completed tab displays a "Completed By" column showing the name of the user who completed the order / VI: Tab Đã hoàn thành hiển thị cột "Người hoàn thành" với tên người hoàn thành
- [ ] AC4: EN: Completed tab displays an "Actual Duration" column showing elapsed time from receivedDate to completedAt / VI: Tab Đã hoàn thành hiển thị cột "Thời gian thực tế" tính từ receivedDate đến completedAt
- [ ] AC5: EN: If the order was completed after requiredDate (overdue): display overdue indicator with how long past deadline / VI: Nếu đơn hoàn thành sau requiredDate (trễ): hiển thị chỉ báo trễ hạn với thời gian vượt quá
- [ ] AC6: EN: If the order was completed before or on requiredDate: display on-time indicator / VI: Nếu đơn hoàn thành đúng hạn: hiển thị chỉ báo đúng hạn
- [ ] AC7: EN: Undo completion must also clear completedById (set to null) / VI: Hoàn tác phải xóa completedById (đặt về null)
- [ ] AC8: EN: "Completed By" is sortable and filterable in the Completed tab / VI: "Người hoàn thành" có thể sắp xếp và lọc trong tab Đã hoàn thành
- [ ] AC9: EN: QR scan completion must also log completedById / VI: Hoàn thành qua quét QR cũng phải ghi nhận completedById
