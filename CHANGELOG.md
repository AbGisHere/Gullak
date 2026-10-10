# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Feature branches add entries under **[Unreleased]** only; the version bump happens on `main`.

## [Unreleased]

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
