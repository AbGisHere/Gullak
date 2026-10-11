import { z } from "zod";
import { Slug } from "./common";

/** Draft migration contract. Existing GradeGroup and topic consumers remain unchanged. */
export const Stage = z.enum(["foundation-explorers", "money-navigators", "financial-strategists"]);
export type Stage = z.infer<typeof Stage>;

const UniqueIds = z
  .array(Slug)
  .min(1)
  .refine((ids) => new Set(ids).size === ids.length, "ids must be unique");

/** Metadata only; localized world copy and gameplay data are separate future contracts. */
export const World = z.object({ id: Slug, lessonIds: UniqueIds }).strict();
export type World = z.infer<typeof World>;

/** Draft lesson metadata, not lesson content, persisted progress or an active unlock evaluator. */
export const Lesson = z
  .object({
    id: Slug,
    worldId: Slug,
    stages: z
      .array(Stage)
      .min(1)
      .refine((stages) => new Set(stages).size === stages.length, "stages must be unique"),
    conceptIds: UniqueIds,
    previousLessonId: Slug.nullable(),
    /** Previous lesson must pass its own check; mastery never gates the next lesson. */
    checkPassMark: z.number().min(0).max(1),
  })
  .strict()
  .refine((lesson) => lesson.previousLessonId !== lesson.id, {
    message: "a lesson cannot be its own predecessor",
    path: ["previousLessonId"],
  });
export type Lesson = z.infer<typeof Lesson>;
