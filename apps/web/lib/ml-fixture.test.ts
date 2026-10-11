import { MlFixtureResult } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { mlFixture } from "../../../packages/engine/src/ml-fixture.test-fixture";

const modules = async () => ({ backend: await import("./backend/ml-fixture"), frontend: await import("./ml-fixture") });
const context = () => {
  const fixture = mlFixture();
  return {
    mode: fixture.mode,
    modelVersion: fixture.modelVersion,
    gradeGroup: fixture.gradeGroup,
    topics: fixture.topics,
    progress: fixture.progress,
  };
};

describe("inactive backend-to-frontend ML fixture integration", () => {
  it("replays validated backend-shaped evidence and consumes a private synthetic result", async () => {
    const { backend, frontend } = await modules();
    const fixture = mlFixture();
    const before = structuredClone(fixture);
    const transport = backend.runMlFixture(fixture, fixture.learnerId);
    const result = frontend.consumeMlFixtureResult(JSON.parse(JSON.stringify(transport)), context());
    expect(result).toMatchObject({
      mode: "synthetic-fixture",
      activation: "disabled",
      modelVersion: "fixture-v1",
      next: { kind: "review", topicId: "money-basics", conceptId: "money-out", reason: "weak-concept" },
    });
    expect(result.mastery["money-basics"]!["money-in"]).toBeCloseTo(0.36559953434225845, 12);
    expect(Object.keys(result)).toEqual([
      "schemaVersion",
      "mode",
      "activation",
      "modelVersion",
      "gradeGroup",
      "mastery",
      "evidenceCounts",
      "next",
    ]);
    expect(MlFixtureResult.parse(result)).toEqual(result);
    expect(fixture).toEqual(before);
  });
  it("rejects another learner at the backend boundary", async () => {
    const { backend } = await modules();
    expect(() => backend.runMlFixture(mlFixture(), "22222222-2222-4222-8222-222222222222")).toThrow(/learner mismatch/);
    expect(() => backend.runMlFixture(mlFixture(), "not-a-uuid")).toThrow();
  });
  it("accepts equivalent learner UUID spelling at the backend scope boundary", async () => {
    const { backend } = await modules();
    const fixture = mlFixture();
    fixture.learnerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    for (const event of fixture.events) event.learner_id = fixture.learnerId;
    expect(backend.runMlFixture(fixture, fixture.learnerId.toUpperCase()).activation).toBe("disabled");
  });
  it.each(["model", "grade", "locked-next", "counts", "identity", "activation", "mastery"])(
    "rejects poisoned frontend %s",
    async (fault) => {
      const { backend, frontend } = await modules();
      const result: Record<string, unknown> = backend.runMlFixture(mlFixture(), mlFixture().learnerId);
      switch (fault) {
        case "model":
          result.modelVersion = "other-model";
          break;
        case "grade":
          result.gradeGroup = "grade-6-7";
          break;
        case "locked-next":
          result.next = { kind: "topic", topicId: "saving", reason: "prerequisite-readiness" };
          break;
        case "counts":
          result.evidenceCounts = { "money-basics": { "money-in": 2 }, saving: { save: 0 } };
          break;
        case "identity":
          result.learnerId = mlFixture().learnerId;
          break;
        case "activation":
          result.activation = "enabled";
          break;
        case "mastery":
          result.mastery = { "money-basics": { "money-in": 0.9, "money-out": 0.9 } };
          break;
      }
      expect(() => frontend.consumeMlFixtureResult(result, context())).toThrow();
    },
  );
  it("never recommends the locked topic when no prerequisite quiz is passed", async () => {
    const { backend, frontend } = await modules();
    const fixture = mlFixture();
    fixture.progress = {};
    const transport = backend.runMlFixture(fixture, fixture.learnerId);
    const result = frontend.consumeMlFixtureResult(transport, { ...context(), progress: {} });
    expect(result.next).toEqual({ kind: "topic", topicId: "money-basics", reason: "foundation-topic" });
  });
  it("changes a review into an open-topic suggestion from new evidence, not new unlocks", async () => {
    const { backend, frontend } = await modules();
    const fixture = mlFixture();
    fixture.registry[0]!.questions[1]!.conceptId = "money-out";
    fixture.events[1]!.concept_id = "money-out";
    const before = frontend.consumeMlFixtureResult(backend.runMlFixture(fixture, fixture.learnerId), context());
    expect(before.next).toEqual({
      kind: "review",
      topicId: "money-basics",
      conceptId: "money-out",
      reason: "weak-concept",
    });
    fixture.events[1]!.correct = true;
    const after = frontend.consumeMlFixtureResult(backend.runMlFixture(fixture, fixture.learnerId), context());
    expect(after.next).toEqual({ kind: "topic", topicId: "saving", reason: "prerequisite-readiness" });
    expect(fixture.progress).toEqual({ "money-basics": 1 });
  });
  it("returns detached consumer data and rejects invalid context", async () => {
    const { backend, frontend } = await modules();
    const transport = backend.runMlFixture(mlFixture(), mlFixture().learnerId);
    const result = frontend.consumeMlFixtureResult(transport, context());
    result.mastery["money-basics"]!["money-in"] = 0;
    expect(transport.mastery["money-basics"]!["money-in"]).toBeCloseTo(0.36559953434225845, 12);
    expect(() => frontend.consumeMlFixtureResult(transport, { ...context(), enabled: true })).toThrow();
  });
  it("rejects missing own mastery even for a concept named constructor", async () => {
    const { backend, frontend } = await modules();
    const fixture = mlFixture();
    const params = fixture.parameters["money-basics"]!["money-in"]!;
    fixture.topics = [{ ...fixture.topics[0]!, conceptIds: ["constructor"] }];
    fixture.progress = {};
    fixture.registry = [];
    fixture.events = [];
    fixture.parameters = { "money-basics": Object.fromEntries([["constructor", params]]) };
    const result = backend.runMlFixture(fixture, fixture.learnerId);
    Reflect.deleteProperty(result.mastery["money-basics"]!, "constructor");
    expect(() =>
      frontend.consumeMlFixtureResult(result, { ...context(), topics: fixture.topics, progress: {} }),
    ).toThrow(/missing own concept mastery/);
  });
});
