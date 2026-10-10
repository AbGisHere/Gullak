import { z } from "zod";
import { Slug } from "./common";

/** Instruments whose value comes from fixed terms (a rate, or none for a piggy bank). */
export const DEPOSIT_KINDS = ["piggy-bank", "savings", "fixed-deposit", "recurring-deposit", "ppf"] as const;

/** Instruments valued as units × a market price or NAV. */
export const MARKET_KINDS = [
  "gold",
  "liquid-fund",
  "bond",
  "debt-fund",
  "mutual-fund",
  "index-fund",
  "etf",
  "stock",
  "nps",
] as const;

export const InstrumentKind = z.enum([...DEPOSIT_KINDS, ...MARKET_KINDS]);
export type InstrumentKind = z.infer<typeof InstrumentKind>;

export const DepositKind = z.enum(DEPOSIT_KINDS);
export type DepositKind = z.infer<typeof DepositKind>;

export const MarketKind = z.enum(MARKET_KINDS);
export type MarketKind = z.infer<typeof MarketKind>;

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
