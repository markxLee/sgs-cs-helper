# Decision Log — US-1.3.4: Scan QR/Barcode to Mark Order Complete
<!-- Created: 2026-02-10 -->

---

## Decisions

| ID | Date | Decision | Rationale | Status |
|----|------|----------|-----------|--------|
| D1 | 2026-02-10 | Scanner library: `@yudiel/react-qr-scanner` v2.5.1 | React-first, TypeScript, small bundle, actively maintained | Final |
| D2 | 2026-02-10 | UI pattern: Full-page overlay (not modal/route) | Best mobile UX for batch scanning, no routing overhead | Final |
| D3 | 2026-02-10 | Reuse `POST /api/orders/[id]/mark-done` | Existing endpoint handles auth + Prisma + SSE — no duplication | Final |
| D4 | 2026-02-10 | New `GET /api/orders/lookup` API route | Scanner decodes `jobNumber`, mark-done needs `orderId` — lookup bridges gap | Final |
| D5 | 2026-02-10 | `next/dynamic` with `{ ssr: false }` | Camera API browser-only; first dynamic import in codebase | Final |
| D6 | 2026-02-10 | Reuse `ConfirmDialog` for scan confirmation | Consistent UX with existing mark-done row button flow | Final |
| D7 | 2026-02-10 | Scanner pauses on decode, resumes after action | Prevents rapid duplicate scans; clean state management | Final |

---

## Detail Records

### D1: Scanner Library Choice

**Context:**  
Need a React QR/barcode scanner for Next.js 16 + React 19 stack.

**Options Considered:**
1. `@yudiel/react-qr-scanner` v2.5.1 — React wrapper, TypeScript, 2.3k GitHub stars
2. `html5-qrcode` — Vanilla JS, larger bundle, needs React integration
3. `react-qr-reader` — Deprecated, no React 19 support
4. Custom WebRTC + `jsQR` — Maximum control but high effort

**Decision:** `@yudiel/react-qr-scanner` v2.5.1

**Rationale:** React-first API (no manual DOM manipulation), TypeScript included, small bundle, actively maintained. Peer dep `react >= 18` — should work with React 19. Chosen during backlog planning, confirmed during analysis.

---

### D2: UI Pattern for Scanner

**Context:**  
Where/how does the scanner UI appear when user taps "Scan"?

**Options Considered:**
1. Full-page overlay on orders page
2. Modal dialog (reuse ConfirmDialog pattern)
3. Dedicated `/orders/scan` route

**Decision:** Full-page overlay

**Rationale:** Best mobile UX — maximizes viewfinder area. Batch scanning (AC8) works naturally (overlay stays open). No routing changes needed, no SSE reconnection concerns. Modal constrains viewfinder and complicates z-index; separate route adds navigation overhead.

---

### D3: Reuse Existing Mark-Done Endpoint

**Context:**  
How should the scanner trigger order completion?

**Decision:** Reuse `POST /api/orders/[id]/mark-done`

**Rationale:** Endpoint already handles auth check, permission check, Prisma update (`COMPLETED` + `completedAt`), SSE broadcast. Creating a new endpoint would duplicate all this logic. Scanner just needs to call the same endpoint with the order `id` obtained from lookup.

---

### D4: New Lookup API Route

**Context:**  
Scanner decodes `jobNumber` (text on QR/barcode), but mark-done route requires `orderId` (UUID). Need a bridge.

**Options Considered:**
1. Client-side search in loaded orders array
2. Server Action
3. Dedicated `GET` API route

**Decision:** `GET /api/orders/lookup?jobNumber=xxx`

**Rationale:**  
- Client-side search only covers loaded orders — may miss orders not yet visible (e.g., filtered out or paginated)
- Server Action works but API route is more consistent with existing pattern (mark-done is a route handler, not a server action)
- API route enables standard HTTP caching, logging, easier testing
- Case-insensitive Prisma `findFirst` with `mode: 'insensitive'` matches existing pattern in `createOrders`

---

### D5: Dynamic Import Pattern

**Context:**  
`@yudiel/react-qr-scanner` accesses browser camera API. Cannot run during SSR.

**Decision:** `next/dynamic(() => import(...), { ssr: false })`

**Rationale:** Standard Next.js pattern for browser-only components. This is the first `next/dynamic` usage in the codebase — sets precedent for future browser-only components. Loading fallback provides good UX while chunk downloads.

---

### D6: Reuse ConfirmDialog

**Context:**  
User scans → order found → confirm before marking complete. What UI for confirmation?

**Decision:** Reuse existing `ConfirmDialog` component

**Rationale:** Same pattern used by `MarkDoneModal` in orders table. Consistent UX — user sees familiar confirmation dialog. No need to install shadcn Dialog/AlertDialog.

---

### D7: Scanner Pause Behavior

**Context:**  
After decoding a QR code, should scanner continue or pause?

**Decision:** Pause scanner on decode, resume after action completes

**Rationale:** Prevents rapid duplicate scans of the same code. Gives user time to see result and act. After mark-complete or dismissing result, scanner resumes for next scan. Aligns with batch scanning UX (AC8).

---

**End of Decision Log**
