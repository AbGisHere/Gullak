import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CurriculumBrief, TopicMeta } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { allUnlockRules, locales } from "./config";

// Mirrors @gullak/ai validateCurriculumBrief's context checks; content may only depend on types.
const briefsDir = fileURLToPath(new URL("../briefs/", import.meta.url));
const topicsDir = fileURLToPath(new URL("../topics/", import.meta.url));
const files = readdirSync(briefsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(`${briefsDir}${d.name}`).map((file) => `${d.name}/${file}`));

describe("curriculum briefs", () => {
  it.each(files)("%s is a valid draft for its topic", (path) => {
    const [topicId, file] = path.split("/");
    const brief = CurriculumBrief.parse(JSON.parse(readFileSync(`${briefsDir}${path}`, "utf8")));
    expect(brief.topicId).toBe(topicId);
    expect(file).toBe(`${brief.gradeGroup}.${brief.locale}.json`);
    const meta = TopicMeta.parse(JSON.parse(readFileSync(`${topicsDir}${topicId}/topic.json`, "utf8")));
    const rule = allUnlockRules.find((r) => r.topicId === topicId);
    expect(rule?.pillar).toBe(meta.pillar);
    expect(rule?.gradeGroups).toContain(brief.gradeGroup);
    expect(locales.locales.map((l) => l.code)).toContain(brief.locale);
    const concepts = new Set(meta.concepts.map((c) => c.id));
    for (const { conceptId } of [...brief.keyIdeas, ...brief.quizObjectives]) expect(concepts).toContain(conceptId);
    // Every concept the topic teaches is covered by a key idea.
    expect(new Set(brief.keyIdeas.map((k) => k.conceptId))).toEqual(concepts);
  });
});
