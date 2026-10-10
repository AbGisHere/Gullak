import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { generateDatabaseTypes } from "./generate-database-types.mjs";

// Uses a fresh temporary database, never the user's installed cluster or Supabase account.
const bin = process.argv[2];
if (!bin) throw new Error("Pass your PostgreSQL bin directory (see docs/backend-setup.md).");
const work = mkdtempSync(join(tmpdir(), "gullak-db-test-"));
const data = join(work, "data");
const suffix = process.platform === "win32" ? ".exe" : "";
const run = (name, args, input) => {
  const result = spawnSync(join(bin, name + suffix), args, {
    input,
    encoding: "utf8",
    windowsHide: true,
    stdio: name === "pg_ctl" ? "ignore" : "pipe",
  });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr ?? result.stdout);
  return result.stdout;
};
const socket = createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const address = socket.address();
if (!address || typeof address === "string") throw new Error("Cannot allocate database test port");
const port = String(address.port);
await new Promise((resolve) => socket.close(resolve));
const args = ["-h", "127.0.0.1", "-p", port, "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-X"];
const sql = (text) => run("psql", args, text);
let started = false;
try {
  run("initdb", ["-D", data, "-U", "postgres", "-A", "trust", "--no-locale", "--encoding=UTF8"]);
  run("pg_ctl", ["-D", data, "-l", join(work, "postgres.log"), "-o", `-p ${port} -h 127.0.0.1`, "-w", "start"]);
  started = true;
  sql(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to authenticated;`);
  for (const file of [
    "20261010130000_init.sql",
    "20261010140000_backend_transactions.sql",
    "20261010150000_grade_group_onboarding.sql",
  ]) {
    if (file === "20261010150000_grade_group_onboarding.sql") {
      sql(`insert into auth.users values ('66666666-6666-4666-8666-666666666666');
        select public.onboard_learner('66666666-6666-4666-8666-666666666666', '{"id":"66666666-6666-4666-8666-666666666666","ageBand":"college","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 1234);`);
    }
    sql(readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
  }
  sql(readFileSync(new URL("../supabase/tests/core.sql", import.meta.url), "utf8"));
  if (process.argv.includes("--generate-types")) {
    generateDatabaseTypes((text) => run("psql", [...args, "-t", "-A"], text).trim());
    console.log("Generated database types from migrated local schema.");
  }
  // Two different requests compete for the same cash: exactly one must win.
  const learner = "33333333-3333-4333-8333-333333333333";
  sql(`insert into auth.users values ('${learner}');
    select public.onboard_learner('${learner}', '{"id":"${learner}","gradeGroup":"grade-8-10","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 1000);
    insert into public.topic_progress(learner_id, topic_id, status, completed_at) values ('${learner}', 'fixed-deposit', 'completed', now());`);
  const invest = (key) =>
    new Promise((resolve) => {
      const child = spawn(join(bin, `psql${suffix}`), args, { windowsHide: true });
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      child.stdout.resume();
      child.on("error", (error) => resolve({ status: -1, stderr: error.message }));
      child.on("close", (status) => resolve({ status, stderr }));
      child.stdin.end(`set role service_role; select public.invest_fd('${learner}', '${key}', '{"principalPaise":600}',
      '{"id":"${key}","principalPaise":600,"type":"deposit","kind":"fixed-deposit","tenureMonths":12,"instrumentId":"virtual-fd","openedAt":"2026-10-10T10:00:00Z"}', array['fixed-deposit']);`);
    });
  const results = await Promise.all([
    invest("44444444-4444-4444-8444-444444444444"),
    invest("55555555-5555-4555-8555-555555555555"),
  ]);
  if (
    results.filter((r) => r.status === 0).length !== 1 ||
    !results.some((r) => r.stderr.includes("insufficient_cash"))
  ) {
    throw new Error(`Concurrency test failed: ${JSON.stringify(results)}`);
  }
  const cash = sql(`select cash_paise from public.portfolios where learner_id = '${learner}';`);
  if (!cash.includes("400")) throw new Error("Concurrent deduction did not preserve balance");
  const winnerKey =
    results[0].status === 0 ? "44444444-4444-4444-8444-444444444444" : "55555555-5555-4555-8555-555555555555";
  const retries = await Promise.all([invest(winnerKey), invest(winnerKey)]);
  if (retries.some((r) => r.status !== 0)) throw new Error("Concurrent identical retries failed");
  if (!sql(`select cash_paise from public.portfolios where learner_id = '${learner}';`).includes("400"))
    throw new Error("Retries charged cash twice");
  console.log(
    "Database tests passed: migrations, RLS, restricted writes, quiz gates, retries, rollback, facilitator scope and concurrent investments.",
  );
} finally {
  if (started) run("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
  // Verify this is the generated child of the OS temp directory before recursive cleanup.
  const child = relative(resolve(tmpdir()), resolve(work));
  if (!child.startsWith(`gullak-db-test-`) || child.includes(sep) || child.includes(".."))
    console.error("Refusing unsafe temporary cleanup path");
  else rmSync(work, { recursive: true });
}
