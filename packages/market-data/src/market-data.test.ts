import type { MarketQuote } from "@gullak/types";
import { describe, expect, it, vi } from "vitest";
import { createSnapshotAdapter, type MarketDataAdapter, MemoryCache, withCache, withSnapshotFallback } from "./index";

// Test fixture only, not real market data.
const fixture = {
  symbol: "TEST-INDEX",
  source: "fixture",
  attribution: "unit test fixture",
  quote: { kind: "index-level", value: 100, currency: "INR", asOf: "2020-03-23T15:30:00+05:30", source: "fixture" },
  series: [
    { t: "2020-03-20T15:30:00+05:30", value: 110 },
    { t: "2020-03-23T15:30:00+05:30", value: 100 },
  ],
};

const liveQuote: MarketQuote = {
  symbol: "TEST-INDEX",
  kind: "index-level",
  value: 120,
  currency: "INR",
  asOf: "2026-10-09T15:30:00+05:30",
  source: "live",
  isSnapshot: false,
};

function fakeLive(overrides: Partial<MarketDataAdapter> = {}): MarketDataAdapter {
  return {
    id: "live",
    getQuote: vi.fn(async () => liveQuote),
    getSeries: vi.fn(async () => []),
    ...overrides,
  };
}

describe("market data", () => {
  const snapshot = createSnapshotAdapter([fixture]);

  it("serves snapshot quotes flagged as snapshots", async () => {
    const q = await snapshot.getQuote("TEST-INDEX");
    expect(q).toMatchObject({ value: 100, isSnapshot: true });
  });

  it("filters snapshot series by date range", async () => {
    const s = await snapshot.getSeries("TEST-INDEX", "2020-03-21T00:00:00+05:30", "2020-03-31T00:00:00+05:30");
    expect(s).toHaveLength(1);
  });

  it("falls back to the snapshot when the live source fails", async () => {
    const live = fakeLive({ getQuote: async () => Promise.reject(new Error("down")) });
    const q = await withSnapshotFallback(live, snapshot).getQuote("TEST-INDEX");
    expect(q.isSnapshot).toBe(true);
  });

  it("falls back when the live source returns an invalid payload", async () => {
    const live = fakeLive({ getQuote: async () => ({ ...liveQuote, value: -1 }) });
    const q = await withSnapshotFallback(live, snapshot).getQuote("TEST-INDEX");
    expect(q.source).toBe("fixture");
  });

  it("caches live quotes", async () => {
    const live = fakeLive();
    const cached = withCache(live, new MemoryCache(), 60);
    await cached.getQuote("TEST-INDEX");
    await cached.getQuote("TEST-INDEX");
    expect(live.getQuote).toHaveBeenCalledTimes(1);
  });

  it("expires cache entries after their TTL", async () => {
    let now = 0;
    const cache = new MemoryCache(() => now);
    await cache.set("k", 1, 10);
    now = 11_000;
    expect(await cache.get("k")).toBeUndefined();
  });
});
