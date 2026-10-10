# R3 backend: setup and testing

Work is on `feat/ishita-backend`. No commit, push, deployment or release bump is part of this setup.

## What the inspection found

The initial checkout had finance/unlock functions, shared Zod schemas, Supabase client helpers and adapter infrastructure. Node 24.21.0, npm 11.19.0 and pnpm 12.10.1 were recognised. Installation using the existing lockfile succeeded. Baseline lint, 42 unit tests, typechecking and production build passed. SWC required the normal Windows user context outside the restricted agent sandbox; no execution-policy change was made.

During implementation the checkout advanced to v0.0.3, adding a teammate's initial migration, learner mappers, progress/portfolio interfaces, AMFI adapter and real NAV snapshot. This work extends those files. The original migration is preserved. Database types are now generated from an isolated PostgreSQL database after all local migrations. Shared-project schema comparison remains pending.

## Stages and files

| Stage | Files | Purpose |
|---|---|---|
| Database | `supabase/migrations/20261010140000_backend_transactions.sql` | Extends the existing schema; restricts writes; adds atomic onboarding, grading persistence, FD transactions, retries and cohort permissions |
| Access | `apps/web/lib/data/index.ts`, `transactions.ts`, `database.types.ts` | One verified entry point, typed RPCs and Zod-validated results; reads cash and holdings together |
| Identity and HTTP | `apps/web/lib/backend/auth.ts`, `http.ts`, `errors.ts` | Supabase verifies the session; rejects invalid input, large bodies and cross-origin cookie writes; returns machine-readable error codes |
| Core loop | `apps/web/lib/backend/service.ts`, `apps/web/app/api/**` | Thin routes orchestrate config, content, engine and database; clients never provide trusted balances, scores or unlocks |
| Content | `packages/content/src/topic-loader.ts`, `topics/{money-basics,saving-habit,bank-accounts-upi,fixed-deposit}` | Validated English transcript/quiz drafts; answer keys stay on the server; absent translations return an explicit error |
| Maths | `packages/engine/src/quiz.ts`, `valuation.ts` | Pure grading, FD accrual and observed-history replay using existing compounding/maturity functions |
| Market data | `apps/web/lib/backend/market.ts`, `packages/market-data/src/catalog.ts`, `data/snapshots/sbi-published-card-rate-fd-1y.json` | Next data-cache-backed AMFI quotes with committed fallback; FD is always a dated snapshot |
| Tests | Tests beside these modules; `supabase/tests/core.sql`, `scripts/test-database.mjs` | Input/identity/grading tests plus actual PostgreSQL isolation, rollback and concurrency checks |

R1/R2 should use these API contracts for onboarding and portfolio screens. R5 must review the English drafts and supply other formats and hi/te translations. R4 owns broader adaptive/valuation work; the additions here cover the FD core loop and a lump-sum replay only. Existing legacy repository examples are retained, but the application entry point now requires a Request and returns `{ db, learnerId }`. There is no persistent-API memory fallback. Direct legacy Supabase writes will be rejected after the follow-up migration; use the verified entry point and transaction methods.

## Local commands (PowerShell, repository root)

```powershell
node --version
npm.cmd --version
pnpm.cmd --version
pnpm.cmd install --frozen-lockfile
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin"
pnpm.cmd dev
```

Expected: Node >=24, pnpm 12.10.1, passing checks, and a database-test success message. The database test starts an isolated temporary PostgreSQL cluster on a free loopback port, tests it, stops it and deletes only that temporary directory. It does not use your installed PostgreSQL database or Supabase credentials. Never run `supabase/tests/core.sql` in a shared project; the test runner supplies its own fake Auth schema for local tests.

Validated on 2026-10-10: lint, strict typechecking, 100 unit tests, production build and local PostgreSQL tests passed. Lint has one existing Biome deprecation notice. The Playwright suite passed both HTTP manifest checks, but its phone/desktop browser checks could not launch Chromium: Windows explicitly reported **"An Application Control policy has blocked this file"**. Chromium was installed; no policy was changed or bypassed. Run `pnpm.cmd test:e2e` in an environment permitted to run Playwright, or confirm those checks in CI before merging. Hosted Supabase sessions were not tested because no project credentials are configured.

If tools become unrecognised again, install Node 24 LTS from nodejs.org, reopen VS Code/PowerShell, then run `npm.cmd install --global pnpm@12.10.1`. Use `.cmd` launchers; do not change PowerShell execution policies. Your tools were already installed at inspection time.

## Supabase steps you must perform

For a shared project, start with [the review checklist](backend-review.md) and `supabase/schema-review.sql`. The application steps below require approval of the exact changes after comparing remote metadata; they are not permission to apply migrations now.

