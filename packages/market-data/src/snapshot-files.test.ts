import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SnapshotFile } from "./snapshot";

// Guards every committed file in /data/snapshots, so a bad fetch or a
// hand-edited file fails CI instead of breaking a screen in the demo.
const dir = new URL("../../../data/snapshots/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

describe("committed snapshots", () => {
  it.each(files)("%s matches SnapshotFile", (name) => {
    const file = SnapshotFile.parse(JSON.parse(readFileSync(new URL(name, dir), "utf8")));
    expect(file.attribution.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has a sorted, duplicate-free series ending at its quote", (name) => {
    const { series, quote } = SnapshotFile.parse(JSON.parse(readFileSync(new URL(name, dir), "utf8")));
    for (let i = 1; i < series.length; i++) {
      expect(series[i]!.t > series[i - 1]!.t, `${name} point ${i}`).toBe(true);
    }
    const last = series.at(-1);
    if (last) expect(last).toEqual({ t: quote.asOf, value: quote.value });
  });

  it("are named <source>-<symbol>.json", () => {
    for (const name of files) {
      const { source, symbol } = SnapshotFile.parse(JSON.parse(readFileSync(new URL(name, dir), "utf8")));
      expect(name).toBe(`${source}-${symbol.toLowerCase()}.json`);
    }
  });
});
