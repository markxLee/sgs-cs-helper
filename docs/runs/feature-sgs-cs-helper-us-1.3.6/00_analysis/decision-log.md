# Decision Log — US-1.3.6: Barcode Scanner Device Support
<!-- Created: 2026-02-10 -->

| ID | Decision | Alternatives Considered | Rationale |
|----|----------|------------------------|-----------|
| D1 | Custom hook `useBarcodeScanner` | Inline logic in component, HOC | Hook is composable, testable, and follows existing codebase patterns |
| D2 | Integrate in `OrdersHeader` | Separate component, layout-level | OrdersHeader already manages camera scanner state — natural co-location |
| D3 | Speed threshold: 50ms | 30ms (too strict), 100ms (catches fast typists) | Industry standard for HID scanners. Human typing >100ms. Exposed as constant for tuning |
| D4 | Disable when input focused | Always active | Prevents capturing text typed into search/filter inputs |
| D5 | Disable when camera overlay open | Run both simultaneously | Avoids conflicting scan results and confusing UX |
| D6 | No new UI elements | Add "Scanner Connected" indicator | Passive operation is simpler; indicator adds complexity with no clear benefit |
