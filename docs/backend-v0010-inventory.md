# Backend inventory against main v0.0.10

Base: `3edbe1b`. This inventory separates executable backend behaviour from content/model definitions.

| Feature | Initial status | Evidence / gap |
|---|---|---|
| Verified onboarding and grade-specific cash | Implemented locally | Three migrations; `onboard_learner` preserves existing profile/cash; server loads config |
| Topic prerequisites and grade eligibility | Implemented locally | `requireTopicOpen`, quiz RPC prerequisite checks; tighten grade scope of instrument/progress output |
| Quiz grading and lesson visits | Implemented locally | Answer keys stay server-side; `record_lesson`, `record_quiz`; UUID retries |
| Persistent FD portfolio | Partially implemented | `invest_fd`, `learner_state`, pure valuation; FD only, no early exit or market trades |
| Shared-device ownership | Partially implemented | Verified bearer/cookie sessions, RLS and network-only API cache; profile-switch UX/session recovery is frontend product work |
| Activity and episode definitions | Schema-only | `Activity`, `SpotSortActivity`, `StoryActivity`, `Episode`, `LifeEvent`; JSON examples, no progress/run schema or RPC |
| Goal / historical replay | Partially implemented | Stateless goal projection, observed NAV replay; no simulation run/completion or counterfactual engine |
| Facilitator | Partially implemented | Assigned-cohort aggregates; activity assignments and household reach absent |
| Market sources | Partially implemented | AMFI live adapter + NAV snapshot, dated FD snapshot; broad P1/P2 sources missing |
| Nani's Gullak, class market, missions, mastery | Schema-only / plan-only | No persistent storyline/class market/mission or mastery API; do not invent rules |

Existing tables: learners, topic_progress, portfolios, holdings, backend_commands, cohorts, cohort_learners, cohort_facilitators. Existing RPCs: onboard_learner, record_lesson, record_quiz, invest_fd, facilitator_progress, learner_state. Migrations: initial schema, backend transactions, grade-group onboarding. Existing API routes: onboarding, profile, progress, lessons read/progress/quiz, portfolio read/FD, goals/plan, market/[symbol], time-machine, facilitator/cohorts/[cohortId]/progress.

## Branch history

