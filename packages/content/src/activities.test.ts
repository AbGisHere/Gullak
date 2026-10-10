import { existsSync, readdirSync, readFileSync } from "node:fs";
import { Activity, Episode, SeriesPoint } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { allUnlockRules, locales } from "./config";

// Validates every activity and Practice episode file: schema, file layout,
// links into the topic graph, and real price data covering each episode.
const root = new URL("../", import.meta.url);
const snapshots = new URL("../../../data/snapshots/", import.meta.url);
const localeCodes = new Set(locales.locales.map((l) => l.code));
const topicIds = new Set(allUnlockRules.map((r) => r.topicId));

function filesIn(kind: "activities" | "episodes") {
  const dir = new URL(`${kind}/`, root);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      readdirSync(new URL(`${d.name}/`, dir))
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({
          folder: d.name,
          locale: f.replace(/\.json$/, ""),
          json: JSON.parse(readFileSync(new URL(`${d.name}/${f}`, dir), "utf8")) as unknown,
        })),
    );
}

const activities = filesIn("activities").map((f) => ({ ...f, data: Activity.parse(f.json) }));
const episodes = filesIn("episodes").map((f) => ({ ...f, data: Episode.parse(f.json) }));
const all = [...activities, ...episodes];

describe("activities and episodes", () => {
  it("include one example per engine", () => {
    expect(activities.some((a) => a.data.kind === "spot-sort")).toBe(true);
    expect(activities.some((a) => a.data.kind === "story")).toBe(true);
    expect(episodes.length).toBeGreaterThan(0);
  });

  it.each(all.map((f) => [`${f.folder}/${f.locale}`, f] as const))("%s matches its folder and locale", (_, f) => {
    expect(f.data.id).toBe(f.folder);
    expect(f.data.locale).toBe(f.locale);
    expect(localeCodes.has(f.locale), f.locale).toBe(true);
  });

  it("have an English version of everything", () => {
    for (const folder of new Set(all.map((f) => f.folder))) {
      expect(
        all.some((f) => f.folder === folder && f.locale === "en"),
        folder,
      ).toBe(true);
    }
  });

  it("only practise topics in the graph", () => {
    for (const f of all) for (const id of f.data.topicIds) expect(topicIds.has(id), `${f.folder} → ${id}`).toBe(true);
  });

  it("are what the graph unlocks, and nothing the graph unlocks is missing", () => {
    const ids = new Set(all.map((f) => f.folder));
    for (const rule of allUnlockRules) {
      for (const id of rule.unlocksActivityIds) expect(ids.has(id), `${rule.topicId} → ${id}`).toBe(true);
    }
  });
});

describe("practice episodes", () => {
  const Series = z.object({ series: z.array(SeriesPoint) });

  it.each(episodes.map((e) => [e.folder, e.data] as const))("%s has real prices for its whole range", (_, episode) => {
    for (const instrument of episode.instruments) {
      if (instrument.type !== "market") continue;
      const file = new URL(`${instrument.snapshot}.json`, snapshots);
      expect(existsSync(file), instrument.snapshot).toBe(true);
      const { series } = Series.parse(JSON.parse(readFileSync(file, "utf8")));
      const days = series.map((p) => p.t.slice(0, 10));
      expect(days[0]! <= episode.startDate, `${instrument.snapshot} starts too late`).toBe(true);
      expect(days.at(-1)! >= episode.endDate, `${instrument.snapshot} ends too early`).toBe(true);
      for (const ev of episode.scheduledEvents) expect(days, `${ev.id} on a trading day`).toContain(ev.on);
      expect(days, "reveal on a trading day").toContain(episode.reveal.compareOn);
    }
  });
});
