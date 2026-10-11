import "server-only";
import { committedMarketData, committedSnapshots, createAmfiAdapter, withSnapshotFallback } from "@gullak/market-data";
import { unstable_cache } from "next/cache";
import { ApiError } from "./errors";

// Next's persistent data cache, not module-memory session state or MemoryCache.
const amfi = withSnapshotFallback(
  createAmfiAdapter({
    fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } }),
  }),
  committedMarketData,
);
const cachedNav = unstable_cache(async (symbol: string) => amfi.getQuote(symbol), ["gullak-market-quote-v1"], {
  revalidate: 3600,
});
export async function marketQuote(symbol: string) {
  const snapshot = committedSnapshots.find((f) => f.symbol === symbol);
  if (!snapshot) throw new ApiError(404, "market_symbol_unavailable");
  const quote = snapshot.quote.kind === "nav" ? await cachedNav(symbol) : await committedMarketData.getQuote(symbol);
  return {
    quote,
    attribution: quote.isSnapshot
      ? snapshot.attribution
      : "AMFI daily NAV file: https://portal.amfiindia.com/spages/NAVAll.txt",
    snapshotAttribution: snapshot.attribution,
    sourceUrl: snapshot.sourceUrl,
    seriesType: snapshot.seriesType,
    retrievedAt: snapshot.retrievedAt,
  };
}
