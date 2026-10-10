import { type MarketQuote, MarketQuote as MarketQuoteSchema, SeriesPoint } from "@gullak/types";
import { z } from "zod";
import { type MarketDataAdapter, MarketDataError } from "./adapter";

/** Shape of a committed snapshot file in `/data/snapshots`. */
export const SnapshotFile = z.object({
  symbol: z.string().min(1),
  source: z.string().min(1),
  /** Where the data came from, for attribution in the UI and README. */
  attribution: z.string().min(1),
  quote: MarketQuoteSchema.omit({ isSnapshot: true, symbol: true }),
  series: z.array(SeriesPoint).default([]),
});
export type SnapshotFile = z.infer<typeof SnapshotFile>;

/** Serves committed snapshot data. Never touches the network. */
export function createSnapshotAdapter(files: readonly unknown[]): MarketDataAdapter {
  const bySymbol = new Map(files.map((f) => SnapshotFile.parse(f)).map((f) => [f.symbol, f] as const));
  const find = (symbol: string): SnapshotFile => {
    const file = bySymbol.get(symbol);
    if (!file) throw new MarketDataError(`no snapshot for ${symbol}`, "snapshot");
    return file;
  };
  return {
    id: "snapshot",
    async getQuote(symbol): Promise<MarketQuote> {
      const file = find(symbol);
      return { ...file.quote, symbol, isSnapshot: true };
    },
    async getSeries(symbol, from, to) {
      return find(symbol).series.filter((p) => p.t >= from && p.t <= to);
    },
  };
}
