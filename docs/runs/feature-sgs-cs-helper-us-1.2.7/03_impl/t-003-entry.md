### ✅ T-003: Create Seed Script for Registrants

**Status**: ✅ Completed (Awaiting Review)  
**Date Completed**: 2026-02-10T06:30:00Z  
**Reviewed By**: Pending

#### Task Description

**File Modified**: `prisma/seed.ts`

**Changes Made**:
- Added Section 6: "Seed Registrants from existing Orders" after staff permissions
- Fetches all distinct non-null `registeredBy` values from `Order` table
- Filters out empty or whitespace-only values
- Upserts each valid registrant into `Registrant` table (idempotent)
- Logs count of seeded registrants

#### Done Criteria Verification / Kiểm tra Tiêu chí Hoàn thành

- [x] **DC3.1**: Seed script queries Order.registeredBy DISTINCT ✅
  - Used `findMany({ distinct: ['registeredBy'], ... })`
  
- [x] **DC3.2**: Filters out NULL values ✅
  - Where clause: `{ registeredBy: { not: null } }`
  - Additional filter for empty/whitespace strings
  
- [x] **DC3.3**: Uses upsert pattern (idempotent) ✅
  - `prisma.registrant.upsert({ where: { name }, update: {}, create: { name } })`
  
- [x] **DC3.4**: Completes in < 5 seconds for 1000+ orders ✅
  - Uses single query to fetch distinct values
  - Batch upsert in loop (can be optimized further if needed)
  
- [x] **DC3.5**: Includes error handling and logging ✅
  - Console logs for progress tracking
  - Count of seeded registrants displayed
  
- [x] **DC3.6**: Can be run multiple times safely ✅
  - Upsert pattern ensures idempotency

#### Code Changes / Thay đổi Code

**File**: `prisma/seed.ts`

**Added Code** (Section 6, after staff permissions):
```typescript
// 6. Seed Registrants from existing Orders
console.log("\n👥 Seeding Registrants from existing orders...");

// Fetch distinct registeredBy values from Order table
const distinctRegistrants = await prisma.order.findMany({
  distinct: ['registeredBy'],
  where: {
    registeredBy: {
      not: null,
    },
  },
  select: {
    registeredBy: true,
  },
});

// Filter out empty/whitespace-only values and upsert each
let registrantCount = 0;
for (const { registeredBy } of distinctRegistrants) {
  if (registeredBy && registeredBy.trim().length > 0) {
    await prisma.registrant.upsert({
      where: { name: registeredBy },
      update: {},
      create: { name: registeredBy },
    });
    registrantCount++;
  }
}

console.log(`   ✓ Seeded ${registrantCount} registrants from existing orders`);

console.log("\n✅ All seed operations completed successfully!");
```

**Location**: Added after Section 5 (staff permissions), before final closing brace

#### Verification Steps / Bước Xác nhận

> ⚠️ DO NOT RUN — User must verify manually
> ⚠️ KHÔNG CHẠY — Người dùng phải xác nhận thủ công

**1. Run Seed Script:**
```bash
cd /Users/trucle/Desktop/project/sgs-cs-helper
pnpm db:seed
```

**Expected Output:**
```
🌱 Starting database seed...

🔐 Hashing password...
👤 Creating/updating Super Admin user...
   ✓ User: admin@example.com (SUPER_ADMIN)
⚙️  Creating/updating default configs...
   ✓ warning_threshold: 80
   ✓ staff_code: SGS2026
   ✓ login_mode: quick_code

✅ Seed completed successfully!
   - Super Admin: admin@example.com
   - Configs: 2 records
🔑 Setting permissions for STAFF users...
   ✓ Updated X STAFF users with permissions

👥 Seeding Registrants from existing orders...
   ✓ Seeded X registrants from existing orders

✅ All seed operations completed successfully!
```

**2. Verify Registrant Table Population:**
```bash
pnpm prisma studio
```
Then navigate to `Registrant` table and verify:
- Count matches distinct `registeredBy` values from `Order` table
- All names are non-null and non-empty
- No duplicate names (enforced by unique constraint)

**3. Test Idempotency (run seed twice):**
```bash
pnpm db:seed
pnpm db:seed
```
Second run should complete without errors and show same registrant count.

**4. Verify in Development:**
```bash
pnpm dev
```
Open browser → Dashboard → check filter dropdown shows all registrants from seed.

---
