import { z } from "zod";
import { Slug } from "./common";
import { InstrumentKind } from "./instrument";

export const UnlockRule = z.object({
  /** Topic this rule gates. */
  topicId: Slug,
  /** Topics that must be completed (quiz passed) before this one opens. */
  requiresTopicIds: z.array(Slug).default([]),
  /** Minimum quiz score, 0–1, to count this topic as completed. */
  passMark: z.number().min(0).max(1).default(0.6),
  /** Instruments that open in the paper portfolio once this topic is completed. */
  unlocksInstruments: z.array(InstrumentKind).default([]),
});
export type UnlockRule = z.infer<typeof UnlockRule>;
