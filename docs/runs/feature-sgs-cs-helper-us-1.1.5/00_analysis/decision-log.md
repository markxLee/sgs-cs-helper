# Decision Log / Nhật ký Quyết định

## Decision D1: Field vs Table Storage Approach

**Date:** 2026-02-11  
**Context:** Original US-1.1.5 spec required new OrderSample table to store individual sample rows. User provided feedback requesting simplified approach.

**Options Considered:**

### Option A: OrderSample Table (Original Spec)
- **Pros:** Normalized data, can store full sample details, flexible for future features
- **Cons:** Requires schema migration, complex queries (JOIN + COUNT), more implementation effort
- **Risk:** Medium — new table, new relationships, query performance

### Option B: sampleCount Field (User Requested)  
- **Pros:** Field already exists, no migration, simple queries, better performance, matches current need
- **Cons:** Can't store individual sample details, less flexible for future enhancements
- **Risk:** Low — minimal changes, existing field

**Decision:** Option B (sampleCount field)

**Rationale:**
1. **User preference:** Explicitly requested "tính tổng Sample khi upload file excel, và lưu luôn vào table orders"
2. **Pragmatic approach:** Only total count needed currently, not individual sample details
3. **Implementation simplicity:** No schema changes, field already exists with proper type (Int)
4. **Performance:** Direct field access vs JOIN + aggregate query
5. **Risk minimization:** Smaller change scope reduces chance of bugs

**Impact:** 
- Architecture simplified from original spec
- Implementation effort reduced from High → Medium
- Future flexibility slightly reduced (acceptable trade-off)

---

## Decision D2: Sample Data Parsing Scope

**Date:** 2026-02-11  
**Context:** Original spec wanted to parse all 9 columns (A-I) from sample rows. Need to determine minimal viable scope.

**Options Considered:**

### Option A: Parse All Sample Columns
- Parse Section (A), Sample ID (B), Description (C), Analyte (D), Method (E), LOD (F), LOQ (G), Unit (H), Required Date (I)
- Store in OrderSample table or JSON field

### Option B: Parse Only Sample ID Column (B)
- Extract only Sample ID to calculate total count
- Skip other columns since only count is needed

**Decision:** Option B (Sample ID only)

**Rationale:**
1. **Requirement focus:** Only need total sample count, not sample details
2. **Reduced complexity:** Single column parsing vs 9 columns
3. **Performance:** Faster processing, less memory usage
4. **Maintainability:** Simpler code, fewer edge cases

---

## Decision D3: UI Column Placement

**Date:** 2026-02-11  
**Context:** Need to determine where to place "Total Samples" column in both orders tables.

**Options Considered:**

### Option A: After Job Number (Early)
### Option B: After Priority, Before Progress/Status (Middle)  
### Option C: At End (Last column)

**Decision:** Option B (After Priority, Before Progress/Status)

**Rationale:**
1. **Logical grouping:** Metadata (Job, Date, Priority) → Sample Info → Status/Progress
2. **Visual flow:** Natural reading order left-to-right
3. **Existing patterns:** Follows table design patterns in codebase
4. **User experience:** Important info visible without horizontal scrolling

---

## Decision D4: Default Value Handling

**Date:** 2026-02-11  
**Context:** Existing orders in DB have sampleCount=1 (schema default). New orders will have actual counts.

**Options Considered:**

### Option A: Migrate existing data to sampleCount=0
### Option B: Leave existing data as-is, only new uploads get actual counts
### Option C: Change schema default from 1 to 0

**Decision:** Option B + C (Leave existing as-is + change default)

**Rationale:**
1. **Data integrity:** Don't alter historical data  
2. **Clear distinction:** sampleCount=1 = old data, other values = parsed data
3. **No migration risk:** Avoid potential data corruption during migration
4. **Future-focused:** New default(0) makes sense for newly parsed data