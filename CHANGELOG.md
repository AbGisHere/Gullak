# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Feature branches add entries under **[Unreleased]** only; the version bump happens on `main`.

## [Unreleased]

## [0.2.12] - 2026-10-11

### Added
- Deterministic draft-cache key preparation from the pinned source-content SHA-256, complete request, prompt version and provider/model identity; validates inputs and hashes exact prompt bytes without adding cache storage or live calls.
- Explicit AI SDK structured-output adapter for the existing lesson-draft runner, with strict draft-schema parsing and zero automatic retries; callers choose a model, and no live generation, publication or storage is activated.
- Strict nine-field `QuizAnswerEvent` contract for version-pinned quiz evidence, preserving false answers and explicit timestamp offsets while rejecting missing/extra fields and malformed IDs, attempts or hashes; no persistence or mastery changes.

### Fixed
- Provider eligibility ignores whitespace-only API keys and duplicate provider IDs while preserving first-occurrence order and the default Gemini → Groq selection; no calls, credential rewrites, retry policy or model-default changes.

## [0.2.11] - 2026-10-11

### Changed
- CI skips every job in the graded submission repo; releases pushed there are already green in the team repo.

## [0.2.10] - 2026-10-11

### Added
- Persist server-graded activity evidence and run completion atomically with pinned hashes, revisions, idempotent retries and learner isolation.
- Connect quiz API grading and exact-byte content versions to typed transactional answer persistence, with local schema generation and retry/isolation acceptance instructions.
- Add typed per-answer quiz evidence, authoritative grading and exact-byte content versions for backend integration.
- Atomic per-question quiz evidence with authoritative correctness/concepts, content fingerprints, attempt events, learner-only reads and a service-only invoker-security export; preserve legacy quiz callers and retries without historical backfill.

## [0.2.9] - 2026-10-11

