import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { DataAccess } from "../data/transactions";
import { completeMission, loadMission } from "./missions";

describe("mission publication boundary", () => {
  it("rejects traversal and absent published content", async () => {
    await expect(loadMission("../secret", "en")).rejects.toThrow();
    await expect(loadMission("unpublished-mission", "en")).rejects.toMatchObject({
      code: "mission_content_unavailable",
    });
  });
  it("does not write unreviewed arbitrary mission ids", async () => {
    const mission = vi.fn();
    const db = { state: vi.fn(async () => ({ profile: { locale: "en" } })), mission };
    await expect(
      completeMission(
        db as unknown as DataAccess,
        { missionId: "unpublished-mission", confirmation: "family" },
        "11111111-1111-4111-8111-111111111111",
      ),
    ).rejects.toMatchObject({ code: "mission_content_unavailable" });
    expect(mission).not.toHaveBeenCalled();
  });
});
