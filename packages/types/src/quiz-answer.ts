import { z } from "zod";
import { IsoDateTime, Slug } from "./common";

/** R3's nine-field row contract, not a database migration or mastery update. */
export const QuizAnswerEvent = z
  .object({
    event_id: z.uuid(),
    learner_id: z.uuid(),
    topic_id: Slug,
    concept_id: Slug,
    question_id: Slug,
    correct: z.boolean(),
    answered_at: IsoDateTime,
    attempt_no: z.number().int().positive().safe(),
    content_version: z.string().regex(/^[a-f0-9]{64}$/, "must be lowercase SHA-256 hex"),
  })
  .strict();
export type QuizAnswerEvent = z.infer<typeof QuizAnswerEvent>;
