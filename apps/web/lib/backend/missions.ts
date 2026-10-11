import "server-only";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Locale, type MissionCompletionRequest, MissionDefinition, Slug } from "@gullak/types";
import type { DataAccess } from "../data/transactions";
import { ApiError } from "./errors";

export async function loadMission(id: string, locale: string) {
  Slug.parse(id);
  Locale.parse(locale);
  const root = existsSync(resolve(process.cwd(), "packages/content")) ? process.cwd() : resolve(process.cwd(), "../..");
  let raw: string;
  try {
    raw = await readFile(resolve(root, "packages/content/missions", id, `${locale}.json`), "utf8");
  } catch {
    throw new ApiError(503, "mission_content_unavailable");
  }
  let definition: unknown;
  try {
    definition = JSON.parse(raw);
  } catch {
    throw new ApiError(503, "mission_content_invalid");
  }
  const result = MissionDefinition.safeParse(definition);
  if (!result.success || result.data.id !== id || result.data.locale !== locale)
    throw new ApiError(503, "mission_content_invalid");
  return result.data;
}

export async function completeMission(db: DataAccess, input: MissionCompletionRequest, key: string) {
  const state = await db.state();
  await loadMission(input.missionId, state.profile.locale);
  // Confirmation is an explicit attestation on the learner's session, not proof
  // of a separate parent's identity. It never affects mastery or unlocks.
  return db.mission(key, input);
}
