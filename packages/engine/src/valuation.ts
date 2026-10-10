import { NonNegativePaise, type Portfolio, type SeriesPoint } from "@gullak/types";
import { compoundAmount, fdMaturity } from "./interest";

/** FD-only MVP: ACT/365.25 accrual, capped at the calendar maturity date. */
export function valuePortfolio(portfolio: Portfolio, asOf: string) {
  const at = Date.parse(asOf);
  if (!Number.isFinite(at) || at < Date.parse(portfolio.createdAt)) throw new RangeError("invalid valuation date");
  const holdings = portfolio.holdings.map((holding) => {
    if (holding.type !== "deposit" || holding.kind !== "fixed-deposit" || !holding.tenureMonths) {
      throw new RangeError("valuation unavailable for this holding kind");
    }
    const opened = new Date(holding.openedAt);
    if (at < opened.getTime()) throw new RangeError("valuation precedes holding opening");
    const maturity = new Date(opened);
    const day = maturity.getUTCDate();
    maturity.setUTCDate(1);
    maturity.setUTCMonth(maturity.getUTCMonth() + holding.tenureMonths);
    const lastDay = new Date(Date.UTC(maturity.getUTCFullYear(), maturity.getUTCMonth() + 1, 0)).getUTCDate();
    maturity.setUTCDate(Math.min(day, lastDay));
    const years =
      at >= maturity.getTime()
        ? holding.tenureMonths / 12
        : Math.min(holding.tenureMonths / 12, (at - opened.getTime()) / (365.25 * 86400000));
    return {
      holdingId: holding.id,
      valuePaise: NonNegativePaise.parse(
        compoundAmount(holding.principalPaise, holding.ratePercent, holding.compoundsPerYear, years),
      ),
      maturityPaise: NonNegativePaise.parse(
        fdMaturity(holding.principalPaise, holding.ratePercent, holding.tenureMonths, holding.compoundsPerYear),
      ),
      assumptions: {
        ratePercent: holding.ratePercent,
        compoundsPerYear: holding.compoundsPerYear,
        tenureMonths: holding.tenureMonths,
        source: holding.rateSource,
        asOf: holding.rateAsOf,
        isProjection: true,
        dayCount: "ACT/365.25; capped at calendar maturity",
        excludesTaxAndPenalties: true,
      },
    };
  });
  return {
    isVirtual: true as const,
    asOf,
    holdings,
    totalPaise: NonNegativePaise.parse(portfolio.cashPaise + holdings.reduce((sum, h) => sum + h.valuePaise, 0)),
  };
}

/** Lump-sum index-level replay. No interpolation, dividend, fee or invented dates. */
export function replayHistory(points: readonly SeriesPoint[], initialPaise: number, panicSellAt?: string) {
  NonNegativePaise.positive().parse(initialPaise);
  if (points.length < 2) throw new RangeError("at least two observed dates are required");
  const first = points[0]!;
  if (first.value <= 0) throw new RangeError("initial index level must be positive");
  for (let i = 1; i < points.length; i++) {
    if (Date.parse(points[i]!.t) <= Date.parse(points[i - 1]!.t))
      throw new RangeError("history must be ordered and unique");
  }
  let sell: SeriesPoint | undefined;
  if (panicSellAt) {
    sell = points.find((p) => p.t === panicSellAt);
    if (!sell) throw new RangeError("panic sell must use an observed date");
  }
  return points.map((p) => ({
    t: p.t,
    heldPaise: NonNegativePaise.parse(Math.round((initialPaise * p.value) / first.value)),
    panicSellPaise: NonNegativePaise.parse(
      Math.round((initialPaise * (sell && Date.parse(p.t) >= Date.parse(sell.t) ? sell.value : p.value)) / first.value),
    ),
  }));
}
