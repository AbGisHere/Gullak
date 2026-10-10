#!/usr/bin/env node
// Writes real mutual-fund NAV history to data/snapshots/amfi-<scheme>.json
// (the `SnapshotFile` shape in @gullak/market-data). Worked example of the
// snapshot pipeline; copy it for each new source (see data/snapshots/README.md).
//
// Source: AMFI NAV history, served as JSON by mfapi.in (values match AMFI's own
// NAVAll.txt). Run by hand when data needs refreshing, never in tests or CI.
//
// Usage: pnpm snapshots:mf <scheme-code>... [--from YYYY-MM-DD]
//   e.g. pnpm snapshots:mf 120716 --from 2019-01-01
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const fromIdx = args.indexOf("--from");
const from = fromIdx >= 0 ? args.splice(fromIdx, 2)[1] : "2019-01-01";
const codes = args;
if (!codes.length || !/^\d{4}-\d{2}-\d{2}$/.test(from ?? "") || codes.some((c) => !/^\d+$/.test(c))) {
  console.error("usage: pnpm snapshots:mf <scheme-code>... [--from YYYY-MM-DD]");
  process.exit(1);
}

/** mfapi dates are `DD-MM-YYYY`; NAVs are end-of-day India time. */
const toIso = (d) => {
  const [day, month, year] = d.split("-");
  return `${year}-${month}-${day}T00:00:00+05:30`;
};

mkdirSync("data/snapshots", { recursive: true });
for (const code of codes) {
  const res = await fetch(`https://api.mfapi.in/mf/${code}`);
  const body = res.ok ? await res.json() : undefined;
  if (body?.status !== "SUCCESS" || !Array.isArray(body.data) || !body.data.length) {
    console.error(`✖ ${code}: no NAV history (HTTP ${res.status})`);
    process.exitCode = 1;
    continue;
  }
  const series = body.data
    .map((p) => ({ t: toIso(p.date), value: Number(p.nav) }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0 && p.t.slice(0, 10) >= from)
    .sort((a, b) => a.t.localeCompare(b.t));
  const last = series.at(-1);
  if (!last) {
    console.error(`✖ ${code}: no NAVs since ${from}`);
    process.exitCode = 1;
    continue;
  }
  const file = {
    symbol: code,
    name: body.meta.scheme_name,
    source: "amfi",
    attribution: `AMFI India NAV history for ${body.meta.scheme_name} (${body.meta.fund_house}), via mfapi.in`,
    quote: { kind: "nav", value: last.value, currency: "INR", asOf: last.t, source: "amfi" },
    series,
  };
  const out = `data/snapshots/amfi-${code}.json`;
  writeFileSync(out, `${JSON.stringify(file)}\n`);
  console.log(`✔ ${out}: ${series.length} NAVs, ${series[0].t.slice(0, 10)} → ${last.t.slice(0, 10)}`);
}
