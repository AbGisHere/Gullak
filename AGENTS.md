# AGENTS.md

The single source of truth for every AI agent (Claude Code, Codex, Gemini, OpenCode, Cursor) and every human working on Gullak. `CLAUDE.md` imports this file; Gemini reads it via `.gemini/settings.json`; Codex, OpenCode and Cursor read it natively. **These are project rules: they apply to every teammate and every fork.**

## Product

**Gullak** is a gamified financial-literacy platform for Indian students in Classes 6–12. Core loop: **experience → decide → observe consequences → understand → apply → review → unlock.** The full learning map is in [`docs/curriculum.md`](docs/curriculum.md).

1. Onboarding records language (en / hi / te), class group (6–7 / 8–9 / 10–12), current experience and preferred formats. Older learners may take a placement challenge.
2. The eight shared worlds are **Candy Economy**, **Savings Quest**, **Bankopolis**, **Market Mayhem**, **Grow Your Money**, **Stock Street**, **Life Simulator** and **Finance Tycoon**. Class group changes depth, vocabulary and scenario realism; it does not create separate courses.
3. Each 3–5 minute lesson is data: narrative hook, mechanic, decisions, outcomes, recovery feedback, concept reveal, application, review, XP, mastery and unlocks.
4. Reusable mechanics include budgeting, branching stories, virtual shops, money-growth tools, fictional paper portfolios, life-event cards and spot-and-sort rounds.
5. Progress unlocks the next lesson/world and can award only virtual XP, badges or fictional coins. Never reward the biggest short-term investment return.
6. Learn by doing through life + market simulation (Practice replays history with life events; Live uses paper trading on current prices and scores habits, never returns), story choices and spot-and-sort rounds. Evidence from quizzes, activities and decisions drives mastery and recommendations; passing a lesson's check (today: quiz pass marks) is the only unlock rule.
7. Goal engine, mock Account Aggregator insights → learning nudges, facilitator/NGO dashboard, multilingual AI tutor.
8. **Differentiators** (games are table stakes): **one storyline that remembers every choice** (*Nani's Gullak*: one arc per world across all eight, Gullu as companion, world guide and tutor voice, a recurring cast and villain; no fixed years in the story, then an "FYI, this really happened" reveal with real data); one continuous money life with learn → unlock → invest; **take-home missions** that make the learner the family's money teacher (reach counted in households); built for shared phones and no data; a **habit loop, never addictive** (living Gullak, daily real-price moment, 2-minute drop). Play layer: Money Multiverse and the class market. More ways to learn: Teach the AI, Kitna? lens, pocket-money diary, real documents explained, debate cards, spaced recall, and Stock Street's company report card, which explains every company metric on fictional companies ([`docs/company-metrics.md`](docs/company-metrics.md)). Full design: [`docs/curriculum.md`](docs/curriculum.md).

**Migration status:** the app still runs on the earlier topic model (four pillars, `topics/`, grade groups 6–7 / 8–10 / 11–12) and stays there until after the demo. Phase 0 metadata contracts may be drafted without activating them; moving app code/content is later work. Until then, the topic-model sections below describe what the code does.

### Hard guardrail (non-negotiable)

> **We educate; we never recommend real products or tell anyone to buy or sell. All projections are labelled as assumptions, not promises. All money is virtual.**

Enforced in code, not just copy:
- `Portfolio.isVirtual` is `z.literal(true)`: there is no type for real money.
- `@gullak/ai` guardrails screen learner questions **and** model output for advice; the tutor prompt forbids recommendations.
- Money remains virtual-only in code and existing explanatory copy. Standalone Play money badges are omitted from learner screens at the product owner's request: non-interactive pills looked clickable. Do not replace them with extra warning text. Every projection shows its assumptions (rate, period, source, as-of date).
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
| **R1** Lead / frontend core | @AbGisHere | `apps/web` shell, routing, layouts, learner profile, world map, design system and release management. Also helps on R2–R4 work. |
| **R2** Frontend / game | @mayankSuman404, @Parthvi1707 | Game UI, design direction + tokens, lesson renderer, world maps, mechanics, Practice/Live simulation and portfolio UI, motion and charts |
| **R3** Backend / data | @ishitaanmol975 | `packages/market-data`, `data/snapshots`, Supabase schema + migrations, data-access layer, route handlers |
| **R4** AI / adaptive engine | @VanshGoel-01 | `packages/ai`, `packages/engine` (adaptive parts), `notebooks/` (knowledge tracing on Colab), format bandit, tutor, lesson pre-generation |
| **R5** Product / content / QA | shared, led by R1 | `packages/content` (worlds, lessons, translations), decision/quiz quality, guardrail review, Playwright e2e and demo script |

## Scalability rules

- **Content is data, not code.** A new world, lesson, scenario, stage variant or language never needs a renderer code change.
- **LLM output for lessons is generated once per lesson × stage × format × language and cached.** Live LLM calls are only for the tutor, and those are rate-limited and cached.
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

### How to add a lesson

1. Add the lesson to its world and define its previous-lesson/mastery unlock.
2. Create `packages/content/worlds/<world-id>/<lesson-id>/lesson.json` with stage variants, mechanic, decisions, outcomes, review and XP.
3. Create `<locale>.json` for every supported language; each one needs the same decision ids and review structure.
4. Reference an `@gullak/engine` function only for deterministic calculations or simulations.
5. Run `pnpm test`: content is validated against the schemas. No renderer code change is required.

Until the content schema migrates, mirror this structure in `packages/content/config/topic-graph.json` and its topic files so the existing renderer keeps working, and place each topic in exactly one world in `packages/content/config/topic-worlds.json` (the learning map groups by it; tested).

### How to add a language

1. Add `{ code, name, nativeName }` to `packages/content/config/locales.json`.
2. Add `apps/web/messages/<code>.json` with every key from `en.json` (Sarvam first, LLM fallback, human review by R5).
3. Add `topics/*/<code>.json` content files (or generate them with the pre-generation script).
4. Run `pnpm test`. No code changes needed.

### Learner Back navigation

`NavigationProvider` in the root client providers owns transient route/Home-section history; `ShellFrame` exposes one translated Back control on phone and desktop. Keep history separate from learner evidence and never clear progress during navigation. Directly opened or reloaded routes fall back to Home rather than trusting browser history outside this app session. Inline screens can supply `onBack` to close before leaving their parent; story-step Back and modal Close remain separate. Home section selection goes through `useAppNavigation`, so routed visits can return to the originating section.

Standalone offline and error/404 screens use `RecoveryBackButton`. It validates same-origin destinations, falls back to Home if the navigation provider is unavailable and reloads a same-route failure instead of remaining stuck in its error boundary. `ShellBackScope` suppresses the recovery button inside the learner shell so only the header Back appears there. Preserve the independent Home and Retry actions; recovery never deletes learner data.

Finishing or skipping the starting placement quiz closes it to reveal Home, not the learning map. Save placement and quiz evidence before closing; closing via Back alone does not mark it taken. Keep the recommended-learning card on Home only, with the learner choosing when to visit the map.

The dismissible “New here?” guide lives on Home, not either learning map. Show it on the first two app visits per learner; a visit is a page load that reaches Home, not a tab switch, route change or locale refresh. The root `WelcomeHintProvider` remembers this visit across client navigation, while validated learner-scoped local storage holds the capped count and dismissal separately from progress. “Got it” hides it permanently on this device; blocked storage can only remember dismissal for the current visit. An old device-wide map dismissal migrates to the first observed learner without hiding the guide from future shared-phone learners. Me retains a permanent link to `/help` through its shared profile component.

The lesson class comparison switches both teaching text and quiz questions. Answers, result feedback and session drafts are scoped to the selected class and quiz; returning to the learner's own class restores its state. Other-class quizzes are labelled practice-only and never save attempts, mastery or passes, change the profile, or award unlocks. Only the own-class quiz writes normal progress.

### Lesson presentation selection

`pickLessonVariant` in `@gullak/engine` selects an eligible non-quiz variant from an already-open topic in one resolved locale. Explicit preferences are ordered; onboarding's full-format list means Mix it up, with deterministic caller-owned rotation. Authored content order breaks ties and defines fallback. It never changes mastery or unlocks; quizzes remain separate assessments. The lesson API adds `formatSelection` metadata, selecting at index 0 until per-learner rotation is integrated. Translate reason codes in the lesson UI, never display them as raw strings. Contract and teammate handoff: [`docs/format-picker.md`](docs/format-picker.md).

### Educational recommendations

The experimental `MlFixtureInput` / `MlFixtureResult` boundaries and
`replayQuizFixture` connect synthetic quiz fixtures to BKT and `recommendNext`.
Inactive web backend/frontend adapters validate learner scope and transport context.
They are not connected to routes, components, storage or model artifacts and must
not be used to activate real mastery. Results are always synthetic and disabled;
the fixture registry is not R3's immutable production registry. See
[`docs/architecture.md`](docs/architecture.md#disabled-ml-fixture-integration).

`initialMastery(experience)` in `@gullak/engine` initializes onboarding with the approved exact priors: none 0.1, some 0.3, regular 0.5. The web helper re-exports it. Never reset stored mastery on reads or change quiz-only unlocks; the temporary web evidence updater and its parameters are not replaced by this function.

`recommendNext(input)` in `@gullak/engine` is a pure ranker, not a mastery updater or unlock rule. `RecommendationRequest` and `NextRecommendation` in `@gullak/types` define its contract: grade group, graph-ordered rules extended with canonical `conceptIds`, best quiz scores and complete topic-scoped mastery. Missing evidence state is rejected, never silently reset to onboarding priors. Review the lowest weak concept (<0.6) in passed grade-eligible topics first; otherwise rank open unfinished topics by the mean of every prerequisite concept (foundation readiness 1); otherwise review the passed topic with the lowest mean mastery, or return null. Ties follow graph then authored concept order. Never load synthetic parameters here. UI/DB wiring is separate; translate reason codes. Usage and R2/R3 handoff: [`docs/architecture.md`](docs/architecture.md#educational-recommendation-ranking).

### Curriculum brief validation (pre-generation step 1)

`CurriculumBrief` and `CurriculumBriefContext` live in `@gullak/types`; `validateCurriculumBrief(input, context)` in `@gullak/ai` validates them offline. Briefs require schema version 1, status `draft`, topic/grade/locale, learning goals, concept-linked key ideas and quiz objectives, misconceptions with corrections, and examples. Teaching text is trimmed and limited to 1–600 characters; each list has 1–12 items; topic/concept IDs are kebab-case with at most 80 characters. Unknown brief/nested fields are rejected.

Callers supply canonical `meta`, graph `rule` and `supportedLocales`. Topic IDs and pillars must agree, the grade/locale must be supported, and referenced concepts must exist; duplicate canonical concept IDs are rejected. A successful result is still an **unreviewed draft**, not factual/safety/privacy approval or permission to generate/publish. Real briefs live in `packages/content/briefs/<topic-id>/<grade-group>.<locale>.json` (validated by that package's tests); keep engineering fixtures in tests, not published topic files. This step adds no provider calls, assets, translations or publication workflow. Usage/testing notes: [`docs/architecture.md`](docs/architecture.md#offline-curriculum-preparation).

### Pinned English tutor preparation (inactive, post-demo)

`prepareTutorRequest(input)` and `findTutorExcerpt(input)` in `@gullak/ai` accept only exact English topic bytes from the static `tutor-approved-english.json` editorial allowlist at `v0.2.12` (`fddbdeb6464576d5e207f47c1f098827a1dc75ef`). This is grounding permission, not a real-learner historical registry or a fabricated R5 review record. Modified bytes, newly hashed edits, Hindi/Telugu and Candy Economy gameplay are unapproved. Both helpers validate external input, snapshot caller bytes before hashing, filter grade audiences and omit all quiz/asset/calculation fields. Questions and teaching text are JSON user data under explicit inactive `TUTOR_PROMPT_V3`; the existing active prompt stays v2. No provider calls, API key reads, public routes, persistence, unlock changes or app activation.

The fallback is an attributed `approved-content-excerpt`, never a generated answer or asserted semantic answer. It requires at least two distinct meaningful English terms, all matching one safe complete teaching field; it preserves the whole field and caveats, never joins/truncates text, and returns reason codes when no excerpt qualifies. Bounds, citations and limitations: [`docs/architecture.md`](docs/architecture.md#pinned-english-tutor-preparation-inactive-post-demo). Multilingual review, provider execution, persistent rate limits/cache and app integration remain separate post-demo work.

### Sarvam translation authoring

`createSarvamTranslator` in `@gullak/ai` translates only authored plain English text
to Hindi/Telugu drafts with `mayura:v1`. It never reads keys itself or publishes
content; callers supply the server-only key. The CLI `scripts/translate-text.mjs`
reads `SARVAM_API_KEY`, defaults to dry-run, deduplicates/cache-reuses exact
requests, and reserves input characters before calling. Its external local cache
and ledger are authoring assets, not production persistence; keep them across
runs. Never delete them as scratch or claim a character cap is an organisation-wide
rupee balance. All translated text needs R5 review; placeholders/ICU/HTML are
rejected in this increment. No translation calls occur in tests/builds or the app.
See [authoring handoff](docs/architecture.md#sarvam-plain-text-translation-authoring).

### Offline lesson drafts

`LessonDraft` in `@gullak/types` wraps one existing-renderer-compatible transcript, text-only story, device narration or quiz variant with topic, grade, locale and draft-only status. `validateLessonDraft(input, brief, context)` in `@gullak/ai` revalidates the brief, checks canonical concept coverage and quiz integrity, and screens teaching text with existing output guardrails. Structural success is not factual, safety or R5 approval. No provider calls, assets, publication, persistence or unlock changes. Editorial limits and future generation handoff are in [`docs/architecture.md`](docs/architecture.md#offline-lesson-draft-validation).

`buildLessonGenerationRequest({ brief, context, format })` prepares offline, versioned requests for the same four draft formats. Keep teaching data out of system instructions; add new prompt versions instead of editing a published one. A prepared request is not generated or approved content. Explicit provider execution and cache-key preparation are separate utilities; provider fallback, persistent caching and app wiring remain future work. The draft runner enforces output/request identity and format checks. Contract: [`docs/architecture.md`](docs/architecture.md#offline-lesson-generation-requests).

`generateLessonDraft(input, generate)` connects the current-topic request builder and validator through one caller-supplied async generator. It pins brief/context before awaiting output, rejects mismatched identity/format and returns only validated, unreviewed drafts. No built-in provider, retry, cache, persistence or publication. This does not implement the eight-world migration: wait for agreed world/lesson/stage contracts before adapting generation. Contract: [`docs/architecture.md`](docs/architecture.md#current-topic-draft-generation-runner).

`createLessonDraftGenerator(model)` explicitly bridges an AI SDK model object to the runner using strict structured output and no automatic retries. Invoking the returned generator calls the selected model; constructing it does not. Always use through the runner for semantic/guardrail validation. `buildLessonDraftCacheKey({ request, model, contentVersion })` hashes the complete prepared request, prompt version, model identity and caller-verified exact-byte source-content SHA-256; it prepares a key only, never reads/writes a cache. Both have offline synthetic tests; no app activation, publication or human approval is implied. Models should be pinned for reproducible caches. Contracts and limits: [`docs/architecture.md`](docs/architecture.md#explicit-lesson-provider-adapter), [`cache-key preparation`](docs/architecture.md#lesson-draft-cache-key-preparation).

`prepareLessonBatch({ jobs })` in `@gullak/ai` is offline preparation only. Its fixed catalog pins the five approved v0.2.12 English Grade 8–10 briefs, canonical context and exact source bytes; changed content or scope rejects. It snapshots caller data/bytes before hashing, rejects duplicate identities and returns a deterministic `prepared-only` manifest of requests/model identities/source hashes/cache keys. It accepts no provider/generator, stores nothing and grants no draft/publication approval. Bounds and contract: [`docs/architecture.md`](docs/architecture.md#offline-lesson-batch-preparation). This work remains post-demo; app activation is separate.

### Draft world metadata (inactive until after the demo)

`Stage`, `World` and `Lesson` in `@gullak/types` are metadata-only Phase 0 drafts. Stage IDs are foundation-explorers (Classes 6–7), money-navigators (8–9), financial-strategists (10–12). Worlds and lessons use kebab-case slugs. Lesson metadata carries stages/concepts, predecessor and its own explicit quiz pass mark; it carries no mastery gate. Existing topic types, loaders, routes and onboarding remain unchanged. Full localized gameplay, rewards, catalog links/cycles and migration are separate work. Contract and examples: [`docs/architecture.md`](docs/architecture.md#draft-world-metadata).

### Virtual unit-price comparisons

`compareUnitPrices(input)` in `@gullak/engine` validates `UnitPriceComparison` from `@gullak/types`: explicit virtual-only input, nonnegative safe integer paise, positive whole quantities and matching piece/gram/millilitre units. Exact internal integer cross-products return left/right/equal cost per unit, not affordability or purchase advice. No shop actions, XP, mastery or unlock changes. R2 owns later UI integration and result-label translations. Contract, tests and confirmed current renderer constraints: [`docs/architecture.md`](docs/architecture.md#exact-virtual-unit-price-comparison). Candy Economy Lesson 1 remains unapproved; no generation or gameplay implementation until R5 signs off and supplies JSON. Do not extend the draft `Lesson` metadata with gameplay, XP or mastery gates.

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
| 2026-10-11 | **CI does not run in the submission repo** (every job is guarded on `github.repository`) | Only released, already-green `main` commits are pushed there; rerunning the suite duplicates CI and can add red marks graders see. |
| 2026-10-10 | **No branch protection on main**; fork + PR workflow | Team lead's call. Merger must confirm CI is green. |
| 2026-10-11 | **BKT with forgetting is the on-device knowledge-tracing model; DKT later**, chosen on a real-data benchmark (ASSISTments 2009–10, 5-fold learner-separated: DKT 0.739 AUC, BKT + forgetting 0.727, BKT 0.722, PFA 0.710) | It gets about 98% of DKT's AUC with five readable parameters per concept, runs offline on cheap phones and can be explained to teachers; DKT needs data at a scale Gullak doesn't have yet. |
| 2026-10-11 | **Small, frequent commits on fork branches; PRs merged by rebase/fast-forward, never squashed;** versions bump only on merge | A history of small, reviewable steps shows how the product was built and keeps each change easy to review and revert; tags stay one per release. |
| 2026-10-10 | **Graded submission repo `IIIT-ECell/megathon26-claude2create`** (remote `submission`), pushed only when R1 says so | It's what gets graded and teammates have no access. R1 picks which released, green versions graders see. |
| 2026-10-10 | **Vercel hosting at `gullak.abgupta.me`** (CNAME on Namecheap); production from `main` only, no branch or PR previews (2026-10-11: fork PRs failed the Vercel check and previews duplicated CI); functions in Mumbai (`bom1`) | Zero-config Next/Turborepo deploys; a stable custom URL for judges and the installed PWA; Mumbai is closest to learners and to Supabase. |
| 2026-10-10 | **Four-pillar curriculum for Grades 6–12** (grade groups 6–7 / 8–10 / 11–12) instead of an instrument ladder for adults; **learn-by-doing engines** with every scenario as data (superseded on 2026-10-11 by the eight-world curriculum) | Matches the problem statement (school students, four pillars, learn by doing). Engines are coded once; topics, personas, events, stories and languages are added without code changes. |
| 2026-10-11 | **Eight-world adaptive curriculum** for Classes 6–12 (6–7 / 8–9 / 10–12), built from short decision-led lessons | The journey starts with candies and pocket money, then reaches banking, markets, investing, life finance and entrepreneurship. Worlds share mechanics and adapt depth; lesson data carries decisions, outcomes, XP and unlocks. |
| 2026-10-10 | **Life sim and market sim merged into one engine with Practice (replayed history + life events + reveal) and Live (paper trading on current prices)**; the Time Machine becomes Practice episodes; Live scores habits, not returns | Forced selling during a life event teaches liquidity and why an emergency fund matters, across the eight worlds and every grade group. One shared portfolio and engine instead of two builds. Scoring habits keeps Live educational rather than a trading game. |
| 2026-10-10 | **Sarvam** for en → hi / te translation (UI messages and topic content), LLM fallback, human review before shipping; replaces Bhashini | Built for Indian languages; one provider for every locale. Hindi and Telugu strings written before it lands are unreviewed drafts. |
| 2026-10-10 | **USP is reach and habit, not games:** one continuous money life, take-home missions (households reached), built for shared phones and no data, a 2-minute daily habit loop | The problem statement asks for games, so every team will have them; NGPF Arcade already offers a dozen. Few will design for the family and the shared phone. |
| 2026-10-10 | **The storyline *Nani's Gullak* is the spine of the product;** no fixed years inside the story, real events revealed only after an arc ("FYI, this really happened"); since 2026-10-11, one arc per world instead of three seasons | A story that carries over for years gives learners a reason to care and come back; keeping years out stops it feeling like a history lesson, while the reveal still ties it to real Indian data. |
| 2026-10-10 | **Engagement is habit-forming, never addictive:** no loot boxes, guilt notifications, endless feeds, night or school-hours notifications, or money/returns leaderboards; the Gullak grows only with habits | Learners are 11–17 and the subject is financial discipline; dark patterns would teach the opposite and lose schools' and judges' trust. |
| 2026-10-10 | **Class market lists only fictional companies;** prices come from the class's orders; scored on habits | Teaches price discovery, bubbles and herd behaviour from the inside without naming real products or turning classmates into stocks. |
| 2026-10-11 | **Live paper trading uses Yahoo Finance's public chart and search endpoints, Indian listings only** (NSE `.NS`, BSE `.BO`, Indian indices), through `createYahooAdapter` and public, read-only, server-cached `/api/market/*` routes | Learners asked to practise on any real Indian listing, and no free official API covers stocks, ETFs and mutual funds with search. The endpoints are unofficial and keyless, so results are cached (60 s quotes, 1 h search), every price shows its as-of time and "may be delayed", and an outage shows an honest "price unavailable" state instead of a snapshot, because arbitrary symbols cannot have committed snapshots. Trading a kind of listing opens only after the lesson that unlocks it in the topic graph; money is always play money. |
| 2026-10-10 | **MIT licence** | Standard for hackathon projects; team lead approved. |
| 2026-10-10 | **Impeccable skill committed** for all agents; hooks in shared settings | UI quality is how we win; every teammate's agent gets the same design checks. |
