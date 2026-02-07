# Architecture Change: Mark Order as Done

## System Changes Visualization

```mermaid
graph TD
    subgraph UI
      OR[OrdersTable Component]
    end
    subgraph API
      SA[MarkDoneAction Server Action]
    end
    subgraph Infra
      SSE[SSE Broadcaster]
      AUD[AuditLog]
      DB[(Database)]
    end
    OR -- "Call" --> SA
    SA -- "Update" --> DB
    SA -- "Log" --> AUD
    SA -- "Broadcast" --> SSE
    SSE -- "Push" --> OR
```

## Notes
- UI: orders-table.tsx gets new button and modal
- API: New/updated server action for marking done
- Infra: SSE and AuditLog utilities used
