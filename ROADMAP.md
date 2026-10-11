# Roadmap

24-hour delivery plan. Owners: **R1** lead/frontend core (@AbGisHere) · **R2** frontend/game (@mayankSuman404, @Parthvi1707) · **R3** backend/data (@ishitaanmol975) · **R4** adaptive/AI (@VanshGoel-01) · **R5** product/content/QA (shared, led by R1).

The product is an eight-world, decision-led learning journey. Each completed item should land through a small PR and be checked on phone and desktop.

R1 reports PR #22 deployed as v0.2.10 and the quiz/activity migrations applied in order. Hosted HTTP acceptance passes for two authorized synthetic learners (Grades 8–10 and 11–12): onboarding, prerequisite quizzes, FD unlock/investment, quiz evidence, activity answers/completion, retries, persistence and learner isolation. Phone/desktop browser acceptance remains pending. Mission persistence is local only and awaits published definitions and its own deployment; Practice episode outcomes await R4 contracts. R3 owns datasets: official NIFTY demo snapshot is local pending review; gold/CPI remain pending. See [hosted acceptance](docs/hosted-acceptance-2026-10-11.md).

Quiz evidence API integration is hosted and verified on the two QA learners, including exact-byte content versions, attempt counts, retries, learner-only reads and denied client export/write access. No historical answers were fabricated. See [quiz integration](docs/quiz-api-integration.md).

Generic activity answers and run-only completion are hosted and verified for spot-and-sort and the authored doubling-scheme story. Phone/desktop integration and Practice outcome persistence remain pending. See [activity integration](docs/activity-api-integration.md).

Mission persistence is prepared locally; reviewed mission definitions, production migration application and hosted acceptance remain pending. Family-confirmed reach counts each learner once overall and may include siblings.

NIFTY 50 PRICE-index history for 2019-10-01 through 2020-06-30 is prepared locally. TRI, gold/CPI, historical episodes beyond this range and reviewed Practice mapping remain pending.

## Built so far (v0.0.1–v0.2.1, on the earlier topic model)

These ship today and carry over to the eight worlds; the content model and grade groups still need migrating.

- [x] Engine maths: compounding, FD, RD, SIP, goal planner, valuation, quiz grading and unlock rules; lesson format picker; `recommendNext` ranker (R4)
- [x] Market-data adapters with cache and snapshot fallback; AMFI NIFTY 50 fund NAV history and the SBI one-year FD rate committed (R3)
- [x] Supabase schema, data-access layer and API: profile, onboarding, lessons, quiz grading and unlocks, progress, portfolio and FDs, goals, quotes, activity and episode runs, facilitator cohort view (R3)
- [x] Design direction and tokens via Impeccable ([DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md)) (R2)
- [x] Onboarding in en/hi/te: grade group (6–7 / 8–10 / 11–12), experience, formats, goal (R1)
- [x] Learner app on phone and desktop: shell with bottom tabs and sidebar, locale switcher, Play Money badge, grade-filtered learning map, lessons, quiz unlocks and on-device mastery, the March 2020 Practice episode and the paper portfolio (R1, R2)
- [x] Offline curriculum briefs, lesson-draft validation and versioned lesson-generation requests (R4)
- [x] Knowledge-tracing notebook: synthetic BKT fitting and a real-data benchmark on ASSISTments 2009–10 (R4)
- [ ] Versioned real quiz-evidence integration (R3, R4); strict nine-field `QuizAnswerEvent` row schema is on main. R3's server grading, transactional persistence and migrations landed in v0.2.10; hosted HTTP acceptance passed for both authorized QA learners. Immutable content registry and R4 real-data integration remain pending; no production learner data was exported for model training.

## Phase 0 · Align the foundation

Current-model bridge: an injectable draft-generation runner is implemented in
`@gullak/ai` (`generateLessonDraft`). It connects the existing
topic brief/request/validation flow; it does not generate or publish world
lessons, add live providers/caching, or migrate stage and unlock contracts.
An explicit structured-output provider adapter is implemented on the R4 feature
branch; it requires caller-selected models and has no automatic retries. App
wiring, live generation, provider fallback, caching and human review remain pending.
Deterministic draft-cache key preparation is also implemented on that branch;
source-content hashes, prompt versions, complete requests and model identities
invalidate keys. Persistent cache storage and reviewed-content publication are separate work.
Offline integration tests cover all five approved Grade 8–10 English briefs
across four draft formats, using synthetic provider
outputs only; live generation and human review remain pending.

- [x] Monorepo, strict TypeScript, Biome, Husky, CI, PWA, i18n and Supabase helpers
- [ ] Replace the old four-pillar topic model with the eight-world curriculum and three learner stages (R1, R5)
- [ ] Update schemas: `world`, `lesson`, stage variants, mechanic, decision/outcome, XP, mastery and unlocks (R1, R4); metadata-only `Stage`, `World`, `Lesson` drafted in `@gullak/types`; full gameplay payloads and app migration remain post-demo
- [ ] Create content folder conventions and validators for lessons and translations (R5, R1)
- [ ] Preserve virtual-money, no-advice and anti-speculation guardrails in all content and UI (R1, R5)

