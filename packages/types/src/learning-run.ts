import { z } from "zod";
import { ChoiceVerdict } from "./activity";
import { IsoDate, IsoDateTime, Paise, Slug } from "./common";

export const LearningRunKind = z.enum(["activity", "episode"]);
export type LearningRunKind = z.infer<typeof LearningRunKind>;
export const StartLearningRunRequest = z.object({}).strict();
/** Navigation only; not a simulation action, score, completion or mastery event. */
export const LearningBookmark = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("item"), itemId: Slug }).strict(),
  z.object({ kind: z.literal("node"), nodeId: Slug }).strict(),
  z.object({ kind: z.literal("date"), on: IsoDate }).strict(),
]);
export type LearningBookmark = z.infer<typeof LearningBookmark>;
export const SaveLearningBookmarkRequest = z
  .object({
    expectedRevision: z.number().int().nonnegative().safe(),
    bookmark: LearningBookmark,
  })
  .strict();
export type SaveLearningBookmarkRequest = z.infer<typeof SaveLearningBookmarkRequest>;
export const LearningRun = z.object({
  id: z.uuid(),
  learnerId: z.uuid(),
  kind: LearningRunKind,
  contentId: Slug,
  locale: z.string().min(1),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  status: z.enum(["in-progress", "completed"]),
  completedAt: IsoDateTime.nullable().optional(),
  revision: z.number().int().nonnegative().safe(),
  bookmark: LearningBookmark.nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type LearningRun = z.infer<typeof LearningRun>;

const ExpectedRevision = z.number().int().nonnegative().safe();
export const SpotSortAnswerRequest = z
  .object({ expectedRevision: ExpectedRevision, itemId: Slug, categoryId: Slug })
  .strict();
export const StoryAnswerRequest = z
  .object({ expectedRevision: ExpectedRevision, nodeId: Slug, choiceId: Slug })
  .strict();
export const ActivityAnswerRequest = z.union([SpotSortAnswerRequest, StoryAnswerRequest]);
export type ActivityAnswerRequest = z.infer<typeof ActivityAnswerRequest>;
export const SpotSortAnswerResult = z
  .object({
    run: LearningRun,
    result: z
      .object({ itemId: Slug, correct: z.boolean(), correctCategoryId: Slug, explanation: z.string().min(1) })
      .strict(),
    progress: z.object({ answered: z.number().int().positive(), total: z.number().int().positive() }).strict(),
    completed: z.boolean(),
  })
  .strict();
export const StoryAnswerResult = z
  .object({
    run: LearningRun,
    result: z
      .object({
        nodeId: Slug,
        choiceId: Slug,
        verdict: ChoiceVerdict,
        consequence: z.string().min(1),
        cashDeltaPaise: Paise,
        nextNodeId: Slug,
      })
      .strict(),
    ending: z.boolean(),
    completed: z.boolean(),
  })
  .strict();
export const ActivityAnswerResult = z.union([SpotSortAnswerResult, StoryAnswerResult]);
export type SpotSortAnswerRequest = z.infer<typeof SpotSortAnswerRequest>;
export type StoryAnswerRequest = z.infer<typeof StoryAnswerRequest>;
export type SpotSortAnswerResult = z.infer<typeof SpotSortAnswerResult>;
export type StoryAnswerResult = z.infer<typeof StoryAnswerResult>;
export type ActivityAnswerResult = z.infer<typeof ActivityAnswerResult>;
