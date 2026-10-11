Current status: PR #22 landed in v0.2.10 and R1 applied quiz/activity migrations after learning_runs. Both authorized synthetic learners passed [hosted HTTP acceptance](hosted-acceptance-2026-10-11.md). Mission deployment and browser acceptance remain pending. The older review below is historical context; never reapply migrations based on its earlier status.

# R3 backend review

Current status: backend commit `ea529c0` is pushed in PR #8 against main v0.0.12. No shared database changes have been applied by this agent. The sections below preserve earlier review context; use [the current demo handoff](backend-demo-handoff.md) for agreed scope and current gates.

## Shared Supabase: inspect first

Ask R1 for the existing project name/reference and access through your own Supabase account. Confirm the project in the dashboard before opening SQL Editor. Do not create a second project or send secret keys in chat.

Run [`supabase/schema-review.sql`](../supabase/schema-review.sql) in SQL Editor. It is a read-only transaction returning columns, constraints, RLS, grants and relevant function definitions. It reads no learner records. If its first result reports an existing migration-history table, also run the commented migration-history query separately. Share the metadata output for review, excluding any unexpected sensitive information in custom function definitions. Local server configuration now supports read-only hosted checks. Connectivity and exposed core schema passed; full metadata and migration-history review remain pending.

Compare the results with these local migrations:

| File | Proposed effect |
|---|---|
| `20261010130000_init.sql` | Original teammate schema: learners, progress, portfolios and holdings, ownership constraints and RLS. Apply only if none of those objects already exist. |
| `20261010150000_grade_group_onboarding.sql` | Preserve historical age bands and balances, add explicit grade selection, replace onboarding/state RPCs. |
| `20261010140000_backend_transactions.sql` | Add lesson timestamps, double-precision scores, safe integer cash limits, command retry records and cohort membership tables. Replace direct learner write policies with read-only ownership policies. Add five server-only transactional/aggregate functions and an authenticated own-state reader. |

Review consequences: existing direct writes through legacy repositories will fail after the follow-up; frontend code must use the backend API. A new cash constraint can reject pre-existing invalid balances. Unexpected tables, policies or function signatures require a new reconciliation migration, not overwriting or rerunning applied migrations. SQL Editor applications may be absent from CLI migration history; confirm actual schema as well as history. Do not run `supabase/tests/core.sql` on the shared database.

**Decision gate:** after inspecting metadata, present the exact files/SQL and affected objects to R1 and obtain approval before applying them. If the schema matches the initial migration, propose only the missing follow-ups. If it matches all three, propose no schema write. If empty, propose all three in order. Do not use `db push`, migration-history repair, or destructive reset before this review.

After approved application: verify grants/RLS again, enable the agreed Auth sign-in method, generate database types into a temporary file and review its diff before replacing the local schema-generated types. Configure keys only in local `.env.local`; restart Next.js. Shared facilitator/cohort assignments also require explicit administrator approval.

## Verification and failure alternatives

| Check | Current evidence / next action |
|---|---|
| Lint, TypeScript, 100 unit tests, production build | Rerun and passed on the v0.0.7 review base, 2026-10-10. Frozen-lockfile installation also passed; lint has one existing deprecation notice. |
| Real PostgreSQL transaction tests | Passed locally: ownership, permissions, rollback, score threshold, retries and simultaneous cash deductions. Uses an isolated temporary cluster, not Supabase. |
| Local browser tests | Two manifest HTTP checks passed; two browser checks were blocked by Windows Application Control. Keep that policy enabled. |
| GitHub Actions browser verification | Existing `ci.yml` runs on Ubuntu, installs Chromium with dependencies, builds, then runs phone and desktop projects; uploads HTML reports on failure. Suitable after separately approved commit and push. Enable Actions in your fork if required; check the run for the exact pushed commit. |
| Hosted Supabase and full core-loop browser tests | Not verified. Existing Playwright tests only exercise the home page and manifest; they do not use hosted credentials or cover investment. Use the hosted Postman sequence below; coordinate full UI E2E with R1/R2/R5. |

If Windows blocks Chromium, use the existing Ubuntu CI runner after approval, or ask the device administrator to permit the official Playwright browser. Do not disable Application Control or execution policies. If CI fails, download `playwright-report`, inspect the failing assertion/trace and fix the underlying issue; never skip the test to obtain green.

If the local database test cannot find PostgreSQL, pass your actual installation's `bin` directory: `node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin"`. An approved normal Windows user context was needed for temporary-cluster startup in the agent sandbox. Do not point the tests at the team's database.

Hosted errors: 503 configuration errors mean check the three local Supabase variables and restart the app; missing RPCs mean compare approved migration state; 401 means obtain a valid unexpired token from the same project; anonymous signup errors mean confirm Auth settings/CAPTCHA requirements with R1. A 403 unlock error or 409 lesson prerequisite error means complete the learning sequence. Cash/idempotency errors should be investigated with portfolio reads, never fixed by bypassing constraints.

## Hosted Postman acceptance sequence

Use the importable [`gullak-backend.postman.json`](gullak-backend.postman.json) and exact request bodies in [`backend-setup.md`](backend-setup.md). Set `supabaseUrl` to the shared project and `baseUrl` to your local Next.js app configured against that project. The currently deployed team app may not contain this uncommitted backend. Only the public publishable key and learner access token go into Postman, never the server secret.

