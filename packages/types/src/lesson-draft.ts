import { z } from "zod";
import { GradeGroup, Locale, Slug } from "./common";
import { AudioVariant, QuizQuestion, QuizVariant, StoryVariant, TranscriptVariant } from "./topic";

/** Editorial draft limits, not a replacement for human readability review. */
export const LESSON_DRAFT_LIMITS = {
  transcript: 6000,
  narration: 4000,
  panel: 300,
  option: 120,
  prompt: 300,
  explanation: 600,
  items: 12,
} as const;

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !/!\s*\[|<\s*\/?\s*[a-z][^>]*>/i.test(value), {
      message: "draft text must not embed images or HTML",
    });
const base = {
  conceptIds: z.array(Slug).min(1).max(LESSON_DRAFT_LIMITS.items),
  audience: z.array(GradeGroup).length(1),
};
const DraftTranscript = TranscriptVariant.extend({ ...base, markdown: text(LESSON_DRAFT_LIMITS.transcript) }).strict();
const DraftAudio = AudioVariant.omit({ url: true })
  .extend({ ...base, ttsText: text(LESSON_DRAFT_LIMITS.narration) })
  .strict();
const DraftStory = StoryVariant.extend({
  ...base,
  panels: z
    .array(z.object({ id: Slug, speaker: text(80).optional(), text: text(LESSON_DRAFT_LIMITS.panel) }).strict())
    .min(1)
    .max(LESSON_DRAFT_LIMITS.items),
}).strict();
const DraftQuiz = QuizVariant.extend({
  ...base,
  questions: z
    .array(
      QuizQuestion.extend({
        prompt: text(LESSON_DRAFT_LIMITS.prompt),
        explanation: text(LESSON_DRAFT_LIMITS.explanation),
        options: z
          .array(z.object({ id: Slug, text: text(LESSON_DRAFT_LIMITS.option) }).strict())
          .min(2)
          .max(6),
        correctOptionId: Slug,
      }).strict(),
    )
    .min(1)
    .max(LESSON_DRAFT_LIMITS.items),
}).strict();

/** One offline generation result, compatible with TopicVariant but never publishable by itself. */
export const LessonDraft = z
  .object({
    schemaVersion: z.literal(1),
    reviewStatus: z.literal("draft"),
    topicId: Slug,
    gradeGroup: GradeGroup,
    locale: Locale,
    variant: z.discriminatedUnion("format", [DraftTranscript, DraftStory, DraftAudio, DraftQuiz]),
  })
  .strict();
export type LessonDraft = z.infer<typeof LessonDraft>;
