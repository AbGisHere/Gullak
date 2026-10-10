# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Feature branches add entries under **[Unreleased]** only; the version bump happens on `main`.

## [Unreleased]

### Changed
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
