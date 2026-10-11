import { LearningFormat, type TopicVariant } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { pickLessonVariant, variantsForGrade } from "./index";

const story: TopicVariant = {
  id: "comic",
  format: "story",
  conceptIds: [],
  panels: [{ id: "one", text: "Money comes in and goes out." }],
};
const transcript: TopicVariant = { id: "read", format: "transcript", conceptIds: [], markdown: "Lesson" };
const audio: TopicVariant = { id: "listen", format: "audio", conceptIds: [], ttsText: "Lesson" };
const quiz: TopicVariant = {
  id: "check",
  format: "quiz",
  conceptIds: [],
  questions: [
    {
      id: "one",
      conceptId: "saving",
      prompt: "Q",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "a",
      explanation: "Answer",
    },
  ],
};
const base = { gradeGroup: "grade-8-10", variants: [transcript, story, audio, quiz] };

describe("preference-first lesson picker", () => {
  it("chooses the first available preference rather than content order", () => {
    expect(pickLessonVariant({ ...base, preferredFormats: ["audio", "story"] })).toEqual({
      status: "selected",
      variantId: "listen",
      format: "audio",
      reason: "preferred-format",
    });
  });
  it("tries the next preference when the first format is missing", () => {
    expect(pickLessonVariant({ ...base, preferredFormats: ["video", "story"] })).toMatchObject({
      variantId: "comic",
      reason: "preferred-format",
    });
  });
  it("filters grade-restricted variants before matching preferences", () => {
    expect(
      pickLessonVariant({
        ...base,
        preferredFormats: ["story", "audio"],
        variants: [{ ...story, audience: ["grade-11-12"] }, audio],
      }),
    ).toMatchObject({ variantId: "listen" });
  });
  it.each(["grade-6-7", "grade-8-10", "grade-11-12"])("accepts unrestricted content for %s", (gradeGroup) => {
    expect(pickLessonVariant({ ...base, gradeGroup, preferredFormats: ["story"] })).toMatchObject({
      variantId: "comic",
    });
  });
  it("does not treat an empty audience as unrestricted", () => {
    expect(pickLessonVariant({ ...base, variants: [{ ...story, audience: [] }] })).toEqual({
      status: "unavailable",
      reason: "no-eligible-variant",
    });
  });
  it("falls back to the first eligible non-quiz variant in authored order", () => {
    expect(pickLessonVariant({ ...base, preferredFormats: ["video"] })).toEqual({
      status: "selected",
      variantId: "read",
      format: "transcript",
      reason: "fallback-format",
    });
  });
  it("keeps assessment quizzes out of lesson recommendations even when preferred", () => {
    expect(pickLessonVariant({ ...base, preferredFormats: ["quiz", "audio"] })).toMatchObject({ variantId: "listen" });
  });
  it("returns an explicit unavailable result for quiz-only content", () => {
    expect(pickLessonVariant({ ...base, variants: [quiz], preferredFormats: ["quiz"] })).toEqual({
      status: "unavailable",
      reason: "no-eligible-variant",
    });
  });
  it("returns an explicit unavailable result for empty content", () => {
    expect(pickLessonVariant({ ...base, variants: [] })).toEqual({
      status: "unavailable",
      reason: "no-eligible-variant",
    });
  });
  it("returns unavailable rather than serving a different grade", () => {
    expect(pickLessonVariant({ ...base, variants: [{ ...story, audience: ["grade-11-12"] }] })).toMatchObject({
      status: "unavailable",
    });
  });
  it.each(
    [undefined, [], [...LearningFormat.options], [...LearningFormat.options].reverse()].map((preferredFormats) => ({
      preferredFormats,
    })),
  )("recognises omitted, skipped and onboarding mixed preferences: $preferredFormats", ({ preferredFormats }) => {
    expect(pickLessonVariant({ ...base, preferredFormats, selectionIndex: 1 })).toEqual({
      status: "selected",
      variantId: "comic",
      format: "story",
      reason: "mixed-format",
    });
  });
  it.each([
    [0, "read"],
    [1, "comic"],
    [2, "listen"],
    [3, "read"],
  ])("rotates mixed formats with caller-owned index %i", (selectionIndex, variantId) => {
    expect(pickLessonVariant({ ...base, selectionIndex })).toMatchObject({ variantId });
  });
  it("rotates formats, not variants, so multiple stories do not overweight story", () => {
    expect(
      pickLessonVariant({
        ...base,
        variants: [story, { ...story, id: "comic-two" }, audio],
        selectionIndex: 1,
      }),
    ).toMatchObject({ variantId: "listen" });
  });
  it("ignores the rotation index for explicit preferences", () => {
    expect(
      pickLessonVariant({ ...base, preferredFormats: ["audio", "audio", "story"], selectionIndex: 10 }),
    ).toMatchObject({ variantId: "listen", reason: "preferred-format" });
  });
  it("does not return quiz answers or full lesson content in the selection", () => {
    expect(Object.keys(pickLessonVariant({ ...base, preferredFormats: ["story"] })).sort()).toEqual([
      "format",
      "reason",
      "status",
      "variantId",
    ]);
  });
  it.each([
    { gradeGroup: "teen" },
    { preferredFormats: ["unknown"] },
    { selectionIndex: -1 },
    { selectionIndex: 1.5 },
    { selectionIndex: Number.NaN },
    { selectionIndex: Number.POSITIVE_INFINITY },
    { selectionIndex: Number.MAX_SAFE_INTEGER + 1 },
    { variants: [{ ...audio, ttsText: "" }] },
    { variants: [story, { ...audio, id: story.id }] },
  ])("rejects invalid boundary input: %j", (invalid) => {
    expect(() => pickLessonVariant({ ...base, ...invalid })).toThrow(expect.objectContaining({ name: "ZodError" }));
  });
  it("is repeatable and does not mutate caller-owned content or preferences", () => {
    const input = { ...base, preferredFormats: ["audio", "story"] };
    const before = structuredClone(input);
    Object.freeze(input.variants);
    Object.freeze(input.preferredFormats);
    expect(pickLessonVariant(input)).toEqual(pickLessonVariant(input));
    expect(input).toEqual(before);
  });
});

describe("variantsForGrade", () => {
  const general = { id: "read", format: "transcript" };
  const young = { id: "read-young", format: "transcript", audience: ["grade-6-7"] as const };
  const quiz = { id: "check", format: "quiz" };
  const youngQuiz = { id: "check-young", format: "quiz", audience: ["grade-6-7"] as const };
  const all = [general, quiz, young, youngQuiz];

  it("replaces general versions with the class group's own, format by format", () => {
    expect(variantsForGrade(all, "grade-6-7").map((v) => v.id)).toEqual(["read-young", "check-young"]);
  });

  it("keeps general versions for groups without their own", () => {
    expect(variantsForGrade(all, "grade-8-10").map((v) => v.id)).toEqual(["read", "check"]);
  });

  it("keeps a general format when only another format is tailored", () => {
    expect(variantsForGrade([general, quiz, youngQuiz], "grade-6-7").map((v) => v.id)).toEqual(["read", "check-young"]);
  });
});
