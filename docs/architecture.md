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

## Offline curriculum preparation

Before a future generation job, call `validateCurriculumBrief(draft, context)` from
`@gullak/ai`. Supply context as `{ meta, rule, supportedLocales }`, using canonical
`TopicMeta`, the matching `UnlockRule` and locale codes from content config. The
validator has no network/filesystem calls and does not import `@gullak/content`.

Draft fields and bounds are documented in AGENTS.md and enforced by
`CurriculumBrief`. Validation returns a normalized copy, or a `ZodError` with paths
such as `brief.keyIdeas[0].conceptId` or `context.rule.pillar`. No unsupported
topic/grade/language is substituted. Engineering examples live only in tests.

This first step does not generate anything or alter published lessons. R5/R1 must
review teaching material before later generation/publication; R2 must confirm
renderer constraints before assets. Schema validity cannot establish factual
accuracy, financial safety or absence of sensitive information in free text.

Run focused tests from the repository root, without credentials:

```bash
pnpm --filter @gullak/types exec vitest run src/curriculum-brief.test.ts
pnpm --filter @gullak/ai exec vitest run src/curriculum-brief.test.ts
```
