# Flow Overview — US-1.1.5 Sample Parsing & Display
<!-- Revised: 2026-02-11 -->

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Excel File (.xlsx)                       │
│  Rows 0-3: Order metadata (jobNumber, dates, priority...)   │
│  Rows 10+: Sample data (9 columns: Section..Required Date)  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  parseExcelFile() — Client                   │
│                                                              │
│  ┌───────────────────────┐  ┌─────────────────────────────┐ │
│  │ Rows 0-3:             │  │ Rows 10+:                   │ │
│  │ extractJobNumber()    │  │ parseSamples()              │ │
│  │ getCellValue(meta)    │  │  → 9 cols per row           │ │
│  │ extractNote()         │  │  → skip if sampleId empty   │ │
│  │ → Order fields        │  │  → ParsedSample[]           │ │
│  └───────────┬───────────┘  └──────────┬──────────────────┘ │
│              │                         │                     │
│              │              ┌──────────┴──────────────────┐ │
│              │              │ calculateSampleCount()       │ │
│              │              │  → max .NNN suffix           │ │
│              │              │  → fallback: samples.length  │ │
│              │              └──────────┬──────────────────┘ │
│              └──────────┬──────────────┘                     │
│                         ▼                                    │
│           ParsedOrder {                                      │
│             ...metadata,                                     │
│             samples: ParsedSample[],                         │
│             sampleCount: number                              │
│           }                                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ toCreateOrderInput()
┌─────────────────────────────────────────────────────────────┐
│              createOrders() — Server Action                   │
│                                                              │
│  1. Dedup by jobNumber                                       │
│  2. Batch lookup existing orders                             │
│  3. Categorize: create / update / unchanged                  │
│  4. BEGIN TRANSACTION:                                       │
│     ├─ New order:                                            │
│     │  ├─ prisma.order.create({...metadata, sampleCount})   │
│     │  └─ prisma.orderSample.createMany(samples)            │
│     ├─ Existing order (changed):                             │
│     │  ├─ prisma.order.update({...metadata, sampleCount})   │
│     │  ├─ prisma.orderSample.deleteMany({orderId})          │
│     │  └─ prisma.orderSample.createMany(samples)            │
│     └─ Existing order (unchanged metadata):                  │
│        ├─ prisma.orderSample.deleteMany({orderId})          │
│        ├─ prisma.orderSample.createMany(samples)            │
│        └─ prisma.order.update({sampleCount})                │
│  5. COMMIT                                                   │
│  6. SSE broadcast                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│                                                              │
│  ┌────────────────┐         ┌──────────────────────────┐    │
│  │     Order       │───1:N──│     OrderSample           │    │
│  │                 │         │                           │    │
│  │ id              │         │ id                        │    │
│  │ jobNumber (uniq)│         │ orderId (FK → Order.id)  │    │
│  │ sampleCount     │         │ section                   │    │
│  │ ...metadata     │         │ sampleId                  │    │
│  │                 │         │ description               │    │
│  │ samples[]  ─────│─────────│ analyte                   │    │
│  │                 │         │ method                    │    │
│  │                 │         │ lod, loq, unit            │    │
│  │                 │         │ requiredDate              │    │
│  └────────────────┘         └──────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI — Orders Tables                         │
│                                                              │
│  Tab: In Progress                                            │
│  ┌────────┬──────┬──────┬─────────┬───────────────┬────┐    │
│  │ Job#   │ Reg  │ Recv │Priority │ Total Samples │ ...│    │
│  │ 25-001 │ 2/10 │ 2/11 │ Normal  │      12       │    │    │
│  └────────┴──────┴──────┴─────────┴───────────────┴────┘    │
│                                                              │
│  Tab: Completed                                              │
│  ┌────────┬──────┬─────────┬───────────────┬───────────┐    │
│  │ Job#   │ Reg  │Priority │ Total Samples │Completed  │    │
│  │ 25-002 │ 2/08 │ Rush    │       5       │ 2/11 14:00│    │
│  └────────┴──────┴─────────┴───────────────┴───────────┘    │
└─────────────────────────────────────────────────────────────┘
```
