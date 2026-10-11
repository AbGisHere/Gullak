import { describe, expect, it } from "vitest";
import { startingPortfolio } from "./portfolio-adapter";

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
