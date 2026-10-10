import { OnboardingRequest } from "@gullak/types";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./auth", () => ({ privilegedClient: vi.fn(), verifiedIdentity: vi.fn() }));

import { api, body, requestKey } from "./http";

describe("HTTP boundary", () => {
  it("rejects arbitrary ownership, balances and cohort selection", async () => {
    const request = new Request("http://localhost/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gradeGroup: "grade-6-7",
        experience: "none",
        locale: "en",
        preferredFormats: ["transcript"],
        learner_id: "victim",
        cashPaise: 999999,
        cohortId: "admin",
      }),
    });
    const response = await api(() => body(request, OnboardingRequest));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "invalid_request" } });
  });
  it("rejects malformed JSON and oversized streamed requests", async () => {
    const make = (data: string) =>
      new Request("http://localhost/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
    expect((await api(() => body(make("{"), OnboardingRequest))).status).toBe(400);
    expect((await api(() => body(make(" ".repeat(16385)), OnboardingRequest))).status).toBe(413);
  });
  it("requires a UUID idempotency key", () => {
    expect(() => requestKey(new Request("http://localhost"))).toThrow();
  });
  it("does not leak internal exceptions and disables shared caching", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await api(async () => {
      throw new Error("secret database password");
    });
    expect(await response.text()).not.toContain("password");
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    log.mockRestore();
  });
});
