import { z } from "zod";
import { IsoDate, IsoDateTime, Slug } from "./common";

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
  status: z.literal("in-progress"),
  revision: z.number().int().nonnegative().safe(),
  bookmark: LearningBookmark.nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type LearningRun = z.infer<typeof LearningRun>;
