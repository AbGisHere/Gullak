import { type BktParameters, BktSequenceInput, BktStepInput } from "@gullak/types";

export type BktStepResult = {
  /** One-step-ahead probability before consuming this observation. */
  pCorrect: number;
  /** Knowledge after observing the answer, before learning/forgetting. */
  posterior: number;
  /** Knowledge after the observation's learning/forgetting transition. */
  pKnown: number;
};

export type BktSequenceResult = { predictions: number[]; pKnown: number };

function inferStep(parameters: BktParameters, pKnown: number, correct: boolean): BktStepResult {
  const knownCorrect = pKnown * (1 - parameters.pSlip);
  const unknownCorrect = (1 - pKnown) * parameters.pGuess;
  const pCorrect = knownCorrect + unknownCorrect;
  const knownObserved = correct ? knownCorrect : pKnown * parameters.pSlip;
  const unknownObserved = correct ? unknownCorrect : (1 - pKnown) * (1 - parameters.pGuess);
  // Sum the actual observation's weights: 1-pCorrect can round tiny incorrect likelihoods to zero.
  const likelihood = knownObserved + unknownObserved;
  if (likelihood === 0) {
    throw new RangeError("BKT observation has zero or unrepresentable likelihood");
  }
  const posterior = knownObserved / likelihood;
  return {
    pCorrect,
    posterior,
    pKnown: posterior * (1 - parameters.pForget) + (1 - posterior) * parameters.pLearn,
  };
}

/** Pure inference for one explicit quiz observation; never loads or activates parameters. */
export function bktStep(input: unknown): BktStepResult {
  const { parameters, pKnown, correct } = BktStepInput.parse(input);
  return inferStep(parameters, pKnown, correct);
}

/** Preserve caller order; predict before observing, then transition. Empty input retains pInit. */
export function bktSequence(input: unknown): BktSequenceResult {
  const { parameters, observations } = BktSequenceInput.parse(input);
  let pKnown = parameters.pInit;
  const predictions: number[] = [];
  for (const correct of observations) {
    const result = inferStep(parameters, pKnown, correct);
    predictions.push(result.pCorrect);
    pKnown = result.pKnown;
  }
  return { predictions, pKnown };
}
