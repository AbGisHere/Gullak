import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, expect, it } from "vitest";

const exec = promisify(execFile);
const script = fileURLToPath(new URL("../../../scripts/translate-text.mjs", import.meta.url));
const folders = [];
afterEach(async () => {
  for (const folder of folders.splice(0)) await rm(folder, { recursive: true, force: true });
});
async function directory() {
  const folder = await mkdtemp(join(tmpdir(), "gullak-sarvam-command-"));
  folders.push(folder);
  return folder;
}
const withoutSarvamKey = () =>
  Object.fromEntries(Object.entries(process.env).filter(([name]) => name.toUpperCase() !== "SARVAM_API_KEY"));
const env = () => ({ ...withoutSarvamKey(), SARVAM_API_KEY: "" });

it("actual Node CLI dry-run accepts an env file without spending or echoing its fake key", async () => {
  const folder = await directory();
  const envFile = join(folder, "test.env");
  await writeFile(envFile, "SARVAM_API_KEY=fake-nonproduction-key\n");
  const { stdout, stderr } = await exec(
    process.execPath,
    [`--env-file=${envFile}`, script, "--smoke", "--cache-dir", folder, "--budget-chars", "100"],
    { env: withoutSarvamKey() },
  );
  expect(JSON.parse(stdout)).toMatchObject({
    status: "dry-run",
    plannedRequests: 2,
    plannedInputCharacters: 82,
    reservedInputCharacters: 0,
    estimatedInputCostPaise: 17,
  });
  expect(stdout).not.toContain("fake-nonproduction-key");
  expect(stderr).toBe("");
  expect(await readdir(folder)).toEqual(["test.env"]);
});
it("actual Node CLI execute with no key writes only clearly English fallbacks and no reservation", async () => {
  const folder = await directory();
  const failure = await exec(
    process.execPath,
    [script, "--smoke", "--execute", "--cache-dir", folder, "--budget-chars", "100"],
    { env: env() },
  ).catch((error) => error);
  expect(failure.code).toBe(1);
  expect(failure.stdout).toContain('"reservedInputCharacters": 0');
  const drafts = JSON.parse(await readFile(join(folder, "drafts.json"), "utf8"));
  expect(drafts.outputs.map((output) => output.result.reason)).toEqual(["missing-key", "missing-key"]);
  expect(drafts.outputs.every((output) => output.result.locale === "en")).toBe(true);
  await expect(readFile(join(folder, "journal.json"))).rejects.toMatchObject({ code: "ENOENT" });
});
it("actual Node CLI rejects unsupported placeholders before creating paid state", async () => {
  const folder = await directory();
  const input = join(folder, "input.json");
  await writeFile(
    input,
    JSON.stringify({
      schemaVersion: 1,
      entries: [{ id: "count", text: "You have {count} coins", targetLocales: ["hi"] }],
    }),
  );
  const failure = await exec(process.execPath, [script, "--input", input, "--execute", "--cache-dir", folder], {
    env: env(),
  }).catch((error) => error);
  expect(failure.code).toBe(1);
  expect(failure.stderr).toContain("No automatic retry");
  expect(await readdir(folder)).toEqual(["input.json"]);
});
