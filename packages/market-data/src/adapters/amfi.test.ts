import { describe, expect, it, vi } from "vitest";
import { MarketDataError } from "../adapter";
import { createAmfiAdapter, parseAmfiNavAll } from "./amfi";

// Recorded excerpt of AMFI's NAVAll.txt (CRLF line endings, as served) from
// 09-Oct-2026, plus one `N.A.` row to cover schemes without a published NAV.
const fixture = [
  "Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date",
  " ",
  "Open Ended Schemes(Other Scheme - Index Funds)",
  " ",
  "UTI Mutual Fund",
  " ",
  "120716;INF789F01XA0;-;UTI Nifty 50 Index Fund;Direct Plan;Growth;158.5759;09-Oct-2026",
  "120717;INF789F01WY2;INF789F01WZ9;UTI Nifty 50 Index Fund;Direct Plan;IDCW;79.8928;09-Oct-2026",
  "999999;-;-;Wound-up Scheme;Direct Plan;Growth;N.A.;09-Oct-2026",
  "",
].join("\r\n");

const ok = (body: string) => vi.fn(async () => new Response(body, { status: 200 })) as unknown as typeof fetch;

describe("parseAmfiNavAll", () => {
  it("also accepts six-column NAV files and rejects impossible calendar dates", () => {
    expect(parseAmfiNavAll("120716;-;-;Recorded schema fixture;158.5759;09-Oct-2026").get("120716")?.nav).toBe(
      158.5759,
    );
    expect(parseAmfiNavAll("120716;-;-;Invalid date fixture;;;158.5759;31-Feb-2026").size).toBe(0);
  });
  it("reads data rows and skips headers, fund houses and blanks", () => {
    const navs = parseAmfiNavAll(fixture);
    expect([...navs.keys()]).toEqual(["120716", "120717"]);
    expect(navs.get("120716")).toEqual({
      schemeCode: "120716",
      name: "UTI Nifty 50 Index Fund",
      nav: 158.5759,
      asOf: "2026-10-09T00:00:00+05:30",
    });
  });

  it("skips rows without a usable NAV", () => {
    expect(parseAmfiNavAll(fixture).has("999999")).toBe(false);
  });

  it("returns an empty map for unrelated input", () => {
    expect(parseAmfiNavAll("<html>Document Moved</html>").size).toBe(0);
  });
});

describe("createAmfiAdapter", () => {
  it("maps a scheme's NAV to a live quote with the source's as-of date", async () => {
    const amfi = createAmfiAdapter({ fetch: ok(fixture) });
    await expect(amfi.getQuote("120716")).resolves.toEqual({
      symbol: "120716",
      kind: "nav",
      value: 158.5759,
      currency: "INR",
      asOf: "2026-10-09T00:00:00+05:30",
      source: "amfi",
      isSnapshot: false,
    });
  });

  it("throws MarketDataError for an unknown scheme", async () => {
    const amfi = createAmfiAdapter({ fetch: ok(fixture) });
    await expect(amfi.getQuote("000000")).rejects.toBeInstanceOf(MarketDataError);
  });

  it("throws MarketDataError when AMFI is down", async () => {
    const down = vi.fn(async () => new Response("", { status: 503 })) as unknown as typeof fetch;
    await expect(createAmfiAdapter({ fetch: down }).getQuote("120716")).rejects.toBeInstanceOf(MarketDataError);
  });

  it("has no live history, so the snapshot fallback serves series", async () => {
    await expect(createAmfiAdapter({ fetch: ok(fixture) }).getSeries("120716", "", "")).rejects.toBeInstanceOf(
      MarketDataError,
    );
  });
});
