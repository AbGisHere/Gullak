import "server-only";
import { createYahooAdapter, MarketDataError } from "@gullak/market-data";
import { IndianSymbol, type InstrumentQuote, type InstrumentSearchResult } from "@gullak/types";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { ApiError } from "./errors";

// Live paper trading looks up real Indian listings on Yahoo Finance. Results sit in Next's
// persistent data cache (not module memory), so repeated lookups never hammer the source.
const yahoo = createYahooAdapter({
  fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(5000), cache: "no-store" }),
});

const cachedQuote = unstable_cache((symbol: string) => yahoo.getInstrumentQuote(symbol), ["gullak-live-quote-v1"], {
  revalidate: 60,
});
const cachedSearch = unstable_cache((query: string) => yahoo.search(query, 12), ["gullak-live-search-v1"], {
  revalidate: 3600,
});

export const SearchQuery = z.string().trim().min(2).max(60);

function unavailable(error: unknown): never {
  if (error instanceof MarketDataError) throw new ApiError(503, "live_price_unavailable");
  throw error;
}

export async function liveQuote(symbol: string): Promise<InstrumentQuote> {
  const parsed = IndianSymbol.safeParse(decodeURIComponent(symbol).toUpperCase());
  if (!parsed.success) throw new ApiError(400, "invalid_symbol");
  try {
    return await cachedQuote(parsed.data);
  } catch (error) {
    unavailable(error);
  }
}

/** Search results; mutual funds come back named by code, so their names are filled from the quote. */
export async function searchInstruments(query: string): Promise<InstrumentSearchResult[]> {
  const q = SearchQuery.parse(query).toLowerCase();
  let results: InstrumentSearchResult[];
  try {
    results = await cachedSearch(q);
  } catch (error) {
    unavailable(error);
  }
  return Promise.all(
    results.map(async (result) => {
      if (result.name !== result.symbol) return result;
      try {
        return { ...result, name: (await cachedQuote(result.symbol)).name };
      } catch {
        return result;
      }
    }),
  );
}
