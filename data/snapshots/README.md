# Snapshots

Committed, real market data so the demo never depends on live APIs. One JSON file per symbol, named `<source>-<symbol>.json` and validated by `SnapshotFile` in `@gullak/market-data`:

```json
{ "symbol": "120716", "name": "…", "source": "amfi", "attribution": "…", "quote": { "kind": "nav", "value": 158.5759, "currency": "INR", "asOf": "2026-10-09T00:00:00+05:30", "source": "amfi" }, "series": [{ "t": "…", "value": … }] }
```

Rules (owner: R3):
- **Real data only.** Never invent or smooth values. Every file has an `attribution` naming the source.
- `asOf` and series `t` come from the source, as ISO date-times in India time (`T00:00:00+05:30` for end-of-day values).
- `quote` equals the last series point. The series is sorted, with no duplicates.
- Files are written by scripts in `scripts/snapshots/`, never edited by hand. Biome skips these files; `packages/market-data/src/snapshot-files.test.ts` validates every one in CI.
- Units: rupees per unit for NAVs and prices, % p.a. for rates, points for index levels (see `MarketQuote`).

## Pipeline

| Data | Status | Script | Source | Symbol |
|---|---|---|---|---|
| Mutual fund NAV history | ✅ worked example | `pnpm snapshots:mf <code>... [--from YYYY-MM-DD]` | AMFI, via mfapi.in | AMFI scheme code, e.g. `120716` |
| NIFTY 50 history (incl. Feb–Apr 2020) | TODO(R3) | `scripts/snapshots/nifty.mjs` | niftyindices.com historical data (NSE Indices) | `NIFTY50` |
| Gold price (₹/gram, 24K) | TODO(R3) | `scripts/snapshots/gold.mjs` | IBJA published rates, or RBI DBIE | `XAU-INR` |
| CPI inflation (for "real" returns) | TODO(R3) | `scripts/snapshots/cpi.mjs` | MOSPI CPI (Combined), base 2012=100 | `CPI-IN` |
| FD rates | TODO(R3) | `scripts/snapshots/fd-rates.mjs` (from a hand-checked CSV with source URLs) | Banks' published FD rate pages, with the date checked | e.g. `FD-SBI-1Y` |

Committed so far: `amfi-120716.json` (UTI Nifty 50 Index Fund, Direct, Growth), daily since 2019-01-01. It tracks NIFTY 50, so it already shows the March 2020 crash (77.52 on 3 Feb → 50.40 on 23 Mar 2020) for the Time Machine.

### Adding a source (R3)

1. Copy `scripts/snapshots/mf-nav.mjs` to `scripts/snapshots/<source>.mjs`. Fetch, map to `{ t, value }`, sort, set `quote` from the last point, and write `<source>-<symbol>.json`.
2. Add a `snapshots:<source>` script to the root `package.json`.
3. Run it by hand and commit the JSON. `pnpm test` (CI) validates it.
4. For a live source, add an adapter beside `packages/market-data/src/adapters/amfi.ts` (with recorded-fixture tests) and wrap it with `withSnapshotFallback`.

Sample funds are only examples for practising with play money. Content never calls a fund "good", "best" or "recommended" (AGENTS.md › Hard guardrail).
