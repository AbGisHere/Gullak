import type { PortfolioViewModel } from "../components/paper-portfolio";
import type { MoneyTermData } from "../components/money-decoder";

/**
 * Educational term definitions for development fixtures.
 * Development/demo fixture only — strictly isolated in packages/ui/src/fixtures.
 */
export const portfolioFixtureTerms: Record<string, MoneyTermData> = {
  Liquidity: {
    term: "Liquidity",
    plainMeaning: "How quickly and easily you can convert an asset into spendable cash without losing its value.",
    whereYouSeeIt: ["Bank savings accounts", "Emergency funds", "Investment brochures"],
    example: "Cash in your wallet has instant liquidity; money locked in a 3-year deposit has low liquidity.",
    whyItMattersHere: "Having high liquidity protects you against emergencies so you never have to break investments or pay penalty fees.",
  },
  Tenure: {
    term: "Tenure",
    plainMeaning: "The agreed duration of time an investment stays invested before reaching its maturity date.",
    whereYouSeeIt: ["Fixed Deposits (FD)", "Recurring Deposits (RD)", "Bank loans"],
    example: "A 12-month tenure means your money is committed for one full year.",
    whyItMattersHere: "Longer tenures usually yield higher interest rates, but require you to commit your money for that full duration.",
  },
  Maturity: {
    term: "Maturity",
    plainMeaning: "The date when an investment period ends and you receive your original money back plus accumulated interest.",
    whereYouSeeIt: ["Fixed Deposit certificates", "Bonds", "Government savings schemes"],
    example: "When your FD matures on 15 Oct, the full principal and interest are transferred to your savings account.",
    whyItMattersHere: "Matching maturity dates to when you actually need cash prevents premature withdrawal penalties.",
  },
  "Premature Withdrawal": {
    term: "Premature Withdrawal",
    plainMeaning: "Withdrawing money from a locked investment before the agreed tenure has ended.",
    whereYouSeeIt: ["Fixed Deposit penalty rules", "Retirement savings terms"],
    example: "Breaking a 1-year FD after only 3 months because you need money for an urgent repair.",
    whyItMattersHere: "Institutions often deduct an interest penalty when you exit early.",
  },
  NAV: {
    term: "NAV",
    expandedName: "Net Asset Value",
    plainMeaning: "The price of one single unit of a mutual fund or index fund on a given day.",
    whereYouSeeIt: ["Mutual fund statements", "Index fund trackers", "Financial news"],
    example: "If a fund's NAV is ₹200, an investment of ₹1,000 buys you 5 units.",
    whyItMattersHere: "The NAV fluctuates based on the daily market value of all underlying assets in the fund.",
  },
  Units: {
    term: "Units",
    plainMeaning: "Equal shares of ownership in a pooled investment like an index fund or mutual fund.",
    whereYouSeeIt: ["Index funds", "Mutual funds", "ETFs"],
    example: "Holding 40 units of a virtual Nifty 50 fund.",
    whyItMattersHere: "Your total holding value is calculated by multiplying the number of units by the current NAV.",
  },
  Diversification: {
    term: "Diversification",
    plainMeaning: "Spreading your savings across different types of investments so a downturn in one doesn't wipe out everything.",
    whereYouSeeIt: ["Index funds", "Balanced personal portfolios", "Risk management guides"],
    example: "Keeping some money in bank savings, some in FDs, and some in broad index funds.",
    whyItMattersHere: "Diversification ensures that if one asset drops, your other savings continue to provide stability.",
  },
  "Emergency Fund": {
    term: "Emergency Fund",
    plainMeaning: "An accessible pool of cash saved strictly for unpredictable, urgent expenses like medical care or urgent repairs.",
    whereYouSeeIt: ["Savings accounts", "Liquid mutual funds", "Cash reserves"],
    example: "Keeping ₹5,000 untouched in a bank account until an unforeseen emergency strikes.",
    whyItMattersHere: "An emergency buffer lets you handle life surprises without borrowing money at high interest or destroying investments.",
  },
};

/**
 * Example development fixture: Fictional student paper portfolio.
 * Demonstrates:
 * - Cash (available immediately)
 * - Emergency reserve (readily accessible in high-interest savings)
 * - 1 Fixed Deposit (locked for 12 months, linked to laptop goal)
 * - 1 Recurring Deposit (monthly discipline for bike goal)
 * - 1 Diversified virtual holding (virtual Nifty 50 Index Fund)
 * - 1 Fictional goal (Laptop goal, target ₹20,000)
 *
 * Strictly fictional and educational. Never real financial advice or real products.
 */
