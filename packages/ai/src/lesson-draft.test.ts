import { describe, expect, it } from "vitest";
import { validateLessonDraft } from "./index";

const brief = {
  schemaVersion: 1,
  reviewStatus: "draft",
  topicId: "money-basics",
  gradeGroup: "grade-8-10",
  locale: "en",
  learningGoals: ["Identify incoming and outgoing money."],
  keyIdeas: [
    { conceptId: "money-in", explanation: "A gift adds money." },
    { conceptId: "money-out", explanation: "Bus fare uses money." },
  ],
  misconceptions: [{ misconception: "Only large purchases count.", correction: "Small purchases count too." }],
  examples: ["Meena lists a gift and bus fare."],
  quizObjectives: [
    { conceptId: "money-in", objective: "Identify a gift." },
    { conceptId: "money-out", objective: "Identify a payment." },
  ],
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
function draft() {
  return {
    schemaVersion: 1,
    reviewStatus: "draft",
    topicId: "money-basics",
    gradeGroup: "grade-8-10",
    locale: "en",
    variant: {
      id: "money-quiz",
      format: "quiz",
      audience: ["grade-8-10"],
      conceptIds: ["money-in", "money-out"],
      questions: [
        {
          id: "gift",
          conceptId: "money-in",
          prompt: "Which is money in?",
          options: [
            { id: "a", text: "A gift" },
            { id: "b", text: "Bus fare" },
          ],
          correctOptionId: "a",
          explanation: "A gift adds money.",
        },
        {
          id: "fare",
          conceptId: "money-out",
          prompt: "Which is money out?",
          options: [
            { id: "a", text: "Bus fare" },
            { id: "b", text: "A gift" },
          ],
          correctOptionId: "a",
          explanation: "Bus fare uses money.",
        },
      ],
    },
  };
}

describe("validateLessonDraft", () => {
  it.each([
    { format: "transcript", markdown: "Gifts add money. Bus fare uses money." },
    { format: "audio", ttsText: "A gift comes in; a payment goes out." },
    { format: "story", panels: [{ id: "gift", speaker: "Meena", text: "I received a gift, then paid bus fare." }] },
  ])("accepts safe $format teaching drafts", (content) => {
    const input = {
      ...draft(),
      variant: { id: "reading", audience: ["grade-8-10"], conceptIds: ["money-in", "money-out"], ...content },
    };
    expect(validateLessonDraft(input, brief, context)).toEqual(input);
  });
  it("returns a compatible unreviewed draft without mutating input", () => {
    const input = draft();
    const before = structuredClone(input);
    expect(validateLessonDraft(input, brief, context)).toEqual(before);
    expect(input).toEqual(before);
  });
  it.each([{ topicId: "other-topic" }, { locale: "hi" }, { gradeGroup: "grade-6-7" }])(
    "rejects draft/brief mismatch $topicId $locale $gradeGroup",
    (patch) => {
      expect(() => validateLessonDraft({ ...draft(), ...patch }, brief, context)).toThrow(/match the brief/);
    },
  );
  it("revalidates the brief against canonical metadata", () => {
    expect(() =>
      validateLessonDraft(
        draft(),
        { ...brief, keyIdeas: [{ conceptId: "unknown", explanation: "Unknown." }] },
        context,
      ),
    ).toThrow(/canonical/);
  });
  it("requires the audience to match the draft grade", () => {
    const input = draft();
    input.variant.audience = ["grade-11-12"];
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/audience/);
  });
  it("rejects unknown, duplicate or incomplete concept coverage", () => {
    for (const concepts of [["unknown"], ["money-in", "money-in", "money-out"], ["money-in"]]) {
      const input = draft();
      input.variant.conceptIds = concepts;
      expect(() => validateLessonDraft(input, brief, context)).toThrow(/concept/);
    }
  });
  it("rejects duplicate question ids", () => {
    const input = draft();
    input.variant.questions[1]!.id = "gift";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/question ids/);
  });
  it("rejects duplicate options and nonexistent answer keys", () => {
    const input = draft();
    input.variant.questions[0]!.options[1]!.id = "a";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/option ids/);
    input.variant.questions[0]!.options[1]!.id = "b";
    input.variant.questions[0]!.correctOptionId = "c";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/answer key/);
  });
  it("rejects undeclared question concepts and missed quiz objectives", () => {
    const input = draft();
    input.variant.questions[0]!.conceptId = "unknown";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/question concept/);
    input.variant.questions[0]!.conceptId = "money-out";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/quiz objectives/);
  });
  it.each(["prompt", "explanation"] as const)("screens quiz %s with output guardrails", (field) => {
    const input = draft();
    input.variant.questions[0]![field] = "You should buy shares.";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/investment advice/);
  });
  it("screens option text", () => {
    const input = draft();
    input.variant.questions[0]!.options[0]!.text = "We recommend buying shares.";
    expect(() => validateLessonDraft(input, brief, context)).toThrow(/investment advice/);
  });
  it.each([
    { format: "transcript", markdown: "You should invest in shares." },
    { format: "audio", ttsText: "Stocks offer guaranteed returns." },
    { format: "story", panels: [{ id: "one", text: "We recommend buying shares." }] },
    { format: "story", panels: [{ id: "one", text: "Money in.", speaker: "You should buy shares." }] },
  ])("screens $format teaching text", (content) => {
    const input = draft();
    expect(() =>
      validateLessonDraft(
        {
          ...input,
          variant: { id: "reading", audience: ["grade-8-10"], conceptIds: ["money-in", "money-out"], ...content },
        },
        brief,
        context,
      ),
    ).toThrow(/investment advice/);
  });
  it("rejects duplicate story panel ids", () => {
    const input = draft();
    expect(() =>
      validateLessonDraft(
        {
          ...input,
          variant: {
            id: "reading",
            audience: ["grade-8-10"],
            conceptIds: ["money-in", "money-out"],
            format: "story",
            panels: [
              { id: "one", text: "Money in." },
              { id: "one", text: "Money out." },
            ],
          },
        },
        brief,
        context,
      ),
    ).toThrow(/panel ids/);
  });
});
