# Roadmap

24-hour plan. Owners: **R1** lead/frontend core (@AbGisHere) · **R2** frontend/game (@mayankSuman404, @Parthvi1707) · **R3** backend/data (@ishitaanmol975) · **R4** AI/adaptive (@VanshGoel-01) · **R5** product/content/QA (shared, led by R1).
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
- [ ] Design direction + tokens via Impeccable (R2)
- [ ] App shell with phone bottom tabs + desktop sidebar (R1)
- [ ] Locale switcher (cookie) and play-money badge in the shell (R1)
- [ ] Supabase project, first migration (learners, progress, portfolios), generated types, data-access layer (R3)
- [ ] Snapshot pipeline: real FD rates, NIFTY 50 history (incl. 2020), sample MF NAVs, gold, CPI into `data/snapshots` (R3)
- [x] Curriculum plan: four pillars, 33 topics tagged by grade group, four learn-by-doing engines ([docs/curriculum.md](docs/curriculum.md)) (R1, R5)
- [ ] Curriculum schemas: grade groups (6–7 / 8–10 / 11–12) replace age bands, `pillar` on topics, prerequisite graph, `Activity` schemas for the four engines, one example per engine (R1, R4)
- [ ] Curriculum entry per topic (goals, key ideas, misconceptions, scenario, quiz goals) for all four pillars (R5)
- [x] Vercel project + preview deploys (R1): production at [gullak.abgupta.me](https://gullak.abgupta.me)
- [ ] Ask organisers for sponsored AA/FIU sandbox access; otherwise enquire with Setu, Finvu or Sahamati. Confirm student eligibility, provisioning time, test credentials/users/OTPs, API/Postman docs and webhook requirements (R1 lead, R3)

## Phase 2 · Core loop (h5–h11)
- [ ] Onboarding flow: grade group, current experience, how they like to learn (R1)
- [ ] Lesson pre-generation script (topic × format × grade group × language, cached), run on the first curriculum entries (R4)
- [ ] Demo topics in every format (one per pillar, e.g. needs vs wants, emergency fund, compounding, UPI scams): video, story, visual, formula + live calculator (KaTeX), transcript, simulation, quiz, audio (R2, R5)
- [ ] Format picker from preferences (R4)
- [ ] Quiz pass → unlock rules over the prerequisite graph (R2)
- [ ] Life sim engine + renderer: personas, event deck, monthly needs/wants/savings split (R4, R2)
- [ ] Spot & sort engine + renderer (need or want, scam or real) (R4, R2)
- [ ] Paper portfolio: cash, open an FD, valuation with as-of rates (R2, R3)
- [ ] Demo topics translated to hi + te (R5)

## Phase 3 · Time Machine, stories + goal engine (h11–h15)
- [ ] Time Machine: replay real index history with speed control; March 2020 crash + Panic Sell button (R2)
- [ ] Portfolio valuation over a replayed timeline (engine) (R4)
- [ ] Goal engine: monthly amount needed; savings vs FD vs index SIP with assumptions shown (R4, R2)
- [ ] Story choices engine + renderer: branching nodes, consequences, try again (R4, R2)
- [ ] What-if sandbox: sliders over engine formulas (SIP at 15 vs 25, ₹100 then vs now with real CPI) (R2)

## Phase 4 · Breadth (h15–h19)
- [ ] Remaining topics in all four pillars generated, reviewed and translated (R5, R4)
- [ ] Activities for every topic: life-sim events, stories and spot & sort rounds as data (R5)
- [ ] AI tutor: grounded in topic content, learner's language, guardrails, rate limit, cache, content-search fallback (R4)
- [ ] Knowledge-tracing notebook on Colab → parameters in `/data`; format bandit in engine (R4)
- [ ] AA data adapter: Zod-validated synthetic deposit-account fixtures and, if access is provisioned, hosted FIU sandbox authentication, consent flow, data fetch and webhooks behind the same interface (R3)
- [ ] AA transaction summaries → deterministic learning nudges (income variability, spending categories, savings consistency); pass only validated summaries to R4, never raw statements to an LLM; never product advice (R3, R4)
- [ ] AA demo consent flow and explicit synthetic-data label; review nudge copy and demo claims (R1, R2, R5)

## Phase 5 · Facilitator dashboard (h19–h21)
- [ ] Cohort progress and weakest concepts (from knowledge tracing) (R3, R1)
- [ ] Facilitators assign topics and activities to a class (R3, R1)

## Phase 6 · Polish, freeze, demo (h21–h24)
- [ ] Impeccable polish + audit pass on every screen, phone and desktop (R1, R2)
- [ ] Performance budget on a low-end Android profile; offline lesson check (R1)
- [ ] Guardrail review of all content and tutor answers (R5)
- [ ] E2E for the full core loop on phone + desktop (R5)
- [ ] Code freeze, demo script, pitch (R5, R1)

## AA access plan · 24-hour demo

Time-box initial access attempts to 30–60 minutes, then continue with synthetic fixtures while approval is pending. Sandbox provisioning is not guaranteed; production bank-data access requires eligible regulated FIU onboarding and is outside this demo's scope.

1. Ask the hackathon organisers for partner sandbox credentials and sample financial data (R1 lead).
2. Check [Setu sandbox credential setup](https://support.setu.co/support/solutions/articles/81000412878-how-does-one-generate-sandbox-credentials-). If company PAN/GSTIN is required, ask `aa@setu.co` about student hackathon access; do not invent company details (R1 lead, R3).
3. Request a hosted FIU sandbox and simulated data through [Finvu](https://finvu.github.io/sandbox/get_started.html), contact `support@cookiejar.co.in`. Alternatively enquire at `sandbox@sahamati.org.in`; the published [Sahamati sandbox guide](https://sahamati.org.in/account-aggregator-sahamati-buildaathon-2024/) is from its 2024 event, so confirm current availability (R1 lead, R3).
4. Demonstrate simulated consent → synthetic transaction summary → learning signal → relevant lesson, labelled **AA demo — synthetic data**. If provider access arrives, replace the data adapter while retaining the summary contract and nudge logic (R3, R4, R1/R2).

Resource handoff: R3 shares the summary schema and fixtures with R4; R4 shares concept IDs and nudge outputs with R1/R2; R5 reviews the educational wording. R1 manages server-only deployment credentials. Follow the [Sahamati onboarding requirements](https://sahamati.org.in/faq/) before considering any future production integration.
