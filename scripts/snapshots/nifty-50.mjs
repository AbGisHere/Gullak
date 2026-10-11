// Fetches official historical PRICE-index closes, never a total-return or fund NAV series.
import { writeFileSync } from "node:fs";
import { z } from "zod";

const endpoint = "https://www.niftyindices.com/BackPage/getHistoricaldatatabletoString";
const sourceUrl = "https://www.niftyindices.com/reports/historical-data";
const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json", Referer: sourceUrl },
  body: JSON.stringify({
    cinfo: "{'name':'NIFTY 50','startDate':'01-Oct-2019','endDate':'30-Jun-2020','indexName':'NIFTY 50'}",
  }),
  signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`Official NIFTY history HTTP ${response.status}`);
const rows = z
  .array(z.object({ INDEX_NAME: z.literal("Nifty 50"), HistoricalDate: z.string(), CLOSE: z.string() }))
  .min(1)
  .parse(JSON.parse(await response.text()));
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const series = rows
  .map((row) => {
    const date = /^(\d{2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(row.HistoricalDate);
    if (!date) throw new Error("Unexpected NIFTY source date");
    const month = months.indexOf(date[2]) + 1;
    if (!month) throw new Error("Invalid NIFTY month");
    const t = `${date[3]}-${String(month).padStart(2, "0")}-${date[1]}T00:00:00Z`;
    if (!Number.isFinite(Date.parse(t)) || new Date(t).toISOString().slice(0, 10) !== t.slice(0, 10))
      throw new Error("Invalid NIFTY calendar date");
    const value = z.coerce.number().finite().positive().parse(row.CLOSE);
    if (t < "2019-10-01" || t > "2020-06-30T23:59:59Z") throw new Error("NIFTY row outside requested range");
    return { t, value };
  })
  .sort((a, b) => a.t.localeCompare(b.t));
if (new Set(series.map((p) => p.t)).size !== series.length) throw new Error("Duplicate NIFTY source date");
if (series[0].t.slice(0, 10) !== "2019-10-01" || series.at(-1).t.slice(0, 10) !== "2020-06-30")
  throw new Error("Incomplete demo endpoints");
const last = series.at(-1);
const snapshot = {
  symbol: "NIFTY-50",
  name: "NIFTY 50 historical price index (points)",
  source: "nse-indices",
  sourceUrl,
  retrievedAt: new Date().toISOString(),
  seriesType: "price-index",
  attribution:
    "NSE Indices Limited, official NIFTY 50 daily closing price-index levels, 2019-10-01 through 2020-06-30. Units: index points, not rupees, fund NAV or total-return index. Source dates represented at UTC midnight as date markers, not observed trade times. Non-trading/missing dates are not interpolated. Historical simulation only; excludes dividends, tracking error, fees and tax.",
  quote: { kind: "index-level", value: last.value, currency: "INR", asOf: last.t, source: "nse-indices" },
  series,
};
writeFileSync(
  new URL("../../data/snapshots/nse-indices-nifty-50.json", import.meta.url),
  `${JSON.stringify(snapshot, null, 2)}\n`,
);
console.log(`Saved ${series.length} official NIFTY price-index observations; as-of ${last.t}. No fabricated rows.`);