The original 12-commit difference at v0.0.10 consisted of integrated team changes, not new R3 work. The backend changes were subsequently committed as `ea529c0` on the v0.0.12 base and pushed for [PR #8](https://github.com/AbGisHere/Claude2Create_MegathonX/pull/8). This document retains the initial feature inventory for comparison. See [the current demo handoff](backend-demo-handoff.md) for agreed scope and verification gates.

## Decisions needed

- R4/R1: authoritative completion/mastery events and Practice-to-Live unlock policy. Run bookmarks will not grant either.
- R4/R2: simulation actions, clock advancement, money lifecycle and valid checkpoint semantics. Until then save navigation position only; never accept balances or outcomes.
- R1: shared-device switch/sign-out/recovery flow. Separate verified sessions remain the only proof of identity.
- R5: grades/locales and prerequisites of each activity/episode, plus reviewed content versions.
- R1/R4: classroom market, assignment and mission rules. No new rules implemented here.

## Verification boundaries

Historical v0.0.10 inventory only: current quiz/activity migrations are applied and both authorized QA learners passed hosted HTTP acceptance. See [the acceptance report](hosted-acceptance-2026-10-11.md). Earlier missing-schema and pending-acceptance notes below are preserved for comparison and must not trigger repeated deployment.

Read-only hosted checks passed for Auth health and exposed core schema; grade_group is present, anonymous portfolio access is denied and anonymous sign-in is enabled. The learning_runs table and its three RPCs were absent from the exposed schema. Migration history, full policies/function definitions, hosted persistence, two-learner isolation and generated-type comparison remain unverified. New migrations must be reviewed before any shared write. Browser launch is blocked locally by Windows Application Control; existing Ubuntu CI can verify browser tests after approved push, but its current tests do not cover all backend flows. Snapshot inventory remains the existing real AMFI series plus dated FD reference; broader economic/market snapshots are pending.

## Changes completed locally in this task

Prerequisite enforcement now includes transitive ancestors, grade filtering on instrument output, and explicit FD grade/completion checks. All nine onboarding combinations are tested against config; retry/seed tests preserve cash. Shared-device tests switch verified bearer identities A → B → A and database tests deny B access to A's run.

Activities/episodes are now **partially implemented**: a fourth versioned migration adds RLS-protected `learning_runs`, read/start/bookmark RPCs, strict Zod contracts and five thin routes. Existing graph unlocks govern access; related `topicIds` are not invented extra requirements. Content hashes bind runs to their source definition. Bookmarks store only an existing item/node or an in-range date, not choices, answers, balances, scores or completion. Start retries return the original run; bookmark retries do not increase revision twice. Stale revisions and changed definitions produce 409. Grading and completion for activities follow [activity-answers.md](activity-answers.md); simulation actions and mastery remain schema/engine work for R4.

### Postman requests

| Request | Body / expected result |
|---|---|
| POST `/api/activities/needs-or-wants/runs` | `{}` + UUID Idempotency-Key; requires graph unlock, returns run ID, revision 0, in-progress |
| POST `/api/episodes/march-2020-hospital-bill/runs` | `{}` + fresh key; same isolation, grade and graph checks |
| GET `/api/learning-runs` | Latest 50 owned runs, explicit limit; no learner-selector parameter |
| GET `/api/learning-runs/<run-id>` | Persisted owned run; another profile's ID returns 404 |
| POST `/api/learning-runs/<run-id>/bookmark` | `{"expectedRevision":0,"bookmark":{"kind":"item","itemId":"rice-and-dal"}}` + fresh UUID key |

Story bookmarks use `{"kind":"node","nodeId":"<existing-node>"}`; episode bookmarks use `{"kind":"date","on":"2020-03-01"}`. Repeat the exact request/key and confirm revision stays 1. Change the body with that key: 409. New key plus stale expected revision: 409. Client `score`, `passed`, `status` or balance fields: 400. Invalid item/date: 400. Restart the app and read the same run using the same session. With B's token, reading A's run must return 404 and posting a bookmark must return 404. All responses use the existing private/no-store wrapper and API network-only service-worker rule.

The needs-vs-wants and several episode prerequisite lessons have no published draft yet. Do not forge progress to bypass their gates in hosted Supabase. Use local synthetic fixtures for contract testing; genuine hosted demos wait for content/engine handoff.

### Repeatable local demo data and checks

`scripts/demo-seed.mjs` derives cash and topic IDs from current config and creates two explicitly synthetic learners in the isolated test database. Their pre-completed topics are fixtures, not claimed learning evidence. The test runner seeds twice, tests run persistence/isolation, changes cash and seeds again to prove no reset. It creates no fabricated market series or shared Auth records. The temporary cluster is deleted after testing, so these fixtures are for repeatable backend contract demos/tests, not credentials for the running Next app.

```powershell
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome format --write apps/web/lib/data/database.types.ts
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

Expected: all local checks pass; schema types regenerate with learning_runs and three new RPCs. Never execute either SQL test fixture in the shared project. Inspect `supabase/schema-review.sql` and present the new migration for approval before any shared write. A realistic hosted demo seeder must use agreed real test Auth sessions and the public API; it is not run automatically here.

Local verification on 2026-10-11: 156 unit tests, strict typecheck, production build and isolated PostgreSQL migration/persistence tests passed. Lint passes with the existing onboarding cookie warning and Biome deprecation notice. Postman payloads have a schema-compatibility regression test. Hosted Supabase: connectivity and basic access denial verified separately; full acceptance pending. Browser: Windows policy still blocks local Chromium; no bypass or new CI result claimed. Market data: no new snapshots were generated in this task.
