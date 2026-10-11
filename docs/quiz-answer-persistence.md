# Quiz answer persistence and demo acceptance

**Current status (2026-10-11):** PR #22 landed in v0.2.10 and R1 applied the quiz/activity migrations. Both synthetic QA learners passed hosted HTTP acceptance for grading, answer metadata, retries, export denial and isolation. Missions remain local and await publication/deployment. See [recorded results](hosted-acceptance-2026-10-11.md). The proposal and verification notes below retain the earlier state; do not reapply already-applied migrations.

Base: team main v0.0.14 (`0a3902f`), which contains PR #8 as `4739c5f`. R1 reports the learning_runs migration is applied; a fresh read-only hosted schema check confirmed learning_runs and all three run RPCs are exposed (HTTP 200). This task does not deploy it again. The new quiz_answers migration is proposed local work, not applied to shared Supabase.

## New transactional evidence

`20261011100000_quiz_answers.sql` adds one row per graded question, with exactly event_id, learner_id, topic_id, concept_id, question_id, correct, answered_at, attempt_no and content_version. learner_id is the existing pseudonymous session UUID, not a name or contact. event_id is a distinct database-generated UUID for each answer and is the primary key. A unique learner/topic/attempt/question constraint additionally prevents duplicate question rows. Answers from the same submission share attempt_no, equal to topic_progress.quiz_attempts after its increment. The public Idempotency-Key instead identifies a request within learner + topic; it is not assumed globally unique across learners or topics.

The original seven-argument record_quiz function remains unchanged for existing server callers. A new eight-argument overload locks the same learner, reuses the existing transaction and records server-derived evidence in that transaction. Failed insertion rolls back progress, attempts and the retry command. Identical retries return the original result without new evidence. Retrying legacy commands never creates fabricated answer rows; old callers do not produce detailed evidence. All current web quiz submissions use the evidence overload.

Correctness comes from the pure engine's trusted quiz answer key. Concept IDs come from authored question mappings and are checked against topic metadata. content_version is lowercase SHA-256 hex of the exact UTF-8 locale content bytes. The same loader hashes and validates the definition used for grading, matching the R4 import contract. Public requests cannot supply correctness, identity, attempt number, time, concepts or version. No option text, selected option, answer key, personal information or financial fields are stored in the answer table/export.

Authenticated learners can SELECT their own answer rows through RLS. No client role can insert, update, delete or invoke either write overload. `quiz_answers_export` explicitly uses security_invoker and security_barrier; only service_role has SELECT on it and the source learning table. The export does not rely on owner-bypassed RLS. Service credentials remain server-only and must never be pasted into Postman. Local PostgreSQL tests query the actual view under anon/authenticated/service_role and inspect its settings/columns.

## Before shared application

R1 reviews the migration and read-only schema metadata, including both record_quiz signatures, view settings and grants. Apply this new migration only after approval; do not rerun the learning_runs deployment. Compare freshly introspected hosted types with local generated types. Neither SQL test file nor demo-seed fixture belongs in the shared project.

## Hosted acceptance: two agreed learners

Use the updated Postman collection and separate valid sessions A (Grades 8–10) and B (Grades 11–12), experience none, English. Set baseUrl to the app containing this change and public Supabase variables only. Keep A/B tokens and UUIDs separate. This procedure writes disposable learner records and must be run only with the team's authorization; it was prepared, not executed here.

