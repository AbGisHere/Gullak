import { type GradeGroup, NextRecommendation, type UnlockRule } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { recommendNext } from "./index";

function topic(
  topicId: string,
  conceptIds: string[],
  requiresTopicIds: string[] = [],
  gradeGroups: GradeGroup[] = ["grade-8-10"],
) {
  const rule: UnlockRule = {
    topicId,
    pillar: "plan-and-budget",
    gradeGroups,
    requiresTopicIds,
    passMark: 0.6,
    unlocksInstruments: [],
    unlocksActivityIds: [],
  };
  return { ...rule, conceptIds };
}

function fixture() {
  return {
    gradeGroup: "grade-8-10",
    topics: [
      topic("money-basics", ["money-in", "money-out"]),
      topic("needs-vs-wants", ["needs", "wants"]),
      topic("budgeting", ["budget"], ["money-basics"]),
      topic("saving", ["save"], ["needs-vs-wants"]),
    ],
    progress: {} as Record<string, number>,
    mastery: {
      "money-basics": { "money-in": 0.8, "money-out": 0.8 },
      "needs-vs-wants": { needs: 0.9, wants: 0.9 },
      budgeting: { budget: 0.1 },
      saving: { save: 0.1 },
    } as Record<string, Record<string, number>>,
  };
}

