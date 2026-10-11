import type { InstrumentQuote } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { applyTrade, formatUnits, tradeAccess, unlockTopicId } from "./invest";
import type { LearnerState } from "./learner-state";

const emptyState = (): LearnerState => ({
  passedTopics: [],
  quizAttempts: [],
  mastery: {},
  practiceCashPaise: 0,
  activities: [],
  paperHoldings: [],
  liveCashDeltaPaise: 0,
  emergencyReservePaise: 0,
  reserveTargetPaise: null,
  goals: [],
});

const tcs: InstrumentQuote = {
  symbol: "TCS.NS",
  name: "Tata Consultancy Services Limited",
  exchange: "NSE",
  kind: "stock",
  price: 3000,
  currency: "INR",
  asOf: "2026-10-09T09:45:00.000Z",
  source: "yahoo-finance",
};
const fund: InstrumentQuote = {
  ...tcs,
  symbol: "0P00009J3K.BO",
  name: "Fund",
  exchange: "BSE",
  kind: "mutual-fund",
  price: 198.134,
};

describe("unlockTopicId and tradeAccess", () => {
  it("reads the unlocking lesson from the topic graph", () => {
    expect(unlockTopicId("stock")).toBe("stocks");
    expect(unlockTopicId("etf")).toBe("index-funds-etfs");
    expect(unlockTopicId("mutual-fund")).toBe("mutual-funds-sip");
    expect(unlockTopicId("index")).toBeNull();
  });

  it("opens a kind only after its lesson is passed; indices stay view-only", () => {
    expect(tradeAccess("stock", "grade-8-10", [])).toEqual({ status: "locked", topicId: "stocks" });
    expect(tradeAccess("stock", "grade-8-10", ["stocks"])).toEqual({ status: "open" });
    expect(tradeAccess("index", "grade-11-12", ["stocks"])).toEqual({ status: "view-only" });
  });

  it("explains when a lesson is not taught to the learner's class group", () => {
    expect(tradeAccess("stock", "grade-6-7", [])).toEqual({ status: "not-in-class", topicId: "stocks" });
  });
});

describe("applyTrade", () => {
  it("buys whole shares, records the holding and moves play money", () => {
    const outcome = applyTrade(
      emptyState(),
      1_000_000,
      tcs,
      { side: "buy", quantity: 2 },
      new Date("2026-10-11T06:00:00Z"),
    );
    expect(outcome).toMatchObject({ ok: true, milliUnits: 2000, amountPaise: 600_000 });
    if (!outcome.ok) return;
    expect(outcome.state.liveCashDeltaPaise).toBe(-600_000);
    expect(outcome.state.paperHoldings).toEqual([
      {
        symbol: "TCS.NS",
        name: tcs.name,
        kind: "stock",
        milliUnits: 2000,
        costPaise: 600_000,
        openedAt: "2026-10-11T06:00:00.000Z",
      },
    ]);
  });

  it("removes a holding once every unit is sold and keeps the cash flow", () => {
    const bought = applyTrade(emptyState(), 1_000_000, tcs, { side: "buy", quantity: 2 });
    if (!bought.ok) throw new Error("buy failed");
    const sold = applyTrade(bought.state, 400_000, { ...tcs, price: 3100 }, { side: "sell", milliUnits: 2000 });
    expect(sold).toMatchObject({ ok: true, amountPaise: 620_000 });
    if (!sold.ok) return;
    expect(sold.state.paperHoldings).toEqual([]);
    expect(sold.state.liveCashDeltaPaise).toBe(-600_000 + 620_000);
  });

  it("buys mutual-fund units by amount and refuses overdrafts or selling what is not held", () => {
    expect(applyTrade(emptyState(), 100_000, fund, { side: "buy", amountPaise: 50_000 })).toMatchObject({
      ok: true,
      milliUnits: 2523,
    });
    expect(applyTrade(emptyState(), 100, tcs, { side: "buy", quantity: 1 })).toEqual({
      ok: false,
      reason: "not-enough-cash",
    });
    expect(applyTrade(emptyState(), 100, tcs, { side: "sell", milliUnits: 1000 })).toEqual({
      ok: false,
      reason: "not-enough-units",
    });
  });
});

describe("formatUnits", () => {
  it("prints up to three decimals and whole units plainly", () => {
    expect(formatUnits(2523)).toBe("2.523");
    expect(formatUnits(2000)).toBe("2");
  });
});
