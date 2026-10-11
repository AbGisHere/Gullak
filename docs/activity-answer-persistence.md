# Approved activity answers and snapshot handoff

**Current status (2026-10-11):** PR #22 landed in v0.2.10; R1 applied quiz/activity migrations. Both synthetic QA learners passed hosted HTTP acceptance, including activity completion, retries, concurrency and isolation. NIFTY is committed locally, pending push/review/deployment. Missions and Practice outcomes remain separate pending work. See [recorded results](hosted-acceptance-2026-10-11.md). The implementation notes below describe the earlier local proposal; their pending-hosted statements are historical, not instructions to reapply migrations.

The response contracts supplied by R1/R4 in chat are now in packages/types/src/learning-run.ts. This work preserves the existing local quiz/mission changes. Team main was inspected through v0.0.15; local implementation base remains v0.0.14. No applied migration was edited and no hosted migration was executed.

## Requests and pinned content

POST /api/learning-runs/[runId]/answers requires a verified learner session and a UUID Idempotency-Key. Spot & sort accepts exactly {expectedRevision,itemId,categoryId}; story accepts exactly {expectedRevision,nodeId,choiceId}. IDs use Slug and revisions use the existing nonnegative safe integer rule. Client correctness, scores, cash, completion and mastery are rejected.

Load content with loadLearningDefinition(run.kind,run.contentId,run.locale). Compare its hash with run.contentHash before grading; a mismatch returns 409 content_changed. No historical content store or substitution is introduced. A recorded identical retry returns its previous result, including after content changes, without regrading. A new submission cannot grade changed content.

SpotSortAnswerResult returns run, result {itemId,correct,correctCategoryId,explanation}, progress {answered,total} and completed. Feedback is only for the submitted item. Every distinct accepted item counts toward completion, including incorrect answers. StoryAnswerResult returns run, result {nodeId,choiceId,verdict,consequence,cashDeltaPaise,nextNodeId}, ending and completed. Verdict and cash delta remain exactly authored; reaching a node with no choices completes the run. Story cash is feedback only and never updates the portfolio.

## Local migration proposal

20261011120000_activity_answers.sql adds a separate activity_answers table with the agreed learning fields, unique(run_id,item_or_node_id), learner-only SELECT RLS and no direct client writes. A service-only RPC atomically saves evidence, authoritative story position, completion, completed_at, revision and the idempotent result. Its authenticated state-reader checks ownership before exposing answered IDs or cached feedback. Navigation bookmarks do not determine legal story position.

The new migration widens learning_runs status and adds private activity_state plus completed_at. It replaces the own-run reader to include completedAt. Existing applied learning_runs migration remains untouched. Completion never updates topic_progress or unlocks; episode answer/completion remains unsupported pending the simulation contract.

Errors: changed hash 409 content_changed; stale revision 409 revision_conflict; repeated item/node with a new key 409 already_answered; illegal/missing story choice or item/category 422 invalid_choice; foreign run 404 learning_run_not_found. Same-key different request/run returns 409 idempotency_conflict.

Quiz evidence now follows the corrected contract: each answer has a distinct event_id UUID primary key. Submission identity remains the existing learner/topic idempotency command. All rows in a submission share the incremented topic_progress.quiz_attempts as attempt_no. A unique learner/topic/attempt/question constraint additionally protects against duplicate question rows. Old unapplied quiz migration was corrected locally; no hosted schema was rewritten.

## Hosted acceptance after R1 confirms migrations

Apply no migrations concurrently. R1 first confirms learning_runs; review the three proposed new migrations (quiz answers, missions, activity answers) before approved shared application. Compare hosted generated types and schema-review metadata. Use the existing two agreed English learners, Grades 8–10 and 11–12.

