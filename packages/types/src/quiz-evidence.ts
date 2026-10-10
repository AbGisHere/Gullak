import { z } from "zod";
import { Slug } from "./common";

/** Internal server boundary, never accepted from the public quiz request. */
export const QuizEvidence = z
  .object({
    contentVersion: z.string().regex(/^[a-f0-9]{64}$/),
    answers: z
      .array(z.object({ questionId: Slug, conceptId: Slug, correct: z.boolean() }).strict())
      .min(1)
      .max(100),
  })
  .strict()
  .refine(
    (value) => new Set(value.answers.map((answer) => answer.questionId)).size === value.answers.length,
    "duplicate question evidence",
  );
export type QuizEvidence = z.infer<typeof QuizEvidence>;