1. Ask R1 whether a project already exists. Check its Table Editor and migration history before running SQL. Local files cannot prove a remote project is empty. Use a free project; no paid service is needed.
2. For an empty project, apply **in order** `20261010130000_init.sql`, then `20261010140000_backend_transactions.sql`, then `20261010150000_grade_group_onboarding.sql`, then the reviewed `20261011090000_learning_runs.sql` using the project's SQL Editor. If the initial migration is already applied, review the follow-ups and apply only those not already present. Stop and inspect any unexpected existing tables; do not rerun the initial migration over them. SQL Editor application is manual and does not automatically populate CLI migration history; record which files you applied for R1.
3. Under Authentication settings, enable anonymous sign-ins for the hackathon learner flow. An anonymous Supabase Auth user still has a verified user ID and authenticated database role. Use the dashboard's recommended abuse protection when publicly deploying; a CAPTCHA-enabled signup also needs a real CAPTCHA token.
4. Copy `.env.example` to `apps/web/.env.local` using `Copy-Item .env.example apps/web/.env.local` **only if that file does not already exist**. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` locally. Restart the app. Do not send keys in chat or commit this file. Persistent backend routes need all three; the UI skeleton can still start without them.
5. In Table Editor, verify RLS on learners, topic_progress, portfolios, holdings and the new tables. Learners get read-only access to their rows. Anonymous and authenticated roles cannot call write RPCs; only the server secret can. Membership tables have no client grants or policies.
6. Facilitator access is assigned by an administrator through SQL Editor: create a cohort, add learner memberships and assign the facilitator's verified Auth user ID in `cohort_facilitators`. A self-supplied cohort ID or user metadata grants no access. Do not grant facilitators raw learner-table access.
7. Once CLI setup is available, generate types from the linked database, review the diff in `apps/web/lib/data/database.types.ts`, and keep the RPC contract in sync. Do not expose the secret in a browser or Postman learner requests.

Official references: [anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions).

## Postman: core loop

Import `docs/gullak-backend.postman.json`. Set collection variables `baseUrl` to `http://localhost:3000`, `supabaseUrl` to your project URL, and `publishableKey` to its public key. Keep these local. The first request creates an anonymous session and saves the returned `access_token` as `accessToken`. The server secret is never a Postman collection variable.

The sequence is:

1. `POST {{supabaseUrl}}/auth/v1/signup`, header `apikey: {{publishableKey}}`, JSON `{}`. Expected 200 with `access_token`; anonymous sign-ins must be enabled. Each fresh signup is a new learner. To test persistence, retain the same token; it expires and must later be refreshed.
2. `POST /api/onboarding`, Bearer `{{accessToken}}`, JSON `{"gradeGroup":"grade-8-10","experience":"none","locale":"en","preferredFormats":["transcript","quiz"]}`. Expected 200 profile. Starting cash is 500,000 paise (INR 5,000), read from config. Retrying onboarding cannot reset cash.
3. Topics open along the prerequisite graph (`packages/content/config/topic-graph.json`): pass `money-basics`, then `saving-habit`, the same way as below, before `bank-accounts-upi`. `GET /api/lessons/bank-accounts-upi`. Expected lesson without `correctOptionId` or quiz explanation. `POST /api/lessons/bank-accounts-upi/progress`, JSON `{"variantId":"read"}`.
4. `POST /api/lessons/bank-accounts-upi/quiz`, header `Idempotency-Key: <UUID>`, JSON `{"variantId":"check","answers":[{"questionId":"virtual-money","optionId":"0"},{"questionId":"saving-purpose","optionId":"0"}]}`. Expected calculated score 1 and passed true. Passing `bank-accounts-upi` is required before FD.
5. Read `/api/lessons/fixed-deposit`, record `{"variantId":"read"}` at its `/progress` endpoint, then submit `{"variantId":"check","answers":[{"questionId":"fd-rate","optionId":"0"},{"questionId":"fd-assumptions","optionId":"0"}]}` to its `/quiz` endpoint with a **new** UUID key. Expected passed true. These IDs belong to the current English drafts; if R5 edits them, use the lesson response's IDs.
6. `GET /api/progress`. Expected `fixed-deposit` among unlocked instruments.
7. `POST /api/portfolio/fd`, header `Idempotency-Key: <new UUID>`, JSON `{"principalPaise":100000,"tenureMonths":12}`. Expected persisted virtual holding using the server's 6.25% snapshot rate, effective 2025-12-15. Tenure is currently restricted to 12 months to match that published rate band.
8. Repeat the exact investment with the **same key and body**. Expected the same holding ID, no second deduction. Changing the body with the same key returns 409 `idempotency_conflict`.
9. `GET /api/portfolio`. Expected cash 400,000 paise and one holding after the example investment. Restart the app and repeat this request with the same session: the holding persists. Accrual is a labelled ACT/365.25 assumption, capped at calendar maturity; no automatic real-money payout occurs.

