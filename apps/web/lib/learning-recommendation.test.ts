import { readFileSync } from "node:fs";
import { allUnlockRules } from "@gullak/content";
import { describe, expect, it } from "vitest";
import type { TopicSummary } from "../components/learn-map";
import type { LearnerState } from "./learner-state";
import { learningRecommendation } from "./learning-recommendation";

const topics: TopicSummary[] = allUnlockRules.map((rule) => {
  const meta = JSON.parse(
    readFileSync(new URL(`../../../packages/content/topics/${rule.topicId}/topic.json`, import.meta.url), "utf8"),
  );
  return {
    id: rule.topicId,
    title: rule.topicId,
    summary: "",
    pillar: rule.pillar,
    concepts: meta.concepts.map((c: { id: string }) => c.id),
    playable: true,
  };
});
const empty: LearnerState = { mastery: {}, quizAttempts: [], passedTopics: [], practiceCashPaise: 0, activities: [] };

describe("learningRecommendation", () => {
  it("keeps missing evidence explicit without changing it or opening a gated lesson", () => {
    const result = learningRecommendation(topics, "grade-6-7", empty);
    expect(result.reason).toBe("missing-evidence");
    expect(result.topic?.id).toBe("money-basics");
    expect(empty.mastery).toEqual({});
  });
  it("uses engine foundation and review reasons with complete saved evidence", () => {
    const mastery = Object.fromEntries(topics.flatMap((topic) => topic.concepts.map((id) => [id, 0.3])));
    const state = { ...empty, mastery };
    expect(learningRecommendation(topics, "grade-6-7", state).reason).toBe("foundation-topic");
    state.quizAttempts = [{ topicId: "money-basics", score: 1, at: "2026-10-11T12:00:00Z" }];
    expect(learningRecommendation(topics, "grade-6-7", state)).toMatchObject({ reason: "weak-concept", review: true });
  });
});
