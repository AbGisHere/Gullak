import { describe, expect, it } from "vitest";
import { Holding, LearnerProfile, Locale, Portfolio, TopicContent, TopicProgress } from "./index";

const uuid = "8f14e45f-ceea-467f-a0e6-1c2f1a3b4d5e";
const now = "2026-10-10T10:00:00+05:30";

describe("schemas", () => {
  it("accepts a valid learner profile", () => {
    const profile = LearnerProfile.parse({
      id: uuid,
      gradeGroup: "grade-8-10",
      experience: "none",
      locale: "hi",
      preferredFormats: ["story", "quiz"],
      createdAt: now,
    });
    expect(profile.locale).toBe("hi");
  });

  it("treats locales as data, not an enum", () => {
    expect(Locale.safeParse("ta").success).toBe(true);
    expect(Locale.safeParse("Hindi").success).toBe(false);
  });

  it("rejects a portfolio that is not virtual", () => {
    const result = Portfolio.safeParse({
      id: uuid,
      learnerId: uuid,
      isVirtual: false,
      startingCashPaise: 100,
      cashPaise: 100,
      holdings: [],
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(false);
  });

  it("discriminates deposit and market holdings", () => {
    const fd = Holding.parse({
      id: uuid,
      instrumentId: "sbi-fd",
      openedAt: now,
      type: "deposit",
      kind: "fixed-deposit",
      principalPaise: 1_000_000,
      ratePercent: 6.8,
      tenureMonths: 12,
      rateAsOf: "2026-10-01",
      rateSource: "snapshot",
    });
    expect(fd.type === "deposit" && fd.compoundsPerYear).toBe(4);
  });

  it("requires a quiz in every topic so it can gate unlocking", () => {
    const result = TopicContent.safeParse({
      topicId: "fixed-deposit",
      locale: "en",
      title: "Fixed Deposit",
      summary: "Lock money in, earn a fixed rate.",
      variants: [{ id: "read", format: "transcript", markdown: "..." }],
    });
    expect(result.success).toBe(false);
  });

  it("defaults quiz attempts and bounds the best score", () => {
    const base = { learnerId: uuid, topicId: "fixed-deposit", status: "in-progress", updatedAt: now };
    expect(TopicProgress.parse(base).quizAttempts).toBe(0);
    expect(TopicProgress.safeParse({ ...base, bestScore: 1.2 }).success).toBe(false);
    expect(TopicProgress.safeParse({ ...base, topicId: "Fixed Deposit" }).success).toBe(false);
  });
});
