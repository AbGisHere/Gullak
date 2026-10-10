import { z } from "zod";
import { IsoDate, IsoDateTime, NonNegativePaise, RatePercent, Slug } from "./common";

const HoldingBase = z.object({
  id: z.uuid(),
  instrumentId: Slug,
  openedAt: IsoDateTime,
});

/** Savings / FD / RD: valued from terms, not market prices. */
export const DepositHolding = HoldingBase.extend({
  type: z.literal("deposit"),
  kind: z.enum(["savings", "fixed-deposit", "recurring-deposit"]),
  /** Lump sum for FD/savings; monthly instalment for RD. */
  principalPaise: NonNegativePaise,
  ratePercent: RatePercent,
  /** Absent for savings (no fixed tenure). */
  tenureMonths: z.number().int().positive().optional(),
  compoundsPerYear: z.number().int().positive().default(4),
  /** When and from which source the rate was taken, shown next to it. */
  rateAsOf: IsoDate,
  rateSource: z.string().min(1),
});
export type DepositHolding = z.infer<typeof DepositHolding>;

/** Gold / mutual fund / index fund / stock: units × latest market quote. */
export const MarketHolding = HoldingBase.extend({
  type: z.literal("market"),
  kind: z.enum(["gold", "mutual-fund", "index-fund", "stock"]),
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
