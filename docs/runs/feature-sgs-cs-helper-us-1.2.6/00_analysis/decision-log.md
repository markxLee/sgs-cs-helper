# Decision Log — US-1.2.6: Show Registered By, Filter/Sort, Priority ETA

> **Created:** 2026-02-07  
> **Author:** GitHub Copilot  

This document records all significant technical and design decisions made during Phase 0 Analysis.

---

## Decision Summary / Tóm tắt Quyết định

| ID | Decision | Status | Impact |
|----|----------|--------|--------|
| D-001 | Table Technology Choice | ✅ Final | High |
| D-002 | ETA Implementation Approach | ✅ Final | Medium |
| D-003 | Filter/Sort Implementation Location | ✅ **Revised** | High |
| D-004 | Data Fetching Strategy | ✅ **Revised** | Medium |
| D-005 | Registered By Display Format | ✅ Final | Low |
| D-006 | **Feature Scope Limitation** | ✅ **New** | **High** |
| D-006 | **Feature Scope Limitation** | ✅ **New** | **High** |

---

## Decision Details / Chi tiết Quyết định

### D-001: Table Technology Choice

🇻🇳 **Bối cảnh:** User đề xuất "consider datatable". Cần quyết định giữa shadcn/ui Table hiện tại, TanStack Table, hoặc third-party datatable.

🇬🇧 **Context:** User suggested "consider datatable". Need to choose between current shadcn/ui Table, TanStack Table, or third-party datatable.

| Aspect | Decision |
|--------|----------|
| **Decision** | Extend existing shadcn/ui Table component |
| **Alternatives** | TanStack Table, third-party datatable libraries |
| **Rationale** | ✅ Consistent with existing UI patterns, ✅ Already used in AdminList/AuditLogs/StaffList, ✅ No additional dependencies, ✅ Full control over implementation |
| **Trade-offs** | ❌ Manual implementation of sort/filter logic, ✅ Lower risk, ✅ Faster development |
| **Made By** | Phase 0 Analysis |
| **Date** | 2026-02-07 |

### D-002: ETA Implementation Approach

🇻🇳 **Bối cảnh:** AC5 yêu cầu Priority ETA từ config hoặc hardcoded defaults. Có thể tái sử dụng logic progress hiện có.

🇬🇧 **Context:** AC5 requires Priority ETA from config or hardcoded defaults. Can reuse existing progress logic.

| Aspect | Decision |
|--------|----------|
| **Decision** | Reuse existing `getPriorityDuration()` from `src/lib/utils/progress.ts` |
| **Alternatives** | Create new config-based ETA system, separate hardcoded mapping |
| **Rationale** | ✅ Consistent with existing progress calculation, ✅ Already tested, ✅ No additional database queries, ✅ Same duration logic |
| **Implementation** | Format duration from progress utils: P0→15m, P1→1h, P2→2.5h, P3+→3h |
| **Made By** | Phase 0 Analysis |
| **Date** | 2026-02-07 |

### D-003: Filter/Sort Implementation Location

🇻🇳 **Bối cảnh:** User clarified this is for in-progress orders only (small dataset). Cần quyết định xử lý filter/sort ở client-side hay server-side.

🇬🇧 **Context:** User clarified this is for in-progress orders only (small dataset). Need to decide whether to handle filter/sort client-side or server-side.

| Aspect | Decision |
|--------|----------|
| **Decision** | **Client-side** filtering and sorting in RealtimeOrders component |
| **Alternatives** | Server-side filtering/sorting, hybrid approach |
| **Rationale** | ✅ **Small dataset** (in-progress orders only), ✅ **Instant filtering UX**, ✅ **No server changes needed**, ✅ **Simpler implementation** |
| **Trade-offs** | ❌ All data loaded to client, ✅ Perfect for small datasets, ✅ Better UX |
| **Made By** | Phase 0 Analysis (Revised) |
| **Date** | 2026-02-08 |

### D-004: Data Fetching Strategy  

🇻🇳 **Bối cảnh:** Cần include thông tin uploadedBy từ User table. Chỉ cần thay đổi tối thiểu server action.

🇬🇧 **Context:** Need to include uploadedBy information from User table. Only need minimal server action changes.

