import { z } from "zod";

/**
 * Play-money paper trading maths for Live mode. Money is integer paise; units are integer
 * milli-units (1 unit = 1000) so fractional mutual-fund units never drift. Shares and ETFs
 * trade in whole units; mutual funds trade by amount, rounded down to 0.001 unit.
 */
export const MILLI_UNITS = 1000;

const Paise = z.number().int().safe().nonnegative();
const PositivePaise = z.number().int().safe().positive();

export const PaperHolding = z.object({
  milliUnits: z.number().int().safe().nonnegative(),
  /** Play money paid for the units still held (reduced pro rata on each sale). */
  costPaise: Paise,
});
export type PaperHolding = z.infer<typeof PaperHolding>;

const BuyInput = z.object({
  cashPaise: Paise,
  holding: PaperHolding.default({ milliUnits: 0, costPaise: 0 }),
  pricePaise: PositivePaise,
  /** Whole units for shares and ETFs. */
  quantity: z.number().int().positive().optional(),
  /** Rupee amount for mutual funds. */
  amountPaise: PositivePaise.optional(),
});

const SellInput = z.object({
  cashPaise: Paise,
  holding: PaperHolding,
  pricePaise: PositivePaise,
  milliUnits: z.number().int().safe().positive(),
});

export type TradeResult =
  | { ok: true; cashPaise: number; holding: PaperHolding; milliUnits: number; amountPaise: number }
  | { ok: false; reason: "invalid-order" | "not-enough-cash" | "below-smallest-unit" | "not-enough-units" };

/** Rupees per unit from a quote (e.g. 1170.3) to integer paise per unit. */
export function pricePaiseFromRupees(rupees: number): number {
  if (!Number.isFinite(rupees) || rupees <= 0) throw new RangeError("price must be a positive number");
  return Math.max(1, Math.round(rupees * 100));
}

/** Buys `quantity` whole units, or as many 0.001 units as `amountPaise` covers. Never overdraws cash. */
export function buyUnits(input: unknown): TradeResult {
  const parsed = BuyInput.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid-order" };
  const { cashPaise, holding, pricePaise, quantity, amountPaise } = parsed.data;
  if ((quantity === undefined) === (amountPaise === undefined)) return { ok: false, reason: "invalid-order" };

  let milliUnits: number;
  let spentPaise: number;
  if (quantity !== undefined) {
    milliUnits = quantity * MILLI_UNITS;
    spentPaise = quantity * pricePaise;
  } else {
    const amount = amountPaise as number;
    milliUnits = Math.floor((amount * MILLI_UNITS) / pricePaise);
    if (milliUnits === 0) return { ok: false, reason: "below-smallest-unit" };
    // Charge only for the units actually bought, rounded up so play money never appears from nowhere.
    spentPaise = Math.ceil((milliUnits * pricePaise) / MILLI_UNITS);
  }
  if (!Number.isSafeInteger(spentPaise) || spentPaise > cashPaise) return { ok: false, reason: "not-enough-cash" };
  return {
    ok: true,
    cashPaise: cashPaise - spentPaise,
    holding: { milliUnits: holding.milliUnits + milliUnits, costPaise: holding.costPaise + spentPaise },
    milliUnits,
    amountPaise: spentPaise,
  };
}

/** Sells `milliUnits` at the current price; proceeds are rounded down to whole paise. */
export function sellUnits(input: unknown): TradeResult {
  const parsed = SellInput.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid-order" };
  const { cashPaise, holding, pricePaise, milliUnits } = parsed.data;
  if (milliUnits > holding.milliUnits) return { ok: false, reason: "not-enough-units" };
  const proceedsPaise = Math.floor((milliUnits * pricePaise) / MILLI_UNITS);
  const remaining = holding.milliUnits - milliUnits;
  const costPaise = remaining === 0 ? 0 : Math.round((holding.costPaise * remaining) / holding.milliUnits);
  return {
    ok: true,
    cashPaise: cashPaise + proceedsPaise,
    holding: { milliUnits: remaining, costPaise },
    milliUnits,
    amountPaise: proceedsPaise,
  };
}

/** Current play-money value of a holding, rounded down to whole paise. */
export function holdingValuePaise(holding: PaperHolding, pricePaise: number): number {
  return Math.floor((holding.milliUnits * pricePaise) / MILLI_UNITS);
}
