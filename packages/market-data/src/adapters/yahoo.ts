import {
  type ChartRange,
  IndianSymbol,
  InstrumentChart,
  InstrumentQuote,
  InstrumentSearchResult,
  type ListedKind,
  type MarketQuote,
  type SeriesPoint,
} from "@gullak/types";
import { z } from "zod";
import { type MarketDataAdapter, MarketDataError } from "../adapter";

/**
 * Yahoo Finance's public chart and search endpoints, limited to Indian listings (NSE `.NS`,
 * BSE `.BO` and Indian indices). Used for Live paper trading: learners look up a real
 * instrument and practise with play money. Prices can be delayed; `asOf` comes from Yahoo.
 * These endpoints are unofficial and keyless, so callers cache results and show honest
 * "price unavailable" states when they fail.
 */
export const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
export const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";
const SOURCE = "yahoo-finance";
const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; Gullak learning app)", Accept: "application/json" };

/** Yahoo's range and step for each chart period. */
const CHART_PERIODS: Record<ChartRange, [range: string, interval: string]> = {
  "1d": ["1d", "5m"],
  "1w": ["5d", "30m"],
  "1m": ["1mo", "1d"],
  "1y": ["1y", "1d"],
};

const exchangeOf = (symbol: string): "NSE" | "BSE" => (symbol.endsWith(".BO") ? "BSE" : "NSE");

/** ETFs list as plain equity on Yahoo India; their names say ETF or BeES. */
function kindOf(symbol: string, quoteType: string | undefined, name: string): ListedKind {
  if (symbol.startsWith("^") || quoteType === "INDEX") return "index";
  if (quoteType === "MUTUALFUND") return "mutual-fund";
  if (quoteType === "ETF" || /\b(ETF|BEES)\b/i.test(name)) return "etf";
  return "stock";
}

const ChartMeta = z.object({
  symbol: z.string(),
  currency: z.string().optional(),
  instrumentType: z.string().optional(),
  longName: z.string().optional(),
  shortName: z.string().optional(),
  regularMarketPrice: z.number().finite().positive(),
  chartPreviousClose: z.number().finite().positive().optional(),
  regularMarketTime: z.number().int().positive(),
  regularMarketDayHigh: z.number().finite().positive().optional(),
  regularMarketDayLow: z.number().finite().positive().optional(),
  fiftyTwoWeekHigh: z.number().finite().positive().optional(),
  fiftyTwoWeekLow: z.number().finite().positive().optional(),
  regularMarketVolume: z.number().int().nonnegative().optional(),
});
const ChartResponse = z.object({
  chart: z.object({
    result: z
      .array(
        z.object({
          meta: ChartMeta,
          timestamp: z.array(z.number().int()).optional(),
          indicators: z
            .object({ quote: z.array(z.object({ close: z.array(z.number().nullable()).optional() })) })
            .optional(),
        }),
      )
      .min(1),
  }),
});
const SearchResponse = z.object({
  quotes: z
    .array(
      z.object({
        symbol: z.string(),
        exchange: z.string().optional(),
        quoteType: z.string().optional(),
        shortname: z.string().optional(),
        longname: z.string().optional(),
      }),
    )
    .default([]),
});

/** `1791540000` (Unix seconds) → `2026-10-11T04:40:00.000Z`. */
const isoFromUnix = (seconds: number) => new Date(seconds * 1000).toISOString();

export interface YahooAdapter extends MarketDataAdapter {
  /** Live (possibly delayed) price for one Indian listing. */
  getInstrumentQuote(symbol: string): Promise<InstrumentQuote>;
  /** Prices over one chart period: 5-minute steps for a day, 30-minute for a week, daily otherwise. */
  getChart(symbol: string, range: ChartRange): Promise<InstrumentChart>;
  /** Indian listings matching free text, NSE before BSE, at most `limit`. */
  search(query: string, limit?: number): Promise<InstrumentSearchResult[]>;
}

