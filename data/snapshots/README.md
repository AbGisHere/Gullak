# Snapshots

Committed, real market data so the demo never depends on live APIs. One JSON file per symbol, validated by `SnapshotFile` in `@gullak/market-data`:

```json
{ "symbol": "NIFTY50", "source": "nse", "attribution": "NSE India, index history", "quote": { … }, "series": [ … ] }
```

Rules: real data only (never invented values), always with `asOf` and attribution. Owner: R3.
