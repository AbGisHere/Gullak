import { describe, expect, it } from "vitest";
import { CurriculumBrief, CurriculumBriefContext } from "./index";

// Engineering fixture only: not approved teaching material and never published.
const draft = {
  schemaVersion: 1,
  reviewStatus: "draft",
  topicId: "money-basics",
  gradeGroup: "grade-8-10",
  locale: "en",
  learningGoals: ["Distinguish money coming in from money going out."],
  keyIdeas: [{ conceptId: "money-in", explanation: "Pocket money is an example of money coming in." }],
  misconceptions: [{ misconception: "All incoming money must be spent.", correction: "Some can be kept aside." }],
  examples: ["A fictional student receives pocket money and buys stationery."],
  quizObjectives: [{ conceptId: "money-out", objective: "Identify a purchase as money going out." }],
};
const context = {
  meta: {
    id: "money-basics",
    pillar: "plan-and-budget",
    instrument: null,
    concepts: [{ id: "money-in", label: "Money in" }],
    estimatedMinutes: 3,
  },
  rule: { topicId: "money-basics", pillar: "plan-and-budget", gradeGroups: ["grade-8-10"] },
  supportedLocales: ["en", "hi", "te"],
};
const lists = ["learningGoals", "keyIdeas", "misconceptions", "examples", "quizObjectives"] as const;

describe("curriculum brief contracts", () => {
  it("accepts a draft without marking it reviewed", () => {
    const parsed = CurriculumBrief.parse(draft);
    expect(parsed.reviewStatus).toBe("draft");
    expect(parsed.topicId).toBe("money-basics");
  });
  it("trims all teaching text without modifying the caller", () => {
    const input = {
      ...draft,
      learningGoals: ["  Learn money in.  "],
      keyIdeas: [{ conceptId: "money-in", explanation: "  A gift.  " }],
      misconceptions: [{ misconception: "  Spend all.  ", correction: "  Keep some.  " }],
      examples: ["  A gift.  "],
      quizObjectives: [{ conceptId: "money-in", objective: "  Identify a gift.  " }],
    };
    const before = structuredClone(input);
    expect(CurriculumBrief.parse(input)).toMatchObject({
      learningGoals: ["Learn money in."],
      keyIdeas: [{ explanation: "A gift." }],
      misconceptions: [{ misconception: "Spend all.", correction: "Keep some." }],
      examples: ["A gift."],
      quizObjectives: [{ objective: "Identify a gift." }],
    });
    expect(input).toEqual(before);
  });
  it.each(Object.keys(draft))("requires the %s field", (field) => {
    expect(CurriculumBrief.safeParse({ ...draft, [field]: undefined }).success).toBe(false);
  });
  it.each(lists)("bounds the %s list at 1–12 items", (field) => {
    const entry = draft[field][0];
    expect(CurriculumBrief.safeParse({ ...draft, [field]: [] }).success).toBe(false);
    expect(CurriculumBrief.safeParse({ ...draft, [field]: Array(12).fill(entry) }).success).toBe(true);
    expect(CurriculumBrief.safeParse({ ...draft, [field]: Array(13).fill(entry) }).success).toBe(false);
  });
  it.each([
    { field: "learningGoals", item: (text: string) => text },
    { field: "examples", item: (text: string) => text },
    { field: "keyIdeas", item: (text: string) => ({ conceptId: "money-in", explanation: text }) },
    { field: "misconceptions", item: (text: string) => ({ misconception: text, correction: "Correct" }) },
    { field: "misconceptions", item: (text: string) => ({ misconception: "Mistake", correction: text }) },
    { field: "quizObjectives", item: (text: string) => ({ conceptId: "money-in", objective: text }) },
  ])("bounds teaching text in $field", ({ field, item }) => {
    expect(CurriculumBrief.safeParse({ ...draft, [field]: [item("x".repeat(600))] }).success).toBe(true);
    expect(CurriculumBrief.safeParse({ ...draft, [field]: [item("x".repeat(601))] }).success).toBe(false);
    expect(CurriculumBrief.safeParse({ ...draft, [field]: [item(" \t\n ")] }).success).toBe(false);
  });
  it("bounds topic and concept identifiers without accepting malformed slugs", () => {
    for (const id of ["x".repeat(80), "x".repeat(81), "Money In", ""]) {
      const expected = id === "x".repeat(80);
      expect(CurriculumBrief.safeParse({ ...draft, topicId: id }).success).toBe(expected);
      expect(CurriculumBrief.safeParse({ ...draft, keyIdeas: [{ conceptId: id, explanation: "Idea" }] }).success).toBe(
        expected,
      );
      expect(
        CurriculumBrief.safeParse({ ...draft, quizObjectives: [{ conceptId: id, objective: "Objective" }] }).success,
      ).toBe(expected);
    }
  });
  it.each([
    { schemaVersion: 2 },
    { reviewStatus: "approved" },
    { gradeGroup: "teen" },
    { locale: "English" },
    { learnerId: "private" },
    { apiKey: "not-a-real-key" },
    { householdIncome: 100 },
    { generatedVideoUrl: "https://example.com" },
    { keyIdeas: [{ ...draft.keyIdeas[0], learnerId: "private" }] },
    { misconceptions: [{ ...draft.misconceptions[0], approved: true }] },
    { quizObjectives: [{ ...draft.quizObjectives[0], correctOptionId: "a" }] },
  ])("rejects incorrect literals and unexpected metadata: %j", (change) => {
    expect(CurriculumBrief.safeParse({ ...draft, ...change }).success).toBe(false);
  });
  it("accepts canonical context and applies existing rule defaults", () => {
    expect(CurriculumBriefContext.parse(context).rule.requiresTopicIds).toEqual([]);
  });
  it.each([
    { supportedLocales: [] },
    { supportedLocales: ["English"] },
    { learnerId: "private" },
    { meta: { ...context.meta, concepts: [context.meta.concepts[0], context.meta.concepts[0]] } },
    { rule: { ...context.rule, gradeGroups: [] } },
  ])("rejects malformed or ambiguous context: %j", (change) => {
    expect(CurriculumBriefContext.safeParse({ ...context, ...change }).success).toBe(false);
  });
});
