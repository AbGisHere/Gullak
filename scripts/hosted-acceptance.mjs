// Authorized synthetic learners only. Never applies migrations or deletes accounts.
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

process.loadEnvFile("apps/web/.env.local");
const origin = "https://gullak.abgupta.me";
const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert(project && publicKey, "Local public Supabase configuration is required");
const sessionFile = "apps/web/.env.qa-acceptance.json"; // Git-ignored; contains private sessions.
const reportFile = "docs/hosted-acceptance-2026-10-11.json";
const manifest = existsSync(sessionFile) ? JSON.parse(readFileSync(sessionFile, "utf8")) : { project, learners: [] };
assert.equal(manifest.project, project, "Never reuse test sessions across projects");
const checks = [];
const save = () => writeFileSync(sessionFile, `${JSON.stringify(manifest, null, 2)}\n`);
function pass(name) {
  checks.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
}
async function request(url, method = "GET", body, headers = {}) {
  const response = await fetch(url, {
    method,
    redirect: "manual",
    headers: { "Content-Type": "application/json", ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  });
  const json = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;
  return { status: response.status, json };
}
async function api(learner, path, method = "GET", body, key, expected = 200) {
  const result = await request(origin + path, method, body, {
    Authorization: `Bearer ${learner.accessToken}`,
    ...(key ? { "idempotency-key": key } : {}),
  });
  assert.equal(
    result.status,
    expected,
    `${path}: HTTP ${result.status}, error ${result.json?.error?.code ?? "non-JSON"}`,
  );
  assert(result.json, `${path}: expected JSON`);
  return expected === 200 ? result.json.data : result.json.error;
}
async function rest(learner, path, method = "GET", body) {
  return request(`${project}/rest/v1/${path}`, method, body, {
    apikey: publicKey,
    Authorization: `Bearer ${learner.accessToken}`,
  });
}
function key(learner, label) {
  learner.keys ??= {};
  learner.keys[label] ??= randomUUID();
  save();
  return learner.keys[label];
}
async function evidence(learner, table, filter = "") {
  const result = await rest(learner, `${table}?select=*${filter}`);
  assert.equal(result.status, 200, `${table}: evidence read`);
  return z.array(z.record(z.string(), z.unknown())).parse(result.json);
}
async function quiz(learner, topicId) {
  const raw = readFileSync(`packages/content/topics/${topicId}/en.json`, "utf8");
  const local = JSON.parse(raw);
  const lesson = await api(learner, `/api/lessons/${topicId}`);
  const authored = local.variants.find(
    (v) => v.format === "quiz" && (!v.audience || v.audience.includes(learner.gradeGroup)),
  );
  const published = lesson.content.variants.find((v) => v.id === authored?.id);
  assert(authored && published, `Quiz available: ${topicId}`);
  assert.deepEqual(
    published.questions.map((q) => ({ id: q.id, conceptId: q.conceptId, options: q.options })),
    authored.questions.map((q) => ({ id: q.id, conceptId: q.conceptId, options: q.options })),
    "Deployed quiz must match trusted local definition",
  );
  assert(published.questions.every((q) => !Object.hasOwn(q, "correctOptionId") && !Object.hasOwn(q, "explanation")));
  const variant = local.variants.find(
    (v) => v.format !== "quiz" && (!v.audience || v.audience.includes(learner.gradeGroup)),
  );
  await api(learner, `/api/lessons/${topicId}/progress`, "POST", { variantId: variant.id });
  const body = {
    variantId: authored.id,
    answers: authored.questions.map((q) => ({ questionId: q.id, optionId: q.correctOptionId })),
  };
  const command = key(learner, `quiz:${topicId}`);
  const result = await api(learner, `/api/lessons/${topicId}/quiz`, "POST", body, command);
  assert.equal(result.score, 1);
  assert.equal(result.passed, true);
  const before = await evidence(learner, "quiz_answers", `&topic_id=eq.${topicId}`);
  assert.equal(before.length, authored.questions.length);
  assert.equal(new Set(before.map((a) => a.event_id)).size, before.length);
  assert.equal(new Set(before.map((a) => a.attempt_no)).size, 1);
  const hash = createHash("sha256").update(raw).digest("hex");
  assert(before.every((a) => a.learner_id === learner.id && a.correct === true && a.content_version === hash));
  const progress = await evidence(learner, "topic_progress", `&topic_id=eq.${topicId}`);
  assert.equal(before[0].attempt_no, progress[0].quiz_attempts);
  assert.deepEqual(await api(learner, `/api/lessons/${topicId}/quiz`, "POST", body, command), result);
  assert.deepEqual(await evidence(learner, "quiz_answers", `&topic_id=eq.${topicId}`), before);
  await api(learner, `/api/lessons/${topicId}/quiz`, "POST", { ...body, correct: true }, randomUUID(), 400);
  pass(`${learner.label}: ${topicId} grading/evidence/retry/client-outcome rejection`);
}
async function activity(learner, id) {
  const raw = readFileSync(`packages/content/activities/${id}/en.json`, "utf8");
  const definition = JSON.parse(raw);
  const run = await api(learner, `/api/activities/${id}/runs`, "POST", {}, key(learner, `run:${id}`));
  assert.equal(run.contentHash, createHash("sha256").update(raw).digest("hex"));
  learner.runs ??= {};
  learner.runs[id] = run.id;
  save();
  const path = `/api/learning-runs/${run.id}/answers`;
  const storedRevision = (await api(learner, `/api/learning-runs/${run.id}`)).revision;
  let revision = 0;
  let node = definition.startNodeId;
  let final;
  const steps = definition.kind === "spot-sort" ? definition.items.length : definition.nodes.length;
  for (let i = 0; i < steps; i++) {
    const item = definition.items?.[i];
    const current = definition.nodes?.find((n) => n.id === node);
    const choice = current?.choices.find((c) => c.verdict === "safe") ?? current?.choices[0];
    if (!item && !choice) break;
    const body = item
      ? { expectedRevision: revision, itemId: item.id, categoryId: item.correctCategoryId }
      : { expectedRevision: revision, nodeId: node, choiceId: choice.id };
    const command = key(learner, `answer:${id}:${i}`);
    final = await api(learner, path, "POST", body, command);
    assert.equal(final.run.revision, revision + 1);
    assert.deepEqual(await api(learner, path, "POST", body, command), final);
    if (item) assert.equal(final.result.correctCategoryId, item.correctCategoryId);
    else {
      assert.equal(final.result.verdict, choice.verdict);
      assert.equal(final.result.cashDeltaPaise, choice.cashDeltaPaise ?? 0);
      node = choice.nextNodeId;
    }
    const repeated = await api(
      learner,
      path,
      "POST",
      { ...body, expectedRevision: Math.max(storedRevision, final.run.revision) },
      randomUUID(),
      409,
    );
    assert.equal(repeated.code, "already_answered");
    revision++;
    if (final.completed) break;
  }
  assert.equal(final?.completed, true);
  const persisted = await api(learner, `/api/learning-runs/${run.id}`);
  assert.equal(persisted.status, "completed");
  assert(persisted.completedAt);
  const rows = await evidence(learner, "activity_answers", `&run_id=eq.${run.id}`);
  assert.equal(rows.length, revision);
  pass(`${learner.label}: ${id} authored results, retries, duplicates, completion/persistence`);
}
try {
  for (const [label, gradeGroup, capital] of [
    ["qa-learner-a", "grade-8-10", 500000],
    ["qa-learner-b", "grade-11-12", 1000000],
  ]) {
    let learner = manifest.learners.find((l) => l.label === label);
    if (!learner) {
      const result = await request(
        `${project}/auth/v1/signup`,
        "POST",
        { data: { qaLabel: label, qaPurpose: "authorized-hosted-acceptance-20261011" } },
        { apikey: publicKey },
      );
      assert(
        [200, 201].includes(result.status),
        `Anonymous test signup HTTP ${result.status}: ${result.json?.code ?? "unknown"}`,
      );
      const session = z
        .object({ access_token: z.string(), refresh_token: z.string(), user: z.object({ id: z.uuid() }) })
        .parse(result.json);
      learner = {
        label,
        gradeGroup,
        id: session.user.id,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
      manifest.learners.push(learner);
      save();
    }
    const own = await request(`${project}/auth/v1/user`, "GET", undefined, {
      apikey: publicKey,
      Authorization: `Bearer ${learner.accessToken}`,
    });
    assert.equal(own.status, 200);
    assert.equal(own.json.id, learner.id);
    assert.equal(own.json.user_metadata.qaLabel, label);
    await api(learner, "/api/onboarding", "POST", {
      gradeGroup,
      experience: "none",
      locale: "en",
      preferredFormats: ["transcript", "quiz"],
    });
    const portfolio = (await api(learner, "/api/portfolio")).portfolio;
    assert.equal(portfolio.startingCashPaise, capital);
    assert.equal(portfolio.isVirtual, true);
    pass(`${label}: anonymous identity/onboarding/grade-specific starting cash`);
    for (const topic of [
      "money-basics",
      "saving-habit",
      "bank-accounts-upi",
      "fixed-deposit",
      "needs-vs-wants",
      "protect-your-info",
      "too-good-to-be-true",
    ])
      await quiz(learner, topic);
    assert((await api(learner, "/api/progress")).unlockedInstruments.includes("fixed-deposit"));
    const input = { principalPaise: 100000, tenureMonths: 12 };
    const command = key(learner, "fd-investment");
    const before = portfolio.cashPaise;
    await api(learner, "/api/portfolio/fd", "POST", input, command);
    const saved = await api(learner, "/api/portfolio");
    await api(learner, "/api/portfolio/fd", "POST", input, command);
    assert.deepEqual((await api(learner, "/api/portfolio")).portfolio, saved.portfolio);
    assert.equal(saved.portfolio.cashPaise, capital - 100000);
    assert.equal(saved.portfolio.holdings.length, 1);
    assert(before >= saved.portfolio.cashPaise);
    await api(
      learner,
      "/api/portfolio/fd",
      "POST",
      { principalPaise: capital * 2, tenureMonths: 12 },
      randomUUID(),
      409,
    );
    pass(`${label}: FD unlock, cash deduction, retry, persistence, insufficient-cash rejection`);
    const progress = (await api(learner, "/api/progress")).progress;
    await activity(learner, "needs-or-wants");
    await activity(learner, "the-doubling-scheme");
    assert.deepEqual((await api(learner, "/api/portfolio")).portfolio, saved.portfolio);
    assert.deepEqual((await api(learner, "/api/progress")).progress, progress);
    pass(`${label}: activities do not change cash, topic progress or unlocks`);
    const denied = await rest(learner, "quiz_answers_export?select=event_id");
    assert([401, 403].includes(denied.status));
    const write = await rest(learner, `quiz_answers?learner_id=eq.${learner.id}`, "PATCH", { correct: false });
    assert([401, 403].includes(write.status));
    pass(`${label}: export and direct evidence writes denied`);
  }
  for (const [a, b] of [
    [manifest.learners[0], manifest.learners[1]],
    [manifest.learners[1], manifest.learners[0]],
  ]) {
    for (const table of ["quiz_answers", "activity_answers", "portfolios"])
      assert.deepEqual(await evidence(b, table, `&learner_id=eq.${a.id}`), []);
    const run = a.runs["needs-or-wants"];
    await api(b, `/api/learning-runs/${run}`, "GET", undefined, undefined, 404);
    await api(
      b,
      `/api/learning-runs/${run}/answers`,
      "POST",
      { expectedRevision: 0, itemId: "rice-and-dal", categoryId: "need" },
      randomUUID(),
      404,
    );
    pass(`${b.label}: cross-learner evidence/portfolio/run isolation`);
  }
} catch (error) {
  checks.push({ name: "acceptance stopped", status: "failed", detail: error.message });
  console.log(`FAIL ${error.message}`);
  process.exitCode = 1;
} finally {
  writeFileSync(
    reportFile,
    `${JSON.stringify({ origin, checkedAt: new Date().toISOString(), checks, testLearners: manifest.learners.map(({ label, id, gradeGroup }) => ({ label, id, gradeGroup })), cleanup: "Retained for demo; delete only these verified synthetic Auth users after the demo. Session/cleanup manifest is Git-ignored." }, null, 2)}\n`,
  );
}
