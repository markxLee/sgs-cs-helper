# Work Description — US-1.2.7

**Status**: Draft for Review | **Phase**: 0 (Analysis)  
**Captured**: 2026-02-10 via `/work-intake`

---

## 📋 Summary / Tóm tắt

| Aspect | Value |
|--------|-------|
| **Work Type / Loại công việc** | FEATURE |
| **Title / Tiêu đề** | Multi-Select Registered By Filter with Dedicated Lookup Table |
| **User Story / User Story** | US-1.2.7 |
| **Product / Sản phẩm** | sgs-cs-helper |
| **Phase / Phase** | 1 (MVP) |
| **Epic / Epic** | 1.2 (Order Dashboard) |
| **Affected Roots / Roots bị ảnh hưởng** | sgs-cs-helper |
| **Base Branch / Branch cơ sở** | main |
| **Sources / Nguồn** | Product Checklist, User Stories Backlog, Flow 1 Handoff |

---

## Flow 1 Context / Ngữ cảnh từ Flow 1

| Field | Value |
|-------|-------|
| **From Workflow / Từ Quy trình** | /roadmap-to-delivery |
| **User Story ID** | US-1.2.7 |
| **Product** | sgs-cs-helper |
| **Status Change** | PLANNED → IN_PROGRESS |
| **Git Branch** | feature/sgs-cs-helper-us-1.2.7 |
| **Checklist Path** | docs/product/sgs-cs-helper/checklist.md |

> ℹ️ **Note / Ghi chú**: When Phase 5 completes, checklist.md will be updated to mark this US as DONE / Khi Phase 5 hoàn thành, checklist.md sẽ được cập nhật để đánh dấu US này là DONE.

---

## Problem / Request — Vấn đề / Yêu cầu

**EN:** The Order Dashboard currently supports only single-select filtering by "Registered By", and the filter datasource is extracted from loaded orders on each tab. This creates gaps:
- Users cannot filter by multiple registrants at once
- Registrants who only appear on other pages are never discovered
- Inconsistent data sources across tabs (In Progress uses Set extraction; Completed limited to 50 per page)

We need to enhance the filter to support multi-select backed by a dedicated `Registrant` lookup table, populated during Excel upload and seeded from existing orders.

**VI:** Dashboard Đơn hàng hiện chỉ hỗ trợ lọc đơn lựa chọn theo "Registered By", và nguồn dữ liệu bộ lọc được trích xuất từ các đơn đã tải trên mỗi tab. Điều này tạo ra các khoảng trống:
- Người dùng không thể lọc theo nhiều người đăng ký cùng một lúc
- Những người đăng ký chỉ xuất hiện trên các trang khác không bao giờ được phát hiện
- Các nguồn dữ liệu không nhất quán trên các tab (In Progress sử dụng Set extraction; Completed giới hạn ở 50 trên mỗi trang)

Chúng tôi cần nâng cao bộ lọc để hỗ trợ multi-select được hỗ trợ bởi bảng tra cứu `Registrant` chuyên dụng, được điền trong quá trình tải lên Excel và được seed từ các đơn hiện có.

---

## Expected Outcome — Kết quả Mong đợi

**EN:** 
- Users can select multiple registrants in the "Registered By" filter on both In Progress and Completed tabs
- The filter datasource is a dedicated `Registrant` lookup table, ensuring all known registrants are always available
- Filtering with multiple selections uses OR logic (show orders matching ANY selected registrant)
- Multi-select UI shows selected count and allows clearing individual or all selections
- Filter works consistently across both tabs

**VI:**
- Người dùng có thể chọn nhiều người đăng ký trong bộ lọc "Registered By" trên cả hai tab In Progress và Completed
- Nguồn dữ liệu bộ lọc là bảng tra cứu `Registrant` chuyên dụng, đảm bảo tất cả những người đăng ký được biết luôn có sẵn
- Lọc với nhiều lựa chọn sử dụng logic OR (hiển thị đơn hàng phù hợp với BẤT KỲ người đăng ký được chọn)
- Multi-select UI hiển thị số lượng được chọn và cho phép xóa từng lựa chọn hoặc tất cả
- Bộ lọc hoạt động nhất quán trên cả hai tab

---

## In Scope — Trong Phạm vi

**EN:**
- Create new Prisma model `Registrant` with `name String @unique`
- Populate `Registrant` table during Excel upload (upsert flow)
- Create seed/migration script to backfill `Registrant` from existing orders
- Build API endpoint or Server Action to fetch all registrants
- Update "Registered By" filter on In Progress tab to multi-select
- Update "Registered By" filter on Completed tab to multi-select
- Update filter logic to OR operator for multiple selections
- Update `OrderFilters` type: `registeredBy: string` → `registeredBy: string[]`
- Update In Progress tab client-side filter to support array
- Update Completed tab server-side query to support array
- Multi-select UI with count badge and clear options

