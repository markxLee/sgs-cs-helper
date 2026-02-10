# US-1.3.5 — Completion Tracking — Log Completed By & Show Actual Duration

## Overview

| Field | Value |
|-------|-------|
| User Story | US-1.3.5 |
| Branch | `feature/sgs-cs-helper-us-1.3.5` |
| Base Branch | `main` |
| Status | ✅ Complete |
| Completed | 2026-02-10 |

## Phases

| Phase | Status |
|-------|--------|
| 0 — Analysis | ✅ Approved |
| 1 — Specification | ✅ Approved |
| 2 — Task Planning | ✅ Approved |
| 3 — Implementation | ✅ 6/6 tasks completed, reviewed |
| 4 — Testing | ⏭️ Skipped (manual validation) |
| 5 — Done Check | ✅ Complete |

## Tasks

| ID | Title | Status |
|----|-------|--------|
| T-001 | Add completedById to Order schema + migration | ✅ |
| T-002 | Update mark-done API to record completedById | ✅ |
| T-003 | Update undo-complete API to clear completedById | ✅ |
| T-004 | Update GET /api/orders/completed to include completedBy data | ✅ |
| T-005 | Add duration utilities (formatDuration, calcActualDuration) | ✅ |
| T-006 | Update CompletedOrdersTable UI — new columns & indicators | ✅ |

## Key Deliverables

- **Schema**: `completedById` FK on Order → User
- **APIs**: mark-done records user, undo-complete clears, GET includes relation
- **UI**: 2 new columns — "Completed By" (name + email) and "Actual Duration" (green/purple)
- **Bug Fix**: Overdue color-coding now uses priority-based duration (matches progress bar)

## Known Issues

- ⚠️ P1 duration value (2h in code, 1h in original spec) — needs stakeholder confirmation
- ℹ️ Dead code: `calcOverdueDuration`, `isOverdue` — cleanup in next sprint
