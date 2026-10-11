# Hosted backend acceptance · 2026-10-11

Target: `https://gullak.abgupta.me`, reported by R1 as deployed v0.2.10 after PR #22. R1 reports applying `20261011100000_quiz_answers.sql`, then `20261011120000_activity_answers.sql`. This verification applies no migrations and changes only the two explicitly authorized synthetic learners.

The machine-readable [results](hosted-acceptance-2026-10-11.json) record the actual assertions and UTC verification time. These are authenticated HTTP/database acceptance tests, not phone/desktop browser tests.

**Result: all 31 recorded checks passed for both synthetic learners.** Grade 8–10 starts with 500,000 paise and Grade 11–12 with 1,000,000 paise; each holds one persisted 100,000-paise virtual FD after the prerequisite chain. Quiz/activity retries do not duplicate evidence, concurrent activity retries return the same result, and competing same-revision requests produce one success and one conflict. Authenticated and anonymous roles cannot query the quiz export. Repository lint and whitespace checks pass; lint retains eight existing UI warnings and one configuration deprecation notice.

## Repeatable verification

From the repository root, with the existing local public Supabase configuration:

```powershell
node scripts/hosted-acceptance.mjs
node scripts/hosted-activity-race.mjs
```

Run the second command only after the first passes. It creates an additional synthetic activity run per learner to test concurrent commands. The first command reuses the saved identities and original submission keys; it does not create a new learner or a second FD on retry. The deployed content must match the locally authored questions and exact activity hashes; a mismatch stops acceptance.

Each learner completes the English FD prerequisite chain and the prerequisites for `needs-or-wants` and `the-doubling-scheme`. The tests inspect permitted learner-only evidence reads, authoritative answer metadata, attempt counts, retries, persistent portfolio balances, completed runs and isolation. Concurrent activity tests check wrong-answer grading, missing revisions at the public boundary, invalid choices, stale revisions, same-key retries and competing commands at the same revision.

## Deliberate exclusions

- Phone/desktop UI acceptance remains separate; no blocked browser executable or Windows Application Control policy is bypassed.
- No hosted failure-injection trigger is installed. Transaction rollback under injected failures remains a local database test.
- Mission migration/definitions are not deployed by this task. Missions and households-reached remain pending their own review and deployment.
- Practice simulation outcome contracts remain pending. The doubling-scheme story is the existing authored story; this test does not claim an OTP storyline acceptance pass.
- The official NIFTY snapshot is local pending review; this task does not deploy it. Gold/CPI remain pending. No live history or general index trading is claimed.

## QA retention and cleanup after the demo

Private sessions, learner IDs, idempotency keys and extra run IDs are retained in Git-ignored `apps/web/.env.qa-acceptance.json`. Never share or commit that file. The public report includes only synthetic IDs and grade groups, without tokens or keys.

Keep both learners for the demo. After the demo is confirmed complete, delete only the two manifested Auth users, verifying their IDs and `qaLabel` metadata first. Existing schema foreign keys cascade their learner profiles, portfolio, holdings, commands, learning runs and answer evidence. Verify their filtered rows are gone, then remove the private local session file. Do not delete unrelated learners or apply schema changes as cleanup.

## Post-demo follow-up: missing revision at the RPC boundary

`record_activity_answer` currently compares the stored revision with `(p_request->>'expectedRevision')::integer`. Missing/null input produces SQL NULL, so the comparison does not raise a conflict. The public route's strict Zod schema rejects omitted revisions, and only `service_role` can execute this write RPC, but the database boundary still needs its own guard.

Add a **new migration** after the demo; do not edit the applied migration. Reject missing/null, non-integer, negative and out-of-range revisions before writing evidence, run state or command records. Preserve cached same-key retry semantics and caller compatibility. Add direct-RPC tests proving invalid requests leave evidence, revision, completion and backend commands unchanged; repeat the existing rollback, concurrent request and isolation tests locally before proposing hosted application.
