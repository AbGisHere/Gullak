# Snapshots

Committed, real market data so the demo never depends on live APIs. One JSON file per symbol, named `<source>-<symbol>.json` and validated by `SnapshotFile` in `@gullak/market-data`:

Snapshots are optional illustrative inputs for later-world historical simulations; every core world must remain playable using fictional scenarios and virtual money.

```json
{ "symbol": "120716", "name": "…", "source": "amfi", "attribution": "…", "quote": { "kind": "nav", "value": 158.5759, "currency": "INR", "asOf": "2026-10-09T00:00:00+05:30", "source": "amfi" }, "series": [{ "t": "…", "value": … }] }
```

Rules (owner: R3):
- **Real data only.** Never invent or smooth values. Every file has an `attribution` naming the source.
- `asOf` and series `t` come from the source, as ISO date-times; NIFTY uses explicitly labelled UTC-midnight source-date markers, not observed trade timestamps. Other end-of-day snapshots use India time (`T00:00:00+05:30` for end-of-day values).
- `quote` equals the last series point. The series is sorted, with no duplicates.
- Files are written by scripts in `scripts/snapshots/`, never edited by hand. Biome skips these files; `packages/market-data/src/snapshot-files.test.ts` validates every one in CI.
- Units: rupees per unit for NAVs and prices, % p.a. for rates, points for index levels (see `MarketQuote`).

## Pipeline

Priority: **P1** is needed for the demo topics and the market sim (Phase 1–2); **P2** covers the rest of the curriculum (Phase 4). Every row maps to topics in [docs/curriculum.md](../../docs/curriculum.md#real-data-behind-every-topic).

| Data | Priority | Status | Script | Source | Symbol |
|---|---|---|---|---|---|
| Mutual fund NAV history, every category (liquid, overnight, money market, debt, index, equity, ETF) | P1 | Complete: script; one example committed | `pnpm snapshots:mf <code>... [--from YYYY-MM-DD]` | AMFI, via mfapi.in | AMFI scheme code, e.g. `120716` |
| NIFTY 50 and NIFTY 50 TRI history (incl. 2008, 2016, Feb–Apr 2020) | P1 | PRICE index 2019-10-01 through 2020-06-30 implemented; TRI and other episodes pending | `pnpm snapshots:nifty` | niftyindices.com historical data (NSE Indices) | `NIFTY-50`; TRI symbol pending |
| CPI inflation, headline and by group (food, fuel, education, health) | P1 | TODO(R3) | `scripts/snapshots/cpi.mjs` | MOSPI CPI (Combined), base 2012=100 | `CPI-IN`, `CPI-IN-FOOD`, … |
| Gold price (₹/gram, 24K) | P1 | TODO(R3) | `scripts/snapshots/gold.mjs` | IBJA published rates, or RBI DBIE | `XAU-INR` |
| Savings account, FD and RD rates | P1 | Partial: SBI 1-year FD rate committed | `scripts/snapshots/bank-rates.mjs` (from a hand-checked CSV with source URLs) | Banks' published rate pages, with the date checked | e.g. `FD-SBI-1Y`, `RD-SBI-1Y`, `SB-SBI` |
| Small-savings rates (PPF, SSY, NSC, post office) and history | P1 | TODO(R3) | `scripts/snapshots/small-savings.mjs` (hand-checked CSV) | Ministry of Finance quarterly notifications | `PPF`, `SSY`, `NSC` |
| Household spending by category | P1 | TODO(R3) | `scripts/snapshots/hces.mjs` (hand-checked CSV) | MoSPI HCES 2022–23 fact sheet | `HCES-RURAL`, `HCES-URBAN` |
| Other indices: Next 50, Midcap 150, a few sectors | P2 | TODO(R3) | `scripts/snapshots/nse-index.mjs` | NSE Indices | `NIFTYNEXT50`, … |
| Example stock prices (a few large caps) | P2 | TODO(R3) | `scripts/snapshots/nse-eod.mjs` | NSE end-of-day data | NSE symbol |
| T-bill (91-day) and 10-year G-sec yields | P2 | TODO(R3) | `scripts/snapshots/rbi-yields.mjs` | RBI DBIE | `TBILL-91D`, `GSEC-10Y` |
| RBI repo rate history | P2 | TODO(R3) | `scripts/snapshots/repo-rate.mjs` (hand-checked CSV) | RBI monetary policy statements | `REPO-IN` |
| Loan and credit-card interest rates | P2 | TODO(R3) | `scripts/snapshots/bank-rates.mjs` | Banks' published rate pages | e.g. `LOAN-PERSONAL-SBI` |
| UPI monthly volumes and value | P2 | TODO(R3) | `scripts/snapshots/npci-upi.mjs` | NPCI UPI product statistics | `UPI-VOLUME`, `UPI-VALUE` |
| NPS scheme NAVs | P2 | TODO(R3) | `scripts/snapshots/nps.mjs` | NPS Trust | scheme id |

Scam patterns (RBI Sachet and "BE(A)WARE", I4C / cybercrime.gov.in, NPCI) are not time series. They live in `packages/content` as activity data, each item citing its source.

Committed so far: `amfi-120716.json` (UTI Nifty 50 Index Fund, Direct, Growth), daily since 2019-01-01. It tracks NIFTY 50, so it already shows the March 2020 crash (77.52 on 3 Feb → 50.40 on 23 Mar 2020) for the flagship Practice episode.

### Adding a source (R3)

1. Copy `scripts/snapshots/mf-nav.mjs` to `scripts/snapshots/<source>.mjs`. Fetch, map to `{ t, value }`, sort, set `quote` from the last point, and write `<source>-<symbol>.json`.
2. Add a `snapshots:<source>` script to the root `package.json`.
3. Run it by hand and commit the JSON. `pnpm test` (CI) validates it.
4. For a live source, add an adapter beside `packages/market-data/src/adapters/amfi.ts` (with recorded-fixture tests) and wrap it with `withSnapshotFallback`.

Sample funds are only examples for practising with play money. Content never calls a fund "good", "best" or "recommended" (AGENTS.md › Hard guardrail).

`sbi-published-card-rate-fd-1y.json` is an educational snapshot, regenerated from `scripts/snapshots/fd-rates.csv`. Its one-year simulation assumes quarterly compounding and excludes taxes/penalties. It is never labelled live. NIFTY price-index demo history is available below; TRI, stock, gold and CPI snapshots remain pending; the first Time Machine uses the existing mutual-fund NAV history and identifies that dataset explicitly.

R3 demo addition: `nse-indices-nifty-50.json` holds 184 official NIFTY 50 daily closing PRICE-index observations, 2019-10-01 through 2020-06-30. It is not a total-return series or fund NAV. Source: https://www.niftyindices.com/reports/historical-data. Regenerate with `node scripts/snapshots/nifty-50.mjs`; missing dates stay absent. Dates use UTC-midnight markers. Gold/CPI remain follow-up R3 work.
