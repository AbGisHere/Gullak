import { z } from "zod";
import { GradeGroup, Locale, Slug } from "./common";
import { TopicMeta } from "./topic";
import { UnlockRule } from "./unlock";

export const CURRICULUM_BRIEF_MAX_TEXT_LENGTH = 600;
export const CURRICULUM_BRIEF_MAX_ITEMS = 12;
export const CURRICULUM_BRIEF_MAX_ID_LENGTH = 80;

const BriefText = z.string().trim().min(1).max(CURRICULUM_BRIEF_MAX_TEXT_LENGTH);
const BriefId = Slug.max(CURRICULUM_BRIEF_MAX_ID_LENGTH);
const TextList = z.array(BriefText).min(1).max(CURRICULUM_BRIEF_MAX_ITEMS);

/** Engineering input for future generation, not reviewed/published lesson content. */
export const CurriculumBrief = z
  .object({
    schemaVersion: z.literal(1),
    reviewStatus: z.literal("draft"),
    topicId: BriefId,
    gradeGroup: GradeGroup,
    locale: Locale,
    learningGoals: TextList,
    keyIdeas: z
      .array(z.object({ conceptId: BriefId, explanation: BriefText }).strict())
      .min(1)
      .max(CURRICULUM_BRIEF_MAX_ITEMS),
    misconceptions: z
      .array(z.object({ misconception: BriefText, correction: BriefText }).strict())
      .min(1)
      .max(CURRICULUM_BRIEF_MAX_ITEMS),
    examples: TextList,
    quizObjectives: z
      .array(z.object({ conceptId: BriefId, objective: BriefText }).strict())
      .min(1)
      .max(CURRICULUM_BRIEF_MAX_ITEMS),
  })
  .strict();
export type CurriculumBrief = z.infer<typeof CurriculumBrief>;

/** Canonical content supplied by the caller; no package-to-content dependency. */
export const CurriculumBriefContext = z
  .object({
    meta: TopicMeta,
    rule: UnlockRule,
    supportedLocales: z.array(Locale).min(1),
  })
  .strict()
  .refine(({ meta }) => new Set(meta.concepts.map((concept) => concept.id)).size === meta.concepts.length, {
    message: "canonical concept ids must be unique",
    path: ["meta", "concepts"],
  });
export type CurriculumBriefContext = z.infer<typeof CurriculumBriefContext>;
