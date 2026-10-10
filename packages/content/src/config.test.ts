import { Experience, GradeGroup, Pillar, type UnlockRule } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { allUnlockRules, findPrerequisiteCycle, locales, startingCapital, TopicGraphConfig } from "./config";

const rule = (topicId: string, requiresTopicIds: string[] = [], gradeGroups = GradeGroup.options) => ({
  topicId,
  pillar: "plan-and-budget",
  gradeGroups,
  requiresTopicIds,
});

describe("content config", () => {
  it("defines starting capital for every grade group × experience", () => {
    for (const gradeGroup of GradeGroup.options) {
      for (const experience of Experience.options) {
        expect(
          startingCapital.rows.some((r) => r.gradeGroup === gradeGroup && r.experience === experience),
          `${gradeGroup} × ${experience}`,
        ).toBe(true);
      }
    }
  });

  it("ships English, Hindi and Telugu", () => {
    expect(locales.locales.map((l) => l.code)).toEqual(["en", "hi", "te"]);
  });
});

describe("topic graph", () => {
  const byId = new Map(allUnlockRules.map((r) => [r.topicId, r]));
  const roots = (pillar: Pillar) =>
    allUnlockRules.filter((r) => r.pillar === pillar && r.requiresTopicIds.length === 0);

  it("has the 33 curriculum topics across all four pillars", () => {
    expect(allUnlockRules).toHaveLength(33);
    for (const pillar of Pillar.options)
      expect(
        allUnlockRules.some((r) => r.pillar === pillar),
        pillar,
      ).toBe(true);
  });

  it("opens Plan & budget and Stay financially safe from day one", () => {
    expect(roots("plan-and-budget").map((r) => r.topicId)).toEqual(["money-basics"]);
    expect(roots("stay-safe").map((r) => r.topicId)).toEqual(["protect-your-info"]);
    expect(roots("save-and-manage")).toEqual([]);
    expect(roots("understand-investing")).toEqual([]);
  });

  it("gives every grade group a starting point in every pillar", () => {
    for (const grade of GradeGroup.options) {
      for (const pillar of Pillar.options) {
        const open = allUnlockRules.filter((r) => r.pillar === pillar && r.gradeGroups.includes(grade));
        expect(open.length, `${grade} × ${pillar}`).toBeGreaterThan(0);
      }
    }
  });

  it("unlocks every instrument a learner can hold, each from one topic", () => {
    const kinds = allUnlockRules.flatMap((r) => r.unlocksInstruments);
    expect(new Set(kinds).size).toBe(kinds.length);
    expect(byId.get("market-ups-and-downs")?.unlocksActivityIds).toContain("march-2020-hospital-bill");
  });

  it("rejects unknown prerequisites, cycles and prerequisites missing a grade group", () => {
    const parse = (topics: unknown[]) => TopicGraphConfig.safeParse({ topics }).success;
    expect(parse([rule("a"), rule("b", ["a"])])).toBe(true);
    expect(parse([rule("a", ["ghost"])])).toBe(false);
    expect(parse([rule("a", ["b"]), rule("b", ["a"])])).toBe(false);
    expect(parse([rule("a", [], ["grade-11-12"]), rule("b", ["a"], ["grade-6-7"])])).toBe(false);
    expect(parse([rule("a"), rule("a")])).toBe(false);
  });

  it("reports the cycle it finds", () => {
    const rules = [rule("a", ["c"]), rule("b", ["a"]), rule("c", ["b"])] as UnlockRule[];
    expect(findPrerequisiteCycle(rules)).toEqual(["a", "c", "b", "a"]);
    expect(findPrerequisiteCycle(allUnlockRules)).toBeNull();
  });
});
