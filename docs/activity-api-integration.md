# Activity answer persistence

`POST /api/learning-runs/<run-id>/answers` requires a verified learner session, a UUID `idempotency-key`, and one strict body:

- Spot & sort: `{ "expectedRevision": 0, "itemId": "<authored-item-id>", "categoryId": "<authored-category-id>" }`.
- Story: `{ "expectedRevision": 0, "nodeId": "<current-node-id>", "choiceId": "<authored-choice-id>" }`.

Load the run definition with `loadLearningDefinition` and compare its hash to the pinned run hash. Changed content returns `409 content_changed`; no current definition substitutes for a missing pinned version. Identical saved retries return the prior result without grading or writing again. Spot & sort feedback concerns only the answered item. Stories preserve authored verdicts, consequences and cash deltas; story cash never changes portfolio cash.

The new versioned migration `20261011120000_activity_answers.sql` adds learner-readable evidence, private authoritative story navigation, completed run status and timestamps. Service-only writes atomically store evidence, advance revision/state, set completion and cache the result. Every accepted sort item counts toward completion, including incorrect answers; a story completes at an ending node. Completion never changes topic progress, mastery or unlocks. Episodes remain navigation-only until approved simulation contracts exist.

Local verification:

```powershell
pnpm.cmd verify
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome check --write apps/web/lib/data/database.types.ts
```

The runner creates a temporary local database, applies migrations and tests transaction rollback, retries, concurrent requests, completion, unchanged portfolio/topic progress, learner isolation and direct-write restrictions. It does not access shared Supabase. Regenerated types describe the local schema.

For hosted acceptance, R1 first reviews the new migration against the actual shared schema and applies it after approval; do not edit or reapply the existing learning-runs migration. Import the Postman collection's activity folder. Start legitimate runs after prerequisites, choose actual authored IDs and use the returned revision. Verify one evidence row and revision per accepted answer, identical retries, `409 revision_conflict`, `409 already_answered`, `422 invalid_choice`, completion persistence after reload, and unchanged cash/unlocks. Switch to learner B: A's run API returns 404 and filtered evidence returns an empty array. Direct client writes are denied. Repeat with learners from Grades 8–10 and 11–12 on phone and desktop after frontend integration.

Browser CI and hosted acceptance remain pending. The generic story handler does not supply authored OTP storyline content or implement Practice index-fund trading.