Every response is `{ "data": ... }` or `{ "error": { "code": ... } }`. Errors use codes so R1/R2 can translate them with next-intl. All learner responses have `Cache-Control: private, no-store`.

The service worker also sends `/api/` requests straight to the network. It must not cache one learner's profile or portfolio for another session. Offline lesson downloads need a separate reviewed public-content design; authenticated API responses are not an offline lesson store.

## Negative tests in Postman

| Try | Expected |
|---|---|
| Missing/expired/fake bearer token | 401 when Supabase is configured |
| Missing project configuration | 503, no pretend persisted data |
| Add `learner_id`, `cashPaise`, `cohortId` or `score` to a request body | 400 |
| FD lesson before passing savings | 403 `topic_locked` |
| Quiz before recording a non-quiz lesson | 409 `lesson_required` |
| Incomplete, duplicate or unknown quiz answers | 400 |
| FD investment before passing FD | 403 `instrument_locked` |
| Investment greater than remaining cash | 409 `insufficient_cash`, unchanged portfolio |
| Missing or malformed idempotency UUID | 400 |
| Two simultaneous requests spending more than available cash together | One succeeds; the other returns 409; cash stays nonnegative |
| Use learner B's token and request learner A's data | Only B's state is returned; no learner-selection parameter exists |
| Direct Supabase REST write to own cash or scores | Denied by grants/RLS |
| Unassigned facilitator requests a cohort | 403 `facilitator_forbidden` |
| Request unavailable translation or market symbol | Explicit 503 content error or 404 symbol error |

## Other endpoints

| Endpoint | Input and result |
|---|---|
| `GET /api/profile` | Verified learner's persisted profile and optional onboarding goal |
| `POST /api/goals/plan` | `{"targetPaise":9000000,"currentSavingsPaise":0,"months":24,"assumedAnnualRatePercent":0}` → monthlyPaise 375000, assumptions attached; hypothetical rate, not product advice |
| `GET /api/market/FD-1Y` | Dated FD snapshot, attribution, `isSnapshot: true` |
| `GET /api/market/120716` | AMFI daily NAV with one-day source-file cache and one-hour quote cache; on failure a clearly flagged committed snapshot |
| `POST /api/time-machine` | `{"symbol":"120716","from":"2020-02-01T00:00:00+05:30","to":"2020-04-30T23:59:59+05:30","initialPaise":100000,"panicSellAt":"2020-03-23T00:00:00+05:30"}` → replay on real observed NAV dates, holding vs frozen sell cash |
| `GET /api/facilitator/cohorts/<uuid>/progress` | Aggregate learner count and per-topic pass count/mean best score, only for assigned facilitators; the mean includes learners with a recorded topic, not the whole cohort |

The Time Machine's first dataset is **mutual-fund NAV history**, not NIFTY index levels. It does not invent weekends or interpolate prices. It reports the actual first/last observations selected; those may differ from the requested bounds. It is a lump-sum replay with fractional units, no fees/tax, and no post-sale interest. Separate NIFTY, stock, gold and CPI datasets remain roadmap work; unavailable symbols fail explicitly.

## Boundaries still requiring follow-up

The hosted project, shared-schema type comparison and real-session Postman checks cannot be completed without your account. English draft review, full lesson formats, hi/te content, portfolio UI, knowledge-tracing weakest-concept aggregates and the broader market-data pipeline remain owned roadmap work. No claims of production-scale readiness or hosted end-to-end verification are made. Unbounded portfolios/cohorts will eventually need pagination and aggregates maintained incrementally; these transactions currently lock only the affected learner.

## Grade-group reconciliation

Onboarding now requires `gradeGroup` (`grade-6-7`, `grade-8-10`, `grade-11-12`). Format preferences are optional; omission uses all supported formats for Mix it up. Legacy ageBand requests are rejected. Starting cash uses the nine grade/experience amounts from current config. For experience none: Grades 6?7 receive INR 2,000, Grades 8?10 INR 5,000, Grades 11?12 INR 10,000. Existing portfolios never reset.

The third migration preserves historical `age_band`, adds nullable `grade_group`, and replaces the onboarding/state functions. Legacy learners receive 409 `grade_group_required` until they explicitly select their grade through onboarding; no adult category is automatically mapped.

Regenerate local schema-derived types with:

```powershell
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome format --write apps/web/lib/data/database.types.ts
```

This command creates and removes an isolated temporary database and writes only the local type file. It does not access shared Supabase. Compare hosted type output in a temporary file after approved migration application.
