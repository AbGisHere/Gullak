# Architecture

See [AGENTS.md](../AGENTS.md#architecture) for the package map and scalability rules. Record significant decisions as ADRs in `docs/adr/NNNN-title.md`, and add a row to the AGENTS.md Decisions log.

## Learning request flow

```
Browser PWA
  └─ app shell → learner profile → world map → lesson renderer
       ├─ @gullak/content      worlds, lessons, stage variants and translations
       ├─ @gullak/engine       deterministic calculations, unlocks and simulations
       ├─ @gullak/ai           tutor only: guardrail → cache → provider → approved-content fallback
       ├─ @gullak/market-data  optional real-history display → cache → snapshot fallback
       └─ data-access layer     Supabase progress, XP, mastery and fictional balances
```

## Content and progression boundaries

- `packages/content` owns eight-world lesson data: narrative hooks, mechanics, decisions, outcomes, review, XP and unlocks.
- `packages/engine` owns deterministic mechanics only. It never imports React or content files.
- `apps/web` selects a stage variant and renders the generic experience. It does not hard-code lesson copy or financial answers.
- Supabase stores learner progress and fictional rewards. It never stores real account balances or gives product advice.
- Market data may illustrate history in a later simulation, but first-run lessons must work from committed snapshots and fictional scenarios.
