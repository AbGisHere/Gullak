import { z } from "zod";
import { IsoDateTime } from "./common";

export const QuoteKind = z.enum(["price", "nav", "rate", "index-level"]);
export type QuoteKind = z.infer<typeof QuoteKind>;

export const MarketQuote = z.object({
  symbol: z.string().min(1),
  kind: QuoteKind,
  /** Rupees per unit for prices/NAVs, % p.a. for rates, points for index levels. */
  value: z.number().finite().nonnegative(),
  currency: z.literal("INR"),
  /** When the source says this value was true. Always shown to the learner. */
  asOf: IsoDateTime,
  /** Adapter that produced it, e.g. `amfi`, `snapshot`. */
  source: z.string().min(1),
  /** True when served from a committed snapshot instead of a live source. */
  isSnapshot: z.boolean(),
});
export type MarketQuote = z.infer<typeof MarketQuote>;

/** A point in a historical series, used by Practice episode replays. */
export const SeriesPoint = z.object({
  t: IsoDateTime,
  value: z.number().finite().nonnegative(),
});
export type SeriesPoint = z.infer<typeof SeriesPoint>;

/**
 * Indian listed instruments a learner can look up for paper trading (Live mode).
 * Symbols follow Yahoo Finance: `RELIANCE.NS` (NSE), `RELIANCE.BO` (BSE), `^NSEI` (index).
 */
export const IndianSymbol = z
  .string()
  .max(32)
  .regex(/^(\^[A-Z0-9_.-]{2,24}|[A-Z0-9&_-]{1,24}\.(NS|BO))$/);
export type IndianSymbol = z.infer<typeof IndianSymbol>;

/** What a search result is, which decides the lesson that unlocks it. Indices are view-only. */
export const ListedKind = z.enum(["stock", "etf", "mutual-fund", "index"]);
export type ListedKind = z.infer<typeof ListedKind>;

export const InstrumentSearchResult = z.object({
  symbol: IndianSymbol,
  name: z.string().min(1).max(120),
  exchange: z.enum(["NSE", "BSE"]),
  kind: ListedKind,
});
export type InstrumentSearchResult = z.infer<typeof InstrumentSearchResult>;

/** A live (possibly delayed) price for one instrument, in rupees per unit or index points. */
export const InstrumentQuote = z.object({
  symbol: IndianSymbol,
  name: z.string().min(1).max(120),
  exchange: z.enum(["NSE", "BSE"]),
  kind: ListedKind,
  price: z.number().finite().positive(),
  previousClose: z.number().finite().positive().optional(),
  dayHigh: z.number().finite().positive().optional(),
  dayLow: z.number().finite().positive().optional(),
  week52High: z.number().finite().positive().optional(),
  week52Low: z.number().finite().positive().optional(),
  /** Units traded today; Yahoo reports 0 for funds and indices, which is left out. */
  volume: z.number().int().positive().optional(),
  /** First monthly close in the past year, for a 1-year change. */
  yearAgoPrice: z.number().finite().positive().optional(),
  currency: z.literal("INR"),
  asOf: IsoDateTime,
  source: z.string().min(1),
});
export type InstrumentQuote = z.infer<typeof InstrumentQuote>;