export const exampleStudentPortfolio: PortfolioViewModel = {
  id: "fictional-portfolio-1",
  learnerId: "learner-test-uuid",
  isVirtual: true,
  asOf: "11 Oct 2026",
  startingCashPaise: 2500000, // ₹25,000 starting play money
  cashPaise: 250000, // ₹2,500 unallocated play cash
  terms: portfolioFixtureTerms,
  liquidityDescriptions: {
    "available-now": "Readily accessible funds modeled for immediate needs without early exit penalties.",
    conditional: "Term deposits with committed durations where early withdrawal conditions apply under scenario rules.",
    "long-term": "Market-linked instruments where value fluctuates; amount available when sold depends on prevailing prices.",
  },
  allocationDescription: "Spreading money across multiple asset categories divides exposure across different return and risk characteristics.",
  emergencyReserve: {
    currentReservePaise: 500000, // ₹5,000
    targetPaise: 600000, // ₹6,000 target
    monthlyExpensesPaise: 200000, // ₹2,000/month estimated scenario expense baseline
    monthsCovered: 2.5,
    statusNote: "At the assumptions used in this scenario, this reserve represents about 2.5 months of the supplied monthly expense amount.",
  },
  goals: [
    {
      id: "goal-laptop",
      label: "School Laptop & Coding Setup",
      targetPaise: 2000000, // ₹20,000
      targetDate: "30 Jun 2027",
      currentSavingsPaise: 1200000, // ₹12,000
      linkedHoldingIds: ["holding-fd-1", "holding-savings-buffer"],
    },
    {
      id: "goal-bicycle",
      label: "Commute Bicycle",
      targetPaise: 600000, // ₹6,000
      targetDate: "15 Jan 2027",
      currentSavingsPaise: 300000, // ₹3,000
      linkedHoldingIds: ["holding-rd-1"],
    },
  ],
  holdings: [
    {
      id: "holding-savings-buffer",
      instrumentId: "piggy-bank-savings",
      name: "Smart Student Savings Account",
      type: "deposit",
      kind: "savings",
      currentValuePaise: 500000, // ₹5,000
      principalPaise: 500000,
      openedAt: "01 Sep 2026",
      asOf: "11 Oct 2026",
      liquidityCategory: "available-now",
      liquidityNote: "Available on demand under this scenario's model with no lock-in period.",
      ratePercent: 3.5,
      linkedGoalId: "goal-laptop",
      linkedGoalLabel: "School Laptop & Coding Setup",
      educationalNote: "Allocated to accessible savings to serve as a liquid emergency reserve in this scenario.",
    },
    {
      id: "holding-fd-1",
      instrumentId: "fixed-deposit-1yr",
      name: "12-Month Educational Fixed Deposit",
      type: "deposit",
      kind: "fixed-deposit",
      currentValuePaise: 700000, // ₹7,000
      principalPaise: 700000,
      tenureMonths: 12,
      ratePercent: 6.8,
      openedAt: "15 Jul 2026",
      asOf: "11 Oct 2026",
      liquidityCategory: "conditional",
      liquidityNote: "12-month tenure. Early closure triggers an interest penalty under this scenario's rules.",
      linkedGoalId: "goal-laptop",
      linkedGoalLabel: "School Laptop & Coding Setup",
      educationalNote: "Offers a fixed interest rate for the duration of the agreed tenure.",
    },
    {
      id: "holding-rd-1",
      instrumentId: "recurring-deposit-6mo",
      name: "Monthly Commute Recurring Deposit",
      type: "deposit",
      kind: "recurring-deposit",
      currentValuePaise: 300000, // ₹3,000 saved so far (₹1,000/month)
      principalPaise: 300000,
      tenureMonths: 6,
      ratePercent: 6.2,
      openedAt: "01 Aug 2026",
      asOf: "11 Oct 2026",
      liquidityCategory: "conditional",
      liquidityNote: "Monthly commitment. Early exit forfeits interest bonus under this scenario's rules.",
      linkedGoalId: "goal-bicycle",
      linkedGoalLabel: "Commute Bicycle",
      educationalNote: "Builds savings through scheduled monthly contributions.",
    },
    {
      id: "holding-index-fund-1",
      instrumentId: "virtual-nifty50-index",
      name: "Virtual Broad-Market Index Fund",
      type: "market",
      kind: "index-fund",
      symbol: "NIFTY50-VIRTUAL",
      units: 40,
      currentValuePaise: 800000, // ₹8,000 (40 units @ ₹200.00 NAV)
      principalPaise: 750000, // cost basis ₹7,500
      changePaise: 50000, // +₹500 unrealized gain
      openedAt: "10 Aug 2026",
      asOf: "11 Oct 2026",
      liquidityCategory: "long-term",
      liquidityNote: "Redeemable in 1-2 business days. Market-linked value can rise or fall, so the amount available when you sell may differ from the amount invested.",
      educationalNote: "Mirrors a virtual basket of 50 large companies rather than an individual stock.",
    },
  ],
};
