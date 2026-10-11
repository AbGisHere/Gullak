export type MasteryParams = Readonly<{
  pLearn: number;
  pGuess: number;
  pSlip: number;
}>;

export const DEFAULT_MASTERY_PARAMS: MasteryParams = { pLearn: 0.18, pGuess: 0.2, pSlip: 0.1 };

export function initialMastery(experience: "none" | "some" | "regular"): number {
  return experience === "regular" ? 0.55 : experience === "some" ? 0.35 : 0.2;
}

/** TODO: Temporary local BKT update; replace with the exported @gullak/engine function when it lands. */
export function updateMastery(
  pKnown: number,
  correct: boolean,
  params: MasteryParams = DEFAULT_MASTERY_PARAMS,
): number {
  const prior = pKnown + (1 - pKnown) * params.pLearn;
  const likelihoodKnown = correct ? 1 - params.pSlip : params.pSlip;
  const likelihoodUnknown = correct ? params.pGuess : 1 - params.pGuess;
  return (prior * likelihoodKnown) / (prior * likelihoodKnown + (1 - prior) * likelihoodUnknown);
}
