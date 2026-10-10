import { Portfolio, QuizSubmission, type VariantOf } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { gradeQuiz, replayHistory, valuePortfolio } from "./index";

const quiz: VariantOf<"quiz"> = {
  id: "check",
  format: "quiz",
  conceptIds: [],
  questions: [
    {
      id: "one",
      conceptId: "rate",
      prompt: "Q1",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "a",
      explanation: "A",
    },
    {
      id: "two",
      conceptId: "rate",
      prompt: "Q2",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "b",
      explanation: "B",
    },
  ],
};
describe("trusted quiz grading", () => {
  it("computes the score from the answer key", () => {
    expect(
      gradeQuiz(quiz, {
        variantId: "check",
        answers: [
          { questionId: "one", optionId: "a" },
          { questionId: "two", optionId: "a" },
        ],
      }),
    ).toBe(0.5);
  });
  it.each(
    [
      [{ questionId: "one", optionId: "a" }],
      [
        { questionId: "one", optionId: "a" },
        { questionId: "one", optionId: "a" },
      ],
      [
        { questionId: "one", optionId: "fake" },
        { questionId: "two", optionId: "b" },
      ],
      [
        { questionId: "fake", optionId: "a" },
        { questionId: "two", optionId: "b" },
      ],
    ].map((answers) => ({ answers })),
  )("rejects incomplete, duplicate or invented answers %j", ({ answers }) => {
    expect(() => gradeQuiz(quiz, { variantId: "check", answers })).toThrow(RangeError);
  });
  it("rejects client-supplied scores", () => {
    expect(
      QuizSubmission.safeParse({ variantId: "check", answers: [{ questionId: "one", optionId: "a" }], score: 1 })
        .success,
    ).toBe(false);
  });
});
const uuid = "11111111-1111-4111-8111-111111111111";
const portfolio = Portfolio.parse({
  id: uuid,
  learnerId: uuid,
  isVirtual: true,
  startingCashPaise: 110000,
  cashPaise: 10000,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  holdings: [
    {
      id: uuid,
      instrumentId: "virtual-fd",
      type: "deposit",
      kind: "fixed-deposit",
      openedAt: "2025-01-01T00:00:00Z",
      principalPaise: 100000,
      ratePercent: 7,
      tenureMonths: 12,
      compoundsPerYear: 4,
      rateSource: "test-fixture (snapshot)",
      rateAsOf: "2025-01-01",
    },
  ],
});
describe("FD portfolio valuation", () => {
  it("preserves cash plus principal at opening", () => {
    expect(valuePortfolio(portfolio, portfolio.createdAt).totalPaise).toBe(110000);
  });
  it("caps accrual at the maturity projection and labels assumptions", () => {
    const result = valuePortfolio(portfolio, "2027-01-01T00:00:00Z");
    expect(result.totalPaise).toBe(117186);
    expect(result.holdings[0]?.assumptions.isProjection).toBe(true);
  });
  it("rejects invalid and pre-creation dates", () => {
    expect(() => valuePortfolio(portfolio, "invalid")).toThrow(RangeError);
    expect(() => valuePortfolio(portfolio, "2024-01-01T00:00:00Z")).toThrow(RangeError);
  });
});
// Invented levels used only as mathematical unit-test fixtures, never served as real history.
const series = [
  { t: "2020-03-01T00:00:00Z", value: 100 },
  { t: "2020-03-23T00:00:00Z", value: 50 },
  { t: "2020-04-01T00:00:00Z", value: 80 },
];
describe("observed-history replay", () => {
  it("freezes the panic-sell cash at the observed sell level", () => {
    expect(replayHistory(series, 10000, series[1]!.t).at(-1)).toMatchObject({ heldPaise: 8000, panicSellPaise: 5000 });
  });
  it("rejects unobserved sell dates, short or unordered series and invalid amounts", () => {
    expect(() => replayHistory(series, 10000, "2020-03-24T00:00:00Z")).toThrow(RangeError);
    expect(() => replayHistory([], 10000)).toThrow(RangeError);
    expect(() => replayHistory([...series].reverse(), 10000)).toThrow(RangeError);
    expect(() => replayHistory(series, -1)).toThrow();
  });
});
