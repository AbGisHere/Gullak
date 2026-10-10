import { z } from "zod";
import { Slug } from "./common";

export const InstrumentKind = z.enum([
  "savings",
  "fixed-deposit",
  "recurring-deposit",
  "gold",
  "mutual-fund",
  "index-fund",
  "stock",
]);
export type InstrumentKind = z.infer<typeof InstrumentKind>;

/** Instruments whose value comes from a fixed rate rather than a market price. */
export const DEPOSIT_KINDS = [
  "savings",
  "fixed-deposit",
  "recurring-deposit",
] as const satisfies readonly InstrumentKind[];

export const Instrument = z.object({
  id: Slug,
  kind: InstrumentKind,
  name: z.string().min(1),
  /** Market-data symbol (`NIFTY50`, an AMFI scheme code, `XAU-INR`). Absent for deposits. */
  symbol: z.string().min(1).optional(),
  /** Topic whose completion unlocks this instrument in the paper portfolio. */
  unlockedByTopicId: Slug,
});
export type Instrument = z.infer<typeof Instrument>;