**VI:**
- Tạo mô hình Prisma mới `Registrant` với `name String @unique`
- Điền bảng `Registrant` trong khi tải lên Excel (luồng upsert)
- Tạo tập lệnh seed/migration để điền lại `Registrant` từ các đơn hiện có
- Xây dựng endpoint API hoặc Server Action để tìm nạp tất cả những người đăng ký
- Cập nhật bộ lọc "Registered By" trên tab In Progress thành multi-select
- Cập nhật bộ lọc "Registered By" trên tab Completed thành multi-select
- Cập nhật logic bộ lọc thành toán tử OR cho nhiều lựa chọn
- Cập nhật loại `OrderFilters`: `registeredBy: string` → `registeredBy: string[]`
- Cập nhật bộ lọc phía client In Progress tab để hỗ trợ mảng
- Cập nhật truy vấn phía server Completed tab để hỗ trợ mảng
- UI multi-select với count badge và các tùy chọn xóa

---

## Out of Scope — Ngoài Phạm vi

**EN:**
- Changes to other filters (Required Date, Status, etc.)
- Changes to order list sorting
- Changes to pagination or page size
- New filter components for other fields
- Performance optimization beyond current scope
- Changes to other dashboard tabs or features

**VI:**
- Thay đổi đối với các bộ lọc khác (Required Date, Status, v.v.)
- Thay đổi sắp xếp danh sách đơn
- Thay đổi phân trang hoặc kích thước trang
- Các thành phần bộ lọc mới cho các trường khác
- Tối ưu hóa hiệu suất ngoài phạm vi hiện tại
- Thay đổi đối với các tab hoặc tính năng dashboard khác

---

## Constraints — Ràng buộc

| Type / Loại | Constraint / Ràng buộc |
|------|------------|
| **Technical / Kỹ thuật** | Must use Prisma model with `@unique` on `name` field to prevent duplicates |
| **Technical / Kỹ thuật** | Server-side query for Completed tab must use Prisma `in` clause for array filtering |
| **Technical / Kỹ thuật** | Client-side filter for In Progress tab must support `registeredBy: string[]` |
| **Technical / Kỹ thuật** | Multi-select UI component should follow existing shadcn/ui patterns (e.g., Popover + Command) |
| **Technical / Kỹ thuật** | Must populate `Registrant` during Excel upload upsert, not as separate operation |
| **Process / Quy trình** | Depends on US-1.2.6 (Show Registered By, Filter/Sort) — already DONE |
| **Process / Quy trình** | Must update checklist.md to mark US-1.2.7 as DONE in Phase 5 |
| **Database / Cơ sở dữ liệu** | Schema migration required for new `Registrant` table |

---

## Assumptions — Giả định

**EN:**
- Excel upload upsert flow is already in place and can be extended to insert `Registrant` records
- Seed script can safely query all existing `Order.registeredBy` values
- `Registrant` table should be seeded once during initial migration, then maintained via Excel uploads
- UI component reuse (same multi-select component for both tabs) is preferred
- OrderFilters type is already in use and can be safely updated

**VI:**
- Luồng upsert Excel upload đã được thiết lập và có thể được mở rộng để chèn các bản ghi `Registrant`
- Tập lệnh seed có thể an toàn truy vấn tất cả các giá trị `Order.registeredBy` hiện có
- Bảng `Registrant` sẽ được seed một lần trong quá trình migration ban đầu, sau đó được duy trì qua các lần tải lên Excel
- Tái sử dụng thành phần UI (cùng một thành phần multi-select cho cả hai tab) được ưa thích
- Loại OrderFilters đã được sử dụng và có thể được cập nhật một cách an toàn

---

## Acceptance Criteria (from US-1.2.7) — Tiêu chí Nghiệm thu

- [ ] **AC1** / **AC1**: New Prisma model `Registrant` with `name String @unique` — serves as lookup table for all known registrant names
- [ ] **AC2** / **AC2**: During Excel upload (upsert flow), extract unique `registeredBy` values and insert into `Registrant` table if not already present
- [ ] **AC3** / **AC3**: Seed/migration script to populate `Registrant` from existing `Order.registeredBy` via `SELECT DISTINCT registeredBy FROM "Order" WHERE registeredBy IS NOT NULL`
- [ ] **AC4** / **AC4**: API endpoint or Server Action to fetch all registrants from the `Registrant` table (replaces client-side `Set` extraction)
- [ ] **AC5** / **AC5**: "Registered By" filter on **In Progress** tab changes from single-select to multi-select (select multiple names)
- [ ] **AC6** / **AC6**: "Registered By" filter on **Completed** tab changes from single-select to multi-select (same component)
- [ ] **AC7** / **AC7**: Filter logic: when multiple registrants selected, show orders matching ANY of the selected registrants (`OR` logic)
- [ ] **AC8** / **AC8**: Multi-select UI shows selected count badge (e.g., "2 selected") and allows clearing all or individual selections
- [ ] **AC9** / **AC9**: `OrderFilters` type updated: `registeredBy: string` → `registeredBy: string[]`
- [ ] **AC10** / **AC10**: Completed tab server-side query supports `registeredBy` as array (Prisma `in` clause)
- [ ] **AC11** / **AC11**: In Progress tab client-side filter supports `registeredBy` as array

---

## Missing Information — Thông tin Còn thiếu

> ⚠️ The following questions should be answered before proceeding to Phase 1 (Specification):
> ⚠️ Các câu hỏi sau nên được trả lời trước khi tiếp tục sang Phase 1 (Specification):

**None identified** — All critical information captured from Flow 1 (User Story) and Product Checklist. Ready to proceed.

---

**Captured by**: /work-intake (Flow 2 Entry Point)  
**Next Action**: `/work-review` — Review work description for completeness
