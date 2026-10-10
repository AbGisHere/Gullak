import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), cookieClient: vi.fn(), createClient: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("../env", () => ({
  isSupabaseConfigured: true,
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://fixture.invalid",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-fixture",
  },
}));
vi.mock("../supabase/server", () => ({ createSupabaseServerClient: mocks.cookieClient }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

import { verifiedIdentity } from "./auth";

describe("verified request identity", () => {
  it("switches bearer identities on a shared device without using the previous cookie identity", async () => {
    mocks.createClient.mockReturnValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockImplementation(async (token: string) => ({
      data: { user: { id: token === "token-a" ? "learner-a" : "learner-b" } },
      error: null,
    }));
    for (const token of ["token-a", "token-b", "token-a"]) {
      const result = await verifiedIdentity(
        new Request("http://localhost:3000/api/profile", {
          headers: { Authorization: `Bearer ${token}`, Cookie: "old-session=learner-a" },
        }),
      );
      expect(result.learnerId).toBe(token === "token-a" ? "learner-a" : "learner-b");
    }
    mocks.getUser.mockReset();
  });
  it("gets the user from Supabase verification, never from a body or learner_id header", async () => {
    mocks.createClient.mockReturnValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
    const result = await verifiedIdentity(
      new Request("http://localhost:3000/api/profile", {
        headers: { Authorization: "Bearer test-token", learner_id: "victim" },
      }),
    );
    expect(result.learnerId).toBe("verified-user");
    expect(mocks.getUser).toHaveBeenCalledWith("test-token");
  });
  it("rejects invalid bearer tokens without falling back to cookies", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid" } });
    await expect(
      verifiedIdentity(
        new Request("http://localhost:3000/api/profile", { headers: { Authorization: "Bearer invalid" } }),
      ),
    ).rejects.toMatchObject({ status: 401 });
  });
  it("rejects cross-origin cookie mutations before accessing the session", async () => {
    await expect(
      verifiedIdentity(
        new Request("http://localhost:3000/api/onboarding", {
          method: "POST",
          headers: { Origin: "https://attacker.invalid" },
        }),
      ),
    ).rejects.toMatchObject({ status: 403, code: "origin_forbidden" });
  });
  it("verifies same-origin cookie sessions", async () => {
    mocks.cookieClient.mockResolvedValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "cookie-user" } }, error: null });
    expect(
      (
        await verifiedIdentity(
          new Request("http://localhost:3000/api/onboarding", {
            method: "POST",
            headers: { Origin: "http://localhost:3000" },
          }),
        )
      ).learnerId,
    ).toBe("cookie-user");
  });
});
