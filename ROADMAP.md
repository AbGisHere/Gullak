# Roadmap

24-hour delivery plan. Owners: **R1** lead/frontend core (@AbGisHere) · **R2** frontend/game (@mayankSuman404, @Parthvi1707) · **R3** backend/data (@ishitaanmol975) · **R4** adaptive/AI (@VanshGoel-01) · **R5** product/content/QA (shared, led by R1).

The product is an eight-world, decision-led learning journey. Each completed item should land through a small PR and be checked on phone and desktop.

Quiz evidence API integration is prepared locally against v0.2.8, including typed transactional writes and exact-byte content versions; hosted migration and acceptance remain pending. See [quiz integration](docs/quiz-api-integration.md).

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

## Phase 0 · Align the foundation

Current-model bridge: an injectable draft-generation runner is implemented in
`@gullak/ai` (`generateLessonDraft`). It connects the existing
topic brief/request/validation flow; it does not generate or publish world
lessons, add live providers/caching, or migrate stage and unlock contracts.
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
- [ ] Tutor grounded only in approved lesson content and learner language (R4, R5)

## Phase 5 · Quality and demo

- [ ] Content and guardrail review for every decision, consequence and reward (R5)
- [ ] Phone + desktop E2E for onboarding → World 1 → unlock → review (R5)
- [ ] Offline lesson verification, accessibility, performance audit and Impeccable polish (R1, R2)
- [ ] Facilitator progress view and world/lesson assignment (R1, R3)
- [ ] Demo script: learner starts in Candy Economy and reaches a meaningful World 1 decision outcome (R5, R1)
