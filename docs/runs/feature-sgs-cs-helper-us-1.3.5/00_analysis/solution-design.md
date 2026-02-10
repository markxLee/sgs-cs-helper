# 00_analysis/solution-design.md

## 0.1 Request Analysis / Phân tích Yêu cầu

### Problem Statement / Vấn đề

**EN:**
The system does not track which user completed an order or display the actual processing duration in the Completed tab. This limits staff performance reporting and makes it difficult to identify overdue completions.

**VI:**
Hệ thống chưa ghi nhận người hoàn thành đơn hàng và chưa hiển thị thời gian xử lý thực tế trong tab Đã hoàn thành. Điều này hạn chế việc báo cáo hiệu suất nhân viên và khó xác định các đơn hoàn thành trễ hạn.

### Context / Ngữ cảnh

| Aspect          | Current / Hiện tại                                      | Desired / Mong muốn                                                    |
| --------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Behavior        | Orders can be marked complete, but no user is recorded. | When completed, record user and show in Completed tab.                 |
| Data flow       | No completedById or duration fields in Order model.     | Add completedById, completedBy relation, and duration calculation.     |
| User experience | Completed tab lacks info on who finished and how long.  | Completed tab shows Name (email), actual duration, and overdue status. |

### Gap Analysis / Phân tích Khoảng cách

- EN: Missing user tracking and duration display for completed orders.
- VI: Thiếu ghi nhận người hoàn thành và hiển thị thời gian xử lý cho đơn đã hoàn thành.
- EN: Need to add schema fields, UI columns, and logic for indicators.
- VI: Cần bổ sung trường schema, cột UI, và logic cho chỉ báo.

### Affected Areas / Vùng Ảnh hưởng

| Root          | Component/Module           | Impact                                              |
| ------------- | -------------------------- | --------------------------------------------------- |
| sgs-cs-helper | prisma/schema.prisma       | Add completedById, completedBy relation to Order    |
| sgs-cs-helper | src/app/(dashboard)/orders | Update Completed tab UI, add columns, indicators    |
| sgs-cs-helper | src/lib/db/order.ts        | Update logic for completion, undo, QR scan          |
| sgs-cs-helper | src/components/orders      | Add/modify components for new fields and indicators |

### Open Questions / Câu hỏi Mở

1. EN: None (all clarified) / VI: Không còn (đã làm rõ)

### Assumptions / Giả định

1. EN: User is always authenticated / VI: Người dùng luôn đăng nhập
2. EN: Undo completion is available and clears completedById / VI: Có thể hoàn tác và sẽ xóa completedById
3. EN: Order model can be extended safely / VI: Model Order có thể mở rộng thêm trường mới

---

## 0.2 Solution Research / Nghiên cứu Giải pháp

### Existing Patterns Found / Pattern Có sẵn

| Location                   | Pattern                               | Applicable | Notes                                 |
| -------------------------- | ------------------------------------- | ---------- | ------------------------------------- |
| prisma/schema.prisma       | User/Order relations, status enums    | Yes        | Extend Order model as per pattern     |
| src/app/(dashboard)/orders | Table rendering, status indicators    | Yes        | Add columns, reuse status color logic |
| src/lib/db/order.ts        | Order update logic, server actions    | Yes        | Extend logic for completedById, undo  |
| src/components/orders      | Table, filter, sort, badge components | Yes        | Extend for new fields, indicators     |

### Similar Implementations / Triển khai Tương tự

| Location                   | What it does                           | Learnings                                                                              |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| src/app/(dashboard)/orders | Shows order list, status, progress bar | EN: Can reuse table, color logic / VI: Có thể tái sử dụng bảng, logic màu              |
| src/lib/db/order.ts        | Handles order completion, undo         | EN: Extend to log user, clear on undo / VI: Mở rộng để ghi nhận user, xóa khi hoàn tác |

### Dependencies / Phụ thuộc

| Dependency  | Purpose               | Status   |
| ----------- | --------------------- | -------- |
| Prisma      | ORM, schema migration | Existing |
| Next.js 16+ | App framework         | Existing |
| TypeScript  | Type safety           | Existing |

### Cross-Root Dependencies / Phụ thuộc Đa Root

| From   | To  | Type | Impact |
| ------ | --- | ---- | ------ |
| (none) |     |      |        |

### Reusable Components / Component Tái sử dụng

- src/components/orders/OrderTable: EN: Table rendering, sorting, filtering / VI: Hiển thị bảng, sắp xếp, lọc
- src/components/orders/StatusBadge: EN: Status color logic / VI: Logic màu trạng thái

### New Components Needed / Component Cần tạo Mới

- EN: None required; extend existing components / VI: Không cần mới, chỉ mở rộng component hiện có

---

## 0.3 Solution Design / Thiết kế Giải pháp

