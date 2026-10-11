import { describe, expect, it } from "vitest";
import { committedMarketData, committedSnapshots } from "./catalog";

describe("official NIFTY demo snapshot", () => {
  it("preserves attribution, price-index units and observed range", async () => {
    const snapshot = committedSnapshots.find((s) => s.symbol === "NIFTY-50");
    expect(snapshot?.seriesType).toBe("price-index");
    expect(snapshot?.sourceUrl).toBe("https://www.niftyindices.com/reports/historical-data");
    const series = await committedMarketData.getSeries("NIFTY-50", "2019-10-01T00:00:00Z", "2020-06-30T23:59:59Z");
    expect(series).toHaveLength(184);
    expect(series[0]?.t).toBe("2019-10-01T00:00:00Z");
    expect(series.at(-1)).toEqual({ t: "2020-06-30T00:00:00Z", value: 10302.1 });
    expect(new Set(series.map((p) => p.t)).size).toBe(series.length);
    expect(series.every((p, i) => i === 0 || p.t > series[i - 1]!.t)).toBe(true);
    expect(series.find((p) => p.t === "2020-03-23T00:00:00Z")).toEqual({
      t: "2020-03-23T00:00:00Z",
      value: 7610.25,
    });
    expect(series.some((p) => p.t === "2020-03-22T00:00:00Z")).toBe(false);
  });
  it("labels the historical quote as a snapshot rather than live or NAV", async () => {
    expect(await committedMarketData.getQuote("NIFTY-50")).toMatchObject({
      kind: "index-level",
      isSnapshot: true,
      asOf: "2020-06-30T00:00:00Z",
      source: "nse-indices",
    });
  });
});
