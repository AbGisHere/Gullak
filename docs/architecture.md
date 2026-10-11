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

## Educational recommendation ranking

`recommendNext(input)` from `@gullak/engine` validates with
`RecommendationRequest` and returns `NextRecommendation` from `@gullak/types`.
It is offline and pure: no provider calls, database writes, mastery updates,
parameter imports or unlock changes.

Input:

- `gradeGroup`: `grade-6-7`, `grade-8-10` or `grade-11-12`.
- `topics`: graph-ordered `UnlockRule` objects, each extended with canonical
  `conceptIds` from its `TopicMeta` in authored order.
- `progress`: `{ [topicId]: bestQuizScore }`; scores are finite 0–1. Omit topics
  with no quiz score. A pass is determined only by the topic's `passMark`.
- `mastery`: `{ [topicId]: { [conceptId]: probability } }`; every supplied topic
  and concept needs a finite 0–1 value. Concepts are topic-scoped, not assumed
  globally unique. The caller initializes new learners once (none 0.1, some
  0.3, regular 0.5); subsequent evidence state is preserved. The ranker never
  fills missing values, retrains, or resets priors.

The input rejects extra fields, duplicate topic/concept/prerequisite IDs,
unknown progress/mastery IDs, missing mastery, unknown prerequisites,
prerequisite cycles and grade-incompatible dependencies. Supply a complete,
prerequisite-closed graph of servable topics; don't invent concept IDs for
not-yet-authored topics. Currently the curriculum graph is broader than the
eight authored topics, so the caller must resolve content availability before
future UI wiring. Don't use current topic content to rescore historical answers.

Selection order:

1. A passed, grade-eligible topic's weakest concept below 0.6 →
   `{ kind: "review", topicId, conceptId, reason: "weak-concept" }`.
2. An open, unfinished topic → `{ kind: "topic", topicId, reason }`.
   Readiness is the mean of all concepts in its direct prerequisite topics,
   not a mean of per-topic means and not the candidate's own mastery.
   No prerequisites means readiness 1 and reason `foundation-topic`;
   otherwise reason `prerequisite-readiness`. Higher readiness wins.
3. No unfinished open topic → review the passed topic with the lowest mean
   mastery and target its lowest-mastery concept, reason
   `all-open-topics-passed`. With nothing to review, return `null`.

All ties preserve graph order, then authored concept order. Exactly 0.6 is not
weak. Practising (0.6–<0.95) and mastered (>=0.95) concepts can still be reviewed
after all open lessons are passed. A locked topic is never returned as a preview.

Handoff (not implemented in this step):

- R3 supplies validated best quiz scores and complete mastery through the data
  layer. DB rows using `bestScore` must be mapped to the numeric `progress`
  record above. Persistence/BKT updates are separate work; don't consume the
  synthetic parameter artifact or feed story verdicts into mastery.
- R1/R2 consumes `kind`, `topicId`, optional review `conceptId` and `reason`.
  Resolve IDs to a review card or concept activity; the ranker does not pick an
  activity ID. Translate reason codes with `next-intl`, handle null, and do not
  persist or increment anything on a read.
- R5 reviews the student-facing explanation; output is internal metadata only,
  with no product advice or model-accuracy claim.

Focused checks, no API keys:

```powershell
pnpm --filter @gullak/engine exec vitest run src/recommend-next.test.ts
pnpm --filter @gullak/types typecheck
pnpm --filter @gullak/engine typecheck
```
