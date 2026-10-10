import type { MarketQuote, SeriesPoint } from "@gullak/types";

/**
 * Every market-data source (AMFI NAVs, index prices, gold, FD rates) sits
 * behind this interface. Screens never call a source directly.
 */
export interface MarketDataAdapter {
  /** Short id shown as the quote's `source`, e.g. `amfi`. */
  readonly id: string;
  getQuote(symbol: string): Promise<MarketQuote>;
  /** Historical series for the Time Machine, inclusive range. */
  getSeries(symbol: string, from: string, to: string): Promise<SeriesPoint[]>;
}

/**
 * Pluggable cache. Server code is stateless, so production uses a shared
 * store (e.g. Redis/KV). `MemoryCache` exists for tests and local dev only.
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export class MarketDataError extends Error {
  constructor(
    message: string,
    readonly source: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "MarketDataError";
  }
}
