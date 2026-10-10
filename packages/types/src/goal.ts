import { z } from "zod";
import { IsoDate, IsoDateTime, Paise } from "./common";

export const Goal = z.object({
  id: z.uuid(),
  /** Learner's own words, e.g. "Bike". */
  label: z.string().min(1).max(80),
  targetPaise: Paise.positive(),
  targetDate: IsoDate,
  /** What the learner already has towards it. */
  currentSavingsPaise: Paise.nonnegative().default(0),
  createdAt: IsoDateTime,
});
export type Goal = z.infer<typeof Goal>;
