import { describe, expect, it } from "vitest";
import * as engine from "./index";

// Synthetic engineering fixtures only; not estimates of real students.
const parameters = { pInit: 0.3, pLearn: 0.1, pForget: 0.05, pSlip: 0.1, pGuess: 0.2 };

describe("offline BKT observation then transition", () => {
  it.each([
    { correct: true, posterior: 27 / 41, pKnown: 541 / 820 },
    { correct: false, posterior: 3 / 59, pKnown: 169 / 1180 },
  ])("updates the hand-calculated $correct observation", ({ correct, posterior, pKnown }) => {
    // P(correct) = .3*.9 + .7*.2 = .41; transition = .85*posterior + .1.
    const result = engine.bktStep({ parameters, pKnown: 0.3, correct });
    expect(result.pCorrect).toBeCloseTo(0.41, 14);
    expect(result.posterior).toBeCloseTo(posterior, 14);
    expect(result.pKnown).toBeCloseTo(pKnown, 14);
  });

  it.each([
    { pKnown: 0, correct: true, want: 0.1 },
    { pKnown: 0, correct: false, want: 0.1 },
    { pKnown: 1, correct: true, want: 0.95 },
    { pKnown: 1, correct: false, want: 0.95 },
  ])("handles state endpoint %#", ({ pKnown, correct, want }) => {
    expect(engine.bktStep({ parameters, pKnown, correct }).pKnown).toBe(want);
  });

  it.each([
    { pLearn: 0, pForget: 0, want: 27 / 41 },
    { pLearn: 1, pForget: 0, want: 1 },
    { pLearn: 0, pForget: 1, want: 0 },
    { pLearn: 1, pForget: 1, want: 14 / 41 },
  ])("handles transition endpoint %#", ({ pLearn, pForget, want }) => {
    expect(
      engine.bktStep({ parameters: { ...parameters, pLearn, pForget }, pKnown: 0.3, correct: true }).pKnown,
    ).toBeCloseTo(want, 14);
  });

  it.each([
    { pKnown: 0, correct: false, posterior: 0, want: 0.1 },
    { pKnown: 1, correct: true, posterior: 1, want: 0.95 },
  ])("handles possible observations under perfect emissions %#", ({ pKnown, correct, posterior, want }) => {
    const result = engine.bktStep({ parameters: { ...parameters, pSlip: 0, pGuess: 0 }, pKnown, correct });
    expect(result.posterior).toBe(posterior);
    expect(result.pKnown).toBe(want);
  });

  it.each([
    { pKnown: 0, correct: true },
    { pKnown: 1, correct: false },
  ])("fails closed on impossible observations %#", ({ pKnown, correct }) => {
    expect(() => engine.bktStep({ parameters: { ...parameters, pSlip: 0, pGuess: 0 }, pKnown, correct })).toThrow(
      RangeError,
    );
  });

  it("preserves tiny possible incorrect-observation likelihoods", () => {
    const result = engine.bktStep({
      parameters: { ...parameters, pSlip: 1e-20, pGuess: 0 },
      pKnown: 1,
      correct: false,
    });
    expect(result.posterior).toBe(1);
    expect(result.pKnown).toBe(0.95);
  });

  it.each([
    { parameters, pKnown: Number.NaN, correct: true },
    { parameters, pKnown: Number.POSITIVE_INFINITY, correct: false },
    { parameters, pKnown: 0.3, correct: 1 },
    { parameters: { ...parameters, pForget: "0.05" }, pKnown: 0.3, correct: false },
    { parameters, pKnown: 0.3, correct: false, learnerId: "learner-1" },
    null,
  ])("validates step input before calculating %#", (input) => {
    expect(() => engine.bktStep(input)).toThrowError(expect.objectContaining({ name: "ZodError" }));
  });

  it("preserves empty-sequence initial knowledge", () => {
    expect(engine.bktSequence({ parameters, observations: [] })).toEqual({ predictions: [], pKnown: 0.3 });
  });

  // Golden predictions from the notebook's predict_bkt_batch on one synthetic sequence.
  it.each([
    {
      pForget: 0,
      predictions: [0.41000000000000003, 0.6848780487804879, 0.408482972136223, 0.6834106412005457, 0.8429536471433705],
    },
    {
      pForget: 0.05,
      predictions: [0.41000000000000003, 0.661829268292683, 0.386081860800577, 0.6387109858444524, 0.7954550361730264],
    },
    {
      pForget: 0.2,
      predictions: [
        0.41000000000000003, 0.5926829268292684, 0.3374850299401198, 0.5266501064584812, 0.6607519708914494,
      ],
    },
  ])("matches synthetic benchmark predictions with forgetting $pForget", ({ pForget, predictions }) => {
    const result = engine.bktSequence({
      parameters: { ...parameters, pForget },
      observations: [true, false, true, true, false],
    });
    expect(result.predictions).toHaveLength(predictions.length);
    predictions.forEach((prediction, index) => {
      expect(result.predictions[index]).toBeCloseTo(prediction, 14);
    });
  });

  it("matches the plain notebook final state when forgetting is zero", () => {
    const result = engine.bktSequence({
      parameters: { ...parameters, pForget: 0 },
      observations: [true, false, true, true, false],
    });
    // Golden final state from the notebook's predict_sequence, not this runtime.
    expect(result.pKnown).toBeCloseTo(0.6263762412483415, 14);
  });

  it("returns the transitioned state after a one-answer sequence", () => {
    const result = engine.bktSequence({ parameters, observations: [false] });
    expect(result.predictions[0]).toBeCloseTo(0.41, 14);
    expect(result.pKnown).toBeCloseTo(169 / 1180, 14);
  });

  it.each([
    { parameters, observations: [true, 1] },
    { parameters: { ...parameters, pInit: Number.NaN }, observations: [] },
    { parameters, observations: [true], elapsedDays: 1 },
    null,
  ])("validates all sequence input before calculating %#", (input) => {
    expect(() => engine.bktSequence(input)).toThrowError(expect.objectContaining({ name: "ZodError" }));
  });

  it("fails closed when a later sequence observation is impossible", () => {
    expect(() =>
      engine.bktSequence({
        parameters: { pInit: 0, pLearn: 1, pForget: 0, pSlip: 0, pGuess: 0 },
        observations: [false, false],
      }),
    ).toThrow(RangeError);
  });

  it("does not mutate frozen parameters or observations", () => {
    const input = Object.freeze({
      parameters: Object.freeze({ ...parameters }),
      observations: Object.freeze([true, false]),
    });
    engine.bktSequence(input);
    engine.bktStep(Object.freeze({ parameters: input.parameters, pKnown: 0.3, correct: false }));
    expect(input.parameters).toEqual(parameters);
    expect(input.observations).toEqual([true, false]);
  });
});
