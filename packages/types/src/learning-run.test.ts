import { describe, expect, it } from "vitest";
import { SaveLearningBookmarkRequest, StartLearningRunRequest } from "./learning-run";

describe("learning progress boundaries", () => {
  it("accepts navigation bookmarks and revision numbers", () => {
    expect(
      SaveLearningBookmarkRequest.parse({ expectedRevision: 0, bookmark: { kind: "date", on: "2020-03-01" } })
        .expectedRevision,
    ).toBe(0);
  });
  it.each([{ learner_id: "other" }, { score: 1 }, { passed: true }, { cashPaise: 100 }, { status: "completed" }])(
    "rejects untrusted run start fields %j",
    (body) => {
      expect(StartLearningRunRequest.safeParse(body).success).toBe(false);
    },
  );
  it.each([
    { expectedRevision: -1, bookmark: { kind: "item", itemId: "one" } },
    { expectedRevision: 0, bookmark: { kind: "date", on: "2020-02-31" } },
    { expectedRevision: 0, bookmark: { kind: "item", itemId: "one", score: 1 } },
    { expectedRevision: 0, bookmark: { kind: "node", nodeId: "../escape" } },
  ])("rejects invalid checkpoints %j", (body) => {
    expect(SaveLearningBookmarkRequest.safeParse(body).success).toBe(false);
  });
});
