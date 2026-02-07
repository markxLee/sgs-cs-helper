# Batch Review Findings (2026-02-07)

- Scope: T-007, T-008, T-009, T-010 (batch review)
- Verdict: Request Changes for T-009 (SSE design) — 1 critical issue.

Issue (Critical): Current SSE broadcaster is in-memory / process-local (even after adding a `globalThis` singleton). This means broadcasts will not cross process or instance boundaries (common in production or serverless deployments). Relying on an in-process Set of EventSource controllers is only suitable for single-process development servers.

Risk: In production (multiple server instances, serverless functions, or autoscaled environments) clients connected to different instances will not receive SSE events, causing UI inconsistencies and missed real-time updates.

Recommendation: Replace or augment the in-memory broadcaster with a central pub/sub solution (Redis Pub/Sub, BullMQ with Redis, Pusher, Ably, or a message broker). Implementation options:
- Short-term: document the single-process limitation clearly and revert to per-client polling if multi-instance deployment is expected.
- Medium-term: add an adapter layer for the broadcaster and implement a Redis-backed publish/subscribe channel so all server instances can publish and subscribe to the same events.
- Long-term: consider a managed realtime service (Pusher, Ably) for reliability and scale.

Next Action: `/code-fix-plan` to propose precise changes for T-009 (adapter + Redis integration) or to document operational constraints if adopting single-instance deployment.
