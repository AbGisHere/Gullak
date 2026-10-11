import { z } from "zod";
import { Locale, Slug } from "./common";

export const MissionConfirmation = z.enum(["family", "self_reported"]);
export type MissionConfirmation = z.infer<typeof MissionConfirmation>;
export const MissionCompletionRequest = z.object({ missionId: Slug, confirmation: MissionConfirmation }).strict();
export type MissionCompletionRequest = z.infer<typeof MissionCompletionRequest>;
/** Minimal authored mission content; publication belongs to R1/R5. */
export const MissionDefinition = z
  .object({
    id: Slug,
    locale: Locale,
    title: z.string().min(1),
    instructions: z.string().min(1),
  })
  .strict();
export type MissionDefinition = z.infer<typeof MissionDefinition>;
export const MissionCompletionResult = z.object({
  missionId: Slug,
  confirmation: MissionConfirmation,
  missionsCompleted: z.number().int().nonnegative(),
  householdsReached: z.number().int().min(0).max(1),
});
export type MissionCompletionResult = z.infer<typeof MissionCompletionResult>;
