import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allUnlockRules } from "@gullak/content";
import { isTopicCompleted } from "@gullak/engine";
import { Activity, Episode, type LearningRunKind, Locale, type SaveLearningBookmarkRequest, Slug } from "@gullak/types";
import type { Json } from "../data/database.types";
import type { DataAccess, LearnerState } from "../data/transactions";
import { ApiError } from "./errors";
import { requireTopicOpen } from "./service";

export async function loadLearningDefinition(kind: LearningRunKind, id: string, locale: string) {
  Slug.parse(id);
  Locale.parse(locale);
  const root = existsSync(resolve(process.cwd(), "packages/content")) ? process.cwd() : resolve(process.cwd(), "../..");
  let raw: string;
  try {
    raw = await readFile(
      resolve(root, "packages/content", kind === "activity" ? "activities" : "episodes", id, `${locale}.json`),
      "utf8",
    );
  } catch {
    throw new ApiError(503, "learning_content_unavailable");
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    throw new ApiError(503, "learning_content_invalid");
  }
  const parsed = (kind === "activity" ? Activity : Episode).safeParse(decoded);
  if (!parsed.success || parsed.data.id !== id || parsed.data.locale !== locale)
    throw new ApiError(503, "learning_content_invalid");
  return { definition: parsed.data, hash: createHash("sha256").update(raw).digest("hex") };
}
export function requireLearningOpen(state: LearnerState, definition: Activity | Episode) {
  if (definition.gradeGroups && !definition.gradeGroups.includes(state.profile.gradeGroup))
    throw new ApiError(403, "topic_locked");
  const progress = new Map(state.progress.map((p) => [p.topicId, p]));
  const gates = allUnlockRules.filter((r) => r.unlocksActivityIds.includes(definition.id));
  if (!gates.length) throw new ApiError(503, "learning_gate_missing");
  // Match the existing engine: any completed graph node that unlocks this ID is a gate.
  // topicIds describe concepts practised, not extra prerequisites invented by this API.
  for (const gate of gates) {
    if (!isTopicCompleted(gate, progress)) continue;
    try {
      requireTopicOpen(state, gate.topicId);
    } catch (error) {
      if (error instanceof ApiError && error.code === "topic_locked") continue;
      throw error;
    }
    const requires = new Set<string>();
    const visit = (topicId: string) => {
      if (requires.has(topicId)) return;
      requires.add(topicId);
      for (const id of allUnlockRules.find((r) => r.topicId === topicId)?.requiresTopicIds ?? []) visit(id);
    };
    visit(gate.topicId);
    return [...requires];
  }
  throw new ApiError(403, "topic_locked");
}
export async function startLearningRun(db: DataAccess, kind: LearningRunKind, contentId: string, key: string) {
  const state = await db.state();
  const { definition, hash } = await loadLearningDefinition(kind, contentId, state.profile.locale);
  return db.startRun(
    key,
    { kind, contentId, locale: state.profile.locale },
    {
      id: randomUUID(),
      kind,
      contentId,
      locale: state.profile.locale,
      contentHash: hash,
    },
    requireLearningOpen(state, definition),
  );
}
export async function saveLearningBookmark(
  db: DataAccess,
  runId: string,
  key: string,
  input: SaveLearningBookmarkRequest,
) {
  const run = await db.run(runId);
  const state = await db.state();
  const { definition, hash } = await loadLearningDefinition(run.kind, run.contentId, run.locale);
  if (run.contentHash !== hash) throw new ApiError(409, "content_changed");
  requireLearningOpen(state, definition);
  const b = input.bookmark;
  const valid =
    "kind" in definition
      ? definition.kind === "spot-sort"
        ? b.kind === "item" && definition.items.some((i) => i.id === b.itemId)
        : b.kind === "node" && definition.nodes.some((n) => n.id === b.nodeId)
      : b.kind === "date" && b.on >= definition.startDate && b.on <= definition.endDate;
  if (!valid) throw new ApiError(400, "invalid_learning_bookmark");
  return db.bookmark(runId, key, input as Json, hash);
}
