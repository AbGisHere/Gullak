import type { AgeBand, Experience, Paise } from "@gullak/types";
import { inrToPaise } from "./money";

/** Shape of `packages/content/config/starting-capital.json`. */
export type StartingCapitalTable = {
  defaultInr: number;
  rows: ReadonlyArray<{ ageBand: AgeBand; experience: Experience; inr: number }>;
};

/** Virtual starting cash for a learner. Play money only. */
export function startingCash(table: StartingCapitalTable, ageBand: AgeBand, experience: Experience): Paise {
  const row = table.rows.find((r) => r.ageBand === ageBand && r.experience === experience);
  return inrToPaise(row?.inr ?? table.defaultInr);
}
