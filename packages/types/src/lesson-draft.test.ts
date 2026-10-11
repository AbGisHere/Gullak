import { describe, expect, it } from "vitest";
import { LessonDraft, TopicVariant } from "./index";

function draft(format = "transcript") {
  const base = { id: "money-reading", conceptIds: ["money-in"], audience: ["grade-8-10"] };
  const variants: Record<string, unknown> = {
    transcript: { ...base, format, markdown: "# Money in\nA gift adds to what you have." },
    story: { ...base, format, panels: [{ id: "gift", speaker: "Meena", text: "I received a gift." }] },
    audio: { ...base, format, ttsText: "A gift is money coming in." },
    quiz: {
      ...base,
      format,
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
          explanation: "A gift adds to what you have.",
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
    variant: variants[format],
  };
}

describe("LessonDraft", () => {
  it("accepts ordinary markdown and enforces the transcript length boundary", () => {
    const variant = {
      id: "reading",
      format: "transcript",
      conceptIds: ["money-in"],
      audience: ["grade-8-10"],
      markdown: "x".repeat(6000),
    };
    expect(LessonDraft.safeParse({ ...draft(), variant }).success).toBe(true);
    expect(LessonDraft.safeParse({ ...draft(), variant: { ...variant, markdown: "x".repeat(6001) } }).success).toBe(
      false,
    );
    expect(
      LessonDraft.safeParse({
        ...draft(),
        variant: { ...variant, markdown: "# Money\n\n- **Gifts** add money.\n- Payments use money." },
      }).success,
    ).toBe(true);
  });
  it("rejects overlong quiz options and extra nested fields", () => {
    const question = {
      id: "gift",
      conceptId: "money-in",
      prompt: "Which is money in?",
      options: [
        { id: "a", text: "x".repeat(121) },
        { id: "b", text: "Bus fare" },
      ],
      correctOptionId: "a",
      explanation: "A gift adds money.",
    };
    const variant = {
      id: "quiz",
      format: "quiz",
      conceptIds: ["money-in"],
      audience: ["grade-8-10"],
      questions: [question],
    };
    expect(LessonDraft.safeParse({ ...draft(), variant }).success).toBe(false);
    expect(
      LessonDraft.safeParse({
        ...draft(),
        variant: {
          ...variant,
          questions: [
            {
              ...question,
              options: [
                { id: "a", text: "Gift", imageUrl: "image.png" },
                { id: "b", text: "Bus fare" },
              ],
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
  it.each(["transcript", "story", "audio", "quiz"])("accepts %s using the existing renderer schema", (format) => {
    const result = LessonDraft.parse(draft(format));
    expect(result.reviewStatus).toBe("draft");
    expect(TopicVariant.parse(result.variant)).toEqual(result.variant);
  });
  it("rejects published status and unknown envelope fields", () => {
    expect(LessonDraft.safeParse({ ...draft(), reviewStatus: "approved" }).success).toBe(false);
    expect(LessonDraft.safeParse({ ...draft(), publish: true }).success).toBe(false);
  });
  it.each([
    { format: "video", url: "https://example.com/video", durationSec: 10 },
    { format: "audio", ttsText: "Money in", url: "https://example.com/audio" },
    { format: "story", panels: [{ id: "one", text: "Gift", imageUrl: "image.png" }] },
    { format: "story", panels: [{ id: "one", text: "x".repeat(301) }] },
    { format: "transcript", markdown: "![image](image.png)" },
    { format: "transcript", markdown: "<iframe src='https://example.com'></iframe>" },
    { format: "audio", ttsText: "<audio>Money</audio>" },
    { format: "quiz", questions: [] },
  ])("rejects unsupported media or invalid text: $format", (variant) => {
    expect(
      LessonDraft.safeParse({
        ...draft(),
        variant: { id: "reading", conceptIds: ["money-in"], audience: ["grade-8-10"], ...variant },
      }).success,
    ).toBe(false);
  });
  it("requires explicit concepts and exactly one audience", () => {
    const variant = { id: "reading", format: "transcript", markdown: "Money in." };
    expect(LessonDraft.safeParse({ ...draft(), variant }).success).toBe(false);
    expect(
      LessonDraft.safeParse({ ...draft(), variant: { ...variant, conceptIds: ["money-in"], audience: [] } }).success,
    ).toBe(false);
  });
});
