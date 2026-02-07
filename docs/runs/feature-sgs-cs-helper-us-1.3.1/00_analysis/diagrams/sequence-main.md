# Sequence: Mark Order as Done

```mermaid
sequenceDiagram
    participant U as User (Staff)
    participant OR as OrdersTable (UI)
    participant SA as MarkDoneAction (Server Action)
    participant DB as Database
    participant SSE as SSE Broadcaster
    participant AUD as AuditLog

    U->>OR: Click Mark Done
    OR->>OR: Show confirmation modal
    OR->>SA: Confirm, call server action
    SA->>DB: Update order status to COMPLETED, set completedAt
    SA->>AUD: Log completion event
    SA->>SSE: Broadcast updated order
    SSE->>U: UI updates in real time
```

## Notes / Ghi chú
- Step 1: User clicks button, modal shown
- Step 2: On confirm, server action updates DB, logs event, broadcasts SSE
- Step 3: UI updates for all clients
