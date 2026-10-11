import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const cli = await import("../../../scripts/translate-text.mjs").catch(() => ({}));
const runTranslationAuthoring = (...args) => cli.runTranslationAuthoring(...args);

import * as translation from "./sarvam-translation";

const folders = [];
afterEach(async () => {
  for (const dir of folders.splice(0)) await rm(dir, { recursive: true, force: true });
});
async function folder() {
  const dir = await mkdtemp(join(tmpdir(), "gullak-sarvam-test-"));
  folders.push(dir);
  return dir;
}
const manifest = () => ({
  schemaVersion: 1,
  entries: [{ id: "practice", text: "Practice money.", targetLocales: ["hi", "te"] }],
});
const translator = () =>
  vi.fn(async (request) => ({
    kind: "translated",
    status: "draft",
    version: "gullak-sarvam-text-v1",
    model: "mayura:v1",
    sourceText: request.text,
    targetLocale: request.targetLocale,
    text: request.targetLocale === "hi" ? "अभ्यास का पैसा।" : "అభ్యాస డబ్బు.",
  }));
const options = (dir, translate = translator()) => ({
  cacheDir: dir,
  manifest: manifest(),
  apiKey: "private-test-key",
  execute: true,
  budgetCharacters: 100,
  maxRequests: 10,
  translate,
  translation,
});