1. Create session A through the project's Auth API; save the token as `accessTokenA` and copy it to `accessToken`.
2. Onboard A, read profile/portfolio, record starting cash. The current example uses `grade-8-10` / `none`, giving 500,000 paise. Grade-group onboarding is implemented locally; shared schema verification remains pending.
3. Read savings lesson, record its `read` variant, submit the server-graded `check` quiz with a fresh UUID key.
4. Read FD lesson, record `read`, submit its quiz with another key. Read progress and confirm the FD instrument is unlocked.
5. Invest 100,000 paise for 12 months with a fresh UUID. Save the returned holding ID. Portfolio should show one holding and 400,000 paise cash for this fresh example learner.
6. Repeat the investment with the same key/body: same holding, same balance. Change the amount with that key: 409 conflict. Try a new-key amount exceeding cash: 409 insufficient cash, unchanged state.
7. Restart Next.js and read portfolio using the same valid token: balance and holding persist. Retry onboarding and confirm cash is not reset.
8. Create session B, save `accessTokenB`; retain A's token separately. Onboard B, switch collection `accessToken` to B, and confirm B has its own starting balance and no A holding. Switch back to A and verify A's portfolio is unchanged.
9. With B's token, call `GET {{supabaseUrl}}/rest/v1/portfolios?select=*&learner_id=eq.<A-user-UUID>` with the public `apikey` header: expect 200 with an empty array. Own-state API endpoints must continue to return only B. Spoofed `learner_id`/`cashPaise`/`score` in strict request bodies must return 400.
10. Try a direct REST PATCH of B's cash with B's bearer token and public key: expect permission denial, then verify unchanged balance. Missing/fake token should give 401; B's investment before passing FD should give 403. Unassigned facilitator access should give 403.

Use disposable test learners agreed with R1. Do not reset or delete other teammates' records. Tokens can expire; refreshing preserves the identity, creating a new anonymous session does not.

## Grade-group and type status

The new `20261010150000_grade_group_onboarding.sql` preserves historical age bands and balances, adds explicit grade selection and replaces two RPC definitions. No automatic backfill is performed. Review this migration alongside the earlier files before any shared write. Types now come from local database introspection via `--generate-types`; shared-project verification is still required.

## Remaining gaps

### Expanded v0.0.7 scope

The current FD core remains a foundation, not an implementation of the expanded simulation plan. The team plan now specifies a combined life + market engine with Practice episodes and Live paper trading, optional format preferences, evidence-driven mastery, and Live instrument access after Practice completion. Current quiz-only gates and historical replay do not implement those new requirements. Coordinate evidence contracts/mastery with R4 and episode/content contracts with R1/R5 before extending database migrations.

Additional persistence needs to design: mode and simulation clock, episode runs/completion, budgets and life events, learner decisions and mastery evidence, market-unit trades, early FD/RD exits, and facilitator activity assignments. Preserve virtual cash transaction and identity protections across both modes; do not simply label the existing FD endpoint as Live.

The expanded snapshot plan in `data/snapshots/README.md` prioritises category-spanning MF NAVs; NIFTY 50 and TRI including 2008/2016/2020; headline/group CPI; gold; savings/FD/RD rates; small-savings rates/history; and HCES spending. P2 adds other indices/stocks, Treasury/G-sec yields, repo history, loan/card rates, UPI statistics and NPS NAVs. Only the existing AMFI example and this branch's dated FD snapshot are currently committed. Some economic datasets need typed units and schemas beyond the current price/rate contracts. Source-backed event costs and probabilities still need a defensible data derivation; the expanded plan does not supply numerical event odds.

- Shared project inventory, approved migration application, shared-schema comparison of locally generated types and hosted acceptance evidence.
- Grade-group onboarding is reconciled locally. Product owners still need to define grade-specific capital overrides, broader curriculum content and mastery policies.
- English content review, hi/te translations, other formats and topics, frontend integration and full core-loop browser tests.
- Only FD investment/valuation is implemented. RD, market-instrument trades, disposal/maturity lifecycle and broader valuation need separate reviewed stages.
- Existing real AMFI `120716` NAV history and the dated FD `FD-1Y` rate snapshot are available. NIFTY index levels, stocks, gold and CPI snapshots/pipelines are missing. NAV history must not be described as index history. FD snapshot is attributed and dated, never live; unavailable symbols fail explicitly.
- Goal planning is hypothetical; no separate persisted goal-management API. Replay is observed-date lump-sum NAV history, not a general timeline valuation engine.
- Facilitator aggregates cover assigned-cohort counts/pass rates/best scores; weakest-concept analytics await adaptive-engine outputs.
- AA synthetic adapters/summary nudges, hosted sandbox integration, production pagination/rate limiting and broader operational hardening remain roadmap work.

See the setup guide's stage table for changed-file ownership and the endpoint list. No release versions are bumped on this feature branch.

Latest v0.0.10 inventory, run contracts and validation: see [backend-v0010-inventory.md](backend-v0010-inventory.md). This supersedes older age-band/capital and feature-branch status notes above.
