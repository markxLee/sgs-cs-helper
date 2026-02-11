# Sequence Diagram — US-1.1.5 Upload with Samples
<!-- Revised: 2026-02-11 -->

## Main Flow: Upload Excel with Samples

```
User              FileUpload         parseExcelFile()     createOrders()        Database
 │                    │                    │                    │                    │
 │  Select file(s)    │                    │                    │                    │
 │───────────────────>│                    │                    │                    │
 │                    │  Read .xlsx        │                    │                    │
 │                    │───────────────────>│                    │                    │
 │                    │                    │                    │                    │
 │                    │                    │─┐ Parse rows 0-3   │                    │
 │                    │                    │ │ (metadata)        │                    │
 │                    │                    │<┘                   │                    │
 │                    │                    │                    │                    │
 │                    │                    │─┐ parseSamples()   │                    │
 │                    │                    │ │ rows 10+, 9 cols │                    │
 │                    │                    │ │ skip empty B col │                    │
 │                    │                    │<┘                   │                    │
 │                    │                    │                    │                    │
 │                    │                    │─┐ calculateSample  │                    │
 │                    │                    │ │ Count(samples)    │                    │
 │                    │                    │ │ max .NNN suffix  │                    │
 │                    │                    │<┘                   │                    │
 │                    │                    │                    │                    │
 │                    │  ParsedOrder       │                    │                    │
 │                    │  {metadata,        │                    │                    │
 │                    │   samples[],       │                    │                    │
 │                    │   sampleCount}     │                    │                    │
 │                    │<───────────────────│                    │                    │
 │                    │                    │                    │                    │
 │  Show preview      │                    │                    │                    │
 │<───────────────────│                    │                    │                    │
 │                    │                    │                    │                    │
 │  Confirm upload    │                    │                    │                    │
 │───────────────────>│                    │                    │                    │
 │                    │  createOrders(orders)                   │                    │
 │                    │───────────────────────────────────────>│                    │
 │                    │                    │                    │                    │
 │                    │                    │                    │  BEGIN TX           │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │                    │
 │                    │                    │                    │  Lookup existing   │
 │                    │                    │                    │  by jobNumbers     │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │<───────────────────│
 │                    │                    │                    │                    │
 │                    │                    │                    │  Upsert Order      │
 │                    │                    │                    │  (w/ sampleCount)  │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │                    │
 │                    │                    │                    │  DELETE OrderSample│
 │                    │                    │                    │  WHERE orderId=?   │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │                    │
 │                    │                    │                    │  createMany        │
 │                    │                    │                    │  OrderSample[]     │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │                    │
 │                    │                    │                    │  COMMIT TX         │
 │                    │                    │                    │───────────────────>│
 │                    │                    │                    │<───────────────────│
 │                    │                    │                    │                    │
 │                    │  BatchCreateResult │                    │                    │
 │                    │<───────────────────────────────────────│                    │
 │                    │                    │                    │                    │
 │  Show result       │                    │                    │                    │
 │<───────────────────│                    │                    │                    │
 │                    │                    │                    │                    │
```

## Re-Upload Flow (Same jobNumber)

```
Action              Database
 │                    │
 │  BEGIN TX           │
 │───────────────────>│
 │                    │
 │  Find Order by     │
 │  jobNumber         │
 │───────────────────>│
 │  Found (existing)  │
 │<───────────────────│
 │                    │
 │  Compare metadata  │
 │─┐ (7 fields)       │
 │<┘                   │
 │                    │
 │  UPDATE Order      │
 │  (if changed)      │
 │  + sampleCount     │
 │───────────────────>│
 │                    │
 │  DELETE FROM       │
 │  OrderSample       │
 │  WHERE orderId=?   │
 │───────────────────>│
 │                    │
 │  INSERT INTO       │
 │  OrderSample       │
 │  (new samples)     │
 │───────────────────>│
 │                    │
 │  COMMIT TX         │
 │───────────────────>│
 │<───────────────────│
```
