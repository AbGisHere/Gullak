import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { CurriculumBrief, TopicMeta, UnlockRule } from "@gullak/types";
import { MockLanguageModelV3 } from "ai/test";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  buildLessonDraftCacheKey,
  buildLessonGenerationRequest,
  createLessonDraftGenerator,
  createModel,
  generateLessonDraft,
} from "./index";

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

describe("cache-key integration with approved briefs (offline)", () => {
  it.each(cases)(
    "prepares and invalidates $topicId / $format keys from pinned source bytes",
    async ({ topicId, format }) => {
      const caller = input(topicId, format);
      const before = structuredClone(caller);
      const bytes = readFileSync(new URL(`../../content/topics/${topicId}/en.json`, import.meta.url));
      const contentVersion = createHash("sha256").update(bytes).digest("hex");
      // Constructing the provider object never calls the network; no credentials are read.
      const model = createModel("google", { GOOGLE_GENERATIVE_AI_API_KEY: "synthetic-test-key" });
      const modelIdentity = { provider: model.provider, modelId: model.modelId };
      const request = buildLessonGenerationRequest(caller);
      const key = await buildLessonDraftCacheKey({ request, model: modelIdentity, contentVersion });
      expect(key).toMatch(/^lesson-draft:v1:[a-f0-9]{64}$/);
      expect(caller).toEqual(before);

      const changedBrief = buildLessonGenerationRequest({
        ...caller,
        brief: { ...caller.brief, learningGoals: [...caller.brief.learningGoals, "Synthetic extra learning goal."] },
      });
      expect(await buildLessonDraftCacheKey({ request: changedBrief, model: modelIdentity, contentVersion })).not.toBe(
        key,
      );

      // Whitespace-only source edits must invalidate exact-byte versions too.
      const changedContentVersion = createHash("sha256").update(bytes).update("\n").digest("hex");
      expect(
        await buildLessonDraftCacheKey({ request, model: modelIdentity, contentVersion: changedContentVersion }),
      ).not.toBe(key);
    },
  );
});

function sdkGenerator(fixture: unknown) {
  const model = new MockLanguageModelV3({
    doGenerate: {
      content: [{ type: "text", text: JSON.stringify(fixture) }],
      finishReason: { unified: "stop", raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 20, text: 20, reasoning: undefined },
      },
      warnings: [],
    },
  });
  return { model, generate: createLessonDraftGenerator(model) };
}

describe("structured-provider draft pipeline (offline synthetic responses)", () => {
  it.each(cases)("validates $topicId / $format after real SDK parsing", async ({ topicId, format, concepts }) => {
    const caller = input(topicId, format);
    const before = structuredClone(caller);
    const { model, generate } = sdkGenerator(output(topicId, format, concepts));
    const result = await generateLessonDraft(caller, generate);
    expect(result).toMatchObject({
      topicId,
      gradeGroup: "grade-8-10",
      locale: "en",
      reviewStatus: "draft",
      variant: { format, conceptIds: concepts, audience: ["grade-8-10"] },
    });
    expect(caller).toEqual(before);
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it.each(cases)(
    "rejects structurally valid foreign concepts in $topicId / $format",
    async ({ topicId, format, concepts }) => {
      const fixture = output(topicId, format, concepts);
      fixture.variant.conceptIds.push("foreign-test-concept");
      await expect(generateLessonDraft(input(topicId, format), sdkGenerator(fixture).generate)).rejects.toBeInstanceOf(
        z.ZodError,
      );
    },
  );

  it.each(topics)("rejects a parsed $topicId quiz with missing objective coverage", async ({ topicId, concepts }) => {
    const fixture = output(topicId, "quiz", concepts);
    if (!("questions" in fixture.variant)) throw new Error("quiz fixture must contain questions");
    fixture.variant.questions = fixture.variant.questions.slice(1);
    await expect(generateLessonDraft(input(topicId, "quiz"), sdkGenerator(fixture).generate)).rejects.toBeInstanceOf(
      z.ZodError,
    );
  });

  it.each([{ topicId: "needs-vs-wants" }, { locale: "hi" }, { gradeGroup: "grade-6-7" }])(
    "rejects parsed output with mismatched identity",
    async (patch) => {
      const fixture = { ...output("money-basics", "transcript", ["money-in", "money-out"]), ...patch };
      await expect(
        generateLessonDraft(input("money-basics", "transcript"), sdkGenerator(fixture).generate),
      ).rejects.toBeInstanceOf(z.ZodError);
    },
  );

  it("rejects a structurally valid but unrequested format", async () => {
    const fixture = output("money-basics", "audio", ["money-in", "money-out"]);
    await expect(
      generateLessonDraft(input("money-basics", "transcript"), sdkGenerator(fixture).generate),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(["transcript", "story", "audio"] as const)("screens advice after SDK parsing of %s", async (format) => {
    const fixture = output("money-basics", format, ["money-in", "money-out"]);
    const unsafe = "You should buy shares.";
    const fields = {
      transcript: { markdown: unsafe },
      story: { panels: [{ id: "unsafe-panel", text: unsafe }] },
      audio: { ttsText: unsafe },
    };
    const unsafeFixture = { ...fixture, variant: { ...fixture.variant, ...fields[format] } };
    await expect(
      generateLessonDraft(input("money-basics", format), sdkGenerator(unsafeFixture).generate),
    ).rejects.toBeInstanceOf(z.ZodError);
  });
});
