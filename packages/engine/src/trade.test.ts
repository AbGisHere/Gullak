import { describe, expect, it } from "vitest";
import { buyUnits, holdingValuePaise, pricePaiseFromRupees, sellUnits } from "./trade";

describe("pricePaiseFromRupees", () => {
  it("rounds a quote to whole paise and rejects impossible prices", () => {
    expect(pricePaiseFromRupees(1170.3)).toBe(117030);
    expect(pricePaiseFromRupees(198.134)).toBe(19813);
    expect(pricePaiseFromRupees(0.001)).toBe(1);
    expect(() => pricePaiseFromRupees(0)).toThrow(RangeError);
    expect(() => pricePaiseFromRupees(Number.NaN)).toThrow(RangeError);
  });
});

describe("buyUnits", () => {
  it("buys whole shares and adds to an existing holding", () => {
    expect(
      buyUnits({
        cashPaise: 300_000,
        holding: { milliUnits: 1000, costPaise: 117_800 },
        pricePaise: 117_030,
        quantity: 2,
      }),
    ).toEqual({
      ok: true,
      cashPaise: 300_000 - 234_060,
      holding: { milliUnits: 3000, costPaise: 117_800 + 234_060 },
      milliUnits: 2000,
      amountPaise: 234_060,
    });
  });

  it("buys fund units by amount, rounding units down and charging only what they cost", () => {
    const result = buyUnits({ cashPaise: 100_000, pricePaise: 19_813, amountPaise: 50_000 });
    expect(result).toEqual({
      ok: true,
      cashPaise: 100_000 - 49_989,
      holding: { milliUnits: 2523, costPaise: 49_989 },
      milliUnits: 2523,
      amountPaise: 49_989,
    });
  });

  it("refuses to overdraw play money, including by one paisa", () => {
    expect(buyUnits({ cashPaise: 117_029, pricePaise: 117_030, quantity: 1 })).toEqual({
      ok: false,
      reason: "not-enough-cash",
    });
    expect(buyUnits({ cashPaise: 117_030, pricePaise: 117_030, quantity: 1 })).toMatchObject({
      ok: true,
      cashPaise: 0,
    });
  });

  it("rejects amounts too small for 0.001 unit and malformed orders", () => {
    expect(buyUnits({ cashPaise: 100, pricePaise: 5_000_000, amountPaise: 1 })).toEqual({
      ok: false,
      reason: "below-smallest-unit",
    });
    for (const order of [
      { cashPaise: 100, pricePaise: 100 },
      { cashPaise: 100, pricePaise: 100, quantity: 1, amountPaise: 100 },
      { cashPaise: 100, pricePaise: 100, quantity: 1.5 },
      { cashPaise: -1, pricePaise: 100, quantity: 1 },
      { cashPaise: 100, pricePaise: 0, quantity: 1 },
      null,
    ])
      expect(buyUnits(order)).toEqual({ ok: false, reason: "invalid-order" });
  });
});

describe("sellUnits", () => {
  it("sells part of a holding, reduces cost pro rata and adds proceeds to cash", () => {
    expect(
      sellUnits({
        cashPaise: 1_000,
        holding: { milliUnits: 3000, costPaise: 300_000 },
        pricePaise: 90_000,
        milliUnits: 1000,
      }),
    ).toEqual({
      ok: true,
      cashPaise: 91_000,
      holding: { milliUnits: 2000, costPaise: 200_000 },
      milliUnits: 1000,
      amountPaise: 90_000,
    });
  });

  it("clears cost when everything is sold and rounds fractional proceeds down", () => {
    expect(
      sellUnits({
        cashPaise: 0,
        holding: { milliUnits: 2523, costPaise: 49_997 },
        pricePaise: 19_813,
        milliUnits: 2523,
      }),
    ).toEqual({
      ok: true,
      cashPaise: 49_988,
      holding: { milliUnits: 0, costPaise: 0 },
      milliUnits: 2523,
      amountPaise: 49_988,
    });
  });

  it("refuses to sell units the learner does not hold, or a malformed order", () => {
    expect(
      sellUnits({ cashPaise: 0, holding: { milliUnits: 1000, costPaise: 1 }, pricePaise: 100, milliUnits: 1001 }),
    ).toEqual({ ok: false, reason: "not-enough-units" });
    expect(
      sellUnits({ cashPaise: 0, holding: { milliUnits: 1000, costPaise: 1 }, pricePaise: 100, milliUnits: 0 }),
    ).toEqual({
      ok: false,
      reason: "invalid-order",
    });
  });
});

describe("holdingValuePaise", () => {
  it("values milli-units at the current price, rounding down", () => {
    expect(holdingValuePaise({ milliUnits: 2523, costPaise: 0 }, 19_813)).toBe(49_988);
    expect(holdingValuePaise({ milliUnits: 0, costPaise: 0 }, 19_813)).toBe(0);
  });
});
