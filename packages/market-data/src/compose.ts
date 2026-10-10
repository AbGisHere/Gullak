import { MarketQuote, SeriesPoint } from "@gullak/types";
import type { Cache, MarketDataAdapter } from "./adapter";

/** Caches quotes and series from `inner`. Results are Zod-validated before caching. */
export function withCache(inner: MarketDataAdapter, cache: Cache, ttlSeconds: number): MarketDataAdapter {
  return {
    id: inner.id,
    async getQuote(symbol) {
      const key = `quote:${inner.id}:${symbol}`;
      const hit = await cache.get<MarketQuote>(key);
      if (hit) return hit;
      const quote = MarketQuote.parse(await inner.getQuote(symbol));
      await cache.set(key, quote, ttlSeconds);
      return quote;
    },
    async getSeries(symbol, from, to) {
      const key = `series:${inner.id}:${symbol}:${from}:${to}`;
      const hit = await cache.get<SeriesPoint[]>(key);
      if (hit) return hit;
      const series = SeriesPoint.array().parse(await inner.getSeries(symbol, from, to));
      await cache.set(key, series, ttlSeconds);
      return series;
    },
  };
}

/**
 * Tries `live` first; on any error or invalid payload, serves `snapshot`
 * so no screen breaks when an API is down. Snapshot quotes are flagged.
 */
export function withSnapshotFallback(live: MarketDataAdapter, snapshot: MarketDataAdapter): MarketDataAdapter {
  return {
    id: live.id,
    async getQuote(symbol) {
      try {
        return MarketQuote.parse(await live.getQuote(symbol));
      } catch {
        return { ...(await snapshot.getQuote(symbol)), isSnapshot: true };
      }
    },
    async getSeries(symbol, from, to) {
      try {
        return SeriesPoint.array().parse(await live.getSeries(symbol, from, to));
      } catch {
        return snapshot.getSeries(symbol, from, to);
      }
    },
  };
}
