import { CurriculumBrief, CurriculumBriefContext, type LessonDraft } from "@gullak/types";
import { z } from "zod";
import { validateLessonDraft } from "./lesson-draft";
import { buildLessonGenerationRequest, type LessonGenerationRequest } from "./lesson-generation";

export type LessonDraftGenerator = (request: Readonly<LessonGenerationRequest>) => Promise<unknown>;

/** Existing topic-model runner. No built-in provider, retries, cache, persistence or publication. */
export async function generateLessonDraft(input: unknown, generate: LessonDraftGenerator): Promise<LessonDraft> {
  // Zod creates a detached snapshot before the asynchronous boundary.
  const snapshot = z
    .object({ brief: CurriculumBrief, context: CurriculumBriefContext, format: z.string() })
    .strict()
    .parse(input);
  const request = buildLessonGenerationRequest(snapshot);
  const output = await generate(request);
  const draft = validateLessonDraft(output, snapshot.brief, snapshot.context);
  if (draft.variant.format !== snapshot.format) {
    throw new z.ZodError([
      { code: "custom", path: ["variant", "format"], message: "generated format must match the requested format" },
    ]);
  }
  return draft;
}
