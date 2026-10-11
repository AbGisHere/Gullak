import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { allUnlockRules } from "./config";
import { loadTopic, loadVersionedTopic } from "./topic-loader";

const directory = fileURLToPath(new URL("../topics/", import.meta.url));
describe("server topic loader", () => {
  it("pins grading to the exact content bytes rather than reserialized JSON", async () => {
    const { topic, contentVersion } = await loadVersionedTopic(directory, "fixed-deposit", "en");
    const bytes = readFileSync(resolve(directory, "fixed-deposit/en.json"));
    expect(contentVersion).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(contentVersion).not.toBe(createHash("sha256").update(JSON.stringify(topic.content)).digest("hex"));
  });
  const topicIds = readdirSync(directory, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  it.each(topicIds)("validates %s English draft including its answer key", async (id) => {
    const topic = await loadTopic(directory, id, "en");
    const rule = allUnlockRules.find((r) => r.topicId === id);
    expect(rule, `${id} is in the topic graph`).toBeDefined();
    expect(topic.meta.pillar).toBe(rule?.pillar);
  });
  it("rejects path traversal before file access", async () => {
    await expect(loadTopic(directory, "../../secrets", "en")).rejects.toThrow();
  });
  it("does not pretend an absent translation exists", async () => {
    await expect(loadTopic(directory, "fixed-deposit", "hi")).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe("class-group versions", () => {
  const topicIds = readdirSync(directory, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  it.each(topicIds)("%s has a lesson and a quiz for every class group it is open to", async (id) => {
    const topic = await loadTopic(directory, id, "en");
    const rule = allUnlockRules.find((r) => r.topicId === id);
    for (const grade of rule?.gradeGroups ?? []) {
      const visible = topic.content.variants.filter((v) => !v.audience || v.audience.includes(grade));
      expect(
        visible.some((v) => v.format === "quiz"),
        `${id} quiz for ${grade}`,
      ).toBe(true);
      expect(
        visible.some((v) => v.format !== "quiz"),
        `${id} lesson for ${grade}`,
      ).toBe(true);
    }
  });

  it("writes a Class 6–7 and a Class 11–12 version of every lesson open to all classes", async () => {
    const shared = allUnlockRules.filter((r) => r.gradeGroups.length === 3);
    expect(shared.length).toBeGreaterThan(0);
    for (const rule of shared) {
      const topic = await loadTopic(directory, rule.topicId, "en");
      for (const grade of ["grade-6-7", "grade-11-12"] as const) {
        const own = topic.content.variants.filter((v) => v.audience?.includes(grade));
        expect(own.map((v) => v.format).sort(), `${rule.topicId} ${grade}`).toEqual(["quiz", "transcript"]);
      }
    }
  });

  it("versions grading by the stages file too, and leaves topics without one unchanged", async () => {
    const { contentVersion } = await loadVersionedTopic(directory, "compounding", "en");
    const base = readFileSync(resolve(directory, "compounding/en.json"), "utf8");
    const stages = readFileSync(resolve(directory, "compounding/en.stages.json"), "utf8");
    expect(contentVersion).toBe(createHash("sha256").update(base).update("\u0000").update(stages).digest("hex"));
  });
});
