import { z } from "zod";

/** Stable, URL-safe identifier, e.g. `fixed-deposit`. */
export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");
export type Slug = z.infer<typeof Slug>;

/**
 * BCP 47 language tag (`en`, `hi`, `te`, `en-IN`). Deliberately a string,
 * not an enum: supported locales are data (`packages/content/config/locales.json`),
 * so adding a language never needs a code change.
 */
export const Locale = z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "must be a BCP 47 tag");
export type Locale = z.infer<typeof Locale>;

/**
 * Money is always integer paise (1 INR = 100 paise) to avoid float drift.
 * Human-edited config files may use whole rupees and convert at load time.
 */
export const Paise = z.number().int().safe();
export type Paise = z.infer<typeof Paise>;

export const NonNegativePaise = Paise.nonnegative();

export const IsoDate = z.iso.date();
export const IsoDateTime = z.iso.datetime({ offset: true });

/** Annual rate as a percentage, e.g. `7.1` for 7.1% p.a. */
export const RatePercent = z.number().min(0).max(100);

/** School grade group the learner is in (docs/curriculum.md › Learners). */
export const GradeGroup = z.enum(["grade-6-7", "grade-8-10", "grade-11-12"]);
export type GradeGroup = z.infer<typeof GradeGroup>;

export const Experience = z.enum(["none", "some", "regular"]);
export type Experience = z.infer<typeof Experience>;

export const LearningFormat = z.enum([
  "video",
  "story",
  "visual",
  "formula",
  "transcript",
  "simulation",
  "quiz",
  "audio",
]);
export type LearningFormat = z.infer<typeof LearningFormat>;
