# Activity answers contract

Agreed contract for grading spot & sort and story-choice answers inside a learning run. Owner: R3 (implementation), R4 (consumes the evidence). It extends the existing learning runs (`packages/types/src/learning-run.ts`, `apps/web/lib/backend/learning.ts`, `supabase/migrations/20261011090000_learning_runs.sql`); read [backend-v0010-inventory.md](backend-v0010-inventory.md) first.

## Pinned content

There is no hash-addressed content store; runs pin content the same way bookmarks already do:

1. Load the definition with `loadLearningDefinition(run.kind, run.contentId, run.locale)`.
2. If its sha256 differs from `run.contentHash`, respond **409 `content_changed`**.
3. Otherwise grade only against that definition. The client never sends correctness, scores, verdicts or balances.

## Request

`POST /api/learning-runs/<run-id>/answers` with a fresh UUID `idempotency-key` header (`lib/backend/http.ts`). Bodies are strict; IDs are `Slug`s; `expectedRevision` follows the bookmark rule (stale → 409 `revision_conflict`).

| Activity | Schema | Body |
|---|---|---|
| Spot & sort | `SpotSortAnswerRequest` | `{ expectedRevision, itemId, categoryId }` |
| Story | `StoryAnswerRequest` | `{ expectedRevision, nodeId, choiceId }` |

## Response

```ts
SpotSortAnswerResult = {
  run: LearningRun,              // revision + 1
  result: { itemId, correct: boolean, correctCategoryId, explanation },
  progress: { answered: number, total: number },
  completed: boolean,            // every item answered once
}
StoryAnswerResult = {
  run: LearningRun,              // revision + 1
  result: { nodeId, choiceId, verdict: ChoiceVerdict, consequence, cashDeltaPaise, nextNodeId },
  ending: boolean,               // nextNodeId has no choices
  completed: boolean,            // equals ending
}
```

- `correctCategoryId` and `explanation` are returned only for an item that has just been answered, never ahead of time.
- Answering the same item or node again: **409 `already_answered`**; the first answer stands.
- A choice that isn't on the current node: **422 `invalid_choice`**.
- `cashDeltaPaise` is story feedback only; it doesn't move portfolio cash.

## Storage

- New table **`activity_answers`**, separate from `quiz_answers`: `event_id`, `learner_id`, `run_id`, `content_id`, `content_hash`, `item_or_node_id`, `choice_or_category_id`, `correct` (null for stories), `verdict` (null for spot & sort), `concept_id` (nullable), `answered_at`. Unique on `(run_id, item_or_node_id)`. RLS by `learner_id`.
- Completion lives on `learning_runs`: widen the `status` check to `('in-progress', 'completed')` and add `completed_at`; `LearningRun.status` becomes `z.enum(["in-progress", "completed"])`. `topic_progress` is not touched.
- One atomic, idempotent RPC per answer using the `backend_commands` pattern of `save_learning_bookmark`.
- A new migration file; never edit an applied one.

## Out of scope

BKT and mastery updates (R4 reads `activity_answers` later), unlocks (quiz pass marks remain the only unlock rule) and a BKT mapping for story verdicts (none yet).