| Aspect | Decision |
|--------|----------|
| **Decision** | **Minimal change:** Only add include uploadedBy with select: `{ id, email, name, staffCode }` |
| **Alternatives** | Separate query for users, full user object include, create new filtered endpoint |
| **Rationale** | ✅ **Minimal server changes**, ✅ Single query efficiency, ✅ Sufficient data for display, ✅ **Client handles all filtering** |
| **Impact** | Extends `OrderWithProgress` interface, minimal performance impact |
| **Made By** | Phase 0 Analysis (Revised) |
| **Date** | 2026-02-08 |

### D-005: Registered By Display Format

🇻🇳 **Bối cảnh:** Quyết định hiển thị thông tin "Registered By" như thế nào trong table cell.

🇬🇧 **Context:** Decide how to display "Registered By" information in table cell.

| Aspect | Decision |
|--------|----------|
| **Decision** | Multi-line format: Name (primary), Email (secondary), Staff Code (tertiary) |
| **Alternatives** | Single line with email, name only, clickable user profile |
| **Rationale** | ✅ Maximum information density, ✅ Clear hierarchy, ✅ Consistent with existing multi-line cells |
| **Format** | Primary: `name \|\| "Unknown"`, Secondary: `email` (gray), Tertiary: `"Staff: {staffCode}"` (gray) |
| **Made By** | Phase 0 Analysis |
| **Date** | 2026-02-07 |

### D-006: Feature Scope Limitation

🇻🇳 **Bối cảnh:** User clarified feature chỉ áp dụng cho tab "in-progress" orders, không phải toàn bộ orders.

🇬🇧 **Context:** User clarified feature only applies to "in-progress" orders tab, not all orders.

| Aspect | Decision |
|--------|----------|
| **Decision** | **Feature scope limited to in-progress orders only** |
| **Alternatives** | Apply to all orders (in-progress + completed), create universal filtering |
| **Rationale** | ✅ **Smaller dataset** for client-side processing, ✅ **Simpler implementation**, ✅ **Matches user requirements**, ✅ **Better performance** |
| **Impact** | Significantly reduces implementation complexity, enables client-side approach |
| **Made By** | User Requirement (Revision) |
| **Date** | 2026-02-08 |

---

## Rejected Alternatives / Phương án Bị từ chối

### Server-Side Filtering/Sorting (Original Approach)

**Why Considered:** Better scalability, consistent with existing patterns, works with pagination.

**Why Rejected:**
- ❌ **User clarified small dataset** (in-progress orders only)
- ❌ **Overkill for small dataset** 
- ❌ **More complex implementation** (server action changes, parameter handling)
- ❌ **Slower UX** (server round trips on filter changes)
- ✅ **Client-side perfect for small datasets** with instant filtering

### TanStack Table (React Table)

**Why Considered:** Full-featured table library with excellent TypeScript support, headless design.

**Why Rejected:**
- ❌ Overkill for current requirements (just need basic filter/sort)
- ❌ Additional dependency and bundle size
- ❌ Learning curve and development time
- ❌ Would require significant refactor of existing OrdersTable
- ❌ Not consistent with existing table patterns in codebase

### Config-Based ETA System

**Why Considered:** AC5 mentions "read from a `priority_to_eta` config/mapping".

**Why Rejected:**
- ❌ Additional complexity without clear benefit
- ❌ Requires database queries for config lookup
- ❌ Existing progress duration logic already provides same mapping
- ❌ User story allows "sensible hardcoded defaults" as fallback
- ✅ Existing system already tested and working

### Client-Side Filtering/Sorting

**Why Considered:** Faster UX for filter changes, no server round trips.

**Why Rejected:**
- ❌ Doesn't scale with large datasets
- ❌ Inconsistent with existing server-side patterns
- ❌ Won't work well with future pagination
- ❌ Complex state management with real-time updates
- ❌ Memory usage grows with order count

---

## Future Considerations / Cân nhắc Tương lai

### Potential Enhancements / Cải tiến Tiềm năng

1. **Advanced Filters:** Add more filter options (status, priority range, date created)
2. **Column Customization:** Allow users to show/hide columns
3. **Export Functionality:** Export filtered results to Excel/CSV
4. **Pagination:** Add pagination for large datasets
5. **Saved Filter Presets:** Allow users to save common filter combinations

### Technical Debt / Nợ Kỹ thuật

1. **Sorting State Management:** Current approach requires component state management - consider URL params for persistence
2. **Filter Performance:** May need query optimization or caching for complex filters
3. **Real-time Update Complexity:** Filter changes during SSE updates need careful state synchronization

---

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Next Review:** Phase 1 Specification