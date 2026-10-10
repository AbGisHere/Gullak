import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { allUnlockRules } from "./config";
import { loadTopic } from "./topic-loader";

const directory = fileURLToPath(new URL("../topics/", import.meta.url));
describe("server topic loader", () => {
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