## Phase 1 · First-time learner journey

- [ ] Onboarding: class group, experience, preferred format and optional placement challenge (R1, R4); pure draft `stageForClass` selector implemented in `@gullak/engine`; class-based app onboarding and placement remain pending
- [ ] Responsive app shell: phone navigation, desktop layout, XP/streak/play-money indicators (R1, R2); shell, navigation and Play Money badge built, XP and streak not yet
- [ ] World map with locked, open and completed lesson states (R2)
- [ ] Progress persistence for profile, XP, lesson attempts, mastery and unlocks (R3)
- [ ] Reusable lesson renderer: hook → decision → consequence → concept → application → review → completion (R2)

## Phase 2 · World 1 vertical slice

- [ ] Candyville visual direction, recurring guide and World 1 map (R2)
- [ ] Candy Economy lessons: money, barter, currency, prices, needs/wants, scarcity, opportunity cost, earning, spending and saving (R5)
- [ ] Barter, limited-coin shop, sorting, price-comparison and earning mechanics (R2, R4)
  - R4's exact virtual unit-price input contracts and engine helper are implemented in `@gullak/types` and `@gullak/engine` with tests; UI integration and approved activity content remain pending.
  - Current R2 renderer mapping and evidence-integration gaps are recorded in [architecture](docs/architecture.md#confirmed-current-renderer-handoff). Lesson 1 is still an unapproved R5 draft; generation, XP and gameplay are on hold until sign-off and reviewed JSON.
- [ ] Shopping-day final challenge, XP/retry/unlock behaviour and E2E core loop (R2, R5)
- [ ] English, Hindi and Telugu review for the complete World 1 slice (R5)

## Phase 3 · Worlds 2–5

- [ ] Savings Quest: budget, goal, streak and emergency-event mechanics (R2, R5)
- [ ] Bankopolis: virtual account, UPI, statement and scam-safety activities (R2, R3, R5)
- [ ] Market Mayhem: shop, inventory, demand, pricing and profit/loss simulation (R2, R4, R5)
- [ ] Grow Your Money: interest, inflation, goal-horizon and risk-awareness activities (R2, R4, R5)

## Phase 4 · Worlds 6–8 and adaptive learning

- [ ] Stock Street: fictional-company research, paper portfolio and diversification reasoning (R2, R3, R5)
- [ ] Stock Street company report card: every metric in [docs/company-metrics.md](docs/company-metrics.md) as data, computed by `@gullak/engine` from fictional companies' statements, with en/hi/te explanations; Finance Tycoon reuses it for the learner's own business (R5, R4, R2)
- [ ] Fund categories (all 61, already data in `packages/content`) taught in Grow Your Money, Stock Street and Life Simulator ([curriculum](docs/curriculum.md#fund-categories)) (R5)
- [ ] Life Simulator: salary, bills, emergency, loan/EMI, insurance and scam-event loop (R2, R4, R5)
- [ ] Finance Tycoon: cash flow, inventory, business decisions, break-even and responsible growth (R2, R4, R5)
- [ ] Placement/challenge scoring, spaced review and adaptive next-lesson selection (R4)
- [x] Align onboarding priors with the approved 0.1/0.3/0.5 values (R4); centralized engine function, exact-value tests and web re-export; saved mastery and quiz unlocks unchanged
- [x] Inert BKT-with-forgetting runtime on the R4 feature branch (R4): strict explicit parameters, pure step/ordered-sequence inference and synthetic notebook parity tests; real-data fitting/export, reviewed parameters, persistence and activation remain post-demo
- [ ] Tutor grounded only in approved lesson content and learner language (R4, R5)
- [x] Inactive post-demo English tutor preparation: exact v0.2.12 editorial hashes, grade-eligible teaching-only citations and JSON question isolation; app wiring and multilingual review remain separate (R4)
- [x] Inactive verbatim English tutor excerpt fallback with conservative term matching, source provenance and all 33 pinned topic-source integration checks; no model or app activation (R4)

## Phase 5 · Quality and demo

- [ ] After the demo, add a new migration guarding missing/null/invalid `expectedRevision` in `record_activity_answer`; preserve idempotent retries and prove invalid RPC requests leave all writes unchanged (R3). The public route already rejects missing revisions. See [hosted acceptance](docs/hosted-acceptance-2026-10-11.md).
- [ ] Content and guardrail review for every decision, consequence and reward (R5)
- [ ] Phone + desktop E2E for onboarding → World 1 → unlock → review (R5)
- [ ] Offline lesson verification, accessibility, performance audit and Impeccable polish (R1, R2)
- [ ] Facilitator progress view and world/lesson assignment (R1, R3)
- [ ] Demo script: learner starts in Candy Economy and reaches a meaningful World 1 decision outcome (R5, R1)
