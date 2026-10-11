import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { generateLessonDraft } from "./index";
import type { LessonGenerationRequest } from "./lesson-generation";

function input(format = "transcript") {
  return {
    format,
    brief: {
      schemaVersion: 1,
      reviewStatus: "draft",
      topicId: "money-basics",
      gradeGroup: "grade-8-10",
      locale: "en",
      learningGoals: ["Identify money coming in."],
      keyIdeas: [{ conceptId: "money-in", explanation: "A gift adds money." }],
      misconceptions: [{ misconception: "Money must be spent.", correction: "It can be saved." }],
      examples: ["Meena receives a gift."],
      quizObjectives: [{ conceptId: "money-in", objective: "Identify a gift." }],
    },
    context: {
      meta: {
        id: "money-basics",
        pillar: "plan-and-budget",
        instrument: null,
        estimatedMinutes: 3,
        concepts: [{ id: "money-in", label: "Money in" }],
      },
      rule: { topicId: "money-basics", pillar: "plan-and-budget", gradeGroups: ["grade-8-10"] },
      supportedLocales: ["en"],
    },
  };
}
function draft(format = "transcript") {
  const fields: Record<string, Record<string, unknown>> = {
    transcript: { markdown: "A gift is money coming in." },
    story: { panels: [{ id: "gift", text: "Meena receives a gift." }] },
    audio: { ttsText: "A gift is money coming in." },
    quiz: {
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
      ],
    },
  };
  return {
    schemaVersion: 1,
    reviewStatus: "draft",
    topicId: "money-basics",
    gradeGroup: "grade-8-10",
    locale: "en",
    variant: { id: "money-lesson", format, conceptIds: ["money-in"], audience: ["grade-8-10"], ...fields[format] },
  };
}

describe("generateLessonDraft", () => {
  it.each(["transcript", "story", "audio", "quiz"])(
    "returns a validated %s draft after one generation call",
    async (format) => {
      let calls = 0;
      const result = await generateLessonDraft(input(format), async (request: LessonGenerationRequest) => {
        calls++;
        expect(request).toMatchObject({
          topicId: "money-basics",
          locale: "en",
          gradeGroup: "grade-8-10",
          format,
          promptId: "lesson-draft",
          promptVersion: 1,
        });
        expect(JSON.parse(request.prompt)).toMatchObject({ outputEnvelope: { reviewStatus: "draft" } });
        return draft(format);
      });
      expect(result).toEqual(draft(format));
      expect(calls).toBe(1);
    },
  );
  it("validates inputs before invoking the generator", async () => {
    let calls = 0;
    await expect(
      generateLessonDraft({ ...input(), format: "video" }, async () => {
        calls++;
        return draft();
      }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(calls).toBe(0);
  });
  it.each([{ topicId: "other-topic" }, { gradeGroup: "grade-6-7" }, { locale: "hi" }, { reviewStatus: "approved" }])(
    "rejects changed output identity or status",
    async (patch) => {
      await expect(generateLessonDraft(input(), async () => ({ ...draft(), ...patch }))).rejects.toBeInstanceOf(
        ZodError,
      );
    },
  );
  it("rejects a valid but unrequested format", async () => {
    await expect(generateLessonDraft(input(), async () => draft("audio"))).rejects.toBeInstanceOf(ZodError);
  });
  it.each([null, "{bad json", { success: true }, { ...draft(), publish: true }])(
    "rejects malformed output",
    async (output) => {
      await expect(generateLessonDraft(input(), async () => output)).rejects.toBeInstanceOf(ZodError);
    },
  );
  it("does not retry provider failures", async () => {
    let calls = 0;
    const error = new Error("Generator unavailable");
    await expect(
      generateLessonDraft(input(), async () => {
        calls++;
        throw error;
      }),
    ).rejects.toBe(error);
    expect(calls).toBe(1);
  });
  it("rejects advice and invalid quiz answer keys through the existing validator", async () => {
    await expect(
      generateLessonDraft(input(), async () => ({
        ...draft(),
        variant: { ...draft().variant, markdown: "You should buy shares." },
      })),
    ).rejects.toBeInstanceOf(ZodError);
    const quiz = draft("quiz");
    await expect(
      generateLessonDraft(input("quiz"), async () => ({
        ...quiz,
        variant: {
          ...quiz.variant,
          questions: [
            {
              id: "gift",
              conceptId: "money-in",
              prompt: "Which?",
              options: [
                { id: "a", text: "Gift" },
                { id: "b", text: "Fare" },
              ],
              correctOptionId: "missing",
              explanation: "A gift adds money.",
            },
          ],
        },
      })),
    ).rejects.toBeInstanceOf(ZodError);
  });
  it("pins validation context before awaiting the generator", async () => {
    const caller = input();
    const original = structuredClone(caller);
    const result = await generateLessonDraft(caller, async () => {
      caller.brief.locale = "hi";
      caller.context.meta.concepts[0]!.id = "unknown";
      await Promise.resolve();
      return draft();
    });
    expect(result.locale).toBe(original.brief.locale);
    expect(result.variant.conceptIds).toEqual(["money-in"]);
  });
});
