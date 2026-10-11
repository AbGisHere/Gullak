import "server-only";
import { createYahooAdapter, MarketDataError } from "@gullak/market-data";
import {
  ChartRange,
  IndianSymbol,
  type InstrumentChart,
  type InstrumentQuote,
  type InstrumentSearchResult,
} from "@gullak/types";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { CATEGORY_IDS, categoryQueries, STARTER_STOCKS, STOCKS_CATEGORY } from "../category-search";
import { ApiError } from "./errors";

// Live paper trading looks up real Indian listings on Yahoo Finance. Results sit in Next's
// persistent data cache (not module memory), so repeated lookups never hammer the source.
const yahoo = createYahooAdapter({
  fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(5000), cache: "no-store" }),
});

const cachedQuote = unstable_cache((symbol: string) => yahoo.getInstrumentQuote(symbol), ["gullak-live-quote-v2"], {
  revalidate: 60,
});
const cachedSearch = unstable_cache((query: string) => yahoo.search(query, 12), ["gullak-live-search-v1"], {
  revalidate: 3600,
});

// Today's chart moves every few minutes; longer periods only gain a point a day.
const cachedDayChart = unstable_cache((symbol: string) => yahoo.getChart(symbol, "1d"), ["gullak-live-chart-1d-v1"], {
  revalidate: 60,
});
const cachedLongChart = unstable_cache(
  (symbol: string, range: ChartRange) => yahoo.getChart(symbol, range),
  ["gullak-live-chart-v1"],
  { revalidate: 1800 },
);

export const SearchQuery = z.string().trim().min(2).max(60);

// A category runs several fixed searches (see category-search.ts) and keeps funds and ETFs.
const cachedCategory = unstable_cache(
  async (categoryId: string) => {
    const settled = await Promise.allSettled(categoryQueries(categoryId).map((q) => yahoo.search(q, 20)));
    const seen = new Map<string, InstrumentSearchResult>();
    for (const outcome of settled)
      if (outcome.status === "fulfilled")
        for (const result of outcome.value)
          if ((result.kind === "mutual-fund" || result.kind === "etf") && !seen.has(result.symbol))
            seen.set(result.symbol, result);
    if (seen.size === 0 && settled.every((o) => o.status === "rejected"))
      throw new MarketDataError("Every category search failed", "yahoo-finance");
    // Growth plans first; payout (IDCW) variants of the same fund add noise for learners.
    const ranked = [...seen.values()].sort(
      (a, b) => Number(/IDCW/i.test(a.name)) - Number(/IDCW/i.test(b.name)) || a.name.localeCompare(b.name),
    );
    return ranked.slice(0, 40);
  },
  ["gullak-live-category-v1"],
  { revalidate: 3600 },
);

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

export async function liveChart(symbol: string, range: string | null): Promise<InstrumentChart> {
  const parsedSymbol = IndianSymbol.safeParse(decodeURIComponent(symbol).toUpperCase());
  if (!parsedSymbol.success) throw new ApiError(400, "invalid_symbol");
  const parsedRange = ChartRange.safeParse(range ?? "1d");
  if (!parsedRange.success) throw new ApiError(400, "invalid_range");
  try {
    return parsedRange.data === "1d"
      ? await cachedDayChart(parsedSymbol.data)
      : await cachedLongChart(parsedSymbol.data, parsedRange.data);
  } catch (error) {
    unavailable(error);
  }
}

/**
 * Free-text search, or a category's listings (the starter stocks or a fund category) optionally narrowed by text.
 * Mutual funds can come back named by code, so missing names are filled from the quote.
 */
export async function searchInstruments(query: string, category?: string | null): Promise<InstrumentSearchResult[]> {
  let results: InstrumentSearchResult[];
  try {
    if (category) {
      if (category !== STOCKS_CATEGORY && !CATEGORY_IDS.has(category)) throw new ApiError(400, "invalid_category");
      const text = query.trim().toLowerCase().slice(0, 60);
      const listed = category === STOCKS_CATEGORY ? STARTER_STOCKS : await cachedCategory(category);
      results = listed.filter(
        (r) => !text || r.name.toLowerCase().includes(text) || r.symbol.toLowerCase().includes(text),
      );
    } else {
      results = await cachedSearch(SearchQuery.parse(query).toLowerCase());
    }
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