### Solution Overview / Tổng quan Giải pháp

**EN:**
Extend the Order model to include completedById and completedBy relation. Update the order completion logic to record the user, and update the Completed tab UI to show Name (email), actual duration, and overdue/on-time indicators using color. All changes follow existing patterns for schema, server actions, and UI components.

**VI:**
Mở rộng model Order để thêm completedById và quan hệ completedBy. Cập nhật logic hoàn thành đơn để ghi nhận người dùng, cập nhật UI tab Đã hoàn thành để hiển thị Tên (email), thời gian thực tế, và chỉ báo đúng/trễ hạn bằng màu sắc. Tất cả thay đổi tuân theo pattern hiện có cho schema, server actions, và component UI.

### Approach Comparison / So sánh Phương pháp

| Approach              | Pros                                  | Cons                       | Verdict                  |
| --------------------- | ------------------------------------- | -------------------------- | ------------------------ |
| **Extend existing**   | Consistent, minimal risk, reuses code | Some refactor needed       | ✅ Selected              |
| New custom components | Flexible, decoupled                   | More code, less DRY        | ❌ Rejected: Unnecessary |
| External plugin       | Fast, less code                       | Not tailored, less control | ❌ Rejected: Not needed  |

### Components / Các Component

| #   | Name             | Root          | Purpose                                                                  |
| --- | ---------------- | ------------- | ------------------------------------------------------------------------ |
| 1   | Order (schema)   | sgs-cs-helper | EN: Add completedById, completedBy / VI: Thêm completedById, completedBy |
| 2   | OrderTable       | sgs-cs-helper | EN: Show new columns, indicators / VI: Hiển thị cột mới, chỉ báo         |
| 3   | Order logic (db) | sgs-cs-helper | EN: Record user, clear on undo / VI: Ghi nhận user, xóa khi hoàn tác     |

### Component Details / Chi tiết Component

#### Component 1: Order (schema)

| Aspect       | Detail                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| Root         | sgs-cs-helper                                                            |
| Location     | prisma/schema.prisma                                                     |
| Purpose      | EN: Add completedById, completedBy / VI: Thêm completedById, completedBy |
| Inputs       | n/a                                                                      |
| Outputs      | n/a                                                                      |
| Dependencies | Prisma                                                                   |

#### Component 2: OrderTable

| Aspect       | Detail                                                           |
| ------------ | ---------------------------------------------------------------- |
| Root         | sgs-cs-helper                                                    |
| Location     | src/app/(dashboard)/orders, src/components/orders                |
| Purpose      | EN: Show new columns, indicators / VI: Hiển thị cột mới, chỉ báo |
| Inputs       | Order[]                                                          |
| Outputs      | Table rows                                                       |
| Dependencies | shadcn/ui, StatusBadge                                           |

#### Component 3: Order logic (db)

| Aspect       | Detail                                                               |
| ------------ | -------------------------------------------------------------------- |
| Root         | sgs-cs-helper                                                        |
| Location     | src/lib/db/order.ts                                                  |
| Purpose      | EN: Record user, clear on undo / VI: Ghi nhận user, xóa khi hoàn tác |
| Inputs       | Order, User                                                          |
| Outputs      | Updated Order                                                        |
| Dependencies | Prisma, NextAuth                                                     |

### Data Flow / Luồng Dữ liệu

| Step | From   | To     | Data            | Action                                 |
| ---- | ------ | ------ | --------------- | -------------------------------------- |
| 1    | User   | UI     | Complete action | Mark order complete                    |
| 2    | UI     | Server | Order ID, User  | Update order, set completedById        |
| 3    | Server | DB     | Order, User     | Save completedById, completedAt        |
| 4    | DB     | UI     | Order[]         | Show Name (email), duration, indicator |
| 5    | User   | UI     | Undo action     | Clear completedById                    |
| 6    | UI     | Server | Order ID        | Update order, set completedById null   |

### Error Handling / Xử lý Lỗi

| Scenario               | Handling                        | User Impact                 |
| ---------------------- | ------------------------------- | --------------------------- |
| User not authenticated | Block action, show error        | Cannot complete order       |
| DB update fails        | Show error, do not update UI    | No data loss, user notified |
| Undo fails             | Show error, keep previous state | User can retry              |
| Invalid user data      | Validate, show error if missing | User must fix session       |

### Rollback Plan / Kế hoạch Rollback

**EN:**
If issues arise, revert schema changes, remove completedById and related UI/logic. Restore previous Order model and UI.

**VI:**
Nếu có vấn đề, hoàn tác thay đổi schema, xóa completedById và các thay đổi UI/logic liên quan. Khôi phục model Order và UI như trước.

---

## 0.4 Diagrams / Sơ đồ

See [diagrams/flow-overview.md](./diagrams/flow-overview.md) for flow overview.
