# Roadmap

24-hour plan. Owners: **R1** lead/frontend core · **R2** frontend/game · **R3** backend/data · **R4** AI/adaptive · **R5** product/content/QA.
Tick items as they land on `main`. Finishing a phase = minor version bump.

## Phase 0 · Setup (h0–h2) → v0.0.1
- [x] Monorepo: pnpm workspaces + catalog, Turborepo, strict TS (R1)
- [x] Biome, Husky (pre-commit / commit-msg / pre-push), commitlint, attribution + changelog checks (R1)
- [x] CI on every push and PR, including forks: rules, lint, typecheck, test, build, e2e phone + desktop (R1)
- [x] AGENTS.md, CLAUDE.md, ROADMAP.md, CHANGELOG.md, README.md, .env.example, LICENSE (R1)
- [x] Shared Zod schemas: LearnerProfile, Topic (all formats), Portfolio, Holding, Instrument, UnlockRule, MarketQuote, Goal (R1)
- [x] Starting-capital config and topic-unlock order as data (R5)
- [x] Engine maths: compound, FD, RD, SIP, goal inverse, unlock rules (R4)
- [x] Market-data adapter interface + cache + snapshot fallback (R3)
- [x] AI module skeleton: provider order, guardrails, versioned tutor prompt (R4)
- [x] PWA (Serwist), i18n en/hi/te (next-intl), Supabase client helpers (R1)

## Phase 1 · Skeleton (h2–h5)
- [ ] Design direction + tokens via Impeccable; app shell with phone bottom tabs + desktop sidebar (R1)
- [ ] Locale switcher (cookie) and play-money badge in the shell (R1)
- [ ] Supabase project, first migration (learners, progress, portfolios), generated types, data-access layer (R3)
- [ ] Snapshot pipeline: real FD rates, NIFTY 50 history (incl. 2020), sample MF NAVs, gold, CPI into `data/snapshots` (R3)
- [ ] Topic content folder structure + FD topic draft (en) (R5)
- [ ] Vercel project + preview deploys (R1)

## Phase 2 · Core loop (h5–h11)
- [ ] Onboarding flow: age band, experience, language, formats, goal (R1)
- [ ] FD lesson in every format: video, story, visual, formula + live calculator (KaTeX), transcript, simulation, quiz, audio (R2, R5)
- [ ] Format picker from preferences (R4)
- [ ] Quiz pass → FD unlock (engine unlock rules) (R2)
- [ ] Paper portfolio: cash, open an FD, valuation with as-of rates (R2, R3)
- [ ] FD content translated to hi + te (R5)

## Phase 3 · Time Machine + goal engine (h11–h15)
- [ ] Time Machine: replay real index history with speed control; March 2020 crash + Panic Sell button (R2)
- [ ] Portfolio valuation over a replayed timeline (engine) (R4)
- [ ] Goal engine: monthly amount needed; savings vs FD vs index SIP with assumptions shown (R4, R2)

## Phase 4 · Breadth (h15–h19)
- [ ] Remaining ladder topics: savings, RD, gold, MF/SIP, index funds, stocks, risk & diversification (R5)
- [ ] Stay-safe scam-spotting track (R5)
- [ ] Lesson pre-generation script (topic × format × age band × language, cached) (R4)
- [ ] AI tutor: grounded in topic content, learner's language, guardrails, rate limit, cache, content-search fallback (R4)
- [ ] Knowledge-tracing notebook on Colab → parameters in `/data`; format bandit in engine (R4)
- [ ] Mock Account Aggregator personas → learning nudges (never product advice) (R3, R4)

## Phase 5 · Facilitator dashboard (h19–h21)
- [ ] Cohort progress and weakest concepts (from knowledge tracing) (R3, R1)

## Phase 6 · Polish, freeze, demo (h21–h24)
- [ ] Impeccable polish + audit pass on every screen, phone and desktop (R1, R2)
- [ ] Performance budget on a low-end Android profile; offline lesson check (R1)
- [ ] Guardrail review of all content and tutor answers (R5)
- [ ] E2E for the full core loop on phone + desktop (R5)
- [ ] Code freeze, demo script, pitch (R5, R1)
