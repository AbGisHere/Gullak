import { describe, expect, it } from "vitest";
import { QuizSubmission } from "./api";
import { QuizEvidence } from "./quiz-evidence";

const evidence = {
  contentVersion: `${"a".repeat(64)}`,
  answers: [{ questionId: "one", conceptId: "saving", correct: true }],
};
describe("trusted quiz evidence boundary", () => {
  it("validates versioned per-question evidence", () => expect(QuizEvidence.parse(evidence)).toEqual(evidence));
  it("rejects duplicate questions, missing concepts and unofficial versions", () => {
    for (const value of [
      { ...evidence, answers: [...evidence.answers, ...evidence.answers] },
      { ...evidence, contentVersion: "v1" },
      { ...evidence, answers: [{ questionId: "one", correct: true }] },
      { ...evidence, answers: [{ questionId: "one", conceptId: "saving", correct: "true" }] },
    ])
      expect(QuizEvidence.safeParse(value).success).toBe(false);
  });
  it("does not allow public clients to supply learning evidence", () => {
    const input = { variantId: "check", answers: [{ questionId: "one", optionId: "a" }] };
    for (const extra of [
      { evidence },
      { correct: true },
      { contentVersion: evidence.contentVersion },
      { learner_id: "spoof" },
    ])
      expect(QuizSubmission.safeParse({ ...input, ...extra }).success).toBe(false);
  });
});
