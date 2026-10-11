import { describe, expect, it, vi } from "vitest";
import { MarketDataError } from "../adapter";
import { createYahooAdapter } from "./yahoo";

// Recorded (trimmed) Yahoo Finance responses from 9-Oct-2026 (Friday close). Tests never hit the network.
const relianceChart = {
  chart: {
    result: [
      {
        meta: {
          symbol: "RELIANCE.NS",
          currency: "INR",
          instrumentType: "EQUITY",
          longName: "Reliance Industries Limited",
          shortName: "RELIANCE INDUSTRIES LTD",
          regularMarketPrice: 1170.3,
          chartPreviousClose: 1178,
          regularMarketTime: 1791539100,
          regularMarketDayHigh: 1182.5,
          regularMarketDayLow: 1165,
          fiftyTwoWeekHigh: 1608.95,
          fiftyTwoWeekLow: 1114.85,
          regularMarketVolume: 0,
        },
        timestamp: [1791453600, 1791539100],
        indicators: { quote: [{ close: [1178, 1170.3] }] },
      },
    ],
  },
};
const fundChart = {
  chart: {
    result: [
      {
        meta: {
          symbol: "0P00009J3K.BO",
          currency: "INR",
          instrumentType: "MUTUALFUND",
          longName: "HDFC Mid Cap Regular Gr",
          shortName: "0P00009J3K.BO",
          regularMarketPrice: 198.134,
          chartPreviousClose: 195.669,
          regularMarketTime: 1791540000,
        },
      },
    ],
  },
};
const usdChart = {
  chart: { result: [{ meta: { ...relianceChart.chart.result[0]?.meta, symbol: "RS", currency: "USD" } }] },
};
const search = {
  quotes: [
    { symbol: "RELIANCE.NS", exchange: "NSI", quoteType: "EQUITY", shortname: "RELIANCE INDUSTRIES LTD" },
    { symbol: "RS", exchange: "NYQ", quoteType: "EQUITY", shortname: "Reliance, Inc." },
    { symbol: "RIGD.IL", exchange: "IOB", quoteType: "EQUITY", shortname: "RELIANCE INDUSTRIES LIMITED GDR" },
    { symbol: "RELIANCE.BO", exchange: "BSE", quoteType: "EQUITY", shortname: "RELIANCE INDUSTRIES LTD." },
    { symbol: "NIFTYBEES.NS", exchange: "NSI", quoteType: "EQUITY", shortname: "NIP IND ETF NIFTY BEES" },
    { symbol: "0P00009J3K.BO", exchange: "BSE", quoteType: "MUTUALFUND", shortname: "0P00009J3K.BO" },
    { symbol: "^NSEI", exchange: "NSI", quoteType: "INDEX", shortname: "NIFTY 50" },
    { symbol: "^GSPC", exchange: "SNP", quoteType: "INDEX", shortname: "S&P 500" },
  ],
};

