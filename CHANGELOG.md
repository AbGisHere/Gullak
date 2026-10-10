# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Feature branches add entries under **[Unreleased]** only; the version bump happens on `main`.

## [Unreleased]

### Added
- Grade-group onboarding with optional mixed-format defaults, existing default virtual capital, a non-destructive legacy-profile migration, and database types generated from local PostgreSQL schema introspection.
- Read-only shared-schema inventory and backend review checklist covering migration approval, Ubuntu browser verification and two-learner hosted acceptance tests.
- Verified-session backend API for config-driven onboarding, lesson progress, server-graded quizzes, virtual FD investment and persistent portfolio valuation, with strict Zod request contracts and server-only privileged access.
- Follow-up Supabase migration restricting direct learner writes and providing atomic, idempotent transactions plus assigned-cohort facilitator aggregates; preserves the original schema.
- Goal-planning and observed-history Time Machine endpoints, cached AMFI quotes with snapshot fallback, a dated published FD-rate snapshot and regeneration source.
- English savings and FD transcript/quiz drafts for content review, local PostgreSQL concurrency/isolation tests, and a beginner setup guide with an importable Postman collection.

### Changed
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
