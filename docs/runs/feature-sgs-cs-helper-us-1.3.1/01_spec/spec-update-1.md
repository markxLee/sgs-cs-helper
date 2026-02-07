# Specification: Mark Order as Done (Update 1)
# Đặc tả: Đánh dấu Đơn Hoàn thành (Cập nhật 1)

## 📋 TL;DR

| Aspect | Value |
|--------|-------|
| Feature | Mark Order as Done (Update 1: permission & upload SSE) |
| Phase 0 Analysis | [solution-design](../00_analysis/solution-design.md) |
| Functional Reqs | 4 (updated) |
| Non-Functional Reqs | 3 (including new NFR-005) |
| Affected Roots | sgs-cs-helper |

---

## 1. Overview / Tổng quan

### 1.1 Summary / Tóm tắt
**EN:** This update tightens permission checks around the "Mark Done" action and adds real-time SSE broadcasting for order uploads so UIs observing orders update immediately.

**VI:** Cập nhật này bổ sung kiểm soát quyền cho hành động "Đánh dấu Hoàn thành" và thêm SSE broadcast khi upload đơn để UI theo dõi đơn được cập nhật ngay lập tức.

### 1.2 Scope / Phạm vi
**In Scope / Trong phạm vi:**
- Permission rules for displaying and executing "Mark Done" (frontend + server validation)
- SSE broadcast after upload of new orders (backend + broadcaster integration)
- Tests for permission enforcement and SSE behaviour

**Out of Scope / Ngoài phạm vi:**
- Rework of order upload UX beyond broadcasting
- Audit/log persistence beyond current logging decisions (T-006 was skipped)

---

## 2. Functional Requirements / Yêu cầu Chức năng

### FR-001: Mark Done Button Permission

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The "Mark Done" button is visible and actionable only to users who are SUPER_ADMIN or ADMIN, or STAFF users with the boolean flag `canUpdateStatus = true` on their account.
- **VI:** Nút "Đánh dấu Hoàn thành" chỉ hiển thị và có thể nhấn đối với SUPER_ADMIN, ADMIN hoặc STAFF có `canUpdateStatus = true`.

**Acceptance Criteria / Tiêu chí Nghiệm thu:**
- [ ] AC1: SUPER_ADMIN and ADMIN see and can use the button for in-progress orders.
- [ ] AC2: STAFF with `canUpdateStatus=true` see and can use the button.
- [ ] AC3: STAFF without `canUpdateStatus` do not see the button.
- [ ] AC4: Button remains hidden/disabled for COMPLETED orders.

---

### FR-002: Server-side Permission Validation for Mark Done

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** The `POST /api/orders/:id/mark-done` endpoint must validate the authenticated user's role and `canUpdateStatus` flag before changing order status. Unauthorized attempts must return 403.
- **VI:** Endpoint `mark-done` phải kiểm tra quyền của người dùng (role và `canUpdateStatus`) trước khi cập nhật trạng thái. Trả về 403 nếu không có quyền.

**Acceptance Criteria:**
- [ ] AC1: Requests from unauthorized users receive HTTP 403 and no DB change.
- [ ] AC2: Authorized users can mark IN_PROGRESS orders to COMPLETED and `completedAt` is set.
- [ ] AC3: Endpoint logs attempt with success/failure result (for audit/testing purposes).

---

### FR-003: SSE Broadcast on Mark Done (existing)

| Aspect | Detail |
|--------|--------|
| Priority | Must |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** After successfully marking an order as COMPLETED, the server should broadcast an SSE event to connected clients containing updated order data so UIs update in real time.
- **VI:** Sau khi cập nhật, server gửi SSE event chứa dữ liệu đơn đã cập nhật để các client cập nhật UI.

**Acceptance Criteria:**
- [ ] AC1: SSE event contains order `id`, new `status`, `completedAt`, and fields required by UI.
- [ ] AC2: Clients subscribed to SSE receive event within 1s of update under normal conditions.

---

### FR-004: SSE Broadcast on Upload Orders (new)

