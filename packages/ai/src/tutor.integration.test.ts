import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { GradeGroup, TopicContent } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkLearnerQuestion, checkModelOutput } from "./guardrails";
import { findTutorExcerpt, prepareTutorRequest } from "./tutor";
import approved from "./tutor-approved-english.json";

const root = new URL("../../../", import.meta.url);
const PreparedPayload = z
  .object({
    question: z.string(),
    locale: z.literal("en"),
    gradeGroup: GradeGroup,
    sources: z.array(
      z
        .object({
          text: z.string(),
          citation: z
            .object({
              topicId: z.string(),
              locale: z.literal("en"),
              variantId: z.string(),
              field: z.string(),
              contentVersion: z.string(),
              path: z.string(),
              release: z.string(),
              gitRef: z.string(),
            })
            .strict(),
        })
        .strict(),
    ),
  })
  .strict();

function sourceInput(topicId: string, question = "Explain this topic", gradeGroup = "grade-8-10") {
  const source = approved.sources.find((item) => item.topicId === topicId);
  if (!source) throw new Error(`missing test source: ${topicId}`);
  const sourceBytes = readFileSync(new URL(source.path, root));
  return { topicId, question, gradeGroup, locale: "en", contentVersion: source.sha256, sourceBytes };
}

describe("exact v0.2.12 English grounding integration", () => {
  it("covers the pinned English source set without additional editorial permissions", () => {
    const topics = new URL("packages/content/topics/", root);
    const paths = readdirSync(topics, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `packages/content/topics/${entry.name}/en.json`)
      .sort();
    expect(approved.sources.map((source) => source.path).sort()).toEqual(paths);
    expect(new Set(approved.sources.map((source) => source.topicId)).size).toBe(paths.length);
    expect(approved.sources.every((source) => source.locale === "en")).toBe(true);
  });

  it.each(approved.sources)("accepts exact English $topicId bytes for each existing grade", async (source) => {
    const input = sourceInput(source.topicId);
    expect(createHash("sha256").update(input.sourceBytes).digest("hex")).toBe(source.sha256);
    const content = TopicContent.parse(JSON.parse(input.sourceBytes.toString("utf8")));
    const transcript = content.variants.find((variant) => variant.format === "transcript");
    if (transcript?.format !== "transcript") throw new Error("expected pinned transcript");
    for (const gradeGroup of GradeGroup.options) {
      const result = await prepareTutorRequest({ ...input, gradeGroup });
      expect(result.status).toBe("ready");
      if (result.status !== "ready") throw new Error(`unavailable source: ${source.topicId}`);
      const payload = PreparedPayload.parse(JSON.parse(result.request.prompt));
      expect(payload.sources).toEqual([
        {
          text: transcript.markdown,
          citation: {
            topicId: source.topicId,
            locale: "en",
            variantId: transcript.id,
            field: "markdown",
            contentVersion: source.sha256,
            path: source.path,
            release: "v0.2.12",
            gitRef: "fddbdeb6464576d5e207f47c1f098827a1dc75ef",
          },
        },
      ]);
      expect(result.request.prompt).not.toContain("correctOptionId");
      expect(result.request.prompt).not.toContain('"questions"');
      expect(result.request.system).not.toContain(transcript.markdown);
      expect(checkModelOutput(payload.sources[0]?.text ?? "").allowed).toBe(true);
    }
  });

  it.each([
    ["money-basics", "Explain pocket money"],
    ["fixed-deposit", "Explain fixed deposit"],
    ["stocks", "Explain share price"],
    ["too-good-to-be-true", "Explain pressure secrecy"],
    ["upi-and-phishing-scams", "Explain UPI PIN"],
  ])("retains complete teaching context for %s", async (topicId, question) => {
    const input = sourceInput(topicId, question);
    const content = TopicContent.parse(JSON.parse(input.sourceBytes.toString("utf8")));
    const transcript = content.variants.find((variant) => variant.format === "transcript");
    if (transcript?.format !== "transcript") throw new Error("expected transcript");
    const result = await findTutorExcerpt(input);
    expect(result.status).toBe("excerpt");
    if (result.status !== "excerpt") throw new Error(`unavailable excerpt: ${topicId}`);
    expect(result.excerpt).toBe(transcript.markdown);
    expect(result.citation.contentVersion).toBe(input.contentVersion);
    expect(checkModelOutput(result.excerpt).allowed).toBe(true);
  });

  it("rejects newly hashed edited English instead of granting it editorial approval", async () => {
    const input = sourceInput("money-basics");
    const edited = Buffer.from(input.sourceBytes.toString("utf8").replace("pocket money", "You should buy this fund"));
    const request = {
      ...input,
      sourceBytes: edited,
      contentVersion: createHash("sha256").update(edited).digest("hex"),
    };
    expect(await prepareTutorRequest(request)).toEqual({ status: "unavailable", reason: "unapproved-content" });
    expect(await findTutorExcerpt(request)).toEqual({ status: "unavailable", reason: "unapproved-content" });
  });

  it("rejects the unapproved Candy teaching file even under its money-basics topic", async () => {
    // Read bytes only; never import app code or execute Candy gameplay.
    const sourceBytes = readFileSync(new URL("apps/web/lib/candy-economy-lesson.ts", root));
    const request = {
      ...sourceInput("money-basics"),
      sourceBytes,
      contentVersion: createHash("sha256").update(sourceBytes).digest("hex"),
    };
    expect(await prepareTutorRequest(request)).toEqual({ status: "unavailable", reason: "unapproved-content" });
    expect(await findTutorExcerpt(request)).toEqual({ status: "unavailable", reason: "unapproved-content" });
  });

  it.each(["hi", "te"])("keeps %s excluded from both helpers", async (locale) => {
    const request = { ...sourceInput("money-basics"), locale };
    expect(await prepareTutorRequest(request)).toEqual({ status: "unavailable", reason: "unsupported-locale" });
    expect(await findTutorExcerpt(request)).toEqual({ status: "unavailable", reason: "unsupported-locale" });
  });

  it.each([
    "Should I buy Reliance shares?",
    "Which mutual fund should I pick for SIP?",
    "best stocks to buy this week",
  ])("applies existing advice guardrails to %s", async (question) => {
    expect(checkLearnerQuestion(question).allowed).toBe(false);
    const request = sourceInput("stocks", question);
    expect(await prepareTutorRequest(request)).toEqual({ status: "unavailable", reason: "investment-advice" });
    expect(await findTutorExcerpt(request)).toEqual({ status: "unavailable", reason: "investment-advice" });
  });

  it("keeps returned excerpt mutations from changing later citations or editorial permissions", async () => {
    const input = sourceInput("money-basics", "Explain pocket money");
    const first = await findTutorExcerpt(input);
    if (first.status !== "excerpt") throw new Error("expected first excerpt");
    const original = structuredClone(first);
    first.excerpt = "synthetic mutated result";
    first.citation.contentVersion = "a".repeat(64);
    first.provenance.matchedTerms.push("synthetic");
    expect(await findTutorExcerpt(input)).toEqual(original);
  });

  it.each([new Uint8Array(), new Uint8Array(262_145)])(
    "rejects absent or oversized source bytes",
    async (sourceBytes) => {
      const request = { ...sourceInput("money-basics"), sourceBytes };
      expect(await prepareTutorRequest(request)).toEqual({ status: "unavailable", reason: "invalid-request" });
      expect(await findTutorExcerpt(request)).toEqual({ status: "unavailable", reason: "invalid-request" });
    },
  );
});
