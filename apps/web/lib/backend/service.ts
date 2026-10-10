import { randomUUID } from "node:crypto";
import { allUnlockRules, locales, startingCapital } from "@gullak/content";
import {
  gradeQuiz,
  isTopicOpen,
  monthlyForTarget,
  pickLessonVariant,
  startingCash,
  unlockedInstruments,
  valuePortfolio,
} from "@gullak/engine";
import {
  DepositHolding,
  GoalPlanRequest,
  LearnerProfile,
  type OnboardingRequest,
  type QuizSubmission,
  type Topic,
} from "@gullak/types";
import type { Json } from "../data/database.types";
import type { DataAccess, LearnerState } from "../data/transactions";
import { ApiError } from "./errors";

export function ruleFor(topicId: string) {
  const rule = allUnlockRules.find((r) => r.topicId === topicId);
  if (!rule) throw new ApiError(404, "topic_not_found");
  return rule;
}
export function requireTopicOpen(state: LearnerState, topicId: string) {
  const rule = ruleFor(topicId);
  // A topic not taught to the learner's grade group is never open to them.
  if (!rule.gradeGroups.includes(state.profile.gradeGroup)) throw new ApiError(403, "topic_locked");
  if (!isTopicOpen(rule, allUnlockRules, new Map(state.progress.map((p) => [p.topicId, p]))))
    throw new ApiError(403, "topic_locked");
  return rule;
}
export function publicLesson(topic: Topic, state: LearnerState) {
  requireTopicOpen(state, topic.meta.id);
  return {
    ...topic,
    formatSelection: pickLessonVariant({
      gradeGroup: state.profile.gradeGroup,
      preferredFormats: state.profile.preferredFormats,
      variants: topic.content.variants,
    }),
    content: {
      ...topic.content,
      variants: topic.content.variants
        .filter((v) => !v.audience || v.audience.includes(state.profile.gradeGroup))
        .map((v) =>
          v.format !== "quiz"
            ? v
            : {
                ...v,
                questions: v.questions.map(({ correctOptionId: _answer, explanation: _explanation, ...q }) => q),
              },
        ),
    },
  };
}
export function createBackendService(db: DataAccess, learnerId: string, now = () => new Date().toISOString()) {
  return {
    async onboard(input: OnboardingRequest) {
      if (!locales.locales.some((l) => l.code === input.locale)) throw new ApiError(400, "unsupported_locale");
      const createdAt = now();
      const profile = LearnerProfile.parse({
        ...input,
        id: learnerId,
        createdAt,
        goal: input.goal ? { ...input.goal, id: randomUUID(), createdAt } : undefined,
      });
      return db.onboard(profile, startingCash(startingCapital, profile.gradeGroup, profile.experience));
    },
    async progress() {
      const state = await db.state();
      return {
        progress: state.progress,
        unlockedInstruments: [
          ...unlockedInstruments(allUnlockRules, new Map(state.progress.map((p) => [p.topicId, p]))),
        ],
      };
    },
    async lesson(topic: Topic, variantId: string) {
      const state = await db.state();
      requireTopicOpen(state, topic.meta.id);
      const variant = topic.content.variants.find(
        (v) =>
          v.id === variantId && v.format !== "quiz" && (!v.audience || v.audience.includes(state.profile.gradeGroup)),
      );
      if (!variant) throw new ApiError(400, "lesson_variant_not_found");
      await db.lesson(topic.meta.id);
      return { recorded: true };
    },
    async quiz(topic: Topic, input: QuizSubmission, key: string) {
      const state = await db.state();
      const rule = requireTopicOpen(state, topic.meta.id);
      const quiz = topic.content.variants.find(
        (v) =>
          v.id === input.variantId &&
          v.format === "quiz" &&
          (!v.audience || v.audience.includes(state.profile.gradeGroup)),
      );
      if (quiz?.format !== "quiz") throw new ApiError(400, "quiz_variant_not_found");
      let score: number;
      try {
        score = gradeQuiz(quiz, input);
      } catch {
        throw new ApiError(400, "invalid_quiz_answers");
      }
      return db.quiz(topic.meta.id, key, input as Json, score, rule.passMark, rule.requiresTopicIds);
    },
    async invest(
      input: { principalPaise: number; tenureMonths: 12 },
      key: string,
      rate: { value: number; asOf: string; source: string },
    ) {
      const state = await db.state();
      const rule = allUnlockRules.find((r) => r.unlocksInstruments.includes("fixed-deposit"));
      if (!rule) throw new ApiError(503, "fd_rule_missing");
      // Transaction checks completion and balance again under a lock.
      const holding = DepositHolding.parse({
        id: randomUUID(),
        instrumentId: "virtual-fd",
        openedAt: now(),
        type: "deposit",
        kind: "fixed-deposit",
        principalPaise: input.principalPaise,
        ratePercent: rate.value,
        tenureMonths: input.tenureMonths,
        compoundsPerYear: 4,
        rateAsOf: rate.asOf.slice(0, 10),
        rateSource: `${rate.source} (snapshot)`,
      });
      if (state.profile.id !== learnerId) throw new ApiError(403, "ownership_mismatch");
      return db.invest(key, input as Json, holding, [...rule.requiresTopicIds, rule.topicId]);
    },
    async portfolio() {
      const state = await db.state();
      return { portfolio: state.portfolio, valuation: valuePortfolio(state.portfolio, now()) };
    },
    goal(input: unknown) {
      const plan = GoalPlanRequest.parse(input);
      const remaining = Math.max(0, plan.targetPaise - plan.currentSavingsPaise);
      return {
        isVirtual: true,
        monthlyPaise: monthlyForTarget(remaining, plan.assumedAnnualRatePercent, plan.months),
        assumptions: {
          ...plan,
          isProjection: true,
          source: "learner-supplied hypothetical rate",
          asOf: now(),
          contributionTiming: "start-of-month",
          currentSavingsHeldAsCash: true,
          excludesTaxAndFees: true,
        },
      };
    },
  };
}
