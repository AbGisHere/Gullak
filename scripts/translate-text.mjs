#!/usr/bin/env node
// Local, pre-generation authoring only. Never a production cache, public endpoint or publication step.
import { randomUUID } from "node:crypto";
import { mkdir, open, readdir, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const Key = z.string().regex(/^[a-f0-9]{64}$/);
const Journal = z
  .object({ schemaVersion: z.literal(1), reservations: z.record(Key, z.number().int().min(1).max(1000)) })
  .strict()
  .refine(
    (journal) => Object.values(journal.reservations).reduce((sum, count) => sum + count, 0) <= 5000,
    "invalid state",
  );
const Reasons = new Set([
  "missing-key",
  "timeout",
  "network-error",
  "unauthorized",
  "credits-exhausted",
  "rate-limited",
  "provider-error",
  "invalid-response",
]);

let modulePromise;
async function loadTranslation() {
  if (!modulePromise)
    modulePromise = (async () => {
      // Reuse the existing workspace esbuild tool, in memory: no new dependency or generated repo output.
      const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
      const { build } = require("esbuild");
      const compiled = await build({
        entryPoints: [fileURLToPath(new URL("../packages/ai/src/sarvam-translation.ts", import.meta.url))],
        bundle: true,
        platform: "node",
        format: "esm",
        write: false,
        logLevel: "silent",
      });
      return import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
    })();
  return modulePromise;
}
function outsideRepo(dir) {
  const path = relative(repoRoot, dir);
  if (!path || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path)))
    throw new Error("cache must be outside the repository");
}
async function jsonFile(path) {
  try {
    const bytes = await readFile(path);
    if (bytes.length > 524288) throw new Error("state too large");
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw new Error("translation state invalid or unreadable");
  }
}
async function atomicJson(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  try {
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}

/** Inject only the network translator in tests; all manifest, cache and budget behaviour stays real. */
export async function runTranslationAuthoring(options) {
  const translation = options.translation ?? (await loadTranslation());
  const manifest = z
    .object({
      schemaVersion: z.literal(1),
      entries: z
        .array(
          z
            .object({
              id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
              text: translation.TranslationInput.shape.text,
              targetLocales: z
                .array(translation.TranslationInput.shape.targetLocale)
                .min(1)
                .max(2)
                .refine((items) => new Set(items).size === items.length),
            })
            .strict(),
        )
        .min(1)
        .max(100),
    })
    .strict()
    .refine(
      (input) => new Set(input.entries.map((entry) => entry.id)).size === input.entries.length,
      "duplicate text identifiers",
    )
    .parse(options.manifest);
  const execute = z.boolean().parse(options.execute ?? false);
  const budget = z
    .number()
    .int()
    .min(1)
    .max(5000)
    .parse(options.budgetCharacters ?? 5000);
  const maxRequests = z
    .number()
    .int()
    .min(1)
    .max(10)
    .parse(options.maxRequests ?? 10);
  const apiKey = options.apiKey?.trim() ?? "";
  if (apiKey && manifest.entries.some((entry) => entry.text.includes(apiKey)))
    throw new Error("invalid authored source");
  const dir = resolve(options.cacheDir ?? join(homedir(), ".cache", "gullak", "sarvam-text"));
  outsideRepo(dir);
  const canonical = await realpath(dir).catch((error) => {
    if (error.code === "ENOENT") return dir;
    throw error;
  });
  outsideRepo(canonical);
  let lock;
  const lockPath = join(dir, ".authoring.lock");
  const owner = randomUUID();
  if (execute) {
    await mkdir(dir, { recursive: true });
    outsideRepo(await realpath(dir));
    try {
      lock = await open(lockPath, "wx", 0o600);
    } catch (error) {
      if (error.code === "EEXIST") throw new Error("authoring cache locked by another run");
      throw error;
    }
    await lock.writeFile(owner);
  }
  try {
    const rawJournal = await jsonFile(join(dir, "journal.json"));
    const names = await readdir(dir).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    const previous = await jsonFile(join(dir, "drafts.json"));
    if (rawJournal === undefined) {
      if (names.some((name) => /^[a-f0-9]{64}\.json$/.test(name)) || (previous?.reservedInputCharacters ?? 0) > 0)
        throw new Error("translation state missing its spend journal");
    }
    const parsed = Journal.safeParse(rawJournal === undefined ? { schemaVersion: 1, reservations: {} } : rawJournal);
    if (!parsed.success) throw new Error("translation state invalid");
    const journal = parsed.data;
    const used = () => Object.values(journal.reservations).reduce((sum, count) => sum + count, 0);
    if (previous !== undefined) {
      const priorSpend = z
        .object({ reservedInputCharacters: z.number().int().nonnegative().max(5000) })
        .safeParse(previous);
      if (!priorSpend.success || priorSpend.data.reservedInputCharacters > used())
        throw new Error("translation spend state inconsistent");
    }
    for (const name of names.filter((name) => /^[a-f0-9]{64}\.json$/.test(name))) {
      const key = name.slice(0, -5);
      const asset = z.object({ sourceText: z.string().min(1).max(2000) }).safeParse(await jsonFile(join(dir, name)));
      if (
        !asset.success ||
        !Object.hasOwn(journal.reservations, key) ||
        journal.reservations[key] !== [...asset.data.sourceText].length
      )
        throw new Error("translation cache spend state inconsistent");
    }
    const jobs = [];
    for (const entry of manifest.entries)
      for (const targetLocale of entry.targetLocales) {
        const request = translation.TranslationInput.parse({ text: entry.text, targetLocale });
        jobs.push({ id: entry.id, request, key: await translation.translationCacheKey(request) });
      }
    const cached = new Map();
    const fresh = new Map();
    for (const job of jobs) {
      const raw = await jsonFile(join(dir, `${job.key}.json`));
      if (raw !== undefined) {
        const result = translation.TranslationDraft.safeParse(raw);
        if (
          !result.success ||
          result.data.sourceText !== job.request.text ||
          result.data.targetLocale !== job.request.targetLocale ||
          (apiKey && result.data.text.includes(apiKey))
        )
          throw new Error("translation cache state invalid");
        cached.set(job.key, result.data);
      } else if (!Object.hasOwn(journal.reservations, job.key)) fresh.set(job.key, [...job.request.text].length);
      if (
        Object.hasOwn(journal.reservations, job.key) &&
        journal.reservations[job.key] !== [...job.request.text].length
      )
        throw new Error("translation reservation state invalid");
    }
    const plannedCharacters = [...fresh.values()].reduce((sum, count) => sum + count, 0);
    if (used() + plannedCharacters > budget || fresh.size > maxRequests)
      throw new Error("translation budget exceeded before any request");
    const summary = {
      plannedRequests: fresh.size,
      plannedInputCharacters: plannedCharacters,
      reservedInputCharacters: used(),
      estimatedInputCostPaise: Math.ceil(plannedCharacters / 5),
      pricing: {
        inrPer10000Characters: 20,
        verifiedOn: "2026-10-11",
        source: "https://docs.sarvam.ai/api/getting-started/pricing",
        note: "Input-codepoint estimate only; not an account-wide spend guarantee or provider invoice.",
      },
    };
    if (!execute) return { status: "dry-run", ...summary, outputs: [] };
    const translate = options.translate ?? translation.createSarvamTranslator({ apiKey });
    const outputs = [];
    let stopped = false;
    for (const job of jobs) {
      const record = (result, origin) =>
        outputs.push({ id: job.id, targetLocale: job.request.targetLocale, origin, result });
      const fallback = (reason) =>
        record({ kind: "fallback", reason, locale: "en", text: job.request.text }, "fallback");
      if (cached.has(job.key)) {
        record(cached.get(job.key), "cache");
        continue;
      }
      if (!apiKey) {
        fallback("missing-key");
        continue;
      }
      if (Object.hasOwn(journal.reservations, job.key)) {
        fallback("previous-attempt");
        stopped = true;
        continue;
      }
      if (stopped) {
        fallback("batch-stopped");
        continue;
      }
      // Persist before sending. Timeouts/errors may still be billed, so never release or automatically retry.
      journal.reservations[job.key] = [...job.request.text].length;
      await atomicJson(join(dir, "journal.json"), Journal.parse(journal));
      let result;
      try {
        result = await translate(job.request);
      } catch {
        result = { kind: "fallback", reason: "network-error" };
      }
      if (result?.kind !== "translated") {
        fallback(Reasons.has(result?.reason) ? result.reason : "invalid-response");
        stopped = true;
        continue;
      }
      const draft = translation.TranslationDraft.safeParse(result);
      if (
        !draft.success ||
        draft.data.sourceText !== job.request.text ||
        draft.data.targetLocale !== job.request.targetLocale ||
        draft.data.text.includes(apiKey)
      ) {
        fallback("invalid-response");
        stopped = true;
        continue;
      }
      await atomicJson(join(dir, `${job.key}.json`), draft.data);
      cached.set(job.key, draft.data);
      record(draft.data, "provider");
    }
    const result = {
      status: outputs.every((output) => output.result.kind === "translated") ? "drafts" : "fallback",
      ...summary,
      reservedInputCharacters: used(),
      outputs,
    };
    await atomicJson(join(dir, "drafts.json"), result);
    return result;
  } finally {
    if (lock) {
      await lock.close();
      if ((await readFile(lockPath, "utf8")) === owner) await unlink(lockPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(
      "node --env-file=apps/web/.env.local scripts/translate-text.mjs (--input manifest.json | --smoke) [--execute] [--budget-chars 5000] [--max-requests 10] [--cache-dir external-directory]\nDefault: dry-run; plain text only; outputs stay unreviewed drafts. Keep one cache directory to preserve the cumulative ledger.",
    );
    return;
  }
  const flags = new Map();
  for (let index = 0; index < args.length; index++) {
    const name = args[index];
    if (
      !["--input", "--smoke", "--execute", "--budget-chars", "--max-requests", "--cache-dir"].includes(name) ||
      flags.has(name)
    )
      throw new Error("invalid CLI options");
    if (name === "--smoke" || name === "--execute") flags.set(name, true);
    else {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("invalid CLI options");
      flags.set(name, value);
    }
  }
  if (flags.has("--input") === flags.has("--smoke")) throw new Error("choose one input mode");
  const manifest = flags.has("--smoke")
    ? {
        schemaVersion: 1,
        entries: [{ id: "play-money", text: "All money here is virtual practice money.", targetLocales: ["hi", "te"] }],
      }
    : await jsonFile(resolve(flags.get("--input")));
  const result = await runTranslationAuthoring({
    manifest,
    execute: flags.has("--execute"),
    apiKey: process.env.SARVAM_API_KEY,
    budgetCharacters: Number(flags.get("--budget-chars") ?? 5000),
    maxRequests: Number(flags.get("--max-requests") ?? 10),
    cacheDir: flags.get("--cache-dir"),
  });
  const { outputs: _outputs, ...summary } = result;
  console.log(JSON.stringify(summary, null, 2));
  if (flags.has("--execute"))
    console.log(
      "Drafts saved in the authoring cache. Review with R5 before publishing; existing app content was not changed.",
    );
  if (result.status === "fallback") process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error(
      "Translation authoring failed. Check input, character budget, cache state and lock. No automatic retry. Provider errors and credentials are never logged.",
    );
    process.exitCode = 1;
  });
}
