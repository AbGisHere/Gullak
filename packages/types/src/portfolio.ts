import { z } from "zod";
import { IsoDate, IsoDateTime, NonNegativePaise, RatePercent, Slug } from "./common";
import { DepositKind, MarketKind } from "./instrument";

const HoldingBase = z.object({
  id: z.uuid(),
  instrumentId: Slug,
  openedAt: IsoDateTime,
});

/** Piggy bank / savings / FD / RD / PPF: valued from terms, not market prices. */
export const DepositHolding = HoldingBase.extend({
  type: z.literal("deposit"),
  kind: DepositKind,
  /** Lump sum for FD/savings; monthly instalment for RD. */
  principalPaise: NonNegativePaise,
  ratePercent: RatePercent,
  /** Absent for a piggy bank or savings (no fixed tenure). */
  tenureMonths: z.number().int().positive().optional(),
  compoundsPerYear: z.number().int().positive().default(4),
  /** When and from which source the rate was taken, shown next to it. */
  rateAsOf: IsoDate,
  rateSource: z.string().min(1),
});
export type DepositHolding = z.infer<typeof DepositHolding>;

/** Gold / funds / bonds / stocks / NPS: units × latest market quote or NAV. */
export const MarketHolding = HoldingBase.extend({
  type: z.literal("market"),
  kind: MarketKind,
  symbol: z.string().min(1),
  units: z.number().finite().positive(),
  costBasisPaise: NonNegativePaise,
});
export type MarketHolding = z.infer<typeof MarketHolding>;

export const Holding = z.discriminatedUnion("type", [DepositHolding, MarketHolding]);
export type Holding = z.infer<typeof Holding>;

export const Portfolio = z.object({
  id: z.uuid(),
  learnerId: z.uuid(),
  /**
   * Hard guardrail encoded in the type: every portfolio is play money.
   * There is no code path that represents real funds.
   */
  isVirtual: z.literal(true),
  startingCashPaise: NonNegativePaise,
  cashPaise: NonNegativePaise,
  holdings: z.array(Holding),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Portfolio = z.infer<typeof Portfolio>;