const json = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("createYahooAdapter", () => {
  it("maps a chart response to an instrument quote with Yahoo's own timestamp", async () => {
    const yahoo = createYahooAdapter({ fetch: json(relianceChart) });
    await expect(yahoo.getInstrumentQuote("RELIANCE.NS")).resolves.toEqual({
      symbol: "RELIANCE.NS",
      name: "Reliance Industries Limited",
      exchange: "NSE",
      kind: "stock",
      price: 1170.3,
      previousClose: 1178,
      dayHigh: 1182.5,
      dayLow: 1165,
      week52High: 1608.95,
      week52Low: 1114.85,
      yearAgoPrice: 1178,
      currency: "INR",
      asOf: "2026-10-09T09:45:00.000Z",
      source: "yahoo-finance",
    });
  });

  it("classifies mutual funds from BSE and serves the shared MarketQuote contract", async () => {
    const yahoo = createYahooAdapter({ fetch: json(fundChart) });
    await expect(yahoo.getInstrumentQuote("0P00009J3K.BO")).resolves.toMatchObject({
      kind: "mutual-fund",
      exchange: "BSE",
      name: "HDFC Mid Cap Regular Gr",
    });
    await expect(yahoo.getQuote("0P00009J3K.BO")).resolves.toMatchObject({ kind: "nav", value: 198.134 });
  });

  it("rejects non-Indian symbols before any request and non-rupee prices after one", async () => {
    const fetch = json(usdChart);
    const yahoo = createYahooAdapter({ fetch });
    await expect(yahoo.getInstrumentQuote("AAPL")).rejects.toBeInstanceOf(MarketDataError);
    expect(fetch).not.toHaveBeenCalled();
    await expect(yahoo.getInstrumentQuote("RELIANCE.NS")).rejects.toThrow("not priced in rupees");
  });

  it("turns HTTP failures and malformed payloads into MarketDataError", async () => {
    await expect(createYahooAdapter({ fetch: json({}, 503) }).getInstrumentQuote("TCS.NS")).rejects.toBeInstanceOf(
      MarketDataError,
    );
    await expect(
      createYahooAdapter({ fetch: json({ chart: { result: [] } }) }).getInstrumentQuote("TCS.NS"),
    ).rejects.toBeInstanceOf(MarketDataError);
    const offline = vi.fn(async () => {
      throw new TypeError("network down");
    }) as unknown as typeof fetch;
    await expect(createYahooAdapter({ fetch: offline }).getInstrumentQuote("TCS.NS")).rejects.toBeInstanceOf(
      MarketDataError,
    );
  });

  it("returns a daily close series inside the requested range", async () => {
    const yahoo = createYahooAdapter({ fetch: json(relianceChart) });
    await expect(yahoo.getSeries("RELIANCE.NS", "2026-10-09", "2026-10-09")).resolves.toEqual([
      { t: "2026-10-09T09:45:00.000Z", value: 1170.3 },
    ]);
  });

  it("charts a period from Yahoo's closes, skipping gaps, with the matching range and step", async () => {
    const gappy = structuredClone(relianceChart);
    const [result] = gappy.chart.result;
    if (result) {
      result.timestamp = [1791453600, 1791453900, 1791539100];
      result.indicators.quote = [{ close: [1178, null, 1170.3] as unknown as number[] }];
    }
    const fetch = json(gappy);
    const yahoo = createYahooAdapter({ fetch });
    await expect(yahoo.getChart("RELIANCE.NS", "1d")).resolves.toEqual({
      symbol: "RELIANCE.NS",
      range: "1d",
      points: [
        { t: "2026-10-08T10:00:00.000Z", price: 1178 },
        { t: "2026-10-09T09:45:00.000Z", price: 1170.3 },
      ],
      previousClose: 1178,
      source: "yahoo-finance",
    });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain("range=1d&interval=5m");
    await yahoo.getChart("RELIANCE.NS", "1y");
    expect(String(vi.mocked(fetch).mock.calls[1]?.[0])).toContain("range=1y&interval=1d");
    await expect(yahoo.getChart("AAPL", "1w")).rejects.toBeInstanceOf(MarketDataError);
  });

  it("keeps only Indian listings in search, NSE first, and labels ETFs, funds and indices", async () => {
    const yahoo = createYahooAdapter({ fetch: json(search) });
    const results = await yahoo.search("reliance");
    expect(results.map((r) => [r.symbol, r.exchange, r.kind])).toEqual([
      ["RELIANCE.NS", "NSE", "stock"],
      ["NIFTYBEES.NS", "NSE", "etf"],
      ["^NSEI", "NSE", "index"],
      ["RELIANCE.BO", "BSE", "stock"],
      ["0P00009J3K.BO", "BSE", "mutual-fund"],
    ]);
  });

  it("skips the request for queries shorter than two characters and caps results", async () => {
    const fetch = json(search);
    const yahoo = createYahooAdapter({ fetch });
    await expect(yahoo.search(" r ")).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    await expect(yahoo.search("reliance", 2)).resolves.toHaveLength(2);
  });
});
