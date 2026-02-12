# Decision Log — US-2.1.2: Export Completed Orders to Excel

---

## D1: ExcelJS over SheetJS

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** Cần thư viện tạo file Excel (.xlsx) trên browser.
**Các lựa chọn:** ExcelJS vs SheetJS (xlsx package)
**Quyết định:** ExcelJS
**Lý do:** ExcelJS được duy trì tích cực (release gần nhất ~1 năm vs SheetJS ~4 năm), MIT license (SheetJS community edition hạn chế tính năng), TypeScript types tích hợp sẵn, hỗ trợ browser `writeBuffer()` tốt, 4.4M weekly downloads.

🇬🇧
**Context:** Need a library to generate Excel (.xlsx) files in the browser.
**Options:** ExcelJS vs SheetJS (xlsx package)
**Decision:** ExcelJS
**Rationale:** ExcelJS actively maintained (last release ~1yr vs SheetJS ~4yr), MIT license (SheetJS community edition has feature limitations), built-in TypeScript types, excellent browser `writeBuffer()` support, 4.4M weekly downloads.

---

## D2: Client-side Generation (Not Server-side)

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** Chọn nơi tạo file Excel — client hay server.
**Quyết định:** Client-side
**Lý do:** Tái sử dụng API phân trang hiện có, không tạo áp lực bộ nhớ server, không cần API route mới, triển khai đơn giản hơn, phù hợp quy mô dữ liệu hiện tại (~vài nghìn đơn).

🇬🇧
**Context:** Choose where to generate the Excel file — client or server.
**Decision:** Client-side
**Rationale:** Reuses existing paginated API, no server memory pressure, no new API route needed, simpler deployment, suitable for current data scale (~few thousand orders).

---

## D3: Batch Size 500 per Page

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** Chọn page size cho batch fetch export.
**Quyết định:** 500 per batch
**Lý do:** Cân bằng giữa số lần gọi API và payload mỗi request. Default hiện tại là 50 — quá nhiều request cho export lớn. 500 giảm 10x số request mà vẫn an toàn cho cả server và client.

🇬🇧
**Context:** Choose page size for export batch fetching.
**Decision:** 500 per batch
**Rationale:** Balance between API call count and per-request payload. Current default is 50 — too many requests for large exports. 500 reduces calls by 10x while remaining safe for both server and client.

---

## D4: Dynamic Import for ExcelJS

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** ExcelJS ~500KB minified — ảnh hưởng initial bundle nếu import tĩnh.
**Quyết định:** Dynamic import `await import("exceljs")`
**Lý do:** Chỉ load khi user thực sự nhấn Export. Không ảnh hưởng page load cho tất cả users.

🇬🇧
**Context:** ExcelJS is ~500KB minified — affects initial bundle with static import.
**Decision:** Dynamic import `await import("exceljs")`
**Rationale:** Only loaded when user actually clicks Export. Doesn't affect page load for all users.

---

## D5: Add Sonner `<Toaster />` to Root Layout

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** Sonner package đã có nhưng `<Toaster />` chưa mount trong layout nào. Cần cho error notifications khi export thất bại.
**Quyết định:** Thêm `<Toaster />` vào `src/app/layout.tsx`
**Lý do:** Mount ở root layout để toast hoạt động trên toàn ứng dụng, không chỉ cho export mà còn cho dashboard-filters đang dùng `toast()`.

🇬🇧
**Context:** Sonner package exists but `<Toaster />` not mounted in any layout. Needed for error notifications on export failure.
**Decision:** Add `<Toaster />` to `src/app/layout.tsx`
**Rationale:** Mount at root layout so toasts work app-wide, not just for export but also for dashboard-filters that already call `toast()`.

---

## D6: Sequential Batch Fetch (Not Parallel)

| Aspect | Detail     |
| ------ | ---------- |
| Date   | 2026-02-11 |
| Status | ✅ Final   |

🇻🇳
**Bối cảnh:** Chọn giữa fetch sequential hay parallel cho batch export.
**Quyết định:** Sequential
**Lý do:** Tránh quá tải server, cho phép tracking tiến trình sạch sẽ (1,2,3...N), dễ xử lý abort, dễ debug. Parallel chỉ nhanh hơn ~2-3s cho dataset lớn nhưng tăng complexity đáng kể.

🇬🇧
**Context:** Choose between sequential vs parallel fetching for batch export.
**Decision:** Sequential
**Rationale:** Avoids overwhelming server, allows clean progress tracking (1,2,3...N), easier abort handling, easier to debug. Parallel only saves ~2-3s for large datasets but significantly increases complexity.
