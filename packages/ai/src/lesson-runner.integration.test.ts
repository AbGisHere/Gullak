import { readFileSync } from "node:fs";
import { CurriculumBrief, TopicMeta, UnlockRule } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { generateLessonDraft } from "./index";

// Literal expectations independent of the prompt builder and validator.
const topics = [
  { topicId: "money-basics", concepts: ["money-in", "money-out"] },
  { topicId: "needs-vs-wants", concepts: ["needs", "wants", "depends-on-situation"] },
  { topicId: "emergency-fund", concepts: ["why-emergency-fund", "how-much", "easy-to-reach"] },
  { topicId: "compounding", concepts: ["growth-on-growth", "start-early", "rate-and-time"] },
  { topicId: "upi-and-phishing-scams", concepts: ["pin-only-to-pay", "fake-links-and-calls", "pause-and-check"] },
];
const formats = ["transcript", "story", "audio", "quiz"] as const;
type Format = (typeof formats)[number];
const cases = topics.flatMap((topic) => formats.map((format) => ({ ...topic, format })));

function readContent(path: string): unknown {
  return JSON.parse(readFileSync(new URL(`../../content/${path}`, import.meta.url), "utf8"));
}

function input(topicId: string, format: Format) {
  const brief = CurriculumBrief.parse(readContent(`briefs/${topicId}/grade-8-10.en.json`));
  const meta = TopicMeta.parse(readContent(`topics/${topicId}/topic.json`));
  const graph = z.object({ topics: z.array(UnlockRule) }).parse(readContent("config/topic-graph.json"));
  const locales = z
    .object({ locales: z.array(z.object({ code: z.string() })) })
    .parse(readContent("config/locales.json"));
  return {
    brief,
    context: {
      meta,
      rule: graph.topics.find((rule) => rule.topicId === topicId),
      supportedLocales: locales.locales.map((locale) => locale.code),
    },
    format,
  };
}

// Provider-output fixtures only, not authored teaching content or approved quizzes.
function output(topicId: string, format: Format, concepts: string[]) {
  const fields = {
    transcript: { markdown: "Synthetic integration fixture. All money is virtual." },
    story: { panels: [{ id: "test-panel", text: "Synthetic integration fixture. All money is virtual." }] },
    audio: { ttsText: "Synthetic integration fixture. All money is virtual." },
    quiz: {
      questions: concepts.map((conceptId, index) => ({
        id: `test-question-${index}`,
        conceptId,
        prompt: "Synthetic test question, not learner content.",
        options: [
          { id: "test-a", text: "Synthetic option A" },
          { id: "test-b", text: "Synthetic option B" },
        ],
        correctOptionId: "test-a",
        explanation: "Synthetic answer-key fixture, not a reviewed assessment.",
      })),
    },
  };
  return {
    schemaVersion: 1,
    reviewStatus: "draft",
    topicId,
    gradeGroup: "grade-8-10",
    locale: "en",
    variant: {
      id: `${topicId}-test-${format}`,
      audience: ["grade-8-10"],
      conceptIds: [...concepts],
      format,
      ...fields[format],
    },
  };
}

describe("approved-brief draft pipeline (offline synthetic outputs)", () => {
  it.each(cases)("runs $topicId / $format through request preparation and draft validation", async (testCase) => {
    const { topicId, format, concepts } = testCase;
    const caller = input(topicId, format);
    const before = structuredClone(caller);
    const fixture = output(topicId, format, concepts);
    const fixtureBefore = structuredClone(fixture);
    const result = await generateLessonDraft(caller, async (request) => {
      expect(request).toMatchObject({ topicId, format, gradeGroup: "grade-8-10", locale: "en" });
      expect(JSON.parse(request.prompt)).toMatchObject({
        canonicalConceptIds: concepts,
        outputEnvelope: { topicId, reviewStatus: "draft" },
        variantRequirements: { format, conceptIds: concepts },
      });
      return fixture;
    });
    expect(result).toMatchObject({
      topicId,
      gradeGroup: "grade-8-10",
      locale: "en",
      reviewStatus: "draft",
      variant: { format, conceptIds: concepts, audience: ["grade-8-10"] },
    });
    expect(caller).toEqual(before);
    expect(fixture).toEqual(fixtureBefore);
  });

  it.each(cases)("rejects a foreign concept from $topicId / $format output", async ({ topicId, format, concepts }) => {
    const fixture = output(topicId, format, concepts);
    fixture.variant.conceptIds.push("foreign-test-concept");
    await expect(generateLessonDraft(input(topicId, format), async () => fixture)).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(topics)("rejects a $topicId quiz that omits an approved objective", async ({ topicId, concepts }) => {
    const fixture = output(topicId, "quiz", concepts);
    if (!("questions" in fixture.variant)) throw new Error("quiz fixture must contain questions");
    // Retain every declared concept but omit its actual assessment evidence.
    const incomplete = { ...fixture, variant: { ...fixture.variant, questions: fixture.variant.questions.slice(1) } };
    await expect(generateLessonDraft(input(topicId, "quiz"), async () => incomplete)).rejects.toBeInstanceOf(
      z.ZodError,
    );
  });
});
