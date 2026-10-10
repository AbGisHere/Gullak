import { Experience, GradeGroup } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { allUnlockRules, locales, startingCapital, topicLadder } from "./config";

describe("content config", () => {
  it("defines starting capital for every age band × experience", () => {
    for (const gradeGroup of GradeGroup.options) {
      for (const experience of Experience.options) {
        expect(
          startingCapital.rows.some((r) => r.gradeGroup === gradeGroup && r.experience === experience) ||
            startingCapital.defaultInr > 0,
          `${gradeGroup} × ${experience}`,
        ).toBe(true);
      }
    }
  });

  it("only references topics that exist in the ladder", () => {
    const ids = new Set(allUnlockRules.map((r) => r.topicId));
    expect(ids.size).toBe(allUnlockRules.length);
    for (const rule of allUnlockRules) {
      for (const req of rule.requiresTopicIds) expect(ids.has(req), `${rule.topicId} → ${req}`).toBe(true);
    }
  });

  it("starts the ladder with savings and keeps stay-safe always open", () => {
    expect(topicLadder.ladder[0]?.topicId).toBe("savings-account");
    expect(topicLadder.staySafe.every((r) => r.requiresTopicIds.length === 0)).toBe(true);
  });

  it("ships English, Hindi and Telugu", () => {
    expect(locales.locales.map((l) => l.code)).toEqual(["en", "hi", "te"]);
  });
});
