# R3 demo handoff

Team scope confirmed on 2026-10-11. Navigation persistence landed through PR #8; quiz and generic activity persistence landed through PR #22 in v0.2.10. R1 applied the shared migrations. Both authorized QA learners passed 31 hosted HTTP checks; phone/desktop browser acceptance remains pending. The local branch is rebased onto team main v0.2.12. See [recorded acceptance](hosted-acceptance-2026-10-11.md).

## Required demo

| Flow | Backend status / next handoff |
|---|---|
| Onboarding → lessons → quizzes → unlock → FD investment | Hosted HTTP acceptance passed for both QA learners, including prerequisite quizzes, answer evidence, FD retry/persistence and cross-learner isolation. Phone/desktop browser acceptance is pending. |
| March 2020 Practice episode: emergency fund, FD and index fund | Run navigation exists; authoritative simulation actions, emergency-fund accounting and index-fund transactions need R4 contracts and R3 persistence. Official NIFTY price-index snapshot is prepared locally for review; existing Practice content still identifies AMFI NAV data. |
| Storyline episode 1: OTP scam choices | Navigation only. Choice validation, consequences and completion need R4 engine contracts and reviewed content. |
| Take-home missions and households reached | Family/self-reported attestation contract confirmed. Local persistence/count implementation is ready; reviewed published mission definitions and shared migration remain pending. No household identities collected. |
| Read-only cohort view | Assigned-cohort aggregate API exists; hosted permissions and frontend acceptance pending. |

Defer Live mode, investments beyond FD and index fund, goals, facilitator features beyond read-only cohort viewing, gold and rate history. CPI is optional. Existing goal/replay APIs do not constitute the flagship Practice engine.

## Ownership and gates

1. R1 reviews PR #8 and runs the full CI suite by pushing the branch to the team repository, including phone and desktop e2e. Do not assume existing home/manifest browser tests cover the complete backend flow.
2. R1 reviews `supabase/schema-review.sql` results and approves/applies the missing learning_runs migration to the shared project. R3 does not apply it automatically.
3. Approved generic activity answers and run-only completion passed hosted HTTP acceptance. The authored doubling-scheme story is verified; this does not establish OTP storyline acceptance. Episode actions/results still await R4 simulation contracts.
4. R3 now owns NIFTY, gold and CPI. The official NIFTY price-index demo snapshot is implemented locally. Gold/CPI are follow-ups with source-access issues documented in activity-answer-persistence.md. Do not substitute MF NAV history for index levels.
5. R1/R5 confirm mission evidence and household-count semantics. R3 implements persistence after that decision; no invented counting rule.

## Hosted acceptance after merge and migration

Use two agreed disposable test sessions: Grades 8–10 and Grades 11–12, experience none, English. Starting balances from current config are respectively 500,000 and 1,000,000 integer paise. Existing learners must retain their balances.

Run the Postman collection against the merged app and hosted Supabase. Complete all four English prerequisite topics; validate server grading and FD unlock, invest 100,000 paise, retry the same request/key and confirm one deduction/holding. Test altered-body key reuse, insufficient cash, invalid fields, expired/missing identity, restart persistence and onboarding retry without cash reset. Switch A → B → A; prove no cross-profile reads or writes. Expected fresh cash after investment: 400,000 / 900,000 paise.

Repeat the integrated frontend flow on phone and desktop after PR #8 is merged and migrated, before the team's M2 deadline of 4 AM. R1/R2/R5 own UI/browser coverage; R3 supplies persistence and isolation assertions. Add flagship episode/story/mission acceptance when contracts and content are integrated. Synthetic SQL fixtures are local only and must not be run in the shared database.

## Verification evidence

- Local lint, typecheck, unit tests, production build and isolated PostgreSQL regression checks passed for the backend changes.
- Hosted acceptance: 31 recorded checks passed for the two authorized synthetic learners, including quiz/activity evidence, completion, FD persistence, concurrent requests, export denial and learner isolation. No other learner records or schema were changed.
- Full hosted SQL function-definition review and phone/desktop browser acceptance remain separate from HTTP acceptance; fault-injection rollback is tested locally only.
- Windows Application Control blocks local Chromium; keep it enabled and use team Ubuntu CI. No current CI pass is claimed.
- Existing hosted snapshots: attributed AMFI NAV history and dated SBI one-year FD rate. The official NIFTY price-index snapshot is prepared locally pending review/deployment; gold/CPI remain pending. See [snapshot review](nifty-snapshot-review.md).

Current answer evidence, mission semantics and hosted checklist: [quiz-answer-persistence.md](quiz-answer-persistence.md).

Current approved activity answer implementation and NIFTY/source status: [activity-answer-persistence.md](activity-answer-persistence.md).
