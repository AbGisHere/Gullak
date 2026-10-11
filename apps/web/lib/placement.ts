import { allUnlockRules } from "@gullak/content";
import { gradeQuiz } from "@gullak/engine";
import type { Experience, GradeGroup, VariantOf } from "@gullak/types";
import type { LearnerState } from "./learner-state";
import { DEFAULT_MASTERY_PARAMS, initialMastery, updateMastery } from "./mastery";

/**
 * The placement quiz is made of real lesson checks: round N is the full quiz of the Nth lesson in the
 * learner's path, written for their class. Passing a round is passing that lesson's check, so it is
 * recorded exactly as the lesson page records it, and the quiz pass mark stays the only unlock rule.
 * It stops at the first round not passed. How far it can go depends on the knowledge level picked at sign-up.
 */
export const PLACEMENT_ROUNDS: Record<Experience, number> = { none: 2, some: 3, regular: 5 };

export interface PlacementRound {
  topicId: string;
  title: string;
  quiz: VariantOf<"quiz">;
}

/** The lessons a placement can cover for one class group, in path order. */
export function placementTopicIds(gradeGroup: GradeGroup, rounds = PLACEMENT_ROUNDS.regular): string[] {
  return allUnlockRules
    .filter((rule) => rule.gradeGroups.includes(gradeGroup))
    .slice(0, rounds)
    .map((rule) => rule.topicId);
}

/** Scores one round and records it like the lesson page would: attempt, mastery and, if passed, the pass. */
export function recordPlacementRound(
  state: LearnerState,
  round: PlacementRound,
  answers: Record<string, string>,
  experience: Experience,
  now = new Date(),
): { state: LearnerState; score: number; passed: boolean } {
  const score = gradeQuiz(round.quiz, {
    variantId: round.quiz.id,
    answers: round.quiz.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] ?? "" })),
  });
  const passMark = allUnlockRules.find((rule) => rule.topicId === round.topicId)?.passMark ?? 1;
  const passed = score >= passMark;
  const mastery = { ...state.mastery };
  for (const q of round.quiz.questions) {
    const current = mastery[q.conceptId] ?? initialMastery(experience);
    mastery[q.conceptId] = updateMastery(current, answers[q.id] === q.correctOptionId, DEFAULT_MASTERY_PARAMS);
  }
  return {
    score,
    passed,
    state: {
      ...state,
      mastery,
      passedTopics: passed ? [...new Set([...state.passedTopics, round.topicId])] : state.passedTopics,
      quizAttempts: [...state.quizAttempts, { topicId: round.topicId, score, at: now.toISOString() }],
    },
  };
}
