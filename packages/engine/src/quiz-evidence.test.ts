import type { QuizSubmission, VariantOf } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { gradeQuiz, gradeQuizAnswers } from "./quiz";

const quiz: VariantOf<"quiz"> = {
  id: "check",
  format: "quiz",
  conceptIds: ["saving", "budgeting"],
  questions: [
    {
      id: "first",
      conceptId: "saving",
      prompt: "First?",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "a",
      explanation: "First explanation",
    },
    {
      id: "second",
      conceptId: "budgeting",
      prompt: "Second?",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "b",
      explanation: "Second explanation",
    },
  ],
};

describe("authoritative quiz evidence", () => {
  it("grades against trusted keys and preserves authored order and concepts", () => {
    const submission: QuizSubmission = {
      variantId: "check",
      answers: [
        { questionId: "second", optionId: "a" },
        { questionId: "first", optionId: "a" },
      ],
    };
    expect(gradeQuizAnswers(quiz, submission)).toEqual([
      { questionId: "first", conceptId: "saving", correct: true },
      { questionId: "second", conceptId: "budgeting", correct: false },
    ]);
    expect(gradeQuiz(quiz, submission)).toBe(0.5);
  });
  it("retains correct boundary scores for all correct or all incorrect", () => {
    for (const [first, second, score] of [
      ["a", "b", 1],
      ["b", "a", 0],
    ] as const) {
      const submission = {
        variantId: "check",
        answers: [
          { questionId: "first", optionId: first },
          { questionId: "second", optionId: second },
        ],
      };
      expect(gradeQuiz(quiz, submission)).toBe(score);
      expect(gradeQuizAnswers(quiz, submission).every((answer) => answer.correct === (score === 1))).toBe(true);
    }
  });
  it("rejects incomplete, duplicate, unknown and wrong-variant submissions", () => {
    const valid = {
      variantId: "check",
      answers: [
        { questionId: "first", optionId: "a" },
        { questionId: "second", optionId: "b" },
      ],
    };
    for (const submission of [
      { ...valid, variantId: "other" },
      { ...valid, answers: [valid.answers[0]!] },
      { ...valid, answers: [valid.answers[0]!, valid.answers[0]!] },
      { ...valid, answers: [{ questionId: "unknown", optionId: "a" }, valid.answers[1]!] },
      { ...valid, answers: [{ questionId: "first", optionId: "unknown" }, valid.answers[1]!] },
    ])
      expect(() => gradeQuizAnswers(quiz, submission)).toThrow(RangeError);
  });
});
