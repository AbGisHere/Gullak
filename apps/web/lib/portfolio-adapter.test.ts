import { describe, expect, it } from "vitest";
import { paperHoldingItem, startingPortfolio } from "./portfolio-adapter";

describe("startingPortfolio", () => {
  it("keeps capital in integer paise and marks the portfolio virtual", () => {
    expect(startingPortfolio(250_000, 25_000)).toMatchObject({
      isVirtual: true,
      cashPaise: 275_000,
      startingCashPaise: 250_000,
      holdings: [],
    });
  });
});

describe("paper trading in the portfolio", () => {
  const holding = {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Limited",
    kind: "stock" as const,
    milliUnits: 2000,
    costPaise: 600_000,
    openedAt: "2026-10-11T06:00:00.000Z",
  };

  it("adds Live trade cash flows to available cash and lists holdings", () => {
    const item = paperHoldingItem(holding, 620_000, "2026-10-11T07:00:00.000Z");
    expect(startingPortfolio(250_000, 0, { cashDeltaPaise: -600_000 + 400_000, holdings: [item] })).toMatchObject({
      cashPaise: 50_000,
      holdings: [{ id: "TCS.NS", kind: "stock", units: 2, currentValuePaise: 620_000, changePaise: 20_000 }],
    });
  });

  it("values a holding at cost until a live price arrives", () => {
    expect(paperHoldingItem(holding)).toMatchObject({ currentValuePaise: 600_000, changePaise: 0 });
  });
});
