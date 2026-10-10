import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "./database.types";

vi.mock("server-only", () => ({}));

import { createDataAccess } from "./transactions";

const id = "11111111-1111-4111-8111-111111111111";
const at = "2026-10-10T10:00:00Z";
const state = {
  profile: {
    id,
    gradeGroup: "grade-8-10",
    experience: "none",
    locale: "en",
    preferredFormats: ["transcript"],
    createdAt: at,
  },
  portfolio: {
    id,
    learnerId: id,
    isVirtual: true,
    startingCashPaise: 1000000,
    cashPaise: 1000000,
    holdings: [],
    createdAt: at,
    updatedAt: at,
  },
  progress: [],
};
function client(result: unknown) {
  return createClient<Database>("https://fixture.invalid", "test-fixture", {
    global: {
      fetch: vi.fn(
        async () => new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } }),
      ),
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
describe("validated database responses", () => {
  it("returns a non-enumerating 404 for another profile's run", async () => {
    const db = client(null);
    await expect(createDataAccess(db, db, id).run(id)).rejects.toMatchObject({
      status: 404,
      code: "learning_run_not_found",
    });
  });
  it("rejects a run response owned by a different learner", async () => {
    const db = client({
      id,
      learnerId: "22222222-2222-4222-8222-222222222222",
      kind: "activity",
      contentId: "needs-or-wants",
      locale: "en",
      contentHash: "a".repeat(64),
      status: "in-progress",
      revision: 0,
      bookmark: null,
      createdAt: at,
      updatedAt: at,
    });
    await expect(createDataAccess(db, db, id).run(id)).rejects.toMatchObject({ code: "ownership_mismatch" });
  });
  it("asks legacy learners to select a grade without treating their state as corrupt", async () => {
    const db = client({ ...state, profile: { ...state.profile, gradeGroup: undefined } });
    await expect(createDataAccess(db, db, id).state()).rejects.toMatchObject({
      status: 409,
      code: "grade_group_required",
    });
  });
  it("reads a virtual persisted state", async () => {
    const db = client(state);
    expect((await createDataAccess(db, db, id).state()).portfolio.cashPaise).toBe(1000000);
  });
  it("fails explicitly when onboarding does not exist", async () => {
    const db = client(null);
    await expect(createDataAccess(db, db, id).state()).rejects.toMatchObject({
      status: 409,
      code: "onboarding_required",
    });
  });
  it("rejects nonvirtual or invalid database money as a server-data error", async () => {
    const db = client({ ...state, portfolio: { ...state.portfolio, isVirtual: false, cashPaise: -1 } });
    await expect(createDataAccess(db, db, id).state()).rejects.toMatchObject({
      status: 503,
      code: "database_response_invalid",
    });
  });
  it("adds an ownership check beyond RLS", async () => {
    const db = client(state);
    await expect(createDataAccess(db, db, "22222222-2222-4222-8222-222222222222").state()).rejects.toMatchObject({
      status: 403,
      code: "ownership_mismatch",
    });
  });
});
