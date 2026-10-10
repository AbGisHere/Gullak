import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

const Row = z.object({
  symbol: z.string().regex(/^[A-Z0-9-]+$/),
  source: z.string().regex(/^[a-z0-9-]+$/),
  ratePercent: z.coerce.number().min(0).max(100),
  effectiveDate: z.iso.date(),
  sourceUrl: z.url(),
  terms: z.string().min(1),
});
const [header, ...lines] = readFileSync(new URL("./fd-rates.csv", import.meta.url), "utf8")
  .trim()
  .split(/\r?\n/);
const fields = header.split(",");
for (const line of lines) {
  const row = Row.parse(Object.fromEntries(line.split(",").map((value, i) => [fields[i], value])));
  const file = {
    symbol: row.symbol,
    source: row.source,
    attribution: `${row.source}: ${row.terms}. Effective ${row.effectiveDate}. ${row.sourceUrl}. Hand-checked 2026-10-10.`,
    quote: {
      kind: "rate",
      value: row.ratePercent,
      currency: "INR",
      asOf: `${row.effectiveDate}T00:00:00+05:30`,
      source: row.source,
    },
    series: [],
  };
  writeFileSync(
    new URL(`../../data/snapshots/${row.source}-${row.symbol.toLowerCase()}.json`, import.meta.url),
    `${JSON.stringify(file, null, 2)}\n`,
  );
}
console.log("FD snapshot regenerated from hand-checked published rates; it is not live data.");
