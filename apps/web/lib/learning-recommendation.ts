import { allUnlockRules } from "@gullak/content";
import { initialMastery, isTopicOpen, recommendNext } from "@gullak/engine";
import { type GradeGroup, type LearnerProfile, RecommendationRequest } from "@gullak/types";
import type { TopicSummary } from "@/components/learn-map";
import type { LearnerState } from "./learner-state";

/** Missing evidence is explicit: never silently replace a returning learner's mastery. */
export function learningRecommendation(topics: TopicSummary[], gradeGroup: GradeGroup, state: LearnerState) {
  const rules = allUnlockRules.map((rule) => ({
    ...rule,
    conceptIds: topics.find((topic) => topic.id === rule.topicId)?.concepts ?? [],
  }));
  const progress = Object.fromEntries(
    allUnlockRules.flatMap((rule) => {
      const scores = state.quizAttempts.filter((attempt) => attempt.topicId === rule.topicId).map((a) => a.score);
      return scores.length ? [[rule.topicId, Math.max(...scores)]] : [];
    }),
  );
  const mastery = Object.fromEntries(
    rules.map((rule) => [
      rule.topicId,
      Object.fromEntries(
        rule.conceptIds.filter((id) => state.mastery[id] !== undefined).map((id) => [id, state.mastery[id]]),
      ),
    ]),
  );
  const input = RecommendationRequest.safeParse({ gradeGroup, topics: rules, progress, mastery });
  const recommendation = input.success ? recommendNext(input.data) : null;
  const scoreMap = new Map(Object.entries(progress).map(([id, bestQuizScore]) => [id, { bestQuizScore }]));
  const fallback = allUnlockRules.find(
    (rule) =>
      rule.gradeGroups.includes(gradeGroup) &&
      isTopicOpen(rule, allUnlockRules, scoreMap) &&
      topics.some((topic) => topic.id === rule.topicId && topic.playable),
  );
  const topic = topics.find((topic) => topic.id === recommendation?.topicId && topic.playable);
  return {
    topic: topic ?? topics.find((item) => item.id === fallback?.topicId),
    reason: topic && recommendation ? recommendation.reason : "missing-evidence",
    review: topic && recommendation?.kind === "review",
  };
}

/** Called at onboarding or explicit recovery, never while reading existing evidence. */
export function initialiseRecommendationEvidence(
  topics: TopicSummary[],
  profile: LearnerProfile,
  state: LearnerState,
): LearnerState {
  const mastery = { ...state.mastery };
  for (const topic of topics)
    for (const concept of topic.concepts) {
      if (mastery[concept] === undefined) mastery[concept] = initialMastery(profile.experience);
    }
  return { ...state, mastery };
}
