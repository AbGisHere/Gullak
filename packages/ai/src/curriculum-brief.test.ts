import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { validateCurriculumBrief } from "./index";

// Offline engineering fixture, not R5-approved curriculum or generated content.
const draft = {
  schemaVersion: 1,
  reviewStatus: "draft",
  topicId: "money-basics",
  gradeGroup: "grade-8-10",
  locale: "en",
  learningGoals: ["Distinguish money coming in from money going out."],
  keyIdeas: [{ conceptId: "money-in", explanation: "Gifts are examples of money coming in." }],
  misconceptions: [{ misconception: "All incoming money must be spent.", correction: "Some can be kept aside." }],
  examples: ["A fictional learner buys stationery using pocket money."],
  quizObjectives: [{ conceptId: "money-out", objective: "Identify a purchase as money going out." }],
};
const context = {
  meta: {
    id: "money-basics",
    pillar: "plan-and-budget",
    instrument: null,
    estimatedMinutes: 3,
    concepts: [
      { id: "money-in", label: "Money in" },
      { id: "money-out", label: "Money out" },
    ],
  },
  rule: { topicId: "money-basics", pillar: "plan-and-budget", gradeGroups: ["grade-8-10"] },
  supportedLocales: ["en", "hi", "te"],
};

function issuePaths(input: unknown, suppliedContext: unknown) {
  try {
    validateCurriculumBrief(input, suppliedContext);
  } catch (error) {
    if (error instanceof ZodError) return error.issues.map((issue) => issue.path);
    throw error;
  }
  throw new Error("expected a validation failure");
}

describe("offline curriculum validation", () => {
  it("returns a validated draft and applies text normalization", () => {
    expect(validateCurriculumBrief({ ...draft, learningGoals: ["  Identify money in.  "] }, context)).toEqual({
      ...draft,
      learningGoals: ["Identify money in."],
    });
  });
  it("validates other topics without hard-coded topic identifiers", () => {
    const other = {
      ...context,
      meta: { ...context.meta, id: "another-topic" },
      rule: { ...context.rule, topicId: "another-topic" },
    };
    expect(validateCurriculumBrief({ ...draft, topicId: "another-topic" }, other).topicId).toBe("another-topic");
  });
  it("accepts a new supported locale supplied by the caller", () => {
    expect(validateCurriculumBrief({ ...draft, locale: "ta" }, { ...context, supportedLocales: ["ta"] }).locale).toBe(
      "ta",
    );
  });
  it("rejects a brief for a different topic with a useful issue path", () => {
    expect(issuePaths({ ...draft, topicId: "unknown-topic" }, context)).toContainEqual(["brief", "topicId"]);
  });
  it("rejects disagreement between canonical metadata and the graph rule", () => {
    expect(issuePaths(draft, { ...context, rule: { ...context.rule, topicId: "another-topic" } })).toContainEqual([
      "brief",
      "topicId",
    ]);
  });
  it("rejects metadata identity mismatch even when the graph matches the brief", () => {
    expect(issuePaths(draft, { ...context, meta: { ...context.meta, id: "another-topic" } })).toContainEqual([
      "brief",
      "topicId",
    ]);
  });
  it("rejects canonical pillar disagreement", () => {
    expect(issuePaths(draft, { ...context, rule: { ...context.rule, pillar: "stay-safe" } })).toContainEqual([
      "context",
      "rule",
      "pillar",
    ]);
  });
  it("rejects a valid grade not taught by the topic", () => {
    expect(issuePaths({ ...draft, gradeGroup: "grade-11-12" }, context)).toContainEqual(["brief", "gradeGroup"]);
  });
  it("rejects a valid locale absent from the supported list", () => {
    expect(issuePaths({ ...draft, locale: "ta" }, context)).toContainEqual(["brief", "locale"]);
  });
  it("identifies each unknown key-idea concept without silently dropping it", () => {
    const paths = issuePaths(
      {
        ...draft,
        keyIdeas: [
          { conceptId: "unknown", explanation: "Idea" },
          { conceptId: "other", explanation: "Idea" },
        ],
      },
      context,
    );
    expect(paths).toContainEqual(["brief", "keyIdeas", 0, "conceptId"]);
    expect(paths).toContainEqual(["brief", "keyIdeas", 1, "conceptId"]);
  });
  it("identifies an unknown quiz-objective concept", () => {
    expect(
      issuePaths({ ...draft, quizObjectives: [{ conceptId: "unknown", objective: "Objective" }] }, context),
    ).toContainEqual(["brief", "quizObjectives", 0, "conceptId"]);
  });
  it.each([
    { input: null, suppliedContext: context },
    { input: draft, suppliedContext: null },
    { input: { ...draft, reviewStatus: "approved" }, suppliedContext: context },
    { input: { ...draft, learnerId: "private" }, suppliedContext: context },
    { input: draft, suppliedContext: { ...context, supportedLocales: [] } },
    {
      input: draft,
      suppliedContext: {
        ...context,
        meta: { ...context.meta, concepts: [context.meta.concepts[0], context.meta.concepts[0]] },
      },
    },
  ])("rejects malformed briefs and context: %j", ({ input, suppliedContext }) => {
    expect(() => validateCurriculumBrief(input, suppliedContext)).toThrow(ZodError);
  });
  it("is repeatable and does not change caller-owned inputs", () => {
    const input = structuredClone(draft);
    const suppliedContext = structuredClone(context);
    const before = structuredClone({ input, suppliedContext });
    Object.freeze(input);
    Object.freeze(input.learningGoals);
    Object.freeze(suppliedContext);
    Object.freeze(suppliedContext.supportedLocales);
    expect(validateCurriculumBrief(input, suppliedContext)).toEqual(validateCurriculumBrief(input, suppliedContext));
    expect({ input, suppliedContext }).toEqual(before);
  });
});
