# AGENTS.md

The single source of truth for every AI agent (Claude Code, Codex, Gemini, OpenCode, Cursor) and every human working on Gullak. `CLAUDE.md` imports this file; Gemini reads it via `.gemini/settings.json`; Codex, OpenCode and Cursor read it natively. **These are project rules: they apply to every teammate and every fork.**

## Product

**Gullak** is an adaptive financial-literacy platform (Megathon X · Vanguard problem statement) for school students in Grades 6–12, especially from underserved communities in Hyderabad. Core loop: **learn → unlock → learn by doing with play money.** The full learning map is in [`docs/curriculum.md`](docs/curriculum.md).

1. Onboarding (after picking a language, en / hi / te): grade group (6–7 / 8–10 / 11–12), current experience (none / some / regular), how they like to learn (optional; default "Mix it up"). Experience only sets a starting prior; evidence from quizzes, activities and simulation decisions drives mastery and unlocks.
2. Virtual starting cash from `packages/content/config/starting-capital.json`.
3. Four pillars from the problem statement: **Plan & budget** (needs vs wants, budgeting, goals, inflation), **Save & manage** (habits, emergency fund, bank accounts/UPI, FD, RD, PPF, borrowing, insurance), **Understand investing** (risk, compounding, gold, money market, bonds, debt funds, MF/SIP, index funds/ETFs, stocks, diversification, retirement) and **Stay financially safe** (protecting information, scams, fake apps, reporting fraud). Topics form a prerequisite graph tagged by grade group, all as data in `packages/content`.
4. Every topic is stored once and rendered as video, story/comic, visual, formula + calculator, transcript, simulation, quiz and audio.
5. Passing a topic's quiz unlocks instruments in the paper portfolio, simulations or the next topics.
6. Learn by doing through three data-driven engines: **life + market sim** (month-by-month budgeting and investing with life events, in two play-money modes: **Practice** replays real history as episodes, e.g. March 2020 + a hospital bill, with a reveal of the alternatives; **Live** is paper trading on current prices, scored on habits, never returns), **story choices** (branching consequences) and **spot & sort** (need or want, scam or real), plus a what-if sandbox over engine formulas. The demo story is the adaptive loop: evidence → recommendation → activity → simulation → mastery update → changed recommendation.
7. Goal engine, mock Account Aggregator insights → learning nudges, facilitator/NGO dashboard, multilingual AI tutor.
8. **Differentiators** (games are table stakes): **one storyline that remembers every choice** (*Nani's Gullak*: three seasons, one per grade group, Gullu as companion and tutor voice, a recurring cast and villain; no fixed years in the story, then an "FYI, this really happened" reveal with real data); one continuous money life with learn → unlock → invest; **take-home missions** that make the learner the family's money teacher (reach counted in households); built for shared phones and no data; a **habit loop, never addictive** (living Gullak, daily real-price moment, 2-minute drop). Play layer: Money Multiverse and the class market. More ways to learn: Teach the AI, Kitna? lens, pocket-money diary, real documents explained, debate cards, spaced recall. Full design: [`docs/curriculum.md`](docs/curriculum.md).

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
data/snapshots         Committed real-data snapshots so the demo never depends on live APIs. Written by scripts/snapshots/*.
supabase/migrations    Postgres schema (RLS on every per-learner table). Accessed only via apps/web/lib/data.
notebooks              Colab-ready notebooks (model training, heavy data prep). Never run heavy jobs locally.
docs                   Architecture notes and ADRs.
```

Dependency direction: `web → (ui, ai, market-data, content, engine, types)`; `engine, content, market-data, ai → types`. Packages never import from `apps/`. Packages export TypeScript source (no build step); Next transpiles them.

**Phone and desktop are both first-class.** One responsive PWA: bottom tab bar and touch targets on phones; sidebar and multi-pane dashboard on desktop. Installable on Android, iOS, Windows and macOS. E2E tests run on both a phone and a desktop viewport. Native shells (Capacitor / Expo / Tauri) can wrap it later without touching `packages/`.

### Ownership map

| Role | Who | Owns |
|---|---|---|
| **R1** Lead / frontend core | @AbGisHere | `apps/web` shell, routing, layouts (phone + desktop), onboarding, design system (`packages/ui`), release management. Also helps on R2–R4 work. |
| **R2** Frontend / game | @mayankSuman404, @Parthvi1707 | Website flow (with R1), design direction + tokens (Impeccable init), lesson renderers (all formats), sim + portfolio UI (Practice and Live), charts, animations |
| **R3** Backend / data | @ishitaanmol975 | `packages/market-data`, `data/snapshots`, Supabase schema + migrations, data-access layer, route handlers |
| **R4** AI / adaptive engine | @VanshGoel-01 | `packages/ai`, `packages/engine` (adaptive parts), `notebooks/` (knowledge tracing on Colab), format bandit, tutor, lesson pre-generation |
| **R5** Product / content / QA | shared, led by R1 | `packages/content` (topics, translations), quiz quality, guardrail review, Playwright e2e, demo script |

## Scalability rules

- **Content is data, not code.** A new topic or language never needs a code change.
- **LLM output for lessons is generated once per topic × format × grade group × language and cached.** Live LLM calls are only for the tutor, and those are rate-limited and cached.
- **Every market data source sits behind an adapter with caching and a snapshot fallback,** so no screen breaks if an API is down.
- **Domain logic lives in `/packages/engine`,** which is pure functions, fully unit-tested and free of any framework imports.
- **Stateless server code,** ready for edge/CDN deployment; no in-memory session state. (`MemoryCache` is for tests/local only.)
- **Mobile-first, performance-budgeted** (target cheap Android phones on slow networks), **offline-capable lessons** (Serwist service worker).
- **Database access goes through one data-access layer** (typed, Zod-validated). Components never import a DB client directly. Per-user data is keyed by `learner_id` so it can shard later.
- **Money is integer paise** everywhere in code. Human-edited config may use whole rupees and converts at load.

### Model training

We don't fine-tune LLMs. Small adaptive models (e.g. knowledge tracing) are trained in self-contained **Colab notebooks** in `/notebooks`, which output an artifact (JSON parameters) committed to `/data`. The app runs the exported model in plain TypeScript in `packages/engine`. Never run heavy jobs on a laptop. Tell the team lead when a notebook needs to be run.

`notebooks/gullak-knowledge-tracing-bkt.ipynb` implements synthetic input preparation, synthetic BKT fitting (EM, learner-separated held-out evaluation, a draft parameter export labelled synthetic) and a real-data benchmark of BKT, BKT with forgetting, PFA and DKT on ASSISTments 2009–10, not training on Gullak learners or app integration. The ASSISTments CSV is downloaded at run time and must never be committed or shared (its terms); cite it as `notebooks/README.md` says. Its nine-field quiz-answer contract and local/CI validation checks are documented in `notebooks/README.md`. Use exact-byte SHA-256 content versions and pinned question positions; the latest contract has no `question_index` column. All outputs are labelled synthetic; story verdicts are excluded. Quiz graph pass marks remain the only unlock rule. Never activate parameters fitted on synthetic data as a production mastery model.

## Conventions

- **TypeScript strict** (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`). No `any`; use Zod at every external boundary (API inputs, market data, LLM output, JSON files).
- **Biome** lints and formats everything (`pnpm lint`, `pnpm lint:fix`). Don't add ESLint/Prettier.
- **Naming:** files `kebab-case.ts`; React components `PascalCase`; Zod schema and its type share a name (`export const Goal = z.object(…); export type Goal = z.infer<typeof Goal>`); ids are kebab-case slugs.
- **Dependencies:** add versions to the `catalog:` in `pnpm-workspace.yaml` and reference them with `"catalog:"`, so every package uses the same version.
- **i18n:** never hard-code user-facing strings; use `next-intl` (`useTranslations` / `getTranslations`). Messages in `apps/web/messages/<locale>.json`; every locale file must have the same keys (tested).
- **UI work goes through the Impeccable skill** (`/impeccable` in Claude Code; `.agents/skills/impeccable` for other agents): designing, polishing, critiquing or auditing any screen or component. Add shadcn components with `pnpm dlx shadcn@4.21.4 add <name> -c apps/web` (they land in `packages/ui`).
- **Tests:** every package has Vitest unit tests beside the code (`*.test.ts`). Engine functions need tests for normal, edge and invalid input. E2E in `apps/web/e2e` (Playwright, phone + desktop).
- **Scratch files:** agents put temporary work (throwaway scripts, intermediate output, downloads, test commit messages) in their own scratchpad or temp directory, never in the repo. Clear it whenever it's no longer needed: when the task that used it is done, before a push, and before `/compact`. Look before deleting, and move anything worth keeping into the repo first.

### How to add a topic

1. Add a node to `packages/content/config/topic-graph.json`: pillar, grade groups, prerequisites, pass mark, and the instruments and activities it unlocks. Loading rejects unknown prerequisites, cycles and prerequisites not taught to the same grade groups.
2. Create `packages/content/topics/<topic-id>/topic.json` (`TopicMeta`) and `<locale>.json` per locale (`TopicContent`, must include a quiz variant).
3. Formula variants reference an `@gullak/engine` function by name in `calculator`.
4. Run `pnpm test`: content is validated against the schemas. No code changes needed.

### How to add a language

1. Add `{ code, name, nativeName }` to `packages/content/config/locales.json`.
2. Add `apps/web/messages/<code>.json` with every key from `en.json` (Sarvam first, LLM fallback, human review by R5).
3. Add `topics/*/<code>.json` content files (or generate them with the pre-generation script).
4. Run `pnpm test`. No code changes needed.

### Lesson presentation selection

`pickLessonVariant` in `@gullak/engine` selects an eligible non-quiz variant from an already-open topic in one resolved locale. Explicit preferences are ordered; onboarding's full-format list means Mix it up, with deterministic caller-owned rotation. Authored content order breaks ties and defines fallback. It never changes mastery or unlocks; quizzes remain separate assessments. The lesson API adds `formatSelection` metadata, selecting at index 0 until per-learner rotation is integrated. Translate reason codes in the lesson UI, never display them as raw strings. Contract and teammate handoff: [`docs/format-picker.md`](docs/format-picker.md).

### Curriculum brief validation (pre-generation step 1)

`CurriculumBrief` and `CurriculumBriefContext` live in `@gullak/types`; `validateCurriculumBrief(input, context)` in `@gullak/ai` validates them offline. Briefs require schema version 1, status `draft`, topic/grade/locale, learning goals, concept-linked key ideas and quiz objectives, misconceptions with corrections, and examples. Teaching text is trimmed and limited to 1–600 characters; each list has 1–12 items; topic/concept IDs are kebab-case with at most 80 characters. Unknown brief/nested fields are rejected.

Callers supply canonical `meta`, graph `rule` and `supportedLocales`. Topic IDs and pillars must agree, the grade/locale must be supported, and referenced concepts must exist; duplicate canonical concept IDs are rejected. A successful result is still an **unreviewed draft**, not factual/safety/privacy approval or permission to generate/publish. Real briefs live in `packages/content/briefs/<topic-id>/<grade-group>.<locale>.json` (validated by that package's tests); keep engineering fixtures in tests, not published topic files. This step adds no provider calls, assets, translations or publication workflow. Usage/testing notes: [`docs/architecture.md`](docs/architecture.md#offline-curriculum-preparation).

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
      *Automation (see Decisions, 2026-10-10):* CI runs the full suite (lint, typecheck, unit tests, production build, phone + desktop e2e) on every push and PR; nobody needs to run it locally. The `pre-push` hook only runs the release check on main. A PR must be green in CI before it's merged; whoever merges checks this.
   4. Bump the version following SemVer, starting at `0.0.1`: patch for fixes and small changes, minor for a finished feature or roadmap phase. Keep all package.json versions in sync. (`pnpm release patch|minor` does this.)
   5. Update `CHANGELOG.md` (move items from Unreleased into the new version with today's date), tick completed items in `ROADMAP.md`, and update `AGENTS.md` if any convention, structure or decision changed. These three files must be fully accurate before the push.
   6. Commit, tag `vX.Y.Z` on main, push.
   7. **Submission repo: only when R1 says so.** The submission repo ([IIIT-ECell/megathon26-claude2create](https://github.com/IIIT-ECell/megathon26-claude2create), remote `submission`) is what gets graded. R1 decides which releases go there and when. When told to, push a released, CI-green `main` and its tag: `git push submission main vX.Y.Z`. Never push feature branches there, and agents never push there on their own, not even right after a release. Only R1 has access; set it up once with `git remote add submission https://github.com/IIIT-ECell/megathon26-claude2create.git`.
   *Enforced on main:* `scripts/check-release.mjs` (versions in sync, dated changelog section, README version badge, tag present) in `pre-push` and CI.
4. **Team workflow:** 5 people push to this repo. Work on feature branches (`feat/<area>`), keep PRs small. To avoid version-file conflicts between teammates, feature branches only add entries under `[Unreleased]`; the version bump and changelog release happen on the push/merge to `main`.
   *In practice:* **R1 (team lead)** works on branches in this repo and merges them to `main` when ready. **R2–R5 fork** the repo, work on `feat/<area>` in their fork, and open PRs into `AbGisHere/Claude2Create_MegathonX:main`. Enable Actions once in your fork (Actions tab → "I understand my workflows, go ahead and enable them") so CI runs on your pushes. Once a branch is merged into `main`, delete it locally and on the remote.
   **Commit small and push often.** On your fork branch, commit each logical step on its own (a schema, its tests, a route, a doc) as soon as it works, and push to your fork after every few commits. Don't save a day's work for one big commit, and don't make empty or padding commits; every commit follows rule 2. PRs are merged by rebase or fast-forward, never squashed, so every commit lands on `main`. Versions and tags still change only when a PR merges into `main`, so there are many commits per release.
5. **Never** force-push to main (on either remote), commit secrets, or commit generated build output.
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
| 2026-10-10 | **CI runs every check; `pre-push` only runs the release check on main** | No double effort: the full suite runs automatically on every push and PR, including forks. A red CI is fixed, never merged. |
| 2026-10-10 | **No branch protection on main**; fork + PR workflow | Team lead's call. Merger must confirm CI is green. |
| 2026-10-11 | **BKT with forgetting is the on-device knowledge-tracing model; DKT later**, chosen on a real-data benchmark (ASSISTments 2009–10, 5-fold learner-separated: DKT 0.739 AUC, BKT + forgetting 0.727, BKT 0.722, PFA 0.710) | It gets about 98% of DKT's AUC with five readable parameters per concept, runs offline on cheap phones and can be explained to teachers; DKT needs data at a scale Gullak doesn't have yet. |
| 2026-10-11 | **Small, frequent commits on fork branches; PRs merged by rebase/fast-forward, never squashed;** versions bump only on merge | A history of small, reviewable steps shows how the product was built and keeps each change easy to review and revert; tags stay one per release. |
| 2026-10-10 | **Graded submission repo `IIIT-ECell/megathon26-claude2create`** (remote `submission`), pushed only when R1 says so | It's what gets graded and teammates have no access. R1 picks which released, green versions graders see. |
| 2026-10-10 | **Vercel hosting at `gullak.abgupta.me`** (CNAME on Namecheap); production from `main`, previews per branch; functions in Mumbai (`bom1`) | Zero-config Next/Turborepo deploys; a stable custom URL for judges and the installed PWA; Mumbai is closest to learners and to Supabase. |
| 2026-10-10 | **Four-pillar curriculum for Grades 6–12** (grade groups 6–7 / 8–10 / 11–12) instead of an instrument ladder for adults; **learn-by-doing engines** with every scenario as data | Matches the problem statement (school students, four pillars, learn by doing). Engines are coded once; topics, personas, events, stories and languages are added without code changes. |
| 2026-10-10 | **Life sim and market sim merged into one engine with Practice (replayed history + life events + reveal) and Live (paper trading on current prices)**; the Time Machine becomes Practice episodes; Live scores habits, not returns | Forced selling during a life event teaches liquidity and why an emergency fund matters, across three pillars and every grade group. One shared portfolio and engine instead of two builds. Scoring habits keeps Live educational rather than a trading game. |
| 2026-10-10 | **Sarvam** for en → hi / te translation (UI messages and topic content), LLM fallback, human review before shipping; replaces Bhashini | Built for Indian languages; one provider for every locale. Hindi and Telugu strings written before it lands are unreviewed drafts. |
| 2026-10-10 | **USP is reach and habit, not games:** one continuous money life, take-home missions (households reached), built for shared phones and no data, a 2-minute daily habit loop | The problem statement asks for games, so every team will have them; NGPF Arcade already offers a dozen. Few will design for the family and the shared phone. |
| 2026-10-10 | **The storyline *Nani's Gullak* is the spine of the product;** no fixed years inside the story, real events revealed only after an arc ("FYI, this really happened") | A story that carries over for years gives learners a reason to care and come back; keeping years out stops it feeling like a history lesson, while the reveal still ties it to real Indian data. |
| 2026-10-10 | **Engagement is habit-forming, never addictive:** no loot boxes, guilt notifications, endless feeds, night or school-hours notifications, or money/returns leaderboards; the Gullak grows only with habits | Learners are 11–17 and the subject is financial discipline; dark patterns would teach the opposite and lose schools' and judges' trust. |
| 2026-10-10 | **Class market lists only fictional companies;** prices come from the class's orders; scored on habits | Teaches price discovery, bubbles and herd behaviour from the inside without naming real products or turning classmates into stocks. |
| 2026-10-10 | **MIT licence** | Standard for hackathon projects; team lead approved. |
| 2026-10-10 | **Impeccable skill committed** for all agents; hooks in shared settings | UI quality is how we win; every teammate's agent gets the same design checks. |
