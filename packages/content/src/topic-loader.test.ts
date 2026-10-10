import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadTopic } from "./topic-loader";

const directory = fileURLToPath(new URL("../topics/", import.meta.url));
describe("server topic loader", () => {
  it.each(["savings-account", "fixed-deposit"])("validates %s English draft including its answer key", async (id) => {
    expect((await loadTopic(directory, id, "en")).meta.id).toBe(id);
  });
  it("rejects path traversal before file access", async () => {
    await expect(loadTopic(directory, "../../secrets", "en")).rejects.toThrow();
  });
  it("does not pretend an absent translation exists", async () => {
    await expect(loadTopic(directory, "fixed-deposit", "hi")).rejects.toMatchObject({ code: "ENOENT" });
  });
});
