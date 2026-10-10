import { z } from "zod";
import { GradeGroup, Slug } from "./common";
import { InstrumentKind } from "./instrument";
import { Pillar } from "./topic";

/**
 * One node of the topic prerequisite graph (`packages/content/config/topic-graph.json`).
 * Topics form a graph, not a line: a topic opens when all its prerequisites are completed.
 */
export const UnlockRule = z.object({
  /** Topic this rule gates. */
  topicId: Slug,
  pillar: Pillar,
  /** Grade groups this topic is taught to. */
  gradeGroups: z.array(GradeGroup).min(1),
  /** Topics that must be completed (quiz passed) before this one opens. */
  requiresTopicIds: z.array(Slug).default([]),
  /** Minimum quiz score, 0–1, to count this topic as completed. */
  passMark: z.number().min(0).max(1).default(0.6),
  /** Instruments that open in the paper portfolio once this topic is completed. */
  unlocksInstruments: z.array(InstrumentKind).default([]),
  /** Activities and Practice episodes that open once this topic is completed. */
  unlocksActivityIds: z.array(Slug).default([]),
});
export type UnlockRule = z.infer<typeof UnlockRule>;