export function createYahooAdapter(deps: { fetch: typeof fetch }): YahooAdapter {
  async function getJson(url: string) {
    let response: Response;
    try {
      response = await deps.fetch(url, { headers: HEADERS });
    } catch (cause) {
      throw new MarketDataError("Yahoo Finance request failed", SOURCE, { cause });
    }
    if (!response.ok) throw new MarketDataError(`Yahoo Finance returned ${response.status}`, SOURCE);
    try {
      return (await response.json()) as unknown;
    } catch (cause) {
      throw new MarketDataError("Yahoo Finance sent invalid JSON", SOURCE, { cause });
    }
  }

  async function chart(symbol: string, range: string, interval: string) {
    const parsedSymbol = IndianSymbol.safeParse(symbol);
    if (!parsedSymbol.success) throw new MarketDataError(`Not an Indian listing: ${symbol}`, SOURCE);
    const url = `${YAHOO_CHART_URL}${encodeURIComponent(parsedSymbol.data)}?range=${range}&interval=${interval}`;
    const parsed = ChartResponse.safeParse(await getJson(url));
    if (!parsed.success) throw new MarketDataError(`Unexpected chart response for ${symbol}`, SOURCE);
    const result = parsed.data.chart.result[0];
    if (!result) throw new MarketDataError(`No chart data for ${symbol}`, SOURCE);
    if (result.meta.currency !== "INR") throw new MarketDataError(`${symbol} is not priced in rupees`, SOURCE);
    return result;
  }

  async function getInstrumentQuote(symbol: string): Promise<InstrumentQuote> {
    // Today's figures come from a one-day chart (its previous close is yesterday's); a year of
    // monthly closes gives the 1-year change and is optional.
    const [{ meta }, year] = await Promise.all([
      chart(symbol, "1d", "1d"),
      chart(symbol, "1y", "1mo").catch(() => undefined),
    ]);
    const yearAgoPrice = year?.indicators?.quote[0]?.close?.find((c): c is number => typeof c === "number" && c > 0);
    const optional = (value: number | undefined) => (value && value > 0 ? value : undefined);
    const stats = {
      dayHigh: optional(meta.regularMarketDayHigh),
      dayLow: optional(meta.regularMarketDayLow),
      week52High: optional(meta.fiftyTwoWeekHigh),
      week52Low: optional(meta.fiftyTwoWeekLow),
      volume: optional(meta.regularMarketVolume),
      yearAgoPrice,
    };
    const name = (meta.longName ?? meta.shortName ?? symbol).slice(0, 120);
    return InstrumentQuote.parse({
      symbol,
      name,
      exchange: exchangeOf(symbol),
      kind: kindOf(symbol, meta.instrumentType, name),
      price: meta.regularMarketPrice,
      ...(meta.chartPreviousClose ? { previousClose: meta.chartPreviousClose } : {}),
      ...Object.fromEntries(Object.entries(stats).filter(([, v]) => v !== undefined)),
      currency: "INR",
      asOf: isoFromUnix(meta.regularMarketTime),
      source: SOURCE,
    });
  }

  async function getChart(symbol: string, range: ChartRange): Promise<InstrumentChart> {
    const [yahooRange, interval] = CHART_PERIODS[range];
    const result = await chart(symbol, yahooRange, interval);
    const closes = result.indicators?.quote[0]?.close ?? [];
    const points = (result.timestamp ?? []).flatMap((t, i) => {
      const price = closes[i];
      return typeof price === "number" && price > 0 ? [{ t: isoFromUnix(t), price }] : [];
    });
    return InstrumentChart.parse({
      symbol,
      range,
      points,
      ...(result.meta.chartPreviousClose ? { previousClose: result.meta.chartPreviousClose } : {}),
      source: SOURCE,
    });
  }

  return {
    id: SOURCE,
    getInstrumentQuote,
    getChart,
    async getQuote(symbol): Promise<MarketQuote> {
      const quote = await getInstrumentQuote(symbol);
      return {
        symbol,
        kind: quote.kind === "index" ? "index-level" : quote.kind === "mutual-fund" ? "nav" : "price",
        value: quote.price,
        currency: "INR",
        asOf: quote.asOf,
        source: SOURCE,
        isSnapshot: false,
      };
    },
    async getSeries(symbol, from, to): Promise<SeriesPoint[]> {
      const result = await chart(symbol, "max", "1d");
      const closes = result.indicators?.quote[0]?.close ?? [];
      return (result.timestamp ?? [])
        .map((t, i) => ({ t: isoFromUnix(t), value: closes[i] }))
        .filter((p): p is SeriesPoint => typeof p.value === "number" && p.t >= from && p.t <= `${to}￿`);
    },
    async search(query, limit = 10) {
      const q = query.trim().slice(0, 60);
      if (q.length < 2) return [];
      const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(q)}&quotesCount=20&newsCount=0&listsCount=0`;
      const parsed = SearchResponse.safeParse(await getJson(url));
      if (!parsed.success) throw new MarketDataError("Unexpected search response", SOURCE);
      const results: InstrumentSearchResult[] = [];
      for (const item of parsed.data.quotes) {
        const symbol = IndianSymbol.safeParse(item.symbol);
        if (!symbol.success) continue;
        const isIndex = symbol.data.startsWith("^");
        // Indian indices only: Yahoo also lists foreign indices with a caret.
        if (isIndex && item.exchange !== "NSI" && item.exchange !== "BSE") continue;
        const name = (item.longname ?? item.shortname ?? symbol.data).slice(0, 120);
        const parsedResult = InstrumentSearchResult.safeParse({
          symbol: symbol.data,
          name,
          exchange: exchangeOf(symbol.data),
          kind: kindOf(symbol.data, item.quoteType, name),
        });
        if (parsedResult.success) results.push(parsedResult.data);
      }
      results.sort((a, b) => (a.exchange === b.exchange ? 0 : a.exchange === "NSE" ? -1 : 1));
      return results.slice(0, limit);
    },
  };
}
