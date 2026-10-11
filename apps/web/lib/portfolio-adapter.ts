import type { PortfolioViewModel } from "@gullak/ui/components/paper-portfolio";

export function startingPortfolio(cashPaise: number, practiceCashPaise = 0): PortfolioViewModel {
  const virtualCash = cashPaise + practiceCashPaise;
  return {
    id: "local-learner-portfolio",
    isVirtual: true,
    asOf: new Date().toISOString().slice(0, 10),
    startingCashPaise: cashPaise,
    cashPaise: virtualCash,
    holdings: [],
    emergencyReserve: { currentReservePaise: 0, monthlyExpensesPaise: 0 },
    goals: [],
  };
}
