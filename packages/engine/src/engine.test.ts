import type { UnlockRule } from "@gullak/types";
import { describe, expect, it } from "vitest";
import {
  availableTopics,
  compoundAmount,
  fdMaturity,
  inrToPaise,
  isTopicOpen,
  monthlyForTarget,
  rdMaturity,
  sipFutureValue,
  startingCash,
  topicsForGrade,
  unlockedActivityIds,
  unlockedInstruments,
} from "./index";

describe("interest maths", () => {
  it("compounds annually", () => {
    expect(compoundAmount(inrToPaise(1000), 10, 1, 2)).toBe(inrToPaise(1210));
  });

  it("matches a quarterly-compounded FD: ₹1,00,000 at 7% for 12 months", () => {
    // 100000 × (1.0175)^4 = 107185.90
    expect(fdMaturity(inrToPaise(100_000), 7, 12)).toBe(10_718_590);
  });

  it("returns principal for a zero-rate RD", () => {
    expect(rdMaturity(inrToPaise(1000), 0, 12)).toBe(inrToPaise(12_000));
  });

  it("grows an RD above its contributions", () => {
    expect(rdMaturity(inrToPaise(1000), 6.5, 12)).toBeGreaterThan(inrToPaise(12_000));
  });

  it("computes SIP future value as an annuity due", () => {
    // ₹1,000/month, 12% p.a., 12 months ≈ ₹12,809.33
    expect(sipFutureValue(inrToPaise(1000), 12, 12)).toBe(1_280_933);
  });

  it("inverts SIP for a goal: ₹90,000 in 24 months at 0% is ₹3,750/month", () => {
    expect(monthlyForTarget(inrToPaise(90_000), 0, 24)).toBe(inrToPaise(3750));
  });

  it("rejects negative inputs", () => {
    expect(() => compoundAmount(-1, 5, 4, 1)).toThrow(RangeError);
  });
});

describe("starting capital", () => {
  const table = {
    defaultInr: 10_000,
    rows: [{ gradeGroup: "grade-6-7", experience: "none", inr: 2000 }] as const,
  };

  it("looks up the grade group × experience row", () => {
    expect(startingCash(table, "grade-6-7", "none")).toBe(inrToPaise(2000));
  });

  it("falls back to the default", () => {
    expect(startingCash(table, "grade-11-12", "regular")).toBe(inrToPaise(10_000));
  });
});

describe("unlock rules", () => {
  const node = (topicId: string, rest: Partial<UnlockRule> = {}): UnlockRule => ({
    topicId,
    pillar: "save-and-manage",
    gradeGroups: ["grade-6-7", "grade-8-10", "grade-11-12"],
    requiresTopicIds: [],
    passMark: 0.6,
    unlocksInstruments: [],
    unlocksActivityIds: [],
    ...rest,
  });
  const rules: UnlockRule[] = [
    node("saving-habit", { unlocksInstruments: ["savings"] }),
    node("fixed-deposit", {
      gradeGroups: ["grade-8-10", "grade-11-12"],
      requiresTopicIds: ["saving-habit"],
      unlocksInstruments: ["fixed-deposit"],
    }),
    node("recurring-deposit", { requiresTopicIds: ["saving-habit"], unlocksActivityIds: ["rd-exit"] }),
  ];
  const [savings, fd] = rules as [UnlockRule, UnlockRule];

  it("keeps a topic locked until its prerequisite quiz is passed", () => {
    expect(isTopicOpen(fd, rules, new Map([["saving-habit", { bestQuizScore: 0.4 }]]))).toBe(false);
    expect(isTopicOpen(fd, rules, new Map([["saving-habit", { bestQuizScore: 0.8 }]]))).toBe(true);
    expect(isTopicOpen(savings, rules, new Map())).toBe(true);
  });

  it("unlocks instruments for completed topics only", () => {
    const progress = new Map([
      ["saving-habit", { bestQuizScore: 1 }],
      ["fixed-deposit", { bestQuizScore: 0.5 }],
    ]);
    expect([...unlockedInstruments(rules, progress)]).toEqual(["savings"]);
  });

  it("filters the graph by grade group", () => {
    expect(topicsForGrade(rules, "grade-6-7").map((r) => r.topicId)).toEqual(["saving-habit", "recurring-deposit"]);
    expect(topicsForGrade(rules, "grade-11-12")).toHaveLength(3);
  });

  it("offers open, unfinished topics for the learner's grade group only", () => {
    expect(availableTopics(rules, new Map(), "grade-8-10").map((r) => r.topicId)).toEqual(["saving-habit"]);
    const passed = new Map([["saving-habit", { bestQuizScore: 0.9 }]]);
    expect(availableTopics(rules, passed, "grade-6-7").map((r) => r.topicId)).toEqual(["recurring-deposit"]);
    expect(availableTopics(rules, passed, "grade-8-10").map((r) => r.topicId)).toEqual([
      "fixed-deposit",
      "recurring-deposit",
    ]);
  });

  it("unlocks activities for completed topics only", () => {
    expect([...unlockedActivityIds(rules, new Map([["recurring-deposit", { bestQuizScore: 0.5 }]]))]).toEqual([]);
    expect([...unlockedActivityIds(rules, new Map([["recurring-deposit", { bestQuizScore: 0.6 }]]))]).toEqual([
      "rd-exit",
    ]);
  });
});
