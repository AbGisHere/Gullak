import { describe, expect, it } from "vitest";
import { MissionCompletionRequest } from "./mission";

describe("mission completion boundary", () => {
  it("accepts only mission and agreed confirmation", () => {
    for (const confirmation of ["family", "self_reported"])
      expect(MissionCompletionRequest.safeParse({ missionId: "fixture-mission", confirmation }).success).toBe(true);
  });
  it("rejects identities, client counts, mastery and invalid identifiers", () => {
    const base = { missionId: "fixture-mission", confirmation: "family" };
    for (const extra of [{ learner_id: "spoof" }, { householdsReached: 1 }, { score: 1 }, { completed: true }])
      expect(MissionCompletionRequest.safeParse({ ...base, ...extra }).success).toBe(false);
    expect(MissionCompletionRequest.safeParse({ ...base, missionId: "../secret" }).success).toBe(false);
    expect(MissionCompletionRequest.safeParse({ ...base, confirmation: "parent_verified" }).success).toBe(false);
  });
});
