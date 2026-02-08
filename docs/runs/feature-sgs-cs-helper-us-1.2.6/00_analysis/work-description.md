# Work Description / Mô tả Công việc
<!-- Generated: 2026-02-08 | User Story: US-1.2.6 -->

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| User Story ID | US-1.2.6 |
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
| Title / Tiêu đề | Show Registered By, Filter/Sort, Priority ETA |
| Affected Roots | sgs-cs-helper |
| Base Branch | main |
| Requestor | Flow 1 (Product Planning) |
| Sources | User Story US-1.2.6 from product checklist, user clarification |

---

### Problem / Request — Vấn đề / Yêu cầu

**EN:** The Orders dashboard currently lacks visibility into who registered each order and filtering/sorting capabilities. Operators need to see who uploaded orders, filter by registrant and required date, and understand priority-based ETA to manage workload effectively.

**VI:** Dashboard Đơn hàng hiện thiếu khả năng xem ai đã đăng ký từng đơn và tính năng lọc/sắp xếp. Người vận hành cần biết ai đã upload đơn, lọc theo người đăng ký và ngày yêu cầu, và hiểu ETA dựa trên priority để quản lý khối lượng công việc hiệu quả.

---

### Expected Outcome — Kết quả Mong đợi

**EN:** Orders list displays "Registered By" column, provides filtering by registrant and required date, supports sorting by multiple fields, and shows calculated ETA per order based on priority configuration.

**VI:** Danh sách đơn hàng hiển thị cột "Registered By", cung cấp lọc theo người đăng ký và ngày yêu cầu, hỗ trợ sắp xếp theo nhiều trường, và hiển thị ETA được tính toán cho mỗi đơn dựa trên cấu hình priority.

---

### In Scope — Trong Phạm vi

- **EN:** Add "Registered By" column showing uploader name/code / **VI:** Thêm cột "Registered By" hiển thị tên/mã người upload
- **EN:** Filter controls for "Registered By" and "Required Date" (date range) / **VI:** Điều khiển lọc cho "Registered By" và "Required Date" (khoảng ngày)
- **EN:** Sort options for "Registered By", "Required Date", and "Priority" / **VI:** Tùy chọn sắp xếp cho "Registered By", "Required Date", và "Priority"
- **EN:** ETA calculation per order based on priority and warning_threshold config / **VI:** Tính toán ETA cho mỗi đơn dựa trên priority và cấu hình warning_threshold
- **EN:** Responsive UI with loading and empty states / **VI:** UI responsive với trạng thái loading và empty
- **EN:** Unit/Integration tests for new functionality / **VI:** Unit/Integration tests cho tính năng mới

### Out of Scope — Ngoài Phạm vi

- **EN:** Major redesign of dashboard layout / **VI:** Thiết kế lại hoàn toàn layout dashboard
- **EN:** Real-time collaborative filtering (multi-user) / **VI:** Lọc cộng tác thời gian thực (multi-user)
- **EN:** Export filtered results / **VI:** Xuất kết quả đã lọc
- **EN:** Advanced analytics or reporting / **VI:** Phân tích nâng cao hoặc báo cáo

---

### Constraints — Ràng buộc

| Type | Constraint |
|------|------------|
| Technical / Kỹ thuật | Must use existing Next.js App Router structure |
| Technical / Kỹ thuật | Follow shadcn/ui component patterns |
| Technical / Kỹ thuật | Maintain TypeScript strict mode compliance |
| Technical / Kỹ thuật | Use Server Components for data fetching when possible |
| Process / Quy trình | Follow existing error handling patterns (Server Actions with try-catch) |
| Process / Quy trình | Use absolute imports with @/ alias |

---

### Assumptions — Giả định

- **EN:** User database contains uploadedBy field linking orders to users / **VI:** Database người dùng chứa trường uploadedBy liên kết đơn hàng với users
- **EN:** Priority field is numeric and higher = more urgent / **VI:** Trường Priority là số và cao hơn = cấp bách hơn
- **EN:** warning_threshold config exists and represents percentage / **VI:** Cấu hình warning_threshold tồn tại và đại diện cho phần trăm
- **EN:** Current orders list component can be extended vs rebuilt / **VI:** Component danh sách đơn hàng hiện tại có thể được mở rộng thay vì xây dựng lại
- **EN:** US-1.1.3 dependency doesn't block this work (per user clarification) / **VI:** Phụ thuộc US-1.1.3 không chặn công việc này (theo làm rõ của user)

---

### Missing Information — Thông tin Còn thiếu

> ⚠️ These questions should be answered during analysis phase
> ⚠️ Các câu hỏi này nên được trả lời trong giai đoạn phân tích

1. **EN:** ETA calculation formula - how should priority and warning_threshold combine? / **VI:** Công thức tính ETA - priority và warning_threshold kết hợp thế nào?
2. **EN:** Date range filter UI pattern - calendar popup or input fields? / **VI:** Mẫu UI lọc khoảng ngày - calendar popup hay input fields?
3. **EN:** Default sort order - what should be the initial sort? / **VI:** Thứ tự sắp xếp mặc định - sắp xếp ban đầu nên là gì?
4. **EN:** "Registered By" display format - show name, code, or both? / **VI:** Định dạng hiển thị "Registered By" - hiện tên, mã, hay cả hai?

---

### Draft Acceptance Criteria — Tiêu chí Nghiệm thu (Nháp)

- [ ] **AC1:** Add "Registered By" column to orders list showing uploader name or staff code / Thêm cột "Registered By" vào danh sách đơn hàng hiển thị tên người upload hoặc mã nhân viên
- [ ] **AC2:** Implement filter controls for "Registered By" and "Required Date" (date range) / Triển khai điều khiển lọc cho "Registered By" và "Required Date" (khoảng ngày)
- [ ] **AC3:** Add sort options for "Registered By", "Required Date", and "Priority" fields / Thêm tùy chọn sắp xếp cho các trường "Registered By", "Required Date", và "Priority"
- [ ] **AC4:** Display calculated ETA per order derived from priority and warning_threshold config / Hiển thị ETA được tính toán cho mỗi đơn từ priority và cấu hình warning_threshold
- [ ] **AC5:** Ensure UI is responsive and accessible with proper loading and empty states / Đảm bảo UI responsive và accessible với trạng thái loading và empty thích hợp
- [ ] **AC6:** Write unit and integration tests covering filter, sort, and ETA computation logic / Viết unit và integration tests bao gồm logic lọc, sắp xếp, và tính toán ETA
- [ ] **AC7:** Maintain existing real-time SSE updates for filtered/sorted views / Duy trì cập nhật SSE thời gian thực hiện tại cho views đã lọc/sắp xếp

---

### Technical Notes — Ghi chú Kỹ thuật

- **Database:** Verify Order.uploadedBy and Order.uploadedById relationships exist
- **Config:** Confirm Config model has warning_threshold key-value pair
- **Components:** Extend existing orders list component in `src/components/orders/`
- **State Management:** Use React state for filter/sort, Server Components for data
- **Performance:** Consider pagination impact when filtering large order sets

---

**Created:** 2026-02-08  
**User Story:** US-1.2.6  
**Flow:** Flow 1 → Flow 2 handoff