# Work Description — Update #1
<!-- Created: 2026-02-07 -->

## Update Context

| Field | Value |
|-------|-------|
| Original Work | [work-description.md](work-description.md) |
| Update Number | 1 |
| Update Type | REQUIREMENT_CHANGE |
| Source | User - mid-workflow requirement change |
| Timestamp | 2026-02-07T00:00:00Z |

---

## What Changed / Thay đổi gì

### 🇻🇳 Vietnamese

**1. Kiểm soát quyền cho nút "Mark Done"**
- **Trước đây:** Tất cả STAFF đều thấy nút "Mark Done"
- **Bây giờ:** Chỉ SUPER_ADMIN/ADMIN và STAFF có `canUpdateStatus = true` mới thấy và sử dụng được nút này
- **Lý do:** Cần kiểm soát quyền để chỉ những người được phép mới có thể đánh dấu đơn hoàn thành

**2. SSE broadcast cho Upload Orders**
- **Trước đây:** Upload orders không có real-time update
- **Bây giờ:** Khi upload orders mới, broadcast SSE event để tất cả users đang xem orders được cập nhật UI tự động
- **Lý do:** Đảm bảo tính nhất quán - cả Mark Done và Upload đều có real-time updates

---

### 🇬🇧 English

**1. Permission Control for "Mark Done" Button**
- **Previously:** All STAFF could see "Mark Done" button
- **Now:** Only SUPER_ADMIN/ADMIN and STAFF with `canUpdateStatus = true` can see and use this button
- **Reason:** Need permission control so only authorized users can mark orders as done

**2. SSE Broadcast for Upload Orders**
- **Previously:** Upload orders had no real-time update
- **Now:** When new orders are uploaded, broadcast SSE event so all users viewing orders get automatic UI updates
- **Reason:** Ensure consistency - both Mark Done and Upload have real-time updates

---

## Affected Requirements / Yêu cầu Bị ảnh hưởng

| Requirement ID | Change Type | Description |
|----------------|-------------|-------------|
| FR-001 | Modified | "Mark Done" button visibility now requires permission check |
| FR-002 | Modified | Server action must validate `canUpdateStatus` permission |
| NFR-005 | Added | Upload orders must broadcast SSE for real-time UI updates |

---

## Technical Impact / Ảnh hưởng Kỹ thuật

### Frontend Changes Required

**1. Mark Done Button Permission Check**
- File: `src/components/orders/orders-table.tsx`
- Change: Add permission check before rendering button
- Logic: `(session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' || session.user.canUpdateStatus)`

**2. Upload Orders SSE Broadcast**
- File: `src/app/api/orders/upload/route.ts` (or similar upload endpoint)
- Change: Add SSE broadcast after successful upload
- Logic: `broadcastOrderUpdate(newOrders)` after DB insert

### Backend Changes Required

**1. Mark Done Endpoint Validation**
- File: `src/app/api/orders/[id]/mark-done/route.ts`
- Change: Add permission validation
- Logic: Check `user.role` and `user.canUpdateStatus` before allowing update

**2. Upload Endpoint SSE Integration**
- File: Upload orders endpoint
- Change: Import and call broadcaster after upload
- Logic: Similar to T-004 (Mark Done SSE broadcast)

---

## Affected Phases / Các Phase Bị ảnh hưởng

| Phase | Action Required |
|-------|-----------------|
| 1 - Spec | Update FR-001, FR-002; Add NFR-005 |
| 2 - Tasks | Add new tasks for permission checks and upload SSE |
| 3 - Implementation | Implement permission checks + upload SSE |
| 4 - Tests | Add tests for permission logic and SSE broadcast |
| 5 - Done Check | Re-verify with new requirements |

---

## References

- Original Spec: [../01_spec/spec.md](../01_spec/spec.md)
- Original Tasks: [../02_tasks/tasks.md](../02_tasks/tasks.md)
- Prisma Schema: User model has `canUpdateStatus` boolean field
- SSE Broadcaster: `src/lib/sse/broadcaster.ts` (already implemented for Mark Done)

---

## Next Steps

1. Run `/phase-1-spec` to create `spec-update-1.md`
2. Run `/phase-2-tasks` to create `tasks-update-1.md`
3. Continue with implementation phases as needed
