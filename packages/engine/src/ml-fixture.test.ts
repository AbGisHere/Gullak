import { describe, expect, it } from "vitest";
import * as engine from "./index";
import { mlFixture } from "./ml-fixture.test-fixture";

describe("disabled synthetic quiz replay", () => {
  it("observes then transitions with hand-calculated probabilities and counts", () => {
    const result = engine.replayQuizFixture(mlFixture());
    // First posterior = 27/41; transition = 569/820. Second posterior = 569/2577.
    // Final transition = 0.2 + 0.75*(569/2577).
    expect(result.mastery["money-basics"]!["money-in"]).toBeCloseTo(0.36559953434225845, 12);
    expect(result.mastery["money-basics"]!["money-out"]).toBe(0.3);
    expect(result.evidenceCounts["money-basics"]).toEqual({ "money-in": 2, "money-out": 0 });
    expect(result.next).toEqual({
      kind: "review",
      topicId: "money-basics",
      conceptId: "money-out",
      reason: "weak-concept",
    });
    expect(result.activation).toBe("disabled");
  });
  it("orders by pinned question positions rather than input or UUID order", () => {
    const fixture = mlFixture();
    fixture.events.reverse();
    expect(engine.replayQuizFixture(fixture)).toEqual(engine.replayQuizFixture(mlFixture()));
  });
  it.each([
    ["none", 0.1],
    ["some", 0.3],
    ["regular", 0.5],
  ] as const)("initialises all no-evidence concepts for %s", (experience, prior) => {
    const fixture = mlFixture();
    fixture.experience = experience;
    fixture.events = [];
    const result = engine.replayQuizFixture(fixture);
    expect(result.mastery).toEqual({
      "money-basics": { "money-in": prior, "money-out": prior },
      saving: { save: prior },
    });
    expect(result.evidenceCounts.saving).toEqual({ save: 0 });
  });
  it("never passes a topic from estimated mastery and does not mutate inputs", () => {
    const fixture = mlFixture();
    fixture.progress = {};
    const before = structuredClone(fixture);
    const result = engine.replayQuizFixture(fixture);
    expect(result.next).toEqual({ kind: "topic", topicId: "money-basics", reason: "foundation-topic" });
    expect(fixture).toEqual(before);
    expect(engine.replayQuizFixture(fixture)).toEqual(result);
  });
  it.each([
    "foreign-learner",
    "duplicate-id",
    "duplicate-question",
    "unknown-version",
    "mixed-version",
    "unknown-concept",
    "missing-parameters",
    "extra-parameters",
    "duplicate-definition",
    "duplicate-position",
    "duplicate-registry-question",
    "unknown-registry-topic",
    "unknown-registry-concept",
    "reverse-time",
    "different-time-in-attempt",
    "unknown-progress",
  ])("rejects %s before returning a result", (fault) => {
    const fixture = mlFixture();
    const first = fixture.events[0]!;
    const second = fixture.events[1]!;
    const definition = fixture.registry[0]!;
    switch (fault) {
      case "foreign-learner":
        first.learner_id = "22222222-2222-4222-8222-222222222222";
        break;
      case "duplicate-id":
        second.event_id = first.event_id;
        break;
      case "duplicate-question":
        second.question_id = first.question_id;
        break;
      case "unknown-version":
        first.content_version = "b".repeat(64);
        break;
      case "mixed-version":
        fixture.registry.push({ ...structuredClone(definition), contentVersion: "b".repeat(64) });
        second.content_version = "b".repeat(64);
        break;
      case "unknown-concept":
        first.concept_id = "money-out";
        break;
      case "missing-parameters":
        delete fixture.parameters["money-basics"]!["money-in"];
        break;
      case "extra-parameters":
        fixture.parameters.saving!.unknown = fixture.parameters.saving!.save!;
        break;
      case "duplicate-definition":
        fixture.registry.push(structuredClone(definition));
        break;
      case "duplicate-position":
        definition.questions[1]!.position = 0;
        break;
      case "duplicate-registry-question":
        definition.questions[1]!.questionId = definition.questions[0]!.questionId;
        break;
      case "unknown-registry-topic":
        definition.topicId = "other";
        break;
      case "unknown-registry-concept":
        definition.questions[0]!.conceptId = "other";
        break;
      case "reverse-time":
        second.attempt_no = 2;
        second.answered_at = "2026-10-10T00:00:00Z";
        break;
      case "different-time-in-attempt":
        second.answered_at = "2026-10-11T00:00:01Z";
        break;
      case "unknown-progress":
        fixture.progress.unknown = 1;
        break;
    }
    expect(() => engine.replayQuizFixture(fixture)).toThrow();
  });
  it("accepts version changes across attempts with their own question order", () => {
    const fixture = mlFixture();
    fixture.registry.push({
      ...structuredClone(fixture.registry[0]!),
      contentVersion: "b".repeat(64),
      questions: [...fixture.registry[0]!.questions].reverse().map((q, position) => ({ ...q, position })),
    });
    const old = structuredClone(fixture.events);
    fixture.events.push(
      ...old.map((event, index) => ({
        ...event,
        event_id: `00000000-0000-4000-8000-${String(index + 20).padStart(12, "0")}`,
        attempt_no: 2,
        content_version: "b".repeat(64),
        answered_at: "2026-10-11T00:01:00Z",
      })),
    );
    const result = engine.replayQuizFixture(fixture);
    expect(result.evidenceCounts["money-basics"]!["money-in"]).toBe(4);
    fixture.events.reverse();
    expect(engine.replayQuizFixture(fixture)).toEqual(result);
  });
  it("accepts equal instants written with different offsets", () => {
    const fixture = mlFixture();
    fixture.events[1]!.answered_at = "2026-10-11T05:30:00+05:30";
    expect(engine.replayQuizFixture(fixture)).toEqual(engine.replayQuizFixture(mlFixture()));
  });
  it("handles a valid empty graph without inventing a recommendation", () => {
    const fixture = mlFixture();
    fixture.topics = [];
    fixture.progress = {};
    fixture.parameters = {};
    fixture.registry = [];
    fixture.events = [];
    expect(engine.replayQuizFixture(fixture).next).toBeNull();
  });
  it("fails closed on a numerically impossible observation without mutating the fixture", () => {
    const fixture = mlFixture();
    fixture.events = [fixture.events[0]!];
    fixture.events[0]!.correct = false;
    fixture.experience = "none";
    fixture.parameters["money-basics"]!["money-in"] = { pLearn: 1, pForget: 0, pSlip: 0, pGuess: 0 };
    const second = { ...fixture.events[0]!, event_id: "00000000-0000-4000-8000-000000000010", attempt_no: 2 };
    fixture.events.push(second);
    const before = structuredClone(fixture);
    expect(() => engine.replayQuizFixture(fixture)).toThrow(RangeError);
    expect(fixture).toEqual(before);
  });
  it("rejects unknown parameter dictionary keys even when they name a prototype property", () => {
    const fixture = mlFixture();
    Object.defineProperty(fixture.parameters, "constructor", { value: fixture.parameters.saving!, enumerable: true });
    expect(() => engine.replayQuizFixture(fixture)).toThrow(/unknown parameter topic/);
  });
  it("rejects two case spellings of one event UUID across attempts", () => {
    const fixture = mlFixture();
    const first = fixture.events[0]!;
    first.event_id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    fixture.events = [first, { ...first, event_id: first.event_id.toUpperCase(), attempt_no: 2 }];
    expect(() => engine.replayQuizFixture(fixture)).toThrow(/duplicate event id/);
  });
  it("treats differently cased learner UUIDs as the same identity", () => {
    const fixture = mlFixture();
    fixture.learnerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    for (const event of fixture.events) event.learner_id = fixture.learnerId.toUpperCase();
    expect(engine.replayQuizFixture(fixture).evidenceCounts["money-basics"]!["money-in"]).toBe(2);
  });
});
