# Architecture

See [AGENTS.md](../AGENTS.md#architecture) for the package map and scalability rules. Record significant decisions as ADRs in `docs/adr/NNNN-title.md`, and add a row to the AGENTS.md Decisions log.

## Request flow (target)

```
Browser (PWA, offline lessons via service worker)
  └─ Next.js RSC / route handlers (stateless, edge-ready)
       ├─ @gullak/content     static JSON → CDN cached
       ├─ @gullak/engine      pure maths, also runs client-side
       ├─ @gullak/market-data adapter → shared cache → snapshot fallback
       ├─ @gullak/ai          tutor only: guardrail → cache → Gemini → Groq → content search
       └─ data-access layer   Supabase Postgres (per-learner rows, shardable by learner_id)
```
