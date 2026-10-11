# NIFTY snapshot review

This R3 change adds official historical NIFTY 50 **price-index levels**, covering 2019-10-01 through 2020-06-30. It does not enable general index-fund trading or change the existing Practice episode's AMFI fund-NAV dataset. Practice mapping requires its own approved engine/content contract.

## Files and purpose

- `data/snapshots/nse-indices-nifty-50.json`: 184 observed daily closes with source, retrieval date and simulation assumptions. March 23, 2020 is 7,610.25 points; June 30 is 10,302.10 points. Missing dates remain absent.
- `scripts/snapshots/nifty-50.mjs` and root `package.json`: reproducible official-source acquisition with Zod validation, sorted dates, duplicate rejection and range checks.
- `packages/market-data/src/snapshot.ts` and `catalog.ts`: validate optional provenance fields and register the snapshot with the existing adapter.
- `apps/web/lib/backend/market.ts`: return source URL, retrieval time and price-index classification through the existing thin API route.
- Market package/API tests: verify observations, dated snapshot labels, provenance and absence of fabricated weekend values.
- Snapshot README, Postman collection, CHANGELOG and ROADMAP: document the dataset and remaining gaps.

Source: [NSE Indices historical data](https://www.niftyindices.com/reports/historical-data). Units are index points, even though the existing quote schema retains its INR currency field. The attribution explicitly states this distinction. Price-index data excludes dividends; it is not a total-return index or fund NAV. Simulation assumptions exclude tracking error, fees and taxes. Source dates use UTC-midnight date markers, not observed trade timestamps.

## Commands and expected results

```powershell
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

All must succeed before committing/pushing. Unit tests use committed observations and never fetch market data. To deliberately refresh the committed snapshot from its official source:

```powershell
pnpm.cmd snapshots:nifty
```

Expected acquisition output: 184 official observations with as-of `2020-06-30T00:00:00Z`. Inspect any source change before replacing reviewed data. Retrieval time changes on refresh; the historical as-of date does not become today's date.

## Postman verification

Start the local app with `pnpm.cmd --filter @gullak/web dev`. Set `baseUrl` to `http://localhost:3000` and send `GET {{baseUrl}}/api/market/NIFTY-50` (the existing NIFTY request in the collection).

Expect HTTP 200 with `data.quote.kind = "index-level"`, `value = 10302.1`, `isSnapshot = true`, `asOf = "2020-06-30T00:00:00Z"`, `source = "nse-indices"`, and outer `seriesType = "price-index"`, `sourceUrl` and `retrievedAt`. Attribution must explain units and assumptions. This historical quote is never labelled live.

The new symbol is not yet a hosted acceptance claim. Repeat this request on hosted only after the snapshot PR is merged and R1 deploys it. No Supabase dashboard action or migration is needed for this dataset.

## Separate remaining work

Gold/CPI and TRI snapshots remain pending; no replacement values are invented. The demo's FD, quiz and generic activity flows passed hosted HTTP acceptance; the acceptance report is prepared separately for review. Phone/desktop browser acceptance, reviewed Practice result contracts and mission publication/deployment remain separate gates. The RPC missing-revision guard stays deferred until after the demo.
