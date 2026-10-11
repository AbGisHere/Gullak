// Explicitly authorized QA identities only; no migrations, cleanup or unrelated records.
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

process.loadEnvFile("apps/web/.env.local");
const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
const apikey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const origin = "https://gullak.abgupta.me";
const file = "apps/web/.env.qa-acceptance.json";
const manifest = JSON.parse(readFileSync(file, "utf8"));
assert.equal(manifest.project, project);
const rawDefinition = readFileSync("packages/content/activities/needs-or-wants/en.json", "utf8");
const definition = JSON.parse(rawDefinition);
assert.equal(manifest.learners.length, 2, "Complete both authorized QA learners first");
const checks = [];
async function request(url, token, method = "GET", body, key) {
  const response = await fetch(url, {
    method,
    headers: {
      apikey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
      ...(key ? { "idempotency-key": key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, body: await response.json() };
}
for (const learner of manifest.learners) {
  assert(["qa-learner-a", "qa-learner-b"].includes(learner.label));
  const user = await request(`${project}/auth/v1/user`, learner.accessToken);
  assert.equal(user.status, 200);
  assert.equal(user.body.id, learner.id);
  assert.equal(user.body.user_metadata.qaLabel, learner.label);
  const call = (path, method, body, key) => request(origin + path, learner.accessToken, method, body, key);
  const start = await call("/api/activities/needs-or-wants/runs", "POST", {}, randomUUID());
  assert.equal(start.status, 200);
  const run = start.body.data;
  assert.equal(run.learnerId, learner.id);
  learner.raceRunIds ??= [];
  learner.raceRunIds.push(run.id);
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  assert.equal(run.contentHash, createHash("sha256").update(rawDefinition).digest("hex"));
  const path = `/api/learning-runs/${run.id}/answers`;
  const answer = (i, revision) => ({
    expectedRevision: revision,
    itemId: definition.items[i].id,
    categoryId: definition.items[i].correctCategoryId,
  });
  const initial = answer(0, 0);
  initial.categoryId = definition.categories.find((c) => c.id !== initial.categoryId).id;
  const { expectedRevision: _revision, ...missingRevision } = initial;
  assert.equal((await call(path, "POST", missingRevision, randomUUID())).status, 400);
  assert.equal((await call(path, "POST", { ...initial, categoryId: "not-a-category" }, randomUUID())).status, 422);
  assert.equal((await call(path, "POST", { ...initial, expectedRevision: 99 }, randomUUID())).status, 409);
  const key = randomUUID();
  const duplicates = await Promise.all([call(path, "POST", initial, key), call(path, "POST", initial, key)]);
  assert(duplicates.every((r) => r.status === 200));
  assert.deepEqual(duplicates[0].body, duplicates[1].body);
  assert.equal(duplicates[0].body.data.result.correct, false);
  assert.equal(duplicates[0].body.data.result.correctCategoryId, definition.items[0].correctCategoryId);
  const race = await Promise.all([
    call(path, "POST", answer(1, 1), randomUUID()),
    call(path, "POST", answer(2, 1), randomUUID()),
  ]);
  assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
  const saved = await call(`/api/learning-runs/${run.id}`);
  assert.equal(saved.body.data.revision, 2);
  const rows = await request(
    `${project}/rest/v1/activity_answers?select=event_id&run_id=eq.${run.id}`,
    learner.accessToken,
  );
  assert.equal(rows.status, 200);
  assert.equal(rows.body.length, 2);
  checks.push({
    name: `${learner.label}: missing revision, invalid choice, stale revision, concurrent retry and revision race`,
    status: "passed",
  });
  console.log(`PASS ${checks.at(-1).name}`);
}
assert([401, 403].includes((await request(`${project}/rest/v1/quiz_answers_export?select=event_id`)).status));
checks.push({ name: "anonymous export access denied", status: "passed" });
const reportFile = "docs/hosted-acceptance-2026-10-11.json";
const report = JSON.parse(readFileSync(reportFile, "utf8"));
report.checks.push(...checks);
report.checkedAt = new Date().toISOString();
writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
