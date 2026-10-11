import { z } from "zod";
import { IsoDateTime, LearningFormat, NonNegativePaise, Paise, RatePercent, Slug } from "./common";
import { Goal } from "./goal";
import { LearnerProfile } from "./profile";

export const OnboardingRequest = LearnerProfile.omit({ id: true, createdAt: true, cohortId: true, goal: true })
  .extend({
    preferredFormats: z
      .array(LearningFormat)
      .min(1)
      .default([...LearningFormat.options]),
    goal: Goal.omit({ id: true, createdAt: true }).strict().optional(),
  })
  .strict();
export type OnboardingRequest = z.infer<typeof OnboardingRequest>;
export const QuizSubmission = z
  .object({
    variantId: Slug,
    answers: z
      .array(z.object({ questionId: Slug, optionId: z.string().min(1).max(100) }).strict())
      .min(1)
      .max(100),
  })
  .strict();
export type QuizSubmission = z.infer<typeof QuizSubmission>;
export const LessonProgressRequest = z.object({ variantId: Slug }).strict();
export const FdInvestmentRequest = z
  .object({
    principalPaise: Paise.positive(),
    // Only the supported one-year dated card rate is currently available.
    tenureMonths: z.literal(12),
  })
  .strict();
export const IdempotencyKey = z.uuid();
export const ProgressRecord = z.object({
  topicId: Slug,
  bestQuizScore: z.number().min(0).max(1),
  passed: z.boolean(),
  lessonViewedAt: IsoDateTime.nullable(),
  updatedAt: IsoDateTime,
});
export type ProgressRecord = z.infer<typeof ProgressRecord>;
export const QuizResult = z.object({ topicId: Slug, score: z.number().min(0).max(1), passed: z.boolean() });
export const GoalPlanRequest = z
  .object({
    targetPaise: Paise.positive(),
    currentSavingsPaise: NonNegativePaise.default(0),
    months: z.number().int().min(1).max(600),
    assumedAnnualRatePercent: RatePercent,
  })
  .strict();
export const ReplayRequest = z
  .object({
    symbol: z.string().min(1).max(80),
    from: IsoDateTime,
    to: IsoDateTime,
    initialPaise: Paise.positive(),
    panicSellAt: IsoDateTime.optional(),
  })
  .strict()
  .refine((r) => Date.parse(r.from) < Date.parse(r.to), { message: "from must precede to" });
export const CohortAggregate = z.object({
  missionsCompleted: z.number().int().nonnegative().optional(),
  householdsReached: z.number().int().nonnegative().optional(),
  reachDefinition: z.literal("one-per-learner-family-confirmed-may-include-siblings").optional(),
  learnerCount: z.number().int().nonnegative(),
  topics: z.array(
    z.object({ topicId: Slug, passedCount: z.number().int().nonnegative(), meanBestScore: z.number().min(0).max(1) }),
  ),
});
