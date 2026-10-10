# AGENTS.md

The single source of truth for every AI agent (Claude Code, Codex, Gemini, OpenCode, Cursor) and every human working on Gullak. `CLAUDE.md` imports this file; Gemini reads it via `.gemini/settings.json`; Codex, OpenCode and Cursor read it natively. **These are project rules: they apply to every teammate and every fork.**

## Product

**Gullak** is an adaptive financial-literacy platform (Megathon X · Vanguard problem statement). Core loop: **learn → unlock → practise with play money on real markets.**

1. Onboarding: age band (teen / college / first job / parent), experience (none / some / regular), language (en / hi / te), preferred formats, a personal goal.
2. Virtual starting cash from `packages/content/config/starting-capital.json`.
3. Topic ladder: Savings → FD → RD → Gold → Mutual funds / SIP → Index funds → Stocks → Risk & diversification, plus an always-open **Stay safe** (scam-spotting) track. Order lives in `packages/content/config/topic-ladder.json`.
4. Every topic is stored once and rendered as video, story/comic, visual, formula + calculator, transcript, simulation, quiz and audio.
5. Passing a topic's quiz unlocks its instrument in the paper portfolio.
6. Paper portfolio on real data (FD rates with as-of dates, MF NAVs, index/stock prices, gold) and a **Time Machine** replay of real history (e.g. March 2020 crash, with a Panic Sell button).
7. Goal engine, mock Account Aggregator insights → learning nudges, facilitator/NGO dashboard, multilingual AI tutor.

### Hard guardrail (non-negotiable)

> **We educate; we never recommend real products or tell anyone to buy or sell. All projections are labelled as assumptions, not promises. All money is virtual.**

Enforced in code, not just copy:
- `Portfolio.isVirtual` is `z.literal(true)`: there is no type for real money.
- `@gullak/ai` guardrails screen learner questions **and** model output for advice; the tutor prompt forbids recommendations.
- Every money screen shows `<PlayMoneyBadge />`. Every projection shows its assumptions (rate, period, source, as-of date).
- Never name a real fund/stock/bank as "good", "best" or "recommended" in content.

## Architecture

```
apps/web               Next.js App Router PWA. UI + thin route handlers only.
packages/types         Zod schemas + TS types for every boundary (profile, topic, portfolio, market data, goal).
packages/engine        Pure TS domain logic: FD/RD/SIP/compounding, valuation, goal planner, unlock rules. No framework imports.
packages/content       Topic content + config as JSON (one source, many formats) and Zod-validated loaders.
packages/market-data   One adapter interface per data source, with caching + snapshot fallback.
packages/ai            Provider-agnostic LLM client (AI SDK: Gemini → Groq), versioned prompts, guardrails, cache.
packages/ui            Design system: shadcn/ui (Base UI) components, tokens (globals.css), formatting.
packages/typescript-config  Shared strict tsconfigs.
data/snapshots         Committed real-data snapshots so the demo never depends on live APIs.
notebooks              Colab-ready notebooks (model training, heavy data prep). Never run heavy jobs locally.
docs                   Architecture notes and ADRs.
```

Dependency direction: `web → (ui, ai, market-data, content, engine, types)`; `engine, content, market-data, ai → types`. Packages never import from `apps/`. Packages export TypeScript source (no build step); Next transpiles them.

**Phone and desktop are both first-class.** One responsive PWA: bottom tab bar and touch targets on phones; sidebar and multi-pane dashboard on desktop. Installable on Android, iOS, Windows and macOS. E2E tests run on both a phone and a desktop viewport. Native shells (Capacitor / Expo / Tauri) can wrap it later without touching `packages/`.

### Ownership map

| Role | Owns |
|---|---|
| **R1** Lead / frontend core | `apps/web` shell, routing, layouts (phone + desktop), onboarding, design system (`packages/ui`), release management |
| **R2** Frontend / game | Lesson renderers (all formats), paper portfolio UI, Time Machine, charts, animations |
| **R3** Backend / data | `packages/market-data`, `data/snapshots`, Supabase schema + migrations, data-access layer, route handlers |
| **R4** AI / adaptive engine | `packages/ai`, `packages/engine` (adaptive parts), `notebooks/` (knowledge tracing on Colab), format bandit, tutor, lesson pre-generation |
| **R5** Product / content / QA | `packages/content` (topics, translations), quiz quality, guardrail review, Playwright e2e, demo script |

## Scalability rules

- **Content is data, not code.** A new topic or language never needs a code change.
- **LLM output for lessons is generated once per topic × format × age band × language and cached.** Live LLM calls are only for the tutor, and those are rate-limited and cached.
- **Every market data source sits behind an adapter with caching and a snapshot fallback,** so no screen breaks if an API is down.
- **Domain logic lives in `/packages/engine`,** which is pure functions, fully unit-tested and free of any framework imports.
- **Stateless server code,** ready for edge/CDN deployment; no in-memory session state. (`MemoryCache` is for tests/local only.)
- **Mobile-first, performance-budgeted** (target cheap Android phones on slow networks), **offline-capable lessons** (Serwist service worker).
- **Database access goes through one data-access layer** (typed, Zod-validated). Components never import a DB client directly. Per-user data is keyed by `learner_id` so it can shard later.
- **Money is integer paise** everywhere in code. Human-edited config may use whole rupees and converts at load.