1. Complete the FD prerequisite quizzes and virtual investment/retry/persistence/isolation sequence in quiz-answer-persistence.md.
2. Complete legitimate activity prerequisites. Start a run and save its ID/hash; current sample activity prerequisite topics may still lack published English content. Do not forge hosted progress or run local SQL fixtures there.
3. Submit one valid sort answer; verify revision increases once, feedback concerns only that item, and one evidence row is visible to its learner. Repeat exact key/body: identical saved response, no new evidence/revision. New key for that item at current revision: already_answered. Another item with stale revision: revision_conflict.
4. Answer all items once, including a wrong answer: completed=true, status=completed and completedAt populated, no new topic unlock. Restart the app and confirm persisted completion.
5. Start a story; answer only its current node. Reject jumping to another node and a choice not on that node. Follow authored nextNodeId until an ending. Verify verdict/consequence/cashDeltaPaise, and verify portfolio cash is unchanged before/after and on retry.
6. Switch to the other learner: run reads/answers return 404; filtered activity/quiz evidence REST reads return empty arrays; direct writes and learner export access are denied. Return to the original learner and confirm state persists.
7. Test concurrent same-key submissions and competing requests using the same expected revision. Same-key submissions share one result/row; competing fresh requests accept one and reject the stale one. Local SQL tests already exercise these races.
8. Verify content_changed safely in a local/test environment with a changed definition; do not edit shared published content just to trigger it. Test phone and desktop after frontend integration. Do not claim hosted/browser acceptance from local tests.

## Market data

R3 now owns NIFTY, gold and CPI. NIFTY is available: data/snapshots/nse-indices-nifty-50.json contains 184 official NSE Indices closing price-index observations from 2019-10-01 through 2020-06-30. Reproduce with node scripts/snapshots/nifty-50.mjs. Catalog integration uses the existing snapshot adapter and GET /api/market/NIFTY-50; isSnapshot=true, asOf=2020-06-30, kind=index-level, seriesType=price-index. Source URL, retrieval time and attribution are preserved. UTC midnight is a source-date marker, not a trade timestamp. Missing/non-trading dates are not interpolated.

This is neither NIFTY total-return data nor a real index fund's NAV. Practice may simulate an index proxy only with explicit assumptions about dividends, tracking error, fees and tax. Existing March content still references AMFI NAV; coordinate its reviewed instrument/source mapping with R4/R5 rather than silently replacing content. General index-fund portfolio trading and Live mode remain deferred.

Gold and CPI are follow-up datasets, not claimed complete. Gold needs an attributed series with purity, rupees per gram/10 grams and frequency explicit; RBI monthly prices cannot be passed off as daily trading quotes. CPI needs the official all-India Combined general monthly series (base 2012=100 for the 2019–2020 episode), with missing/provisional observations labelled; never mix base years or interpolate missing lockdown observations.

## Remaining content/engine blockers

The approved generic answer contract is implemented; published storyline episode 1 OTP nodes/choices remain absent. Existing doubling-scheme content is not that episode. Practice state/actions, emergency-fund accounting, FD early exits, index holdings and episode completion still await the simulation engine contract. Missions have agreed persistence/count semantics but still need published mission definitions. BKT/mastery updates remain R4-owned.

## Source-access blockers for follow-up datasets

The official NIFTY endpoint returned the complete requested range successfully. RBI's historical gold table endpoint at https://systemhealth.rbi.org.in/Scripts/PublicationsView.aspx_id%3D22640.html timed out during retrieval; its general publication page was reachable but supplied no usable monthly series. Required gold data: observed Mumbai monthly average gold prices for October 2019?June 2020, with the source's purity and rupees-per-10g/gram unit verified and preserved. CPI portal https://www.cpi.mospi.gov.in/ failed with a network connection error and timed out on a repeated probe. Required CPI data: all-India Combined General monthly CPI, base 2012=100, October 2019?June 2020, with publication/revision status and unavailable observations preserved. An official downloaded CSV/XLS/press table would unblock validation/import; no synthetic values or alternate base years were used.

## Validation

Lint, strict typecheck, all 292 unit tests and production build passed. Isolated PostgreSQL tests passed for grading gates, distinct per-answer quiz event IDs, atomic rollback, revisions, retries, concurrent quiz/activity requests, completion, unchanged portfolio/topic progress and cross-learner permissions. Existing onboarding-cookie and Biome deprecation notices remain. Local browser launch is still policy-blocked; no current CI or hosted acceptance pass is claimed. The contract-only commit is pushed in PR #11. Remaining persistence and dataset implementation is local; no shared database writes were made.
