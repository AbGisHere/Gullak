import { z } from "zod";

const Probability = z.number().finite().min(0).max(1);

/** Explicit per-concept parameters; forgetting is a transition after each observation. */
export const BktParameters = z
  .object({
    pInit: Probability,
    pLearn: Probability,
    pForget: Probability,
    pSlip: Probability,
    pGuess: Probability,
  })
  .strict()
  .refine((parameters) => parameters.pGuess < 1 - parameters.pSlip, {
    message: "known and unknown states must have distinguishable emissions (guess + slip < 1)",
    path: ["pGuess"],
  });
export type BktParameters = z.infer<typeof BktParameters>;

/** One caller-ordered correct/incorrect quiz observation and its current knowledge state. */
export const BktStepInput = z.object({ parameters: BktParameters, pKnown: Probability, correct: z.boolean() }).strict();
export type BktStepInput = z.infer<typeof BktStepInput>;

/** One concept's already-ordered observations, starting at the explicit pInit. */
export const BktSequenceInput = z.object({ parameters: BktParameters, observations: z.array(z.boolean()) }).strict();
export type BktSequenceInput = z.infer<typeof BktSequenceInput>;
