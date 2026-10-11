import { CurriculumBrief, CurriculumBriefContext, LESSON_DRAFT_LIMITS, Slug } from "@gullak/types";
import { z } from "zod";
import { validateCurriculumBrief } from "./curriculum-brief";
import { LESSON_DRAFT_PROMPT } from "./prompts/lesson-draft";

const Format = z.enum(["transcript", "story", "audio", "quiz"]);
const Input = z.object({ brief: CurriculumBrief, context: CurriculumBriefContext, format: Format }).strict();
const FORMAT_FIELDS: Record<z.infer<typeof Format>, string> = {
  transcript: "id, format, audience, conceptIds, markdown (plain markdown)",
  story: "id, format, audience, conceptIds, panels [{id, text, optional speaker}]; text only, no imageUrl",
  audio: "id, format, audience, conceptIds, ttsText (device narration); no url",
  quiz: "id, format, audience, conceptIds, questions [{id, conceptId, prompt, options [{id, text}], correctOptionId, explanation}]",
};

/** Prepare one provider-independent request, without model calls, caching, credentials or writes. */
export function buildLessonGenerationRequest(input: unknown) {
  const parsed = Input.parse(input);
  const brief = validateCurriculumBrief(parsed.brief, parsed.context);
  const { topicId, gradeGroup, locale } = brief;
  const canonicalConceptIds = parsed.context.meta.concepts.map((concept) => concept.id);
  const requiredConceptIds = z
    .array(Slug)
    .min(1)
    .max(LESSON_DRAFT_LIMITS.items)
    .parse([
      ...new Set([
        ...brief.keyIdeas.map((idea) => idea.conceptId),
        ...(parsed.format === "quiz" ? brief.quizObjectives.map((objective) => objective.conceptId) : []),
      ]),
    ]);
  const payload = {
    brief,
    canonicalConceptIds,
    outputEnvelope: { schemaVersion: 1, reviewStatus: "draft", topicId, gradeGroup, locale },
    variantRequirements: {
      format: parsed.format,
      audience: [gradeGroup],
      conceptIds: requiredConceptIds,
      fields: FORMAT_FIELDS[parsed.format],
    },
    limits: { ...LESSON_DRAFT_LIMITS, speaker: 80, quizOptionsMin: 2, quizOptionsMax: 6 },
  };
  return {
    promptId: LESSON_DRAFT_PROMPT.id,
    promptVersion: LESSON_DRAFT_PROMPT.version,
    topicId,
    gradeGroup,
    locale,
    format: parsed.format,
    system: LESSON_DRAFT_PROMPT.system,
    prompt: JSON.stringify(payload),
  };
}
export type LessonGenerationRequest = ReturnType<typeof buildLessonGenerationRequest>;
