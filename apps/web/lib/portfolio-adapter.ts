import type { PortfolioHoldingItem, PortfolioViewModel } from "@gullak/ui/components/paper-portfolio";
import type { LearnerState } from "./learner-state";

type PaperHolding = LearnerState["paperHoldings"][number];
const HOLDING_KIND = { stock: "stock", etf: "index-fund", "mutual-fund": "mutual-fund", index: "index-fund" } as const;

/** One Live paper-trading holding, valued at `valuePaise` (its cost until a live price arrives). */
export function paperHoldingItem(holding: PaperHolding, valuePaise = holding.costPaise, asOf = holding.openedAt) {
  return {
    id: holding.symbol,
    instrumentId: holding.symbol,
    name: holding.name,
    type: "market",
    kind: HOLDING_KIND[holding.kind],
    currentValuePaise: valuePaise,
    principalPaise: holding.costPaise,
    units: holding.milliUnits / 1000,
    symbol: holding.symbol,
    openedAt: holding.openedAt,
    asOf: asOf.slice(0, 10),
    liquidityCategory: "available-now",
    changePaise: valuePaise - holding.costPaise,
  } satisfies PortfolioHoldingItem;
}

export function startingPortfolio(
  cashPaise: number,
  practiceCashPaise = 0,
  live: { cashDeltaPaise: number; holdings: PortfolioHoldingItem[] } = { cashDeltaPaise: 0, holdings: [] },
): PortfolioViewModel {
  const virtualCash = cashPaise + practiceCashPaise + live.cashDeltaPaise;
  return {
    id: "local-learner-portfolio",
    isVirtual: true,
    asOf: new Date().toISOString().slice(0, 10),
    startingCashPaise: cashPaise,
    cashPaise: virtualCash,
    holdings: live.holdings,
    emergencyReserve: { currentReservePaise: 0, monthlyExpensesPaise: 0 },
    goals: [],
  };
}
