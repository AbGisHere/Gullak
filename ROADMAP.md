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
- [x] Design direction + tokens via Impeccable (R2): [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md), brand tokens in `packages/ui`
- [ ] App shell with phone bottom tabs + desktop sidebar (R1)
- [ ] Locale switcher (cookie) and play-money badge in the shell (R1)
- [x] Supabase project, first migration (learners, progress, portfolios), generated types, data-access layer (R3)
- [ ] Snapshot pipeline, P1 sources: MF NAVs for every fund category, NIFTY 50 + TRI (incl. 2008, 2016, 2020), CPI by group, gold, bank savings/FD/RD rates, small-savings rates, household spending ([data/snapshots](data/snapshots/README.md)) (R3); one AMFI NAV history and the SBI 1-year FD rate committed
- [x] Curriculum plan: four pillars, 33 topics tagged by grade group, learn-by-doing engines ([docs/curriculum.md](docs/curriculum.md)) (R1, R5)
- [x] Curriculum schemas: grade groups (6–7 / 8–10 / 11–12) replace age bands, `pillar` on topics, prerequisite graph, `Activity` and `Episode` schemas for the three engines, one example per engine (R1, R4)
- [ ] Curriculum entry per topic (goals, key ideas, misconceptions, scenario, quiz goals) for all four pillars (R5); Grade 8–10 English briefs done for the five demo topics
- [x] Vercel project + preview deploys (R1): production at [gullak.abgupta.me](https://gullak.abgupta.me)
- [ ] Ask organisers for sponsored AA/FIU sandbox access; otherwise enquire with Setu, Finvu or Sahamati. Confirm student eligibility, provisioning time, test credentials/users/OTPs, API/Postman docs and webhook requirements (R1 lead, R3)

## Phase 2 · Core loop (h5–h11)
- [x] Onboarding flow: grade group, current experience, how they like to learn (optional, "Mix it up" default) (R1)
- [ ] Lesson pre-generation script (topic × format × grade group × language, cached), run on the first curriculum entries (R4); the brief validator (step 1) is done, generation and caching are not
- [ ] Demo topics in every format (one per pillar, e.g. needs vs wants, emergency fund, compounding, UPI scams): video, story, visual, formula + live calculator (KaTeX), transcript, simulation, quiz, audio (R2, R5); 8 topics have a reading lesson and a quiz, and the lesson renderer is built but not wired
- [x] Format picker from preferences (R4) ([handoff](docs/format-picker.md)); the learned bandit stays in Phase 4
- [ ] Quiz pass → unlock rules over the prerequisite graph (R2)
- [ ] Life + market sim engine (Practice): monthly needs/wants/savings split, personas, event deck, unlocked instruments on real prices, FD/RD early-exit rules, selling units at the day's price (R4)
- [ ] Practice renderer + flagship episode: March 2020 + hospital bill, with speed control and the side-by-side reveal (R2, R5); renderer and rewind comparison built on sample data, episode data committed, not yet joined
- [x] Activity and episode runs: start, resumable bookmarks, pinned content hashes, idempotent writes (R3)
- [ ] Activity answers: server-graded spot & sort and story choices, run completion ([contract](docs/activity-answers.md)) (R3); request/response schemas done, route and storage not yet
- [ ] Spot & sort engine + renderer (need or want, scam or real) (R4, R2); renderer built on sample data, grading belongs to activity answers
- [ ] Shared portfolio: cash, piggy bank, RD, FD, gold, funds; valuation with as-of prices (R2, R3); portfolio + FD API and the paper-portfolio UI exist, not yet joined
- [ ] Demo topics translated to hi + te (R5)
- [ ] Living Gullak: a piggy-bank character that grows and evolves with habits (streaks, emergency fund, scams spotted), never with spending or luck (R2, R1)
- [ ] Daily loop: today's real-price move as a micro-lesson + the 2-minute daily drop, streaks with forgiveness (R2, R4)
- [ ] Take-home missions: a 5-minute mission with a parent, hi/te audio, a 3-question parent check, "households reached" count (R1, R5, R3)

## Phase 3 · Live mode, stories + goal engine (h11–h15)
- [ ] Counterfactual replay for the reveal: same episode, different choices, side by side (engine) (R4)
- [ ] Live mode: paper trading on current prices via the market-data adapters (live index + gold adapters), unlocked per instrument after Practice, habit scoring, no returns leaderboard (R3, R4, R2)
- [ ] Simulation decisions report to knowledge tracing as evidence (R4)
- [ ] Goal engine: monthly amount needed; savings vs FD vs index SIP with assumptions shown (R4, R2)
- [ ] Story choices engine + renderer: branching nodes, consequences, try again (R4, R2); renderer built on sample data
- [ ] Nani's Gullak as data: seasons, episodes, cast, story state carried across episodes and seasons, links to topics, Practice episodes and missions; Season 1 episodes 1–3 first (R5, R4, R2)
- [ ] Gullu: the revived gullak as companion, narrator and tutor voice (R4, R2)
- [ ] "FYI, this really happened" reveal after each arc, with real data and a replay as a Practice episode (R2, R3)
- [ ] What-if sandbox: sliders over engine formulas (SIP at 15 vs 25, ₹100 then vs now with real CPI) (R2)
- [ ] Money Multiverse: the learner's parallel self on the other choice, viewable side by side at any time, on the counterfactual replay engine (R4, R2)
- [ ] Class market: a teacher room, fictional companies with fact sheets, an order book where the class's orders set the price, news cards, overlay with a real episode, habit scoring, bot classmates for the demo (R3, R4, R2)
- [ ] Teach the AI: an AI classmate makes the topic's misconceptions and the learner corrects it (R4, R2)
- [ ] Kitna? lens: camera → price → days of a typical wage (PLFS), weeks of saving, RD what-if with assumptions, true EMI cost; images not stored (R4, R2, R3)

## Phase 4 · Breadth (h15–h19)
- [ ] Remaining topics in all four pillars generated, reviewed and translated (R5, R4)
- [ ] Activities for every topic: life-sim events, stories and spot & sort rounds as data (R5)
- [ ] Snapshot pipeline, P2 sources: more indices, example stocks, T-bill/G-sec yields, repo rate, loan rates, UPI statistics, NPS NAVs (R3)
- [ ] More Practice episodes as data: 2008, demonetisation 2016, gold 2020, 2022 rate rises (R5, R2)
- [ ] More games as data: scam drills during play, wheel of life events, month-end challenge, borrowing cards, be the bank, think like a scammer, "You are the ₹500 note" story (R5, R2, R4)
- [ ] More ways to learn: pocket-money diary, real documents explained, money-in-the-news cards, interview missions, debate cards, spaced recall, concept-map skill tree (R2, R4, R5)
- [ ] Collections and class play: historical notes and coins, Scam Hunter deck, class goals, duels, streak-saver gifts; no money leaderboards (R2, R3)
- [ ] Shared phones: several profiles per device with quick switching and sign-out; lesson packs shared over WhatsApp/Bluetooth (R1, R3)
- [ ] AI tutor: grounded in topic content, learner's language, guardrails, rate limit, cache, content-search fallback (R4)
- [ ] Knowledge-tracing notebook on Colab → parameters in `/data`; format bandit in engine (R4); synthetic input preparation, BKT fitting with held-out evaluation, a synthetic draft parameter export and a real-data model benchmark on ASSISTments 2009–10 done; fitting on Gullak learners' answers and app integration not yet
- [ ] AA data adapter: Zod-validated synthetic deposit-account fixtures and, if access is provisioned, hosted FIU sandbox authentication, consent flow, data fetch and webhooks behind the same interface (R3)
- [ ] AA transaction summaries → deterministic learning nudges (income variability, spending categories, savings consistency); pass only validated summaries to R4, never raw statements to an LLM; never product advice (R3, R4)
- [ ] AA demo consent flow and explicit synthetic-data label; review nudge copy and demo claims (R1, R2, R5)

## Phase 5 · Facilitator dashboard (h19–h21)
- [ ] Cohort progress and weakest concepts (from knowledge tracing) (R3, R1)
- [ ] Facilitators assign topics and activities to a class (R3, R1)
- [ ] Households reached and take-home mission completion on the dashboard (R3, R1)

## Phase 6 · Polish, freeze, demo (h21–h24)
- [ ] Impeccable polish + audit pass on every screen, phone and desktop (R1, R2)
- [ ] Performance budget on a low-end Android profile; offline lesson check (R1)
- [ ] Guardrail review of all content and tutor answers (R5)
- [ ] E2E for the full core loop on phone + desktop (R5)
- [ ] Code freeze, demo script, pitch (R5, R1): lead with the differentiators; demo picks in [docs/curriculum.md](docs/curriculum.md#demo-picks)

## AA access plan · 24-hour demo

Time-box initial access attempts to 30–60 minutes, then continue with synthetic fixtures while approval is pending. Sandbox provisioning is not guaranteed; production bank-data access requires eligible regulated FIU onboarding and is outside this demo's scope.

1. Ask the hackathon organisers for partner sandbox credentials and sample financial data (R1 lead).
2. Check [Setu sandbox credential setup](https://support.setu.co/support/solutions/articles/81000412878-how-does-one-generate-sandbox-credentials-). If company PAN/GSTIN is required, ask `aa@setu.co` about student hackathon access; do not invent company details (R1 lead, R3).
3. Request a hosted FIU sandbox and simulated data through [Finvu](https://finvu.github.io/sandbox/get_started.html), contact `support@cookiejar.co.in`. Alternatively enquire at `sandbox@sahamati.org.in`; the published [Sahamati sandbox guide](https://sahamati.org.in/account-aggregator-sahamati-buildaathon-2024/) is from its 2024 event, so confirm current availability (R1 lead, R3).
4. Demonstrate simulated consent → synthetic transaction summary → learning signal → relevant lesson, labelled **AA demo — synthetic data**. If provider access arrives, replace the data adapter while retaining the summary contract and nudge logic (R3, R4, R1/R2).

Resource handoff: R3 shares the summary schema and fixtures with R4; R4 shares concept IDs and nudge outputs with R1/R2; R5 reviews the educational wording. R1 manages server-only deployment credentials. Follow the [Sahamati onboarding requirements](https://sahamati.org.in/faq/) before considering any future production integration.
