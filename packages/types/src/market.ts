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

/** A point in a historical series, used by the Time Machine replay. */
export const SeriesPoint = z.object({
  t: IsoDateTime,
  value: z.number().finite().nonnegative(),
});
export type SeriesPoint = z.infer<typeof SeriesPoint>;