### Added
- Controlled Financial Twin story presentation components for compact progress, household dialogue, supplied money state, decisions, consequence feedback, reflection and correctly paired rewind alternatives.
- Complete learner-facing frontend experience in `apps/web`: connected learner dashboard with habit streak, adaptive recommendations ("Why Gullu picked this for you"), daily 2-minute drop, and quick portfolio glance.
- Persistent Financial Twin narrative journey (*Nani's Gullak*): 7-step connected flow spanning Hyderabad lane context, March 2020 emergency dilemma, branching choices, Practice simulation, Multiverse Counterfactual Rewind, and "FYI, This Really Happened" historical reveal.
- Mobile-first app shell (`AppShell`) with accessible 44px+ touch bottom navigation bar, companion Gullu avatar status, and full responsive desktop sidebar layout.
- Four-pillar curriculum explorer (`LearnTab`) categorized by Plan & Budget, Save & Manage, Understand Investing, and Stay Financially Safe, with format badges and full modal activity runners.
- Paper portfolio tab with interactive virtual piggy-bank deposits, emergency buffer check, and `MoneyDecoder` sheet.
- Family Take-Home Missions & Living Gullak evolution tracker (`MissionsTab`) with interactive household reach counters and scam defense drills.
- Synchronized Hindi (`hi.json`) and Telugu (`te.json`) localization strings matching English keys across all learner tabs.
- Activity normalizers mapping content activity JSON schema to UI contracts (`normalizeSpotSortActivity`, `normalizeStoryActivity`).
- World 1 Candy Economy Lesson 1 data conforming to the 9-step pedagogical sequence (`intro` → `experience` → `story-choice` → `notice` → `explanation` → `spot-and-sort` → `transfer` → `reflection` → `recap`).
- Limited-Coin Shop prototype component in `@gullak/ui` with wallet, till, insufficient funds, and unavailable change checks.

## [0.2.8] - 2026-10-11

### Added
- Shared `SchoolClass` boundary schema in `@gullak/types`; draft stage selection validates through the engine's declared types dependency rather than an undeclared direct Zod import.
- Offline draft-pipeline regression tests for the five approved English briefs across four formats, including canonical-concept and quiz-objective rejection; provider outputs are synthetic fixtures, not generated or approved learner content.
- Pure draft-stage selection by school class in `@gullak/engine`, with exact Classes 6–7 / 8–9 / 10–12 boundaries and rejection of invalid or coerced values; existing onboarding, placement and unlocks remain unchanged.
- Strict virtual unit-price comparison input contracts: safe integer paise, positive whole quantities and matching piece/gram/millilitre units; ambiguous units, real-money flags and extra fields are rejected.
- Pure exact unit-price comparison in `@gullak/engine`, using integer cross products without rounding or unsafe intermediate numbers; returns only left/right/equal and does not change lessons, purchases, rewards or unlocks.

## [0.2.7] - 2026-10-11

### Changed

- The learning map is grouped by the eight worlds (Candy Economy to Finance Tycoon) instead of the four pillars, using a new `topic-worlds.json` that places each of the 33 topics in one world as `docs/curriculum.md` maps them; a topic page names its world. Finance Tycoon shows that new lessons are on the way. Hindi and Telugu world names are unreviewed drafts.

## [0.2.6] - 2026-10-11

### Added
- English lesson and 3-question check for the 25 remaining topics in the topic graph (budgeting, goals, inflation, deposits, credit, insurance, investing basics, fictional-company stocks, NPS and fraud safety), so all 33 topics are playable. Unreviewed R5 drafts; fictional names only, every rate labelled as an assumption.

## [0.2.5] - 2026-10-11

### Added
- Draft-only Phase 0 stage/world/lesson metadata contracts with approved stage IDs, ordered unique lesson IDs, explicit quiz thresholds and predecessor metadata; existing topic schemas and app consumers remain unchanged.
- Centralized onboarding mastery initialization in `@gullak/engine` with the approved exact priors (none 0.1, some 0.3, regular 0.5); the web helper reuses it without resetting saved evidence or changing unlocks.
- Injectable draft-generation runner for the current topic schemas: validate inputs before generation, pin validation context across async calls, reject mismatched identity/format and validate returned teaching drafts without retries, caching or publication.

## [0.2.4] - 2026-10-11

### Changed
- Docs now match the code's unlock policy: passing a lesson's check (today: quiz pass marks) is the only unlock rule; mastery ranks recommendations and reviews but never gates progress.

## [0.2.3] - 2026-10-11

### Added
- Company metrics catalogue (`docs/company-metrics.md`): every number stock-research sites show for a company, grouped, with what it tells you, how it is worked out and the learner stage, plus the time windows behind the variants. Planned as Stock Street's company report card on fictional companies.

### Changed
- The eight-world curriculum now keeps the product design the rewrite had dropped: Practice and Live, *Nani's Gullak* as one arc per world, differentiators, Money Multiverse, class market, more ways to learn, habit design, shared phones and the real-data map, plus where each current topic and all 61 fund categories sit among the worlds. AGENTS.md, PRODUCT.md and DESIGN.md use worlds and stages.

## [0.2.2] - 2026-10-11

### Changed
- Product documentation now uses the eight-world adaptive learning workflow: Candy Economy, Savings Quest, Bankopolis, Market Mayhem, Grow Your Money, Stock Street, Life Simulator and Finance Tycoon. Lessons use the decision-led cycle: experience → decide → consequences → understand → apply → review.

## [0.2.1] - 2026-10-11

### Added
- Offline, versioned four-format lesson-generation request preparation from validated curriculum briefs; teaching data stays separate from system instructions and all requested output remains draft-only.

## [0.2.0] - 2026-10-11

### Added
- Draft-only lesson contracts for transcript, text-only story, device narration and quiz, with strict fields and bounded editorial text limits compatible with existing renderers.
- Offline lesson-draft validation against curriculum briefs and canonical concepts, with audience checks, unique panel/question/option IDs, quiz answer-key and objective coverage checks, and existing investment-advice screening. Validation never approves or publishes content.
- Responsive learner app shell with locale switching, Play Money badge and onboarding handoff to Learn.
- Grade-filtered learning map, content-backed lessons, quiz unlocks and on-device mastery tracking.
- Practice and paper portfolio demo screens, local profile controls, component adapters and phone/desktop learner-flow coverage. Practice decisions currently use bundled sample outcomes.

## [0.1.5] - 2026-10-11

### Added
- Strict educational recommendation input/output contracts with validated topic graphs, quiz scores and complete topic-scoped concept mastery.
- Pure `recommendNext` educational ranking: weak-concept reviews, prerequisite-readiness ordering and completed-topic reviews. Grade filtering and quiz-only unlocks remain unchanged; no trained parameters, database writes or UI integration.

### Changed
- Vercel deploys only `main`; branch pushes and pull requests no longer create preview deployments (`vercel.json`). CI still checks every push and PR.

## [0.1.4] - 2026-10-11

### Added
- Knowledge-tracing notebook, increment 3: benchmarks BKT, BKT with forgetting, PFA and DKT (an LSTM on the Colab GPU) on real student answers from ASSISTments 2009–10 with 5-fold learner-separated cross-validation, and exports aggregate results and realistic BKT parameter ranges. The dataset is downloaded at run time and never committed; the app does not use the results yet.
- Benchmark results from the Colab run in `data/models/knowledge-tracing-benchmark.assistments-2009.json`: AUC 0.739 for DKT, 0.727 for BKT with forgetting, 0.722 for BKT and 0.710 for PFA over 283,105 real answers.

## [0.1.3] - 2026-10-11

### Added
- Knowledge-tracing notebook, increment 2: fits per-concept BKT by EM on synthetic learners drawn from known parameters, checks parameter recovery and held-out next-answer prediction against a constant baseline, and exports a draft parameter file labelled synthetic. Runs on a Colab CPU in under a minute with no installs; the app does not load it.

### Changed
- Redesign Financial Twin as an illustrated seven-stage Hyderabad household story with localized dialogue, a consistent ₹15,000 bill, three choices, immediate consequences, rewind alternatives, reflection and replay. Replace mismatched ₹7,000 outcomes and unsupported return/penalty claims with clearly labelled qualitative fixtures. Include phone/desktop screenshots, 19 unit cases and six complete browser checks.

## [0.1.2] - 2026-10-11

### Changed
- README has a "What works today" section and no longer claims data sources that aren't committed yet; ROADMAP and the snapshot pipeline table match what is on `main`.

## [0.1.1] - 2026-10-11

### Fixed
- All 74 `@gullak/ui` component tests pass: Testing Library now cleans up between tests, and four stale assertions match the current components.

## [0.1.0] - 2026-10-11

### Added
- Adaptive learning and practice UI in `@gullak/ui` (R2): lesson renderer for the 8-step learning loop, spot & sort, branching story choices, money-term decoder, paper portfolio, Practice simulation and the counterfactual "rewind" comparison, with a companion character and brand tokens.
- Localization label contracts for the learning components: every component takes optional `labels` with English defaults, so the app can pass Hindi and Telugu copy.
- `/r2-preview` route for reviewing the learning components on fixtures.

### Known issues
- 35 of the 49 component tests in `packages/ui/src/ui.test.tsx` fail (fixed in 0.1.1), and the components are not yet wired to the backend (still open).

## [0.0.18] - 2026-10-11

### Added
- M2 mid-submission progress report PDF in `deliverables/`.

## [0.0.17] - 2026-10-11

### Added
- Activity answer schemas in `@gullak/types`: strict spot & sort and story request bodies, graded results, and a `completed` run status with `completedAt`.

## [0.0.16] - 2026-10-11

### Added
- Activity answers contract ([docs/activity-answers.md](docs/activity-answers.md)): server-graded spot & sort and story answers against the run's pinned content hash, a separate `activity_answers` table and run completion.
- Synthetic-only BKT input-preparation notebook with the nine-field version-pinned quiz-answer contract, deterministic fixtures, content-derived answer ordering and local/CI validation tests. No training, production mastery changes or unlock changes.

## [0.0.15] - 2026-10-10

### Changed
- Team workflow: commit each logical step on fork branches and push often; PRs merge by rebase or fast-forward (never squash), and versions still bump only on merge.

## [0.0.14] - 2026-10-10

### Added
- Session-scoped activity/episode run creation and resumable navigation bookmarks with content hashes, revision checks and idempotent writes; no client-supplied completion, money or mastery.
- Repeatable synthetic local demo seeds and regression coverage for grade-specific cash, transitive prerequisites, shared-device identity switching and cross-profile progress isolation.

### Fixed
- Apply current graph prerequisites and grade eligibility to FD investment and instrument unlock output.
- Align Postman prerequisite examples and setup balances with the v0.0.10 config; distinguish team commits from new backend work.

## [0.0.13] - 2026-10-10

### Added
- First curriculum briefs (Grades 8–10, English drafts for R5 review) for the demo topics: money basics, needs vs wants, emergency fund, compounding, and UPI and phishing scams. New English drafts (transcript + quiz) and concept metadata for the four new topics. A content test checks every brief against its topic's concepts, the graph and the supported locales.
- Mutual fund category catalogue for the investing topics: 61 categories (SEBI's categories, SIFs and a few platform groupings such as "short and mid term"), each with its group, paper-portfolio instrument, a coarse risk band and the topic that teaches it, and English text (what it holds, what to watch out for). Validated against the topic graph and locales.

## [0.0.12] - 2026-10-10

### Added
- Draft-only curriculum brief contracts and a pure offline validator checking canonical topic/graph identity, grade and locale eligibility, and concept references. Bounded strict inputs and unit tests prepare the first lesson-generation step without generating or publishing lessons.

## [0.0.11] - 2026-10-10

### Added
- Grade-aware, preference-first lesson format picker with validated request/result contracts, deterministic caller-owned mixed-format rotation, explicit unavailable results and quiz exclusion. The lesson API includes answer-free selection metadata; unit and backend integration tests cover selection and boundary cases.
- R4 format-picker integration and local-testing guide, including content/frontend/backend handoffs and the distinction from the later learned bandit.

## [0.0.10] - 2026-10-10

### Changed
- Product docs: the *Nani's Gullak* storyline (three seasons, cast, Gullu, no fixed years, "FYI, this really happened" reveals), differentiators (one continuous money life, take-home missions, built for shared phones and no data), Money Multiverse, class market, more ways to learn beyond games, more games and stories, and habit design rules (never addictive).

## [0.0.9] - 2026-10-10

### Added
- M1 approach PDF in `deliverables/`.

## [0.0.8] - 2026-10-10

### Added
- Learner onboarding on phone and desktop: language (from `locales.json`), grade group (required), current experience with a starting-cash preview from config, an optional format step ("Mix it up" by default, or Skip) and an optional goal in the learner's own words. The profile is validated and stored on the device until learner persistence is connected.
- Curriculum as data: a 33-topic prerequisite graph (`packages/content/config/topic-graph.json`) with a pillar, grade groups, prerequisites and unlocks per topic, validated at load (no unknown prerequisites, no cycles, and prerequisites are taught to the same grade groups).
- `Activity` schemas for spot & sort rounds and branching stories, and an `Episode` schema for Practice episodes (date range, persona, instruments, starting holdings, scheduled and random life events, reveal), with one example each: need or want, the doubling scheme, and March 2020 + a hospital bill priced from the committed index-fund snapshot.
- Instrument kinds for every unlock in the curriculum: piggy bank, PPF, liquid fund, bond, debt fund, ETF and NPS.
- Engine helpers for grade-aware topic availability and unlocked activities; English drafts for `money-basics` and `saving-habit` so the lesson → quiz → FD loop follows the graph.
- Grade-group onboarding with optional mixed-format defaults, a non-destructive legacy-profile migration, and database types generated from local PostgreSQL schema introspection.
- Read-only shared-schema inventory and backend review checklist covering migration approval, Ubuntu browser verification and two-learner hosted acceptance tests.
- Verified-session backend API for config-driven onboarding, lesson progress, server-graded quizzes, virtual FD investment and persistent portfolio valuation, with strict Zod request contracts and server-only privileged access.
- Follow-up Supabase migration restricting direct learner writes and providing atomic, idempotent transactions plus assigned-cohort facilitator aggregates; preserves the original schema.
- Goal-planning and observed-history Time Machine endpoints, cached AMFI quotes with snapshot fallback, a dated published FD-rate snapshot and regeneration source.
- English savings and FD transcript/quiz drafts for content review, local PostgreSQL concurrency/isolation tests, and a beginner setup guide with an importable Postman collection.

### Changed
- Translation uses Sarvam (LLM fallback, human review) instead of Bhashini; existing Hindi and Telugu strings are unreviewed drafts.
- Starting cash scales by grade group and experience (₹2,000–₹20,000).
- Topics form a prerequisite graph tagged by pillar and grade group instead of a linear ladder; the savings draft is now `bank-accounts-upi`, and the backend also refuses topics not taught to the learner's grade group.
- The AI tutor pitches answers at the learner's grade group (prompt v2); v1 stays unchanged so cached answers keyed by version remain valid.
- The data-access entry point requires a verified Request and fails explicitly when persistence is unconfigured; no module-memory session fallback.
- Authenticated API responses bypass service-worker caches so learner data is not reused after an account change.
- Market snapshot ranges compare timestamps rather than ISO string ordering, and AMFI parsing supports both column layouts with calendar-date validation.

## [0.0.7] - 2026-10-10

### Changed

- Life sim and market sim are one engine with two play-money modes: Practice replays real history with life events and a reveal (the Time Machine becomes Practice episodes; the flagship is March 2020 + a hospital bill), and Live is paper trading on current prices, scored on habits rather than returns.
- Onboarding's format preference is optional ("Mix it up" by default); current experience sets only a starting prior, and evidence from quizzes, activities and simulations drives mastery and unlocks.

## [0.0.6] - 2026-10-10

### Changed

- Data sources now cover the whole curriculum, not just the first instruments: every topic and engine maps to a real Indian source (CPI by group, household spending, bank and small-savings rates, every fund category, indices, gold, yields, repo rate, UPI, NPS, scam patterns), and the snapshot pipeline is split into P1 and P2.

## [0.0.5] - 2026-10-10

### Changed
- New curriculum plan in `docs/curriculum.md`: four pillars from the problem statement (plan & budget, save & manage, understand investing, stay financially safe) with 33 topics tagged by grade group (6–7, 8–10, 11–12), from needs vs wants and emergencies to money markets, bonds and index funds.
- Learn by doing through four data-driven engines: market sim (paper portfolio and Time Machine), life sim, story choices, spot & sort, plus a what-if sandbox.
- Onboarding plan is now grade group → current experience → how they like to learn. AGENTS.md, README and ROADMAP follow the new plan.

## [0.0.4] - 2026-10-10

### Added
- Live deployment on Vercel at https://gullak.abgupta.me: production from `main`, a preview URL for every branch. Linked from a README badge.
- README names the team, **Claude2Create**, and its members; the LICENSE holder is now Team Claude2Create.
- Roadmap plan for Account Aggregator access: sandbox requests, synthetic-data fallback and deterministic learning nudges.

## [0.0.3] - 2026-10-10

### Added
- Data-access layer in `apps/web/lib/data`: typed Supabase client, a `learners` repository as the worked example (Zod-validated row ↔ schema mappers, Supabase and in-memory stores, tests), and interfaces for progress and portfolios.
- First Supabase migration: learners, topic progress, paper portfolios and holdings, with row-level security, paise money columns and `check (is_virtual)`.
- `TopicProgress` schema in `@gullak/types`.
- AMFI live NAV adapter in `@gullak/market-data`, tested on a recorded fixture.
- Snapshot pipeline: `pnpm snapshots:mf` writes real NAV history, and every committed snapshot is validated in CI. First snapshot is UTI Nifty 50 Index Fund (Direct, Growth) since 2019, which includes the March 2020 crash.
- README badges (version, licence, stack) and a Team table with GitHub handles.

### Changed
- Documented the graded submission repo (`IIIT-ECell/megathon26-claude2create`, remote `submission`), which only gets pushed when R1 says so.
- R2 owns the design direction and tokens (Impeccable init). R5 work is shared, led by R1.
- Agents keep temporary files in their scratchpad and clear it when it's no longer needed.
- Merged branches are deleted locally and on the remote.
- `pnpm release` updates the README version badge, and the release check verifies it.

### Fixed
- `pnpm release` no longer leaves package versions half-bumped when it refuses an empty `[Unreleased]`.

## [0.0.2] - 2026-10-10

### Changed
- CI is the single place checks run (lint, typecheck, unit tests, build, phone + desktop e2e); the `pre-push` hook now only runs the release check on `main`.
- Team workflow: R1 works on branches in this repo; R2–R5 fork and open PRs.
- Turborepo agent guidance turned off so it no longer rewrites `AGENTS.md`.

### Fixed
- Home e2e test matched two "Play money" elements; it now targets the badge exactly.
- Turborepo "no output files" warning for the test task.

## [0.0.1] - 2026-10-10

### Added
- Monorepo with pnpm workspaces, a shared dependency catalog and Turborepo: `apps/web` plus `types`, `engine`, `content`, `market-data`, `ai`, `ui` and `typescript-config` packages.
- Next.js 16 PWA skeleton: installable on phone and desktop, offline fallback via Serwist, en/hi/te via next-intl, theme and query providers, Supabase client helpers.
- Shared Zod schemas: LearnerProfile, Topic (video, story, visual, formula, transcript, simulation, quiz, audio variants), Portfolio (virtual-only), Holding, Instrument, UnlockRule, MarketQuote, Goal.
- Engine: compound interest, FD and RD maturity, SIP future value, monthly-for-goal, starting-capital lookup, topic unlock rules.
- Content config: starting capital by age band × experience, topic ladder with stay-safe track, supported locales.
- Market-data adapter interface with cache and snapshot fallback.
- AI module: Gemini → Groq provider order, investment-advice guardrails (en/hi/te), versioned tutor prompt.
- Design system: shadcn/ui on Base UI, rupee formatting, play-money badge.
- Tooling: strict TypeScript, Biome, Husky hooks, commitlint with commit-message, changelog and no-AI-attribution checks, release scripts.
- CI on every push and PR (forks included): git rules, lint, typecheck, unit tests, build, Playwright on phone + desktop.
- Docs: AGENTS.md, CLAUDE.md, ROADMAP.md, README.md, .env.example, MIT licence.
