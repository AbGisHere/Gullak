import { describe, expect, it } from "vitest";
import { ActivityAnswerRequest } from "./learning-run";

describe("approved activity answer inputs", () => {
  it("accepts the exact spot-sort and story bodies", () => {
    expect(ActivityAnswerRequest.parse({ expectedRevision: 0, itemId: "rice", categoryId: "need" })).toBeDefined();
    expect(ActivityAnswerRequest.parse({ expectedRevision: 1, nodeId: "start", choiceId: "stop" })).toBeDefined();
  });
  it("rejects client outcomes, mixed bodies and invalid revisions", () => {
    const input = { expectedRevision: 0, itemId: "rice", categoryId: "need" };
    for (const extra of [
      { correct: true },
      { score: 1 },
      { cashDeltaPaise: 1 },
      { mastery: 1 },
      { nodeId: "start", choiceId: "stop" },
      { expectedRevision: -1 },
    ])
      expect(ActivityAnswerRequest.safeParse({ ...input, ...extra }).success).toBe(false);
  });
});
