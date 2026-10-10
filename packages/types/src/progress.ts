import { z } from "zod";
import { IsoDateTime, Slug } from "./common";

/**
 * A learner's record for one topic. Locked/open is not stored: it's derived
 * from these records and the unlock rules (`@gullak/engine`).
 */
export const TopicProgress = z.object({
  learnerId: z.uuid(),
  topicId: Slug,
  status: z.enum(["in-progress", "completed"]),
  /** Best quiz score so far, 0–1. */
  bestScore: z.number().min(0).max(1).optional(),
  quizAttempts: z.number().int().nonnegative().default(0),
  completedAt: IsoDateTime.optional(),
  updatedAt: IsoDateTime,
});
export type TopicProgress = z.infer<typeof TopicProgress>;
