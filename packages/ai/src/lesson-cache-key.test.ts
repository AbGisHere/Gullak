import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { buildLessonDraftCacheKey } from "./index";

function input() {
  return {
    contentVersion: "a".repeat(64),
    model: { provider: "google.generative-ai", modelId: "gemini-test" },
    request: {
      promptId: "lesson-draft",
      promptVersion: 1,
      topicId: "money-basics",
      gradeGroup: "grade-8-10",
      locale: "en",
      format: "transcript",
      system: "Teach with virtual money.",
      prompt: '{"brief":"synthetic"}',
    },
  };
}

describe("buildLessonDraftCacheKey", () => {
  it("returns a deterministic namespaced SHA-256 key without mutating inputs", async () => {
    const caller = input();
    const before = structuredClone(caller);
    const key = await buildLessonDraftCacheKey(caller);
    // Independently calculated SHA-256 of the documented fixed-order tuple.
    expect(key).toBe("lesson-draft:v1:b32a095681e8586d6a54509161df4d1fabbdeb487ae43c440cb46896782ec8e2");
    expect(key).toMatch(/^lesson-draft:v1:[a-f0-9]{64}$/);
    expect(await buildLessonDraftCacheKey(input())).toBe(key);
    expect(caller).toEqual(before);
    expect(key).not.toContain("gemini-test");
    expect(key).not.toContain("money-basics");
  });

  it.each([
    { promptId: "lesson-draft-next" },
    { promptVersion: 2 },
    { topicId: "needs-vs-wants" },
    { gradeGroup: "grade-6-7" },
    { locale: "hi" },
    { format: "story" },
    { system: "Different versioned instructions." },
    { prompt: '{"brief":"changed"}' },
  ])("invalidates when a request field changes", async (patch) => {
    expect(await buildLessonDraftCacheKey({ ...input(), request: { ...input().request, ...patch } })).not.toBe(
      await buildLessonDraftCacheKey(input()),
    );
  });

  it.each([{ provider: "groq.chat" }, { modelId: "gemini-other" }])(
    "invalidates when model identity changes",
    async (patch) => {
      expect(await buildLessonDraftCacheKey({ ...input(), model: { ...input().model, ...patch } })).not.toBe(
        await buildLessonDraftCacheKey(input()),
      );
    },
  );

  it("invalidates when the pinned source content changes", async () => {
    expect(await buildLessonDraftCacheKey({ ...input(), contentVersion: "b".repeat(64) })).not.toBe(
      await buildLessonDraftCacheKey(input()),
    );
  });

  it("ignores object insertion order but preserves exact prompt bytes", async () => {
    const caller = input();
    const reordered = {
      request: Object.fromEntries(Object.entries(caller.request).reverse()),
      model: { modelId: "gemini-test", provider: "google.generative-ai" },
      contentVersion: caller.contentVersion,
    };
    const key = await buildLessonDraftCacheKey(caller);
    expect(await buildLessonDraftCacheKey(reordered)).toBe(key);
    expect(
      await buildLessonDraftCacheKey({ ...caller, request: { ...caller.request, prompt: ' {"brief":"synthetic"}' } }),
    ).not.toBe(key);
  });

  it("pins input before awaiting hashing", async () => {
    const caller = input();
    const pending = buildLessonDraftCacheKey(caller);
    caller.request.prompt = "changed after calling";
    caller.model.modelId = "changed-model";
    caller.contentVersion = "b".repeat(64);
    expect(await pending).toBe(await buildLessonDraftCacheKey(input()));
  });

  it.each(["", "A".repeat(64), "g".repeat(64), "a".repeat(63), " a".repeat(32)])(
    "rejects malformed content versions",
    async (contentVersion) => {
      await expect(buildLessonDraftCacheKey({ ...input(), contentVersion })).rejects.toBeInstanceOf(ZodError);
    },
  );

  it.each([
    { provider: "" },
    { provider: "   " },
    { provider: 1 },
    { modelId: "" },
    { modelId: "\t" },
    { modelId: 1 },
    { apiKey: "must-not-enter-key" },
  ])("rejects invalid or extra model identity fields", async (patch) => {
    await expect(
      buildLessonDraftCacheKey({ ...input(), model: { ...input().model, ...patch } }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it.each([
    { promptVersion: 0 },
    { promptVersion: 1.5 },
    { promptVersion: "1" },
    { promptVersion: Number.MAX_SAFE_INTEGER + 1 },
    { promptId: "not a slug" },
    { gradeGroup: "foundation-explorers" },
    { format: "video" },
    { system: "" },
    { prompt: "" },
    { learnerId: "private" },
  ])("rejects malformed or extra request fields", async (patch) => {
    await expect(
      buildLessonDraftCacheKey({ ...input(), request: { ...input().request, ...patch } }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it.each([null, {}, { ...input(), apiKey: "secret" }, { ...input(), contentVersion: undefined }])(
    "rejects incomplete or extra envelopes",
    async (value) => {
      await expect(buildLessonDraftCacheKey(value)).rejects.toBeInstanceOf(ZodError);
    },
  );
});