### Model training

We don't fine-tune LLMs. Small adaptive models (e.g. knowledge tracing) are trained in self-contained **Colab notebooks** in `/notebooks`, which output an artifact (JSON parameters) committed to `/data`. The app runs the exported model in plain TypeScript in `packages/engine`. Never run heavy jobs on a laptop. Tell the team lead when a notebook needs to be run.

## Conventions

- **TypeScript strict** (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`). No `any`; use Zod at every external boundary (API inputs, market data, LLM output, JSON files).
- **Biome** lints and formats everything (`pnpm lint`, `pnpm lint:fix`). Don't add ESLint/Prettier.
- **Naming:** files `kebab-case.ts`; React components `PascalCase`; Zod schema and its type share a name (`export const Goal = z.object(…); export type Goal = z.infer<typeof Goal>`); ids are kebab-case slugs.
- **Dependencies:** add versions to the `catalog:` in `pnpm-workspace.yaml` and reference them with `"catalog:"`, so every package uses the same version.
- **i18n:** never hard-code user-facing strings; use `next-intl` (`useTranslations` / `getTranslations`). Messages in `apps/web/messages/<locale>.json`; every locale file must have the same keys (tested).
- **UI work goes through the Impeccable skill** (`/impeccable` in Claude Code; `.agents/skills/impeccable` for other agents): designing, polishing, critiquing or auditing any screen or component. Add shadcn components with `pnpm dlx shadcn@4.21.4 add <name> -c apps/web` (they land in `packages/ui`).
- **Tests:** every package has Vitest unit tests beside the code (`*.test.ts`). Engine functions need tests for normal, edge and invalid input. E2E in `apps/web/e2e` (Playwright, phone + desktop).

### How to add a topic

1. Add an unlock rule to `packages/content/config/topic-ladder.json` (ladder or `staySafe`).
2. Create `packages/content/topics/<topic-id>/topic.json` (`TopicMeta`) and `<locale>.json` per locale (`TopicContent`, must include a quiz variant).
3. Formula variants reference an `@gullak/engine` function by name in `calculator`.
4. Run `pnpm test`: content is validated against the schemas. No code changes needed.

### How to add a language

1. Add `{ code, name, nativeName }` to `packages/content/config/locales.json`.
2. Add `apps/web/messages/<code>.json` with every key from `en.json` (Bhashini first, LLM fallback, human review by R5).
3. Add `topics/*/<code>.json` content files (or generate them with the pre-generation script).
4. Run `pnpm test`. No code changes needed.

### How to add a market-data adapter

1. In `packages/market-data/src/adapters/<source>.ts`, implement `MarketDataAdapter` (`getQuote`, `getSeries`). Validate the source's raw response with Zod and map it to `MarketQuote` / `SeriesPoint`, setting `asOf` from the source.
2. Wrap it: `withCache(withSnapshotFallback(adapter, snapshot), cache, ttl)`.
3. Commit a snapshot for every symbol it serves to `data/snapshots/` (with attribution).
4. Add unit tests with recorded fixtures. Never hit the network in tests.

## Git and release rules

These rules apply to every human and agent, in this repo and in every fork. Hooks install automatically on `pnpm install` (Husky) and CI enforces the same rules on every push and PR, including on forks.

1. **No AI attribution.** Never add `Co-Authored-By: Claude`, "Generated with Claude Code", or any other AI attribution line to commits, PR titles or PR bodies. Also set Claude Code's project settings to turn off its default commit attribution (check the current setting name in the Claude Code docs).
   *Enforced:* `.claude/settings.json` sets `"attribution": { "commit": "", "pr": "" }`; the `commit-msg` hook and CI run `scripts/check-attribution.mjs`.
2. **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
   **Proper commit messages:** the subject says *what* changed in the imperative mood (10–72 chars, lower-case, no trailing full stop, not "update"/"wip"/"fix"), with a scope where it helps (`feat(engine): add RD maturity calculation`). `feat`, `fix`, `perf` and `refactor` commits need a body explaining *why*. **Every `feat`/`fix`/`perf`/`refactor` commit must also add an entry under `[Unreleased]` in `CHANGELOG.md`.**
   *Enforced:* commitlint (`commitlint.config.mjs`) and `scripts/check-changelog.mjs` in the `commit-msg` hook; commitlint in CI.
3. **Before every push, in this order:**
   1. `git pull --rebase` from the remote branch (and from `main` when pushing to main), then resolve any conflicts. On a fork: `git pull --rebase upstream main`.
   2. Install dependencies if the lockfile changed.
   3. Run lint, typecheck, unit tests and production build. **All must pass. If anything fails, fix it; never push a broken build and never skip or disable checks to get green.**
      *Automation (see Decisions, 2026-10-10):* the `pre-push` hook runs lint, typecheck and unit tests locally; CI runs the full suite including the production build and phone + desktop e2e on every push and PR. A PR must be green in CI before it's merged; whoever merges checks this.
   4. Bump the version following SemVer, starting at `0.0.1`: patch for fixes and small changes, minor for a finished feature or roadmap phase. Keep all package.json versions in sync. (`pnpm release patch|minor` does this.)
   5. Update `CHANGELOG.md` (move items from Unreleased into the new version with today's date), tick completed items in `ROADMAP.md`, and update `AGENTS.md` if any convention, structure or decision changed. These three files must be fully accurate before the push.
   6. Commit, tag `vX.Y.Z` on main, push.
   *Enforced on main:* `scripts/check-release.mjs` (versions in sync, dated changelog section, tag present) in `pre-push` and CI.
4. **Team workflow:** 5 people push to this repo. Work on feature branches (`feat/<area>`), keep PRs small. To avoid version-file conflicts between teammates, feature branches only add entries under `[Unreleased]`; the version bump and changelog release happen on the push/merge to `main`.
   *In practice:* teammates **fork** the repo, work on `feat/<area>` in their fork, and open PRs into `AbGisHere/Claude2Create_MegathonX:main`. Enable Actions once in your fork (Actions tab → "I understand my workflows, go ahead and enable them") so CI runs on your pushes.
5. **Never** force-push to main, commit secrets, or commit generated build output.
6. **After every successful push:** stop and tell me: "Pushed vX.Y.Z — good time to run /compact." Wait for me before continuing.
7. **AI agents ask before every commit and every push.** Show the human the message and what's staged, and wait for an explicit yes. Approval for one commit or push doesn't carry over to the next. *Enforced:* `.claude/settings.json` sets `git commit`, `git push`, `git tag` and PR create/merge to "ask", and denies `--no-verify` and force-push.

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-10-10 | TypeScript **6.0.3**, not 7.0.2 | TS 7 is the Go-native rewrite; typescript-eslint supports only TS < 6.1 and tooling still relies on the JS compiler API. Revisit after the hackathon. |
| 2026-10-10 | **Biome 2.5** instead of ESLint + Prettier | One fast tool for lint + format with React/Next domains; Next 16 dropped `next lint`; no coupling to the TS version. |
| 2026-10-10 | **`motion`** instead of `framer-motion` | Same library, renamed package (`motion/react`). |
| 2026-10-10 | **Serwist (`@serwist/turbopack`)** instead of next-pwa | next-pwa is unmaintained (last release 2022); Serwist supports Next 16's Turbopack build. |
| 2026-10-10 | **Vercel AI SDK** with Gemini (free tier) → Groq (free tier) → content-search fallback | Provider-agnostic, Zod-structured output, streaming; switching providers is config. Zero cost; demo never breaks on quota. |
| 2026-10-10 | **Supabase** (not Convex), behind one data-access layer | Facilitator analytics and market time series fit SQL; Postgres has a defensible path to very large scale (replicas → sharding by learner id) and is portable. |
| 2026-10-10 | **One responsive PWA** for phone + desktop; no native shells yet | One codebase, installable everywhere; native wrappers can be added later without touching `packages/`. |
| 2026-10-10 | **No LLM fine-tuning**; small adaptive models trained on Colab | Fine-tuning isn't feasible or useful in 24h. Knowledge tracing (BKT/IRT) trained on Colab, exported as JSON, run in TS; format choice via an online bandit. |
| 2026-10-10 | **Locale is a string validated against `locales.json`,** not an enum | Adding a language must not need a code change. |
| 2026-10-10 | **Money as integer paise** | Avoids floating-point drift in a finance product. |
| 2026-10-10 | **Locale stored in a cookie** (no `/en` URL prefix) | Stable start URL for installed PWAs; simpler routing. |
| 2026-10-10 | **pnpm catalog** for dependency versions | One place to bump versions; avoids drift across 7 workspaces and 5 people. |
| 2026-10-10 | **Node 24 LTS** in CI and `engines` | Node 25 is not LTS. |
| 2026-10-10 | **Pre-push runs lint + typecheck + unit tests; CI runs everything** (adds build + e2e) | Keeps pushes fast for 5 people; the full suite still runs automatically on every push and PR, including forks. |
| 2026-10-10 | **No branch protection on main**; fork + PR workflow | Team lead's call. Merger must confirm CI is green. |
| 2026-10-10 | **MIT licence** | Standard for hackathon projects; team lead approved. |
| 2026-10-10 | **Impeccable skill committed** for all agents; hooks in shared settings | UI quality is how we win; every teammate's agent gets the same design checks. |