describe("credit-conscious translation authoring", () => {
  it("dry-runs by default without spending, reserving or writing cache", async () => {
    const dir = await folder();
    const settings = options(dir);
    delete settings.execute;
    const result = await runTranslationAuthoring(settings);
    expect(result).toMatchObject({
      status: "dry-run",
      plannedRequests: 2,
      plannedInputCharacters: 30,
      reservedInputCharacters: 0,
      estimatedInputCostPaise: 6,
    });
    expect(settings.translate).not.toHaveBeenCalled();
    await expect(readFile(join(dir, "journal.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("persists drafts once and serves the next run from validated cache without calls", async () => {
    const dir = await folder();
    const settings = options(dir);
    const result = await runTranslationAuthoring(settings);
    expect(result.status).toBe("drafts");
    expect(settings.translate).toHaveBeenCalledTimes(2);
    expect(result.outputs.map((output) => output.result.status)).toEqual(["draft", "draft"]);
    const saved = JSON.parse(await readFile(join(dir, "drafts.json"), "utf8"));
    expect(JSON.stringify(saved)).not.toContain(settings.apiKey);
    const next = translator();
    const repeated = await runTranslationAuthoring(options(dir, next));
    expect(next).not.toHaveBeenCalled();
    expect(repeated.reservedInputCharacters).toBe(30);
    expect(repeated.outputs.map((output) => output.origin)).toEqual(["cache", "cache"]);
  });
  it("deduplicates equal source/locale jobs without translating identifiers", async () => {
    const dir = await folder();
    const settings = options(dir);
    settings.manifest.entries.push({ ...settings.manifest.entries[0], id: "second-label" });
    const result = await runTranslationAuthoring(settings);
    expect(settings.translate).toHaveBeenCalledTimes(2);
    expect(result.outputs.map((output) => output.id)).toEqual(["practice", "practice", "second-label", "second-label"]);
  });
  it("rejects a whole over-budget batch before any paid request", async () => {
    const settings = options(await folder());
    settings.budgetCharacters = 29;
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/budget/);
    expect(settings.translate).not.toHaveBeenCalled();
  });
  it("retains cumulative reservations and fails before spending on a later batch", async () => {
    const dir = await folder();
    await runTranslationAuthoring(options(dir));
    const settings = options(dir);
    settings.manifest.entries[0].text = "A different sentence.";
    settings.budgetCharacters = 40;
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/budget/);
    expect(settings.translate).not.toHaveBeenCalled();
  });
  it("keeps a timeout reservation, stops further calls and never retries on restart", async () => {
    const dir = await folder();
    const translate = vi.fn(async (request) => ({
      kind: "fallback",
      reason: "timeout",
      locale: "en",
      text: request.text,
    }));
    const first = await runTranslationAuthoring(options(dir, translate));
    expect(translate).toHaveBeenCalledTimes(1);
    expect(first.reservedInputCharacters).toBe(15);
    expect(first.outputs.map((output) => output.result.reason)).toEqual(["timeout", "batch-stopped"]);
    const next = translator();
    const repeated = await runTranslationAuthoring(options(dir, next));
    expect(next).not.toHaveBeenCalled();
    expect(repeated.outputs[0].result.reason).toBe("previous-attempt");
  });
  it("makes no requests or reservations without a key", async () => {
    const settings = options(await folder());
    settings.apiKey = " ";
    const result = await runTranslationAuthoring(settings);
    expect(result.outputs.every((output) => output.result.reason === "missing-key")).toBe(true);
    expect(result.reservedInputCharacters).toBe(0);
    expect(settings.translate).not.toHaveBeenCalled();
  });
  it("honours an existing exclusive lock without deleting another process's lock", async () => {
    const dir = await folder();
    await writeFile(join(dir, ".authoring.lock"), "other-owner");
    await expect(runTranslationAuthoring(options(dir))).rejects.toThrow(/locked/);
    expect(await readFile(join(dir, ".authoring.lock"), "utf8")).toBe("other-owner");
  });
  it("fails closed on corrupted journal instead of resetting the credit budget", async () => {
    const dir = await folder();
    await writeFile(join(dir, "journal.json"), "{bad json");
    const settings = options(dir);
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/state/);
    expect(settings.translate).not.toHaveBeenCalled();
  });
  it("does not reset the budget when the journal is lost but paid cache files remain", async () => {
    const dir = await folder();
    await runTranslationAuthoring(options(dir));
    await rm(join(dir, "journal.json"));
    const settings = options(dir);
    settings.manifest.entries[0].text = "New words.";
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/state/);
    expect(settings.translate).not.toHaveBeenCalled();
  });
  it.each([null, { schemaVersion: 1, reservations: {} }])(
    "rejects a null or stale valid journal with existing paid assets %#",
    async (journal) => {
      const dir = await folder();
      await runTranslationAuthoring(options(dir));
      await writeFile(join(dir, "journal.json"), JSON.stringify(journal));
      const settings = options(dir);
      settings.manifest.entries[0].text = "New words.";
      await expect(runTranslationAuthoring(settings)).rejects.toThrow(/state/);
      expect(settings.translate).not.toHaveBeenCalled();
    },
  );
  it("rejects a corrupted cached translation before making more calls", async () => {
    const dir = await folder();
    const settings = options(dir);
    await runTranslationAuthoring(settings);
    const key = await translation.translationCacheKey({ text: settings.manifest.entries[0].text, targetLocale: "hi" });
    await writeFile(join(dir, `${key}.json`), JSON.stringify({ status: "approved", text: "bad" }));
    const next = options(dir);
    await expect(runTranslationAuthoring(next)).rejects.toThrow(/cache.*state/);
    expect(next.translate).not.toHaveBeenCalled();
  });
  it("redacts thrown provider errors and reserves ambiguous failures", async () => {
    const dir = await folder();
    const settings = options(
      dir,
      vi.fn(async () => {
        throw new Error("private-test-key");
      }),
    );
    const result = await runTranslationAuthoring(settings);
    expect(result.outputs[0].result.reason).toBe("network-error");
    expect(result.reservedInputCharacters).toBe(15);
    expect(await readFile(join(dir, "drafts.json"), "utf8")).not.toContain("private-test-key");
    expect(settings.translate).toHaveBeenCalledTimes(1);
  });
  it("stops at credits exhaustion and rejects exceeding the request-count cap before calling", async () => {
    const settings = options(
      await folder(),
      vi.fn(async (request) => ({ kind: "fallback", reason: "credits-exhausted", locale: "en", text: request.text })),
    );
    const result = await runTranslationAuthoring(settings);
    expect(result.outputs.map((output) => output.result.reason)).toEqual(["credits-exhausted", "batch-stopped"]);
    expect(settings.translate).toHaveBeenCalledTimes(1);
    const capped = options(await folder());
    capped.maxRequests = 1;
    await expect(runTranslationAuthoring(capped)).rejects.toThrow(/budget/);
    expect(capped.translate).not.toHaveBeenCalled();
  });
  it("rejects invalid manifest and unsafe published output location before calling", async () => {
    const settings = options(await folder());
    settings.manifest.entries[0].text = "Hello {name}";
    await expect(runTranslationAuthoring(settings)).rejects.toThrow();
    expect(settings.translate).not.toHaveBeenCalled();
    settings.manifest = manifest();
    settings.cacheDir = fileURLToPath(new URL("../", import.meta.url));
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/outside/);
  });
  it("does not confuse a dot-dot-prefixed descendant with a parent directory", async () => {
    const settings = options(await folder());
    settings.execute = false;
    settings.cacheDir = join(fileURLToPath(new URL("../../../", import.meta.url)), "..cache");
    await expect(runTranslationAuthoring(settings)).rejects.toThrow(/outside/);
    expect(settings.translate).not.toHaveBeenCalled();
  });
});
