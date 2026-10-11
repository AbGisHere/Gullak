import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { marketQuote } from "./market";

describe("historical market metadata", () => {
  it("preserves NIFTY provenance and distinguishes historical price-index points", async () => {
    const result = await marketQuote("NIFTY-50");
    expect(result).toMatchObject({
      quote: { kind: "index-level", isSnapshot: true, source: "nse-indices", asOf: "2020-06-30T00:00:00Z" },
      sourceUrl: "https://www.niftyindices.com/reports/historical-data",
      seriesType: "price-index",
    });
    expect(result.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.attribution).toContain("index points, not rupees");
    expect(result.attribution).toContain("excludes dividends");
  });
});