| Aspect | Detail |
|--------|--------|
| Priority | Should |
| Affected Roots | sgs-cs-helper |

**Description / Mô tả:**
- **EN:** When new orders are uploaded via the upload endpoint, the server should broadcast SSE events to notify clients currently viewing orders so they can fetch or receive the new orders in real time.
- **VI:** Khi upload đơn mới, server gửi SSE event để client đang theo dõi cập nhật.

**Acceptance Criteria:**
- [ ] AC1: After successful upload, SSE events are emitted for each created order (batch allowed).
- [ ] AC2: Clients update their view without manual refresh.

---

## 3. Non-Functional Requirements / Yêu cầu Phi Chức năng

### NFR-001: Security
- **EN:** All endpoints must enforce authentication and authorization; no privilege escalation is allowed.
- **VI:** Tất cả endpoint phải xác thực và phân quyền.

### NFR-002: Reliability
- **EN:** SSE broadcaster must not cause primary request failures; broadcasting errors should be logged but not block the successful response.
- **VI:** Lỗi broadcast không làm hỏng request chính.

### NFR-005: Real-time for Uploads (new)
- **EN:** Upload SSE events should be delivered with low-latency (target < 1s under normal conditions) and be resilient to temporary broadcaster errors (retry/log).
- **VI:** SSE cho upload có độ trễ thấp, có cơ chế log/retry nếu cần.

---

## 4. Cross-Root Impact / Ảnh hưởng Đa Root

### Root: sgs-cs-helper

| Aspect | Detail |
|--------|--------|
| Changes | Frontend: permission checks in `orders-table` + UI tests; Backend: permission check in `mark-done` endpoint; Upload endpoint: broadcast SSE after create |
| Sync Type | immediate |

**Integration Points:**
- `src/app/api/orders/[id]/mark-done/route.ts` — update to validate permissions (FR-002)
- `src/components/orders/orders-table.tsx` — render logic for `Mark Done` depends on session and `canUpdateStatus` (FR-001)
- `src/app/api/orders/upload/route.ts` (or existing upload handler) — call `broadcastOrderUpdate` after DB insert (FR-004)
- SSE broadcaster: `src/lib/sse/broadcaster.ts` (reuse existing)

---

## 5. Data Contracts / Hợp đồng Dữ liệu

### API: POST /api/orders/:id/mark-done
Request:
```json
{ }
```
Response (200):
```json
{
  "id": "<orderId>",
  "status": "COMPLETED",
  "completedAt": "<iso>"
}
```

### SSE Event Shape: order.updated
```json
{
  "type": "order.updated",
  "payload": {
    "id": "<orderId>",
    "status": "COMPLETED",
    "completedAt": "<iso>",
    "jobNumber": "...",
    "registeredDate": "..."
  }
}
```

---

## 6. UI/UX Specifications
- `Mark Done` button location: Actions column in `OrdersTable` row for IN_PROGRESS orders.
- Visibility: Only for allowed users (see FR-001 logic example below).

Example permission check (pseudo):
```ts
const canMarkDone = session?.user?.role === 'SUPER_ADMIN' ||
  session?.user?.role === 'ADMIN' ||
  session?.user?.canUpdateStatus === true
```

---

## 7. Edge Cases & Error Handling
- EC-001: Attempt to mark an already COMPLETED order — return 400 with message.
- EC-002: Unauthorized user attempts to mark — return 403.
- EC-003: SSE broadcaster fails — record error, return success to caller.
- EC-004: Upload creates many orders — batch SSE event or coalesced notification to avoid flooding.

---

## 8. Out of Scope
- Audit persistence (T-006 was skipped by user). If reintroduced, treat as separate task.

---

## Approval / Phê duyệt
| Role | Status | Date |
|------|--------|------|
| Spec Author | ✅ Done | 2026-02-07 |
| Reviewer | ⏳ Pending | |

---

## Next Steps
Run spec review (recommended):
```
/spec-review
```
Or if you reviewed manually and want to proceed directly:
Say `approved` then run `/phase-2-tasks`
