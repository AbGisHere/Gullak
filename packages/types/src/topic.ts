import { z } from "zod";
import { GradeGroup, type LearningFormat, Locale, Slug } from "./common";
import { InstrumentKind } from "./instrument";

/**
 * A topic is stored ONCE as structured content (TopicMeta + one TopicContent
 * per locale) and rendered in many formats. Renderers pick variants by the
 * learner's preferred formats and age band.
 */

export const TopicTrack = z.enum(["ladder", "stay-safe"]);
export type TopicTrack = z.infer<typeof TopicTrack>;

export const Concept = z.object({
  id: Slug,
  /** Short internal label; learner-facing text lives in TopicContent. */
  label: z.string().min(1),
});

export const TopicMeta = z.object({
  id: Slug,
  track: TopicTrack,
  /** Instrument this topic teaches; null for the stay-safe track. */
  instrument: InstrumentKind.nullable(),
  concepts: z.array(Concept).min(1),
  estimatedMinutes: z.number().int().positive(),
});
export type TopicMeta = z.infer<typeof TopicMeta>;

const VariantBase = z.object({
  id: Slug,
  /** Age bands this variant is written for; omitted means all. */
  audience: z.array(GradeGroup).optional(),
  /** Concepts this variant covers, for knowledge tracing. */
  conceptIds: z.array(Slug).default([]),
});

export const VideoVariant = VariantBase.extend({
  format: z.literal("video"),
  url: z.url(),
  posterUrl: z.url().optional(),
  captionsUrl: z.url().optional(),
  durationSec: z.number().int().positive(),
});

export const StoryVariant = VariantBase.extend({
  format: z.literal("story"),
  panels: z
    .array(
      z.object({
        id: Slug,
        imageUrl: z.string().min(1).optional(),
        speaker: z.string().optional(),
        text: z.string().min(1),
      }),
    )
    .min(1),
});

export const VisualVariant = VariantBase.extend({
  format: z.literal("visual"),
  charts: z
    .array(
      z.object({
        id: Slug,
        kind: z.enum(["line", "area", "bar"]),
        title: z.string().min(1),
        caption: z.string().optional(),
        /** Either a snapshot file under /data/snapshots or an engine-computed series id. */
        dataRef: z.string().min(1),
      }),
    )
    .min(1),
});

export const FormulaVariable = z.object({
  symbol: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
  default: z.number(),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
});

export const FormulaVariant = VariantBase.extend({
  format: z.literal("formula"),
  formulas: z
    .array(
      z.object({
        id: Slug,
        label: z.string().min(1),
        /** KaTeX source. */
        latex: z.string().min(1),
        variables: z.array(FormulaVariable),
        /** Name of the pure function in @gullak/engine that powers the live calculator. */
        calculator: z.string().min(1),
      }),
    )
    .min(1),
});

export const TranscriptVariant = VariantBase.extend({
  format: z.literal("transcript"),
  markdown: z.string().min(1),
});

export const SimulationVariant = VariantBase.extend({
  format: z.literal("simulation"),
  /** Registered simulation component id, e.g. `fd-vs-savings`. */
  simulationId: Slug,
  params: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
});

export const QuizQuestion = z.object({
  id: Slug,
  conceptId: Slug,
  prompt: z.string().min(1),
  options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
  correctOptionId: z.string().min(1),
  explanation: z.string().min(1),
});

export const QuizVariant = VariantBase.extend({
  format: z.literal("quiz"),
  questions: z.array(QuizQuestion).min(1),
});

export const AudioVariant = VariantBase.extend({
  format: z.literal("audio"),
  /** Pre-rendered narration; absent means render `ttsText` on device. */
  url: z.url().optional(),
  ttsText: z.string().min(1),
});

export const TopicVariant = z.discriminatedUnion("format", [
  VideoVariant,
  StoryVariant,
  VisualVariant,
  FormulaVariant,
  TranscriptVariant,
  SimulationVariant,
  QuizVariant,
  AudioVariant,
]);
export type TopicVariant = z.infer<typeof TopicVariant>;

export const TopicContent = z
  .object({
    topicId: Slug,
    locale: Locale,
    title: z.string().min(1),
    summary: z.string().min(1),
    variants: z.array(TopicVariant).min(1),
  })
  .refine((c) => c.variants.some((v) => v.format === "quiz"), {
    message: "every topic needs a quiz variant to gate unlocking",
    path: ["variants"],
  });
export type TopicContent = z.infer<typeof TopicContent>;

/** Full topic as assembled for one learner. */
export const Topic = z.object({
  meta: TopicMeta,
  content: TopicContent,
});
export type Topic = z.infer<typeof Topic>;

export type VariantOf<F extends LearningFormat> = Extract<TopicVariant, { format: F }>;
