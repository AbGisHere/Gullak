import { describe, expect, it } from "vitest";
import * as types from "./index";

// Synthetic engineering parameters, not estimates of learner mastery.
const parameters = { pInit: 0.3, pLearn: 0.1, pForget: 0.05, pSlip: 0.1, pGuess: 0.2 };
const step = { parameters, pKnown: 0.3, correct: false };
const sequence = { parameters, observations: [true, false, true] };

describe("explicit offline BKT contracts", () => {
  it("exports validated parameters and step/sequence boundaries", () => {
    expect(types).toHaveProperty("BktParameters");
    expect(types).toHaveProperty("BktStepInput");
    expect(types).toHaveProperty("BktSequenceInput");
  });

  it("preserves explicit parameters, false observations and empty sequences", () => {
    expect(types.BktParameters.parse(parameters)).toEqual(parameters);
    expect(types.BktStepInput.parse(step)).toEqual(step);
    expect(types.BktSequenceInput.parse(sequence)).toEqual(sequence);
    expect(types.BktSequenceInput.parse({ parameters, observations: [] }).observations).toEqual([]);
  });

  it("accepts zero/one state and transition endpoints with distinguishable emissions", () => {
    expect(types.BktParameters.parse({ pInit: 0, pLearn: 1, pForget: 1, pSlip: 0, pGuess: 0 })).toEqual({
      pInit: 0,
      pLearn: 1,
      pForget: 1,
      pSlip: 0,
      pGuess: 0,
    });
    expect(types.BktStepInput.parse({ ...step, pKnown: 1 }).pKnown).toBe(1);
  });

  it.each(["pInit", "pLearn", "pForget", "pSlip", "pGuess"])(
    "rejects invalid or missing %s instead of defaulting or coercing it",
    (field) => {
      for (const value of [
        -0.001,
        1.001,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        "0.1",
        true,
        null,
        undefined,
      ]) {
        expect(types.BktParameters.safeParse({ ...parameters, [field]: value }).success).toBe(false);
      }
    },
  );

  it.each([
    { pSlip: 0.8, pGuess: 0.2 },
    { pSlip: 0.8, pGuess: 0.3 },
    { pSlip: 1, pGuess: 0 },
  ])("rejects indistinguishable or reversed emissions %#", (emissions) => {
    expect(types.BktParameters.safeParse({ ...parameters, ...emissions }).success).toBe(false);
  });

  it.each([-1, 2, Number.NaN, Number.POSITIVE_INFINITY, "0.3", undefined])(
    "rejects invalid or missing current knowledge %#",
    (pKnown) => {
      expect(types.BktStepInput.safeParse({ ...step, pKnown }).success).toBe(false);
    },
  );

  it.each([0, 1, "true", "false", null, undefined, { correct: true }])(
    "rejects nonboolean observations %#",
    (correct) => {
      expect(types.BktStepInput.safeParse({ ...step, correct }).success).toBe(false);
      expect(types.BktSequenceInput.safeParse({ ...sequence, observations: [correct] }).success).toBe(false);
    },
  );

  it.each([
    { ...step, learnerId: "learner-1" },
    { ...step, parameters: { ...parameters, elapsedDays: 1 } },
    { ...step, parameters: null },
    { ...step, parameters: undefined },
    null,
  ])("rejects extra fields and missing parameters in steps %#", (input) => {
    expect(types.BktStepInput.safeParse(input).success).toBe(false);
  });

  it.each([
    { ...sequence, eventId: "event-1" },
    { ...sequence, parameters: { ...parameters, productionApproved: true } },
    { ...sequence, observations: undefined },
    { ...sequence, observations: true },
    { ...sequence, parameters: undefined },
    null,
  ])("rejects extra fields and missing sequence data %#", (input) => {
    expect(types.BktSequenceInput.safeParse(input).success).toBe(false);
  });
});
