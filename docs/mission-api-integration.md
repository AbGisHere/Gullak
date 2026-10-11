# Mission persistence

`POST /api/missions/complete` uses the verified learner session, a UUID `idempotency-key`, and only `{ "missionId": "<published-id>", "confirmation": "family" }` (or `self_reported`). The learner marks the task done and a family member taps “We did this together” on the same device. Confirmation is an attestation, not verified parent identity. No names, contacts or household identifiers are collected.

The server loads validated content from `packages/content/missions/<id>/<locale>.json` before recording completion. Reviewed definitions are not yet published; requests currently return `503 mission_content_unavailable`. R1/R5 must provide `id`, `locale`, `title` and `instructions`; no synthetic test mission is published by this change.

One learner/mission counts once. The first confirmation is retained; subsequent submissions do not upgrade self-reported confirmation. Only family confirmation contributes to reach, once per learner overall. Cohort aggregates exclude outsiders and use the label “one per learner, family-confirmed, may include siblings”. Missions never change mastery, topic progress or instrument unlocks.

`20261011110000_mission_completions.sql` is a new migration, not an edit to an applied migration. Learners can read only their own completion rows and cannot write directly. Only the service-role RPC writes completion, computes counts and stores the retry result atomically. Assigned facilitators retain their restricted read-only cohort view.

Local commands:

```powershell
pnpm.cmd verify
node scripts/test-database.mjs "C:\Program Files\PostgreSQL\18\bin" --generate-types
pnpm.cmd exec biome check --write apps/web/lib/data/database.types.ts
```

These database tests use a temporary local cluster and include duplicate submissions, conflicting keys, concurrent requests, injected rollback, learner isolation and cohort scope. They never access production.

After the demo, R1 reviews and applies only unapplied migrations in timestamp order. In Postman, set the reviewed mission ID, token and UUID key. Submit self-reported confirmation: mission count increases once, reach remains zero for a learner with no previous family mission. Repeat the request: unchanged response. A family-confirmed different mission increases reach to one; more family missions retain reach one. Reusing a key with another body returns 409. Learner B cannot read or edit A's rows. Cohort reach is deduplicated by learner only, and no household uniqueness claim is made. Hosted acceptance and phone/desktop family-tap integration remain pending.
