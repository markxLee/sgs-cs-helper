# Work Updates / Cập nhật Công việc
<!-- US-1.2.1 | Branch: feature/sgs-cs-helper-us-1.2.1 -->

This file tracks requirement changes and scope updates during the workflow.
File này theo dõi các thay đổi yêu cầu và cập nhật phạm vi trong workflow.

---

## Update #0 — Initial Intake / Lần #0 — Ghi nhận ban đầu

| Field | Value |
|-------|-------|
| Timestamp | 2026-02-07 |
| Type | INITIAL |
| Author | Copilot (from roadmap-to-delivery) |

**Description / Mô tả:**
- Created initial work-description.md
- Merged US-1.2.2 (Progress Bar) into US-1.2.1
- Established public read-only access requirement
- Defined progress bar color scheme: ⬜ 0-40%, 🟢 41-65%, 🟡 66-80%, 🔴 >80%

**Scope Changes / Thay đổi Phạm vi:**
- US-1.2.2 merged into US-1.2.1 (Progress Bar is now part of Orders List)
- Access model: Public view (no login), Auth required for updates

---

## Update #1 — Progress Calculation Clarification / Lần #1 — Làm rõ cách tính Progress

| Field | Value |
|-------|-------|
| Timestamp | 2026-02-07 |
| Type | REQUIREMENT_CLARIFICATION |
| Author | User |

**Description / Mô tả:**
User clarified progress bar calculation:
- Default duration: **3 hours** from Received Date (not Registered → Required)
- Future-proofing: Multiple order types with different progress durations
- Admin configurable: SUPER_ADMIN/ADMIN can configure duration per order type

**Scope Changes / Thay đổi Phạm vi:**
- Progress calculation changed: `(now - receivedDate) / durationHours * 100`
- Default durationHours = 3 (when no admin config)
- Added AC12-AC13 for extensibility requirements
- Design must support easy addition of new order type configs

**Impact / Ảnh hưởng:**
- Need to design extensible progress config system
- May need OrderProgressConfig table or similar in future
- For this US: Use hardcoded 3-hour default, but structure code for easy extension

---

## Update #2 — Lunch Break Exclusion / Lần #2 — Bỏ qua giờ nghỉ trưa

| Field | Value |
|-------|-------|
| Timestamp | 2026-02-07 |
| Type | BUSINESS_RULE |
| Author | User |

**Description / Mô tả:**
User added business rule for lunch break:
- If order received before 12:00 and current time is after 13:00
- Subtract 1 hour from elapsed time (lunch break 12:00-13:00)
- Staff are not working during lunch, so don't count that hour

**Formula / Công thức:**
```
elapsedHours = (now - receivedDate) - lunchBreak
lunchBreak = 1 hour IF (receivedDate < 12:00 AND now > 13:00) ELSE 0
progress = elapsedHours / durationHours * 100
```

**Examples / Ví dụ:**
- Order received 11:00, now is 14:00 → elapsed = 3h - 1h lunch = 2h → 66%
- Order received 13:30, now is 16:30 → elapsed = 3h (no lunch break) → 100%
- Order received 11:00, now is 12:30 → elapsed = 1.5h (still in lunch) → 50%

**Scope Changes / Thay đổi Phạm vi:**
- Added AC14 for lunch break exclusion
- Progress calculation logic more complex

---

## Update #3 — Priority-Based Duration / Lần #3 — Thời gian theo Priority

| Field | Value |
|-------|-------|
| Timestamp | 2026-02-07 |
| Type | REQUIREMENT_UPDATE |
| Author | User |

**Description / Mô tả:**
User updated default duration to be based on Order Priority instead of fixed 3 hours:

| Priority | Duration |
|----------|----------|
| 0 | 15 minutes (0.25h) |
| 1 | 1 hour |
| 2 | 2.5 hours |
| >= 3 | 3 hours |

**Rationale / Lý do:**
- Higher priority orders have shorter turnaround times
- Priority 0 is urgent/express (15 min)
- Priority 1-2 are standard tiers
- Priority 3+ is normal processing

**Scope Changes / Thay đổi Phạm vi:**
- AC8 updated: duration based on Priority
- AC13 updated: P0=15min, P1=1h, P2=2.5h, P3+=3h
- Progress calculation now depends on order.priority field

---

<!-- Future updates will be added below -->
