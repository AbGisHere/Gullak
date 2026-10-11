import { type NextRecommendation, RecommendationRequest } from "@gullak/types";
import { availableTopics, isTopicCompleted, topicsForGrade } from "./unlock";

/**
 * Suggest education, never products. Mastery ranks; only quiz pass marks unlock.
 * No state updates, network, model artifacts or framework dependencies.
 */
export function recommendNext(input: unknown): NextRecommendation {
  const { gradeGroup, topics, progress, mastery } = RecommendationRequest.parse(input);
  const scores = new Map(Object.entries(progress).map(([id, bestQuizScore]) => [id, { bestQuizScore }]));
  const eligible = topicsForGrade(topics, gradeGroup);
  const byId = new Map(topics.map((topic) => [topic.topicId, topic]));
  const values = (topicId: string): number[] => {
    const topic = byId.get(topicId)!;
    return topic.conceptIds.map((id) => mastery[topicId]![id]!);
  };
  const mean = (items: number[]): number => items.reduce((sum, value) => sum + value, 0) / items.length;
  const passed = eligible.filter((topic) => isTopicCompleted(topic, scores));

  let weak: NextRecommendation = null;
  let weakest = 0.6;
  for (const rule of passed) {
    for (const conceptId of byId.get(rule.topicId)!.conceptIds) {
      const probability = mastery[rule.topicId]![conceptId]!;
      if (probability < weakest) {
        weakest = probability;
        weak = { kind: "review", topicId: rule.topicId, conceptId, reason: "weak-concept" };
      }
    }
  }
  if (weak) return weak;

  let next: NextRecommendation = null;
  let highestReadiness = -1;
  for (const topic of availableTopics(topics, scores, gradeGroup)) {
    const readiness = topic.requiresTopicIds.length === 0 ? 1 : mean(topic.requiresTopicIds.flatMap(values));
    if (readiness > highestReadiness) {
      highestReadiness = readiness;
      next = {
        kind: "topic",
        topicId: topic.topicId,
        reason: topic.requiresTopicIds.length === 0 ? "foundation-topic" : "prerequisite-readiness",
      };
    }
  }
  if (next) return next;

  let review: NextRecommendation = null;
  let lowestMean = Number.POSITIVE_INFINITY;
  for (const rule of passed) {
    const average = mean(values(rule.topicId));
    if (average < lowestMean) {
      lowestMean = average;
      const concepts = byId.get(rule.topicId)!.conceptIds;
      const conceptId = concepts.reduce((lowest, id) =>
        mastery[rule.topicId]![id]! < mastery[rule.topicId]![lowest]! ? id : lowest,
      );
      review = { kind: "review", topicId: rule.topicId, conceptId, reason: "all-open-topics-passed" };
    }
  }
  return review;
}
