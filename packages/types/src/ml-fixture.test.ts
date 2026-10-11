import { describe, expect, it } from "vitest";
import * as types from "./index";

const input = () => ({
  schemaVersion: 1,
  mode: "synthetic-fixture",
  learnerId: "11111111-1111-4111-8111-111111111111",
  gradeGroup: "grade-8-10",
  experience: "none",
  modelVersion: "fixture-v1",
  topics: [],
  progress: {},
  parameters: {},
  registry: [],
  events: [],
});

describe("synthetic ML integration boundaries", () => {
  it("accepts an explicit empty fixture without activating it", () => {
    expect(types.MlFixtureInput.parse(input())).toEqual(input());
  });
  it.each([
    "mode",
    "schemaVersion",
    "learnerId",
    "gradeGroup",
    "experience",
    "modelVersion",
    "topics",
    "progress",
    "parameters",
    "registry",
    "events",
  ])("rejects omitted %s", (key) => {
    const value: Record<string, unknown> = input();
    delete value[key];
    expect(types.MlFixtureInput.safeParse(value).success).toBe(false);
  });
  it.each(["real", "production", "synthetic"])("rejects non-fixture mode %s", (mode) => {
    expect(types.MlFixtureInput.safeParse({ ...input(), mode }).success).toBe(false);
  });
  it.each([NaN, Infinity, -0.1, 1.1, "0.2"])("rejects malformed transition probability %s", (pLearn) => {
    expect(
      types.MlFixtureInput.safeParse({
        ...input(),
        parameters: { "money-basics": { "money-in": { pLearn, pForget: 0, pSlip: 0.1, pGuess: 0.2 } } },
      }).success,
    ).toBe(false);
  });
  it("does not accept fitted pInit or indistinguishable emissions", () => {
    for (const params of [
      { pLearn: 0.1, pForget: 0, pSlip: 0.1, pGuess: 0.2, pInit: 0.9 },
      { pLearn: 0.1, pForget: 0, pSlip: 0.5, pGuess: 0.5 },
    ])
      expect(
        types.MlFixtureInput.safeParse({ ...input(), parameters: { "money-basics": { "money-in": params } } }).success,
      ).toBe(false);
  });
  it("rejects additional envelope fields", () => {
    expect(types.MlFixtureInput.safeParse({ ...input(), enabled: true }).success).toBe(false);
  });
  it.each(["passMark", "requiresTopicIds", "unlocksInstruments", "unlocksActivityIds"])(
    "requires explicit graph field %s",
    (key) => {
      const topic: Record<string, unknown> = {
        topicId: "money-basics",
        pillar: "plan-and-budget",
        gradeGroups: ["grade-8-10"],
        requiresTopicIds: [],
        passMark: 0.6,
        unlocksInstruments: [],
        unlocksActivityIds: [],
        conceptIds: ["money-in"],
      };
      delete topic[key];
      expect(types.MlFixtureInput.safeParse({ ...input(), topics: [topic] }).success).toBe(false);
    },
  );
  it("requires synthetic disabled status on frontend results", () => {
    const result = {
      schemaVersion: 1,
      mode: "synthetic-fixture",
      activation: "disabled",
      modelVersion: "fixture-v1",
      gradeGroup: "grade-8-10",
      mastery: {},
      evidenceCounts: {},
      next: null,
    };
    expect(types.MlFixtureResult.parse(result)).toEqual(result);
    for (const value of [
      { ...result, activation: "enabled" },
      { ...result, learnerId: input().learnerId },
      { ...result, events: [] },
    ])
      expect(types.MlFixtureResult.safeParse(value).success).toBe(false);
  });
});
