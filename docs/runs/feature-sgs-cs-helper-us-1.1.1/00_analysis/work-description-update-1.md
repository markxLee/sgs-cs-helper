# Work Description — Update #1
<!-- US-1.1.1 | Update: 2026-02-07 -->

---

## Update Context / Ngữ cảnh Cập nhật

| Field | Value |
|-------|-------|
| Original Work | [work-description.md](work-description.md) |
| Update Number | #1 |
| Update Type | SCOPE_EXPANSION |
| Source | User request |
| Approved At | 2026-02-07 |

---

## What Changed / Những gì Thay đổi

### 1. Multiple File Upload (thay vì Sequential)

**Before / Trước:**
- AC9: "Sequential upload: can upload another file after first completes"
- User uploads one file, waits for completion, then can upload another

**After / Sau:**
- AC9: "Multiple file upload: can select and upload multiple files at once"
- User can select multiple files in file picker
- All selected files are uploaded (processed sequentially server-side)
- UI shows progress for each file

### 2. Staff Dashboard Integration

**Status:** ✅ Already implemented correctly

The dashboard already shows "Upload Excel" for Staff with `canUpload=true`:
```tsx
{isStaff && canUpload && (
  <Link href="/upload">Upload Excel</Link>
)}
```

No additional changes needed for this requirement.

---

## Affected Requirements / Yêu cầu Bị ảnh hưởng

| ID | Change | Before | After |
|----|--------|--------|-------|
| AC9 | Modified | Sequential upload | Multiple file upload |
| FR-006 | Modified | Sequential Upload Support | Multiple File Upload Support |

---

## Implementation Changes Required / Thay đổi Triển khai Cần thiết

| File | Change |
|------|--------|
| `src/components/orders/upload-form.tsx` | Add `multiple` attribute to file input, handle multiple files, show list of selected files, loop upload calls |
| `src/lib/actions/upload.ts` | No change (keep single-file action, called per file) |

---

## Updated Acceptance Criteria / Tiêu chí Nghiệm thu Cập nhật

- [ ] **AC9 (Updated):** Multiple file upload: can select and upload multiple files at once  
  Tải lên nhiều file: có thể chọn và tải nhiều file cùng lúc

---

## Restart Phase / Phase Bắt đầu lại

| Field | Value |
|-------|-------|
| Restart From | Phase 3: Implementation |
| Affected Phases | 3, 4, 5 |
| Reason | UI behavior change only, no architecture change |

---

**Created:** 2026-02-07
