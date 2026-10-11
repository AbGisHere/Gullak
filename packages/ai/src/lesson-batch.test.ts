import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { CurriculumBrief, CurriculumBriefContext } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as ai from "./index";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(new URL(`../../content/${path}`, import.meta.url), "utf8"));
}

function batchJob(topicId = "money-basics") {
  const graph = z
    .object({ topics: z.array(z.object({ topicId: z.string() }).passthrough()) })
    .parse(readJson("config/topic-graph.json"));
  const bytes = new Uint8Array(readFileSync(new URL(`../../content/topics/${topicId}/en.json`, import.meta.url)));
  return {
    id: `prepare-${topicId}`,
    brief: CurriculumBrief.parse(readJson(`briefs/${topicId}/grade-8-10.en.json`)),
    context: CurriculumBriefContext.parse({
      meta: readJson(`topics/${topicId}/topic.json`),
      rule: graph.topics.find((rule) => rule.topicId === topicId),
      supportedLocales: ["en", "hi", "te"],
    }),
    formats: ["story", "quiz"] as string[],
    model: { provider: "synthetic-offline", modelId: "fixture-model-v1" },
    source: { bytes, sha256: createHash("sha256").update(bytes).digest("hex") },
  };
}

describe("offline lesson batch preparation", () => {
  it("exports the bounded preparer", () => {
    expect(ai).toHaveProperty("prepareLessonBatch", expect.any(Function));
  });

  it("prepares requests and independently reproducible keys in caller order", async () => {
    const first = batchJob("needs-vs-wants");
    const second = batchJob();
    second.formats = ["audio"];
    const input = { jobs: [first, second] };
    const before = structuredClone(input);
    const manifest = await ai.prepareLessonBatch(input);
    expect(manifest).toMatchObject({ schemaVersion: 1, keyVersion: 1, status: "prepared-only" });
    expect(manifest.jobs.map((job) => [job.id, job.request.topicId, job.request.format])).toEqual([
      ["prepare-needs-vs-wants", "needs-vs-wants", "story"],
      ["prepare-needs-vs-wants", "needs-vs-wants", "quiz"],
      ["prepare-money-basics", "money-basics", "audio"],
    ]);
    for (const job of manifest.jobs) {
      const source = job.request.topicId === "money-basics" ? second : first;
      expect(job.contentVersion).toBe(source.source.sha256);
      expect(job.model).toEqual(source.model);
      expect(job.key).toBe(
        await ai.buildLessonDraftCacheKey({
          request: ai.buildLessonGenerationRequest({
            brief: source.brief,
            context: source.context,
            format: job.request.format,
          }),
          model: source.model,
          contentVersion: source.source.sha256,
        }),
      );
    }
    expect(await ai.prepareLessonBatch(input)).toEqual(manifest);
    expect(input).toEqual(before);
    expect(JSON.stringify(manifest)).not.toContain('"bytes"');
  });

  it("rejects a forged syntactically valid source hash", async () => {
    const job = batchJob();
    job.source.sha256 = "a".repeat(64);
    await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(["brief", "context", "source"])(
    "rejects unapproved %s changes under an approved topic slug",
    async (kind) => {
      const job = batchJob();
      if (kind === "brief") job.brief.learningGoals.push("Synthetic unapproved learning goal.");
      if (kind === "context") job.context.meta.estimatedMinutes += 1;
      if (kind === "source") {
        job.source.bytes = new Uint8Array([...job.source.bytes, 10]);
        job.source.sha256 = createHash("sha256").update(job.source.bytes).digest("hex");
      }
      await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
    },
  );

  it.each(["malformed-json", "invalid-topic", "wrong-topic", "wrong-locale", "invalid-utf8"])(
    "rejects verified source bytes with %s",
    async (kind) => {
      const job = batchJob();
      const source = JSON.parse(new TextDecoder().decode(job.source.bytes));
      if (kind === "invalid-topic") source.variants = [];
      if (kind === "wrong-topic") source.topicId = "needs-vs-wants";
      if (kind === "wrong-locale") source.locale = "hi";
      job.source.bytes =
        kind === "invalid-utf8"
          ? new Uint8Array([255])
          : new TextEncoder().encode(kind === "malformed-json" ? "{broken" : JSON.stringify(source));
      job.source.sha256 = createHash("sha256").update(job.source.bytes).digest("hex");
      await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
    },
  );

  it.each([
    { formats: ["video"] },
    { formats: [] },
    { formats: ["quiz", "quiz"] },
    { id: "" },
    { model: { provider: " ", modelId: "fixture-model-v1" } },
    { model: { provider: "synthetic-offline", modelId: "fixture-model-v1", secret: "test-only" } },
    { learnerId: "synthetic-private-field" },
  ])("rejects invalid job fields %j", async (patch) => {
    await expect(ai.prepareLessonBatch({ jobs: [{ ...batchJob(), ...patch }] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(["hi", "te", "grade-6-7", "candy-economy"])("rejects scope expansion %s", async (kind) => {
    const job = batchJob();
    if (kind.startsWith("grade")) job.brief.gradeGroup = "grade-6-7";
    else if (kind === "candy-economy") job.brief.topicId = kind;
    else job.brief.locale = kind;
    await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it("rejects metadata unknown fields without silently removing them", async () => {
    const job = batchJob();
    await expect(
      ai.prepareLessonBatch({
        jobs: [
          {
            ...job,
            context: {
              ...job.context,
              meta: { ...job.context.meta, learnerId: "synthetic-private-field" },
            },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(["id", "brief", "context", "formats", "model", "source"])("rejects a job missing %s", async (field) => {
    const incomplete = Object.fromEntries(Object.entries(batchJob()).filter(([key]) => key !== field));
    await expect(ai.prepareLessonBatch({ jobs: [incomplete] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it.each(["foreign-concept", "ineligible-grade", "mismatched-pillar", "unsupported-locale"])(
    "reuses request-builder semantic rejection for %s",
    async (kind) => {
      const job = batchJob();
      if (kind === "foreign-concept") {
        const idea = job.brief.keyIdeas[0];
        if (!idea) throw new Error("fixture key idea missing");
        idea.conceptId = "foreign-synthetic-concept";
      }
      if (kind === "ineligible-grade") job.context.rule.gradeGroups = ["grade-6-7"];
      if (kind === "mismatched-pillar") job.context.meta.pillar = "stay-safe";
      if (kind === "unsupported-locale") job.context.supportedLocales = ["hi"];
      await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
    },
  );

  it("rejects duplicate job ids even when their topic identities differ", async () => {
    const first = batchJob();
    const second = batchJob("compounding");
    second.id = first.id;
    await expect(ai.prepareLessonBatch({ jobs: [first, second] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it("rejects repeated topic-grade-locale-format identities under different ids", async () => {
    const first = batchJob();
    const second = { ...batchJob(), id: "another-job" };
    await expect(ai.prepareLessonBatch({ jobs: [first, second] })).rejects.toBeInstanceOf(z.ZodError);
  });

  it("rejects empty and oversized batches and oversized source bytes", async () => {
    await expect(ai.prepareLessonBatch({ jobs: [] })).rejects.toBeInstanceOf(z.ZodError);
    await expect(ai.prepareLessonBatch({ jobs: Array.from({ length: 6 }, () => batchJob()) })).rejects.toBeInstanceOf(
      z.ZodError,
    );
    const job = batchJob();
    job.source.bytes = new Uint8Array(524289);
    await expect(ai.prepareLessonBatch({ jobs: [job] })).rejects.toBeInstanceOf(z.ZodError);
    await expect(ai.prepareLessonBatch({ jobs: [batchJob()], execute: () => undefined })).rejects.toBeInstanceOf(
      z.ZodError,
    );
  });

  it("snapshots nested input and byte views before awaiting hashes", async () => {
    const job = batchJob();
    // A Buffer is a Uint8Array subclass whose slice shares memory.
    const buffer = Buffer.from(job.source.bytes);
    job.source.bytes = buffer.subarray(0);
    const promise = ai.prepareLessonBatch({ jobs: [job] });
    job.brief.learningGoals[0] = "Synthetic caller mutation after invocation.";
    const concept = job.context.meta.concepts[0];
    if (!concept) throw new Error("fixture concept missing");
    concept.id = "synthetic-mutation";
    job.formats[0] = "audio";
    job.model.modelId = "mutated-model";
    buffer.fill(0);
    const manifest = await promise;
    expect(manifest.jobs.map((entry) => entry.request.format)).toEqual(["story", "quiz"]);
    expect(manifest.jobs[0]?.model.modelId).toBe("fixture-model-v1");
    expect(manifest.jobs[0]?.request.prompt).not.toContain("Synthetic caller mutation");
    expect(manifest.jobs[0]?.request.prompt).not.toContain("synthetic-mutation");
  });
});
