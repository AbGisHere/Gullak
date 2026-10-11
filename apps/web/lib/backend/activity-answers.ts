import "server-only";
import { Activity, type ActivityAnswerRequest, ActivityAnswerResult } from "@gullak/types";
import type { Json } from "../data/database.types";
import type { DataAccess } from "../data/transactions";
import { ApiError } from "./errors";
import { loadLearningDefinition } from "./learning";

export async function answerActivity(db: DataAccess, runId: string, input: ActivityAnswerRequest, key: string) {
  const run = await db.run(runId);
  if (run.kind !== "activity") throw new ApiError(400, "activity_required");
  const state = await db.activityState(runId, key, input as Json);
  if (state.cached) {
    const cached = ActivityAnswerResult.safeParse(state.cached);
    if (!cached.success) throw new ApiError(503, "database_response_invalid");
    if (cached.data.run.id !== run.id || cached.data.run.learnerId !== run.learnerId)
      throw new ApiError(403, "ownership_mismatch");
    return cached.data;
  }
  const loaded = await loadLearningDefinition(run.kind, run.contentId, run.locale);
  if (loaded.hash !== run.contentHash) throw new ApiError(409, "content_changed");
  const definition = Activity.parse(loaded.definition);
  if (run.revision !== input.expectedRevision) throw new ApiError(409, "revision_conflict");
  let evidence: Json;
  let transition: Json;
  let result: Json;
  if (definition.kind === "spot-sort") {
    if (!("itemId" in input)) throw new ApiError(400, "invalid_request");
    if (state.answeredIds.includes(input.itemId)) throw new ApiError(409, "already_answered");
    const item = definition.items.find((item) => item.id === input.itemId);
    if (!item || !definition.categories.some((category) => category.id === input.categoryId))
      throw new ApiError(422, "invalid_choice");
    const correct = item.correctCategoryId === input.categoryId;
    evidence = {
      itemOrNodeId: item.id,
      choiceOrCategoryId: input.categoryId,
      correct,
      verdict: null,
      conceptId: item.conceptId ?? null,
    };
    transition = { kind: "spot-sort", total: definition.items.length };
    result = { itemId: item.id, correct, correctCategoryId: item.correctCategoryId, explanation: item.explanation };
  } else {
    if (!("nodeId" in input)) throw new ApiError(400, "invalid_request");
    if (state.answeredIds.includes(input.nodeId)) throw new ApiError(409, "already_answered");
    if (input.nodeId !== (state.currentNodeId ?? definition.startNodeId)) throw new ApiError(422, "invalid_choice");
    const node = definition.nodes.find((node) => node.id === input.nodeId);
    const choice = node?.choices.find((choice) => choice.id === input.choiceId);
    const next = definition.nodes.find((node) => node.id === choice?.nextNodeId);
    if (!choice || !next) throw new ApiError(422, "invalid_choice");
    evidence = {
      itemOrNodeId: input.nodeId,
      choiceOrCategoryId: choice.id,
      correct: null,
      verdict: choice.verdict,
      conceptId: choice.conceptId ?? null,
    };
    transition = {
      kind: "story",
      currentNodeId: definition.startNodeId,
      nextNodeId: next.id,
      ending: next.choices.length === 0,
    };
    result = {
      nodeId: input.nodeId,
      choiceId: choice.id,
      verdict: choice.verdict,
      consequence: choice.consequence,
      cashDeltaPaise: choice.cashDeltaPaise,
      nextNodeId: next.id,
    };
  }
  if (run.status === "completed") throw new ApiError(409, "already_completed");
  return db.answerActivity(runId, key, input as Json, run.contentHash, evidence, transition, result);
}
