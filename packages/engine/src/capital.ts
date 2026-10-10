import type { Experience, GradeGroup, Paise } from "@gullak/types";
import { inrToPaise } from "./money";

/** Shape of `packages/content/config/starting-capital.json`. */
export type StartingCapitalTable = {
  defaultInr: number;
  rows: ReadonlyArray<{ gradeGroup: GradeGroup; experience: Experience; inr: number }>;
};

/** Virtual starting cash for a learner. Play money only. */
export function startingCash(table: StartingCapitalTable, gradeGroup: GradeGroup, experience: Experience): Paise {
  const row = table.rows.find((r) => r.gradeGroup === gradeGroup && r.experience === experience);
  return inrToPaise(row?.inr ?? table.defaultInr);
}