1. Onboard A; expect 500,000 paise for a genuinely new learner. B starts with 1,000,000. Existing balances must be preserved.
2. Read and record the transcript, then submit quizzes in order: money-basics → saving-habit → bank-accounts-upi → fixed-deposit. Confirm later topics/investment are denied before prerequisites. Existing collection answers are authored English fixtures.
3. After each quiz, use the own quiz_answers REST request: count one row per question, a distinct event UUID per answer, authoritative concepts/correctness, current content fingerprint and one incremented attempt number. Repeat the exact request and UUID key: score, row count, event IDs and attempt number stay unchanged. A genuinely new attempt/key produces a new event. Change the body with the old key: 409.
4. Confirm FD unlock; invest 100,000 paise. Fresh remaining cash is 400,000 (A), 900,000 (B). Repeat same key/body: one holding and one deduction. Altered-body key reuse or insufficient cash must fail without changing holdings/cash.
5. Restart the app; read portfolio, progress and answer rows with the same refreshed identity. Retry onboarding: no cash reset.
6. Switch A → B → A. With B's token, filter answer/portfolio REST reads by A's UUID: empty arrays. Own-state API must show B only; A's run ID must return 404. Missing/invalid token: 401. Public quiz fields such as correct, score, learner_id or contentVersion: 400.
7. Own answer PATCH/INSERT/DELETE must fail. The export must return permission denial for both learners and anonymous callers. Verify the permission-denial response, not just an empty result. Service-only export inspection is a separate approved server/dashboard action, never a Postman secret.
8. Run integrated phone and desktop acceptance after merge/migrations. Record exact commit, app URL, test identities as pseudonymous labels, expected/actual results and CI report. Do not include tokens or keys in reports.

## Precise demo blockers

- Practice: Episode schemas and March 2020 content exist, but engine exports contain no action/state transition or authoritative result/completion contract. Need R4's initial state, allowed actions, clock/event ordering, emergency fund/FD/index accounting, rounding, replay determinism, revision and completion/evidence outputs. Episode-local index simulation is required; a general portfolio index trading API and Live mode remain deferred.
- Story: the approved generic transition/evidence contract is now implemented locally (see activity-answer-persistence.md). The existing doubling-scheme example is not the agreed storyline episode 1 OTP scenario. Need reviewed episode 1 content IDs/version and the broader cross-episode state-carryover contract. Do not persist client-claimed outcomes.
- Missions: the team confirmed learner Done plus same-device family attestation, with confirmation family or self_reported. Only family contributes to householdsReached, once per learner overall. missionsCompleted counts once per learner per mission. Repeats add nothing: first confirmation wins, including a self_reported submission later repeated as family. Local migration/API implement this contract without changing mastery or unlocks. Published mission definitions are still absent, so unknown missions return mission_content_unavailable (503) before writing. R1/R5 must publish reviewed id/locale/title/instructions files under packages/content/missions/<id>/<locale>.json. No parent account or household identity is collected; the read-only cohort response supplies reachDefinition for the UI label "one per learner, family-confirmed, may include siblings". This is reported participation, not independent proof of unique households.
- Datasets: local snapshots now include official NIFTY 50 price-index closes in addition to AMFI NAV and dated SBI FD. R3 owns NIFTY, gold and CPI; gold/CPI remain follow-ups. March content currently references AMFI NAV, not NIFTY index levels; agree the correct sourced series/label with R4/R5 instead of silently substituting it. Historical episode deposit rates are explicitly assumptions, not the present one-year FD reference.

## Local commands

```powershell
pnpm.cmd install --frozen-lockfile
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome format --write apps/web/lib/data/database.types.ts
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

If sandbox cache permissions prevent pnpm/SWC execution, run these in the normal Windows user terminal. Do not bypass Execution Policy or Application Control. Browser verification uses the team's Ubuntu CI; no current hosted/browser pass is asserted by local tests.

## Verification recorded for this change

Local frozen-lockfile install, lint, strict typecheck, all 282 unit tests, production build and isolated PostgreSQL migration/transaction tests passed. Lint retains the existing onboarding cookie warning and Biome deprecation notice. Normal Windows user execution resolved sandbox cache access errors; no policy was changed. Hosted metadata now confirms learning_runs and its RPCs. quiz_answers, quiz_answers_export and mission_completions are not exposed, as expected for these unapplied proposals. Hosted learner acceptance was not run and browser results were not independently verified. No shared write, commit or push occurred.

The subsequent approved activity contracts, corrected per-answer event IDs, R3 market ownership and NIFTY snapshot supersede earlier pending-contract/dataset notes: see [activity-answer-persistence.md](activity-answer-persistence.md).