describe("recommendNext", () => {
  it("starts with the first unpassed foundation in graph order", () => {
    expect(recommendNext(fixture())).toEqual({ kind: "topic", topicId: "money-basics", reason: "foundation-topic" });
  });

  it("reviews the weakest concept in a passed topic before an open lesson", () => {
    const input = fixture();
    input.progress = { "money-basics": 0.6, "needs-vs-wants": 0.7 };
    input.mastery["money-basics"] = { "money-in": 0.4, "money-out": 0.2 };
    input.mastery["needs-vs-wants"] = { needs: 0.1, wants: 0.9 };
    expect(recommendNext(input)).toEqual({
      kind: "review",
      topicId: "needs-vs-wants",
      conceptId: "needs",
      reason: "weak-concept",
    });
  });

  it("breaks equal weak-concept ties by graph order then authored concept order", () => {
    const input = fixture();
    input.progress = { "money-basics": 1, "needs-vs-wants": 1 };
    input.mastery["money-basics"] = { "money-out": 0.2, "money-in": 0.2 };
    input.mastery["needs-vs-wants"] = { needs: 0.2, wants: 0.2 };
    expect(recommendNext(input)).toEqual({
      kind: "review",
      topicId: "money-basics",
      conceptId: "money-in",
      reason: "weak-concept",
    });
  });

  it.each([0, 0.599999])("treats mastery %s as weak", (value) => {
    const input = fixture();
    input.progress = { "money-basics": 1 };
    input.mastery["money-basics"] = { "money-in": value, "money-out": 1 };
    expect(recommendNext(input)?.reason).toBe("weak-concept");
  });

  it.each([0.6, 0.95, 1])("does not prioritise mastery %s as weak", (value) => {
    const input = fixture();
    input.progress = { "money-basics": 1 };
    input.mastery["money-basics"] = { "money-in": value, "money-out": 1 };
    expect(recommendNext(input)).toEqual({ kind: "topic", topicId: "needs-vs-wants", reason: "foundation-topic" });
  });

  it("does not review weak concepts in an unpassed topic", () => {
    const input = fixture();
    input.mastery["money-basics"] = { "money-in": 0.1, "money-out": 0.1 };
    expect(recommendNext(input)?.kind).toBe("topic");
  });

  it("ranks open topics by prerequisite mastery rather than own mastery", () => {
    const input = fixture();
    input.progress = { "money-basics": 1, "needs-vs-wants": 1 };
    input.mastery.budgeting = { budget: 1 };
    expect(recommendNext(input)).toEqual({ kind: "topic", topicId: "saving", reason: "prerequisite-readiness" });
  });

  it("averages every prerequisite concept, not per-topic averages", () => {
    const input = fixture();
    input.topics = [
      topic("money-basics", ["money-in", "money-out"]),
      topic("needs-vs-wants", ["needs"]),
      topic("saving", ["save"]),
      topic("budgeting", ["budget"], ["money-basics", "needs-vs-wants"]),
      topic("other", ["other"], ["saving"]),
    ];
    input.progress = { "money-basics": 1, "needs-vs-wants": 1, saving: 1 };
    input.mastery = {
      "money-basics": { "money-in": 0.6, "money-out": 0.6 },
      "needs-vs-wants": { needs: 1 },
      saving: { save: 0.75 },
      budgeting: { budget: 0.1 },
      other: { other: 0.1 },
    };
    // (0.6 + 0.6 + 1) / 3 = 0.7333, below 0.75; mean of topic means would pick budgeting.
    expect(recommendNext(input)?.topicId).toBe("other");
  });

  it("uses graph order for equally ready topics", () => {
    const input = fixture();
    input.progress = { "money-basics": 1, "needs-vs-wants": 1 };
    input.mastery["needs-vs-wants"] = { needs: 0.8, wants: 0.8 };
    expect(recommendNext(input)?.topicId).toBe("budgeting");
  });

  it("never unlocks a topic from high mastery when its prerequisite quiz is not passed", () => {
    const input = fixture();
    input.progress = { "money-basics": 0.59, "needs-vs-wants": 1, saving: 1 };
    input.mastery["money-basics"] = { "money-in": 1, "money-out": 1 };
    input.mastery.saving = { save: 0.8 };
    expect(recommendNext(input)?.topicId).toBe("money-basics");
  });

  it("filters other-grade lessons and reviews", () => {
    const input = fixture();
    input.topics[0] = topic("money-basics", ["money-in", "money-out"], [], ["grade-6-7", "grade-8-10"]);
    input.topics.push(topic("advanced", ["advanced"], [], ["grade-11-12"]));
    input.mastery.advanced = { advanced: 0 };
    input.progress.advanced = 1;
    expect(recommendNext(input)?.topicId).toBe("money-basics");
  });

  it("reviews the passed topic with the lowest mean mastery when no unfinished topic is open", () => {
    const input = fixture();
    input.progress = { "money-basics": 1, "needs-vs-wants": 1, budgeting: 1, saving: 1 };
    input.mastery.budgeting = { budget: 0.7 };
    input.mastery.saving = { save: 0.75 };
    expect(recommendNext(input)).toEqual({
      kind: "review",
      topicId: "budgeting",
      conceptId: "budget",
      reason: "all-open-topics-passed",
    });
  });

  it("returns null if there is no lesson or passed topic for this grade", () => {
    const input = fixture();
    input.gradeGroup = "grade-11-12";
    expect(recommendNext(input)).toBeNull();
    expect(recommendNext({ gradeGroup: "grade-8-10", topics: [], progress: {}, mastery: {} })).toBeNull();
  });

  it("does not mutate caller state and is repeatable", () => {
    const input = fixture();
    const before = structuredClone(input);
    const result = recommendNext(input);
    expect(recommendNext(input)).toEqual(result);
    expect(input).toEqual(before);
  });

  it.each([-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY, "0.8"])("rejects invalid mastery %s", (value) => {
    const input = fixture();
    expect(() => recommendNext({ ...input, mastery: { ...input.mastery, saving: { save: value } } })).toThrow();
  });

  it("rejects missing mastery rather than silently resetting a learner's prior", () => {
    const input = fixture();
    delete input.mastery.saving;
    expect(() => recommendNext(input)).toThrow();
  });

  it("rejects a missing concept even when the topic has another mastery value", () => {
    const input = fixture();
    input.mastery["money-basics"] = { "money-in": 0.8 };
    expect(() => recommendNext(input)).toThrow(/missing concept mastery/);
  });

  it.each([
    { requiresTopicIds: ["unknown"], message: /unknown prerequisite/ },
    { requiresTopicIds: ["money-basics"], message: /prerequisite cycle/ },
    { requiresTopicIds: ["needs-vs-wants", "needs-vs-wants"], message: /prerequisite ids/ },
  ])("rejects malformed prerequisites $requiresTopicIds", ({ requiresTopicIds, message }) => {
    const input = fixture();
    input.topics[0] = { ...topic("money-basics", ["money-in", "money-out"]), requiresTopicIds };
    expect(() => recommendNext(input)).toThrow(message);
  });

  it("rejects a multi-topic cycle", () => {
    const input = fixture();
    input.topics[0] = topic("money-basics", ["money-in", "money-out"], ["budgeting"]);
    expect(() => recommendNext(input)).toThrow(/prerequisite cycle/);
  });

  it("rejects prerequisites unavailable to the child's grade", () => {
    const input = fixture();
    input.topics[0] = topic("money-basics", ["money-in", "money-out"], [], ["grade-6-7"]);
    expect(() => recommendNext(input)).toThrow(/grade groups/);
  });

  it("breaks completed-review ties by graph and authored concept order", () => {
    const input = fixture();
    input.progress = { "money-basics": 1, "needs-vs-wants": 1, budgeting: 1, saving: 1 };
    input.mastery = {
      "money-basics": { "money-out": 0.8, "money-in": 0.8 },
      "needs-vs-wants": { needs: 0.8, wants: 0.8 },
      budgeting: { budget: 0.8 },
      saving: { save: 0.8 },
    };
    expect(recommendNext(input)).toEqual({
      kind: "review",
      topicId: "money-basics",
      conceptId: "money-in",
      reason: "all-open-topics-passed",
    });
  });

  it("rejects ambiguous or unknown content and progress", () => {
    const input = fixture();
    for (const bad of [
      { ...input, topics: [...input.topics, input.topics[0]] },
      { ...input, topics: [topic("money-basics", ["money-in", "money-in"])] },
      { ...input, topics: [topic("money-basics", ["money-in"], ["unknown"])] },
      { ...input, topics: [topic("money-basics", ["money-in"], ["money-basics"])] },
      {
        ...input,
        topics: [
          topic("money-basics", ["money-in"], ["needs-vs-wants"]),
          topic("needs-vs-wants", ["needs"], ["money-basics"]),
        ],
      },
      { ...input, topics: [input.topics[0], topic("needs-vs-wants", ["needs"], ["money-basics", "money-basics"])] },
      {
        ...input,
        topics: [
          topic("money-basics", ["money-in"], [], ["grade-6-7"]),
          topic("needs-vs-wants", ["needs"], ["money-basics"]),
        ],
      },
      { ...input, progress: { unknown: 1 } },
      { ...input, progress: { "money-basics": 1.1 } },
      { ...input, mastery: { ...input.mastery, unknown: { unknown: 1 } } },
      { ...input, mastery: { ...input.mastery, saving: { save: 0.1, unknown: 0.1 } } },
      { ...input, gradeGroup: "adult" },
      { ...input, unlock: true },
    ])
      expect(() => recommendNext(bad)).toThrow();
  });

  it("returns schema-valid metadata without correctness or a learner identity", () => {
    const input = fixture();
    expect(NextRecommendation.parse(recommendNext(input))).toEqual({
      kind: "topic",
      topicId: "money-basics",
      reason: "foundation-topic",
    });
    input.progress = { "money-basics": 1 };
    input.mastery["money-basics"] = { "money-in": 0.1, "money-out": 0.8 };
    expect(NextRecommendation.parse(recommendNext(input))).toEqual({
      kind: "review",
      topicId: "money-basics",
      conceptId: "money-in",
      reason: "weak-concept",
    });
    expect(
      NextRecommendation.safeParse({ kind: "review", topicId: "money-basics", reason: "weak-concept" }).success,
    ).toBe(false);
    expect(
      NextRecommendation.safeParse({
        kind: "topic",
        topicId: "money-basics",
        reason: "foundation-topic",
        learnerId: "private",
      }).success,
    ).toBe(false);
  });
});
