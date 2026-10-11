import { APICallError, NoObjectGeneratedError } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { describe, expect, it } from "vitest";
import { createLessonDraftGenerator } from "./index";
import type { LessonGenerationRequest } from "./lesson-generation";
import { LESSON_DRAFT_PROMPT } from "./prompts/lesson-draft";

// Synthetic teaching output, never approved content or real learner evidence.
const draft = {
  schemaVersion: 1,
  reviewStatus: "draft",
  topicId: "money-basics",
  gradeGroup: "grade-8-10",
  locale: "en",
  variant: {
    id: "money-transcript",
    format: "transcript",
    conceptIds: ["money-in"],
    audience: ["grade-8-10"],
    markdown: "A gift adds virtual money.",
  },
};
const request: LessonGenerationRequest = {
  promptId: "lesson-draft",
  promptVersion: 1,
  topicId: "money-basics",
  gradeGroup: "grade-8-10",
  locale: "en",
  format: "transcript",
  system: LESSON_DRAFT_PROMPT.system,
  prompt: '{"example":"a gift"}',
};

function response(text: string) {
  return {
    content: [{ type: "text" as const, text }],
    finishReason: { unified: "stop" as const, raw: undefined },
    usage: {
      inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
      outputTokens: { total: 20, text: 20, reasoning: undefined },
    },
    warnings: [],
  };
}

describe("createLessonDraftGenerator", () => {
  it("parses structured output with the real SDK and preserves prompt trust boundaries", async () => {
    const model = new MockLanguageModelV3({ doGenerate: response(JSON.stringify(draft)) });
    const before = structuredClone(request);
    const result = await createLessonDraftGenerator(model)(request);
    expect(result).toEqual(draft);
    expect(request).toEqual(before);
    expect(model.doGenerateCalls).toHaveLength(1);
    expect(model.doGenerateCalls[0]).toMatchObject({
      prompt: [
        { role: "system", content: request.system },
        { role: "user", content: [{ type: "text", text: '{"example":"a gift"}' }] },
      ],
      responseFormat: { type: "json" },
    });
  });

  it.each([
    "not json",
    JSON.stringify({ ...draft, reviewStatus: "approved" }),
    JSON.stringify({ ...draft, publish: true }),
    JSON.stringify({ ...draft, variant: { ...draft.variant, markdown: "<img src='asset'>" } }),
    JSON.stringify({ ...draft, variant: { ...draft.variant, audience: ["grade-8-10", "grade-6-7"] } }),
  ])("rejects malformed or non-draft structured output without repair", async (text) => {
    const model = new MockLanguageModelV3({ doGenerate: response(text) });
    await expect(createLessonDraftGenerator(model)(request)).rejects.toBeInstanceOf(NoObjectGeneratedError);
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it("propagates retryable provider failures without extra requests", async () => {
    const error = new APICallError({
      message: "Synthetic quota failure",
      url: "https://example.invalid/generate",
      requestBodyValues: undefined,
      statusCode: 429,
      isRetryable: true,
    });
    const model = new MockLanguageModelV3({
      doGenerate: async () => {
        throw error;
      },
    });
    await expect(createLessonDraftGenerator(model)(request)).rejects.toBe(error);
    expect(model.doGenerateCalls).toHaveLength(1);
  });
});
