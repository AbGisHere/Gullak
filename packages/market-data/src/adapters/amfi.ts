import { IsoDateTime, type MarketQuote } from "@gullak/types";
import { z } from "zod";
import { type MarketDataAdapter, MarketDataError } from "../adapter";

/**
 * AMFI publishes every Indian mutual fund's latest NAV once a day in one
 * semicolon-separated file. Worked example of the adapter pattern
 * (AGENTS.md › How to add a market-data adapter): fetch, validate the raw
 * response with Zod, map to `MarketQuote`, take `asOf` from the source.
 *
 * Symbols are AMFI scheme codes, e.g. `120716`.
 */
export const AMFI_NAV_URL = "https://portal.amfiindia.com/spages/NAVAll.txt";

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/** `09-Oct-2026` → `2026-10-09T00:00:00+05:30` (NAVs are end-of-day, India time). */
const AmfiDate = z
  .string()
  .regex(/^\d{2}-[A-Z][a-z]{2}-\d{4}$/)
  .transform((s, ctx) => {
    const [day, mon, year] = s.split("-");
    const month = mon ? MONTHS[mon] : undefined;
    if (!month) {
      ctx.addIssue({ code: "custom", message: `unknown month in ${s}` });
      return z.NEVER;
    }
    return `${year}-${month}-${day}T00:00:00+05:30`;
  })
  .pipe(IsoDateTime);

/** One data row: code;ISIN growth;ISIN reinvest;name;plan;option;NAV;date */
const AmfiRow = z
  .tuple([
    z.string().regex(/^\d+$/),
    z.string(),
    z.string(),
    z.string().min(1),
    z.string(),
    z.string(),
    z.coerce.number().finite().positive(),
    AmfiDate,
  ])
  .transform(([schemeCode, , , name, , , nav, asOf]) => ({ schemeCode, name, nav, asOf }));
// NAVAll also serves the standard six-column layout (plan/option are part of the name).
const StandardAmfiRow = z
  .tuple([
    z.string().regex(/^\d+$/),
    z.string(),
    z.string(),
    z.string().min(1),
    z.coerce.number().finite().positive(),
    AmfiDate,
  ])
  .transform(([schemeCode, , , name, nav, asOf]) => ({ schemeCode, name, nav, asOf }));
export type AmfiNav = z.output<typeof AmfiRow>;

/**
 * Parses the whole file into scheme code → latest NAV. Header, fund-house and
 * category lines, blanks and rows without a usable NAV (`N.A.`) are skipped.
 */
export function parseAmfiNavAll(text: string): Map<string, AmfiNav> {
  const navs = new Map<string, AmfiNav>();
  for (const line of text.split(/\r?\n/)) {
    const row = z.union([StandardAmfiRow, AmfiRow]).safeParse(line.trim().split(";"));
    if (row.success) navs.set(row.data.schemeCode, row.data);
  }
  return navs;
}

export interface AmfiAdapterOptions {
  /** Injected so tests use recorded fixtures and never hit the network. */
  fetch?: typeof fetch;
  url?: string;
}

/** Live AMFI adapter. Wrap it: `withCache(withSnapshotFallback(amfi, snapshot), cache, ttl)`. */
export function createAmfiAdapter({ fetch: fetchFn = fetch, url = AMFI_NAV_URL }: AmfiAdapterOptions = {}) {
  const adapter: MarketDataAdapter = {
    id: "amfi",
    async getQuote(symbol): Promise<MarketQuote> {
      let text: string;
      try {
        const res = await fetchFn(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      } catch (cause) {
        throw new MarketDataError("AMFI NAV file unavailable", "amfi", { cause });
      }
      // TODO(R3): this downloads ~2 MB per cache miss. Cache the parsed map
      // (one key, ~1 day TTL) once there's a shared cache in production.
      const nav = parseAmfiNavAll(text).get(symbol);
      if (!nav) throw new MarketDataError(`no AMFI NAV for scheme ${symbol}`, "amfi");
      return {
        symbol,
        kind: "nav",
        value: nav.nav,
        currency: "INR",
        asOf: nav.asOf,
        source: "amfi",
        isSnapshot: false,
      };
    },
    async getSeries() {
      // AMFI's daily file has no history. The Time Machine reads NAV history
      // from committed snapshots (`pnpm snapshots:mf`), which the fallback serves.
      throw new MarketDataError("AMFI live adapter has no history; use snapshots", "amfi");
    },
  };
  return adapter;
}
