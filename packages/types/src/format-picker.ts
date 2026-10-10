import { z } from "zod";
import { GradeGroup, LearningFormat, Slug } from "./common";
import { TopicVariant } from "./topic";

/** Presentation selection only: no mastery, topic unlocking or learner identity. */
export const FormatPickerRequest = z
  .object({
    gradeGroup: GradeGroup,
    preferredFormats: z.array(LearningFormat).default([]),
    variants: z.array(TopicVariant).refine((variants) => new Set(variants.map((v) => v.id)).size === variants.length, {
      message: "variant ids must be unique",
    }),
    /** Caller-owned rotation counter; never incremented by reading a lesson. */
    selectionIndex: z.number().int().safe().nonnegative().default(0),
  })
  .strict();
export type FormatPickerRequest = z.infer<typeof FormatPickerRequest>;

/** Small, answer-free metadata; translate reason codes in the consuming UI. */
export const FormatSelection = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("selected"),
      variantId: Slug,
      format: LearningFormat.exclude(["quiz"]),
      reason: z.enum(["preferred-format", "mixed-format", "fallback-format"]),
    })
    .strict(),
  z.object({ status: z.literal("unavailable"), reason: z.literal("no-eligible-variant") }).strict(),
]);
export type FormatSelection = z.infer<typeof FormatSelection>;
