import type {
  EpisodeMetadata,
  SimulationState,
  ResolvedOutcome,
  SimulationDecisionOption,
} from "../components/practice-simulation";
import type { PortfolioViewModel } from "../components/paper-portfolio";
import type { MoneyTermData } from "../components/money-decoder";

/**
 * Educational term definitions for Practice Simulation fixtures.
 * Strictly educational and isolated in UI fixtures.
 */
export const simulationFixtureTerms: Record<string, MoneyTermData> = {
  Liquidity: {
    term: "Liquidity",
    plainMeaning: "How quickly and easily you can convert an asset into spendable money without losing value.",
    whereYouSeeIt: ["Savings accounts", "Emergency funds", "Cash reserves"],
    example: "Cash in a bank savings account is immediately liquid; money in a 1-year deposit is locked.",
    whyItMattersHere: "Having liquid reserves allows you to pay immediate bills without paying penalties or selling investments at a loss.",
  },
  "Emergency Fund": {
    term: "Emergency Fund",
    plainMeaning: "A dedicated buffer of accessible money saved strictly for unplanned life events.",
    whereYouSeeIt: ["Personal budgeting plans", "High-interest savings accounts"],
    example: "Keeping ₹10,000 set aside in case someone gets sick or an essential appliance breaks.",
    whyItMattersHere: "An emergency fund protects long-term investments and goals from being disrupted by unexpected expenses.",
  },
  Tenure: {
    term: "Tenure",
    plainMeaning: "The agreed length of time an investment stays invested before reaching its maturity date.",
    whereYouSeeIt: ["Fixed Deposits (FD)", "Recurring Deposits (RD)", "Bank loans"],
    example: "A 12-month tenure means the deposit is scheduled to run for a full year.",
    whyItMattersHere: "Committing money for a longer tenure usually earns higher interest, but restricts access during that period.",
  },
  Maturity: {
    term: "Maturity",
    plainMeaning: "The date on which an investment period ends and you receive back the principal and interest.",
    whereYouSeeIt: ["Fixed Deposit receipts", "Bonds", "Government savings schemes"],
    example: "An FD opened on 1 January with a 1-year tenure reaches maturity on 31 December.",
    whyItMattersHere: "Waiting until maturity ensures you receive the full agreed interest rate without early exit deductions.",
  },
  "Premature Withdrawal": {
    term: "Premature Withdrawal",
    plainMeaning: "Taking money out of a term deposit before the agreed tenure is complete.",
    whereYouSeeIt: ["Bank FD terms & conditions", "Deposit penalty notices"],
    example: "Closing an FD after 4 months when the tenure was 12 months.",
    whyItMattersHere: "Banks typically apply an interest penalty deduction when an FD is broken before maturity.",
  },
  Units: {
    term: "Units",
    plainMeaning: "Equal parts of ownership in a pooled investment like an index fund or mutual fund.",
    whereYouSeeIt: ["Index fund account statements", "Mutual fund portfolio overviews"],
    example: "Owning 50 units of a virtual Nifty 50 index fund.",
    whyItMattersHere: "The value of your holding is the number of units multiplied by the current price per unit (NAV).",
  },
  "Market Value": {
    term: "Market Value",
    plainMeaning: "What an investment could currently be sold for based on prevailing market prices right now.",
    whereYouSeeIt: ["Stock exchange quotes", "Mutual fund statements", "Gold prices"],
    example: "If unit prices drop by 25%, the market value of your holding drops even though you still own the exact same number of units.",
    whyItMattersHere: "Market values fluctuate continuously; selling during a downturn locks in that reduced value as an actual loss.",
  },
};

/**
 * Starting portfolio for the March 2020 Medical Bill scenario.
 * Virtual play money only.
 */
export const march2020StartingPortfolio: PortfolioViewModel = {
  id: "sim-march-2020-portfolio",
  learnerId: "demo-student-id",
  isVirtual: true,
  asOf: "15 March 2020",
  cashPaise: 150000, // ₹1,500 unallocated cash
  startingCashPaise: 3000000, // ₹30,000 initial starting capital
  emergencyReserve: {
    currentReservePaise: 800000, // ₹8,000 in liquid emergency reserve
    targetPaise: 1000000, // ₹10,000 target
    monthlyExpensesPaise: 250000, // ₹2,500/month
    monthsCovered: 3.2,
    statusNote: "Provides roughly 3 months of basic expense coverage under scenario assumptions.",
  },
  terms: simulationFixtureTerms,
  liquidityDescriptions: {
    "available-now": "Instantly accessible play funds with no penalty or market waiting.",
    conditional: "Time-locked term deposit with premature exit conditions.",
    "long-term": "Market-linked units whose selling value depends on current market conditions.",
  },
  allocationDescription: "Portfolio is diversified across liquid reserves, guaranteed term deposits, and market index units.",
  goals: [
    {
      id: "goal-laptop",
      label: "Higher Secondary Coding Laptop",
      targetPaise: 2000000, // ₹20,000
      targetDate: "31 Dec 2021",
      currentSavingsPaise: 1500000, // ₹15,000
      linkedHoldingIds: ["holding-fd-1"],
    },
  ],
  holdings: [
    {
      id: "holding-emergency-reserve",
      instrumentId: "inst-savings-reserve",
      name: "Emergency Reserve Savings",
      type: "deposit",
      kind: "savings",
      currentValuePaise: 800000, // ₹8,000
      openedAt: "01 Jan 2020",
      asOf: "15 Mar 2020",
      liquidityCategory: "available-now",
      liquidityNote: "Funds can be accessed immediately with zero fee or loss.",
      ratePercent: 4.0,
      educationalNote: "Kept in an accessible bank savings account specifically for unexpected needs.",
    },
    {
      id: "holding-fd-1",
      instrumentId: "inst-fd-12m",
      name: "1-Year Fixed Deposit (Laptop Goal)",
      type: "deposit",
      kind: "fixed-deposit",
      currentValuePaise: 1200000, // ₹12,000
      principalPaise: 1200000,
      openedAt: "10 Jan 2020",
      asOf: "15 Mar 2020",
      tenureMonths: 12,
      ratePercent: 6.5,
      liquidityCategory: "conditional",
      liquidityNote: "Tenure ends in Jan 2021. Early withdrawal triggers a 1% interest rate penalty under bank rules.",
      linkedGoalId: "goal-laptop",
      linkedGoalLabel: "Higher Secondary Coding Laptop",
      educationalNote: "Locked for safety to fund the upcoming laptop goal.",
    },
    {
      id: "holding-nifty-index",
      instrumentId: "inst-index-nifty50",
      name: "Virtual Nifty 50 Index Fund",
      type: "market",
      kind: "index-fund",
      units: 80,
      currentValuePaise: 800000, // ₹8,000 (down from ₹11,000 cost basis due to March 2020 market drop)
      principalPaise: 1100000,
      openedAt: "15 Dec 2019",
      asOf: "15 Mar 2020",
      changePaise: -300000, // -₹3,000 (-27.3%)
      liquidityCategory: "long-term",
      liquidityNote: "Can be sold in 2-3 business days, but currently experiencing a steep market-wide decline.",
      educationalNote: "Tracks the 50 largest companies in India. Subject to broader economic shocks.",
    },
  ],
};

/**
 * Episode Metadata for the Flagship Practice Scenario.
 */
export const march2020EpisodeMetadata: EpisodeMetadata = {
  episodeId: "practice-ep-march-2020",
  title: "The March Shock: When Plans Meet Reality",
  subtitle: "Navigate an unexpected family emergency during an unpredictable market downturn.",
  dateLabel: "March 2020",
  gradeGroup: "grade-8-10",
  learningGoals: [
    "Experience why accessible liquidity matters during unpredictable events.",
    "Evaluate the trade-offs between using reserves, breaking term deposits, and selling market assets.",
    "Recognize that nobody knew the future at the time of the decision.",
  ],
};

/**
 * Available decisions for the medical bill event.
 */
export const march2020Decisions: SimulationDecisionOption[] = [
  {
    id: "decision-emergency-reserve",
    label: "Use Emergency Reserve",
    description: "Pay the ₹7,000 medical bill directly from the ₹8,000 accessible emergency savings buffer.",
    financialDetail: "Reserve drops from ₹8,000 to ₹1,000. No penalty; long-term investments remain intact.",
    consequencePreview: "Preserves the FD interest rate and avoids selling market units during the downturn.",
    requiredTermIds: ["Emergency Fund", "Liquidity"],
  },
  {
    id: "decision-break-fd",
    label: "Break Fixed Deposit Early",
    description: "Withdraw funds prematurely from the 1-year FD committed to the laptop goal.",
    financialDetail: "Breaks the ₹12,000 FD. Pays ₹7,000 medical bill, remaining ₹5,000 moves to cash. Incurs early exit penalty.",
    consequencePreview: "Incurs premature withdrawal penalty and interrupts progress toward the laptop goal.",
    requiredTermIds: ["Fixed Deposit", "Premature Withdrawal", "Tenure"],
  },
  {
    id: "decision-sell-market",
    label: "Sell Virtual Index Fund Units",
    description: "Sell ₹7,000 worth of virtual Nifty 50 units at today's dropped market prices.",
    financialDetail: "Sells 70 of 80 units at depressed prices. Locks in the temporary market decline as a realized loss.",
    consequencePreview: "Turns a temporary drop into an actual loss. The market's future direction was unknown.",
    requiredTermIds: ["Units", "Market Value"],
  },
];

/**
 * Precomputed outcome examples for UI development.
 * These are demonstration fixtures only. The production engine computes real outcomes.
 */
export const precomputedMarch2020Outcomes: Record<string, ResolvedOutcome> = {
  "decision-emergency-reserve": {
    decisionId: "decision-emergency-reserve",
    stateDelta: "Emergency reserve: ₹8,000 → ₹1,000 (-₹7,000). Fixed Deposit and Index Fund untouched.",
    narrativeConsequence: "You paid the hospital bill immediately without stress. Your laptop FD and index fund units remained completely undisturbed.",
    financialConsequenceSummary: "Your liquid buffer absorbed the shock exactly as designed. Your long-term investments did not need to be liquidated.",
    learningExplanation: "This is why an emergency reserve exists. Even though your reserve is now low and will need rebuilding, you avoided premature exit penalties and avoided selling market assets during a slump.",
    tradeoff: "Your emergency buffer is now down to ₹1,000, leaving you temporarily vulnerable until you replenish it.",
    whatWasUnknown: "In March 2020, nobody knew how long the market slump or economic shutdown would last. Having cash in hand meant not needing to guess.",
    characterReaction: {
      variant: "blob",
      pose: "explaining",
      expression: "thinking",
      accent: "lime",
      dialogue: "That was close! Having that reserve ready saved us from having to touch my laptop savings or sell our index fund at a loss.",
    },
    alternativeOutcomes: [
      {
        id: "alt-break-fd",
        decisionId: "decision-break-fd",
        decisionLabel: "Break Fixed Deposit Early",
        summary: "Would have closed the ₹12,000 FD prematurely with a 1% penalty deduction. Paid hospital bill and left ₹5,000 in cash.",
        resultingSummary: "Would have closed the ₹12,000 FD prematurely with a 1% penalty deduction. Paid hospital bill and left ₹5,000 in cash.",
        stateDelta: "FD closed prematurely. ₹5,000 moved to cash. Emergency reserve kept at ₹8,000.",
        tradeoff: "Protected the emergency buffer, but sacrificed earned interest and halted progress on the laptop goal.",
        tradeoffComparison: "Protected emergency buffer, but sacrificed earned interest and halted progress on the laptop goal.",
        whatWasUnknown: "Whether another emergency would happen before the deposit would have reached maturity.",
        characterReaction: {
          variant: "blob",
          pose: "cautious",
          expression: "concerned",
          accent: "coral",
          dialogue: "Our emergency reserve would still be full, but breaking the FD meant losing interest and starting over on my laptop.",
        },
        portfolioAfter: {
          ...march2020StartingPortfolio,
          cashPaise: 650000, // ₹1,500 + ₹5,000 remainder from FD
          holdings: march2020StartingPortfolio.holdings.filter((h) => h.kind !== "fixed-deposit"),
          goals: [
            {
              id: "goal-laptop",
              label: "Higher Secondary Coding Laptop",
              targetPaise: 2000000,
              targetDate: "31 Dec 2021",
              currentSavingsPaise: 0, // Reset because FD was liquidated
              linkedHoldingIds: [],
            },
          ],
        },
        comparisonMetrics: [
          {
            id: "metric-reserve",
            label: "Emergency Reserve Buffer",
            chosenValue: "₹1,000 (partially depleted)",
            alternativeValue: "₹8,000 (fully intact)",
            note: "The alternative keeps the cash safety net, but breaks an investment.",
          },
          {
            id: "metric-fd",
            label: "Fixed Deposit Status",
            chosenValue: "Intact at 6.5% interest",
            alternativeValue: "Broken early with 1% interest penalty",
            note: "Early exit penalty deducted by bank on premature withdrawal.",
          },
          {
            id: "metric-goal",
            label: "Laptop Goal Progress",
            chosenValue: "₹15,000 saved (on track)",
            alternativeValue: "₹0 saved (plan disrupted)",
            note: "Using the reserve protected the dedicated goal asset.",
          },
          {
            id: "metric-market",
            label: "Virtual Index Units",
            chosenValue: "80 units preserved",
            alternativeValue: "80 units preserved",
            note: "Neither path forced selling market units during the downturn.",
          },
        ],
        termData: [
          simulationFixtureTerms["Premature Withdrawal"]!,
          simulationFixtureTerms["Tenure"]!,
          simulationFixtureTerms["Maturity"]!,
        ],
      },
      {
        id: "alt-sell-market",
        decisionId: "decision-sell-market",
        decisionLabel: "Sell Virtual Index Fund Units",
        summary: "Would have sold 70 units while the market was down 27%, raising ₹7,000 but locking in a steep paper loss.",
        resultingSummary: "Would have sold 70 units while the market was down 27%, raising ₹7,000 but locking in a steep paper loss.",
        stateDelta: "Sold 70 index units at slump price. Emergency reserve untouched at ₹8,000. FD untouched.",
        tradeoff: "Preserved emergency buffer and FD, but permanently crystallized a temporary market drop as an actual loss.",
        tradeoffComparison: "Preserved emergency buffer and FD, but permanently crystallized a temporary market drop as an actual loss.",
        whatWasUnknown: "At the moment of selling, nobody knew whether the market would rebound or decline further.",
        characterReaction: {
          variant: "blob",
          pose: "pondering",
          expression: "thinking",
          accent: "lilac",
          dialogue: "We would have protected cash and the FD, but selling index units after a 27% drop would have permanently locked in the loss.",
        },
        portfolioAfter: {
          ...march2020StartingPortfolio,
          holdings: march2020StartingPortfolio.holdings.map((h) =>
            h.kind === "index-fund"
              ? {
                  ...h,
                  units: 10,
                  currentValuePaise: 100000, // ₹1,000 remaining
                }
              : h
          ),
        },
        comparisonMetrics: [
          {
            id: "metric-reserve",
            label: "Emergency Reserve Buffer",
            chosenValue: "₹1,000 (spent for emergency)",
            alternativeValue: "₹8,000 (untouched)",
            note: "Selling investments avoided depleting the bank reserve.",
          },
          {
            id: "metric-market",
            label: "Virtual Index Units",
            chosenValue: "80 units (no realized loss)",
            alternativeValue: "10 units (70 units sold at bottom)",
            note: "Selling during a market drop turns paper loss into realized loss.",
          },
          {
            id: "metric-uncertainty",
            label: "Market Uncertainty At Decision",
            chosenValue: "Future direction unknown",
            alternativeValue: "Future direction unknown",
            note: "In March 2020, professional fund managers had no certainty about recovery timelines.",
          },
        ],
        termData: [
          simulationFixtureTerms["Units"]!,
          simulationFixtureTerms["Market Value"]!,
          simulationFixtureTerms["Liquidity"]!,
        ],
      },
    ],
  },
  "decision-break-fd": {
    decisionId: "decision-break-fd",
    stateDelta: "Fixed deposit broken: ₹12,000 closed early with 1% interest deduction. Hospital bill paid.",
    narrativeConsequence: "The bill was paid, but your bank deducted a premature exit penalty and your laptop savings plan was halted.",
    financialConsequenceSummary: "Lost earned interest due to early withdrawal penalty. Progress on the laptop goal will need to restart.",
    learningExplanation: "Fixed deposits give predictable interest because you promise not to touch the money for the tenure. When you break that promise, banks reduce the interest paid.",
    tradeoff: "Protected the emergency buffer, but sacrificed interest and delayed the coding laptop purchase.",
    whatWasUnknown: "At that time, future interest rates and market directions were uncertain.",
    characterReaction: {
      variant: "blob",
      pose: "cautious",
      expression: "concerned",
      accent: "coral",
      dialogue: "The bill is paid, but it hurts to see the penalty deduction and know my laptop goal is delayed.",
    },
  },
  "decision-sell-market": {
    decisionId: "decision-sell-market",
    stateDelta: "Sold 70 units at depressed prices. Locked in -27% market drop as a realized loss.",
    narrativeConsequence: "You paid the medical bill by selling index fund units while their market price was sharply down.",
    financialConsequenceSummary: "Locked in a 27% drop that was previously only on paper. Lost potential recovery on those sold units.",
    learningExplanation: "When market prices fall, you only lose money if you are forced to sell. Selling during a market shock converts a paper decline into a permanent loss.",
    tradeoff: "Preserved cash and FD, but permanently sold market assets at their lowest price point in the scenario.",
    whatWasUnknown: "At that moment, nobody knew whether the market would fall another 20% or rebound. Selling eliminated the risk of further drops, but also eliminated any recovery.",
    characterReaction: {
      variant: "blob",
      pose: "pondering",
      expression: "concerned",
      accent: "lilac",
      dialogue: "We got the cash, but selling while prices were down locked in a big loss. In March 2020, we had no idea what tomorrow looked like.",
    },
  },
};

/**
 * Initial Simulation State for the development fixture.
 */
export const initialPracticeSimulationState: SimulationState = {
  phase: "briefing",
  currentDateLabel: "15 March 2020",
  portfolio: march2020StartingPortfolio,
  protagonist: {
    variant: "blob",
    pose: "explaining",
    expression: "friendly",
    accent: "lime",
    label: "Aarav",
    dialogue: "It's March 2020. You've saved steadily, started a laptop FD, and put some money into index funds. But unexpected events are about to test our plan.",
  },
  marketContext: {
    label: "Nifty 50 Market Indicator",
    description: "Sharp global volatility. Markets have dropped sharply over recent weeks.",
    changeLabel: "-27.3% this month",
  },
  currentEvent: {
    id: "event-hospital-bill",
    title: "Urgent Family Medical Emergency",
    description: "Your cousin was admitted to the hospital with a sudden viral infection. The hospital requires an immediate deposit of ₹7,000 for tests and medication.",
    urgencyLabel: "Due Today",
    amountPaise: 700000, // ₹7,000
    supportingCharacter: {
      variant: "arch",
      pose: "cautious",
      expression: "concerned",
      accent: "coral",
      label: "Uncle Ramesh",
      dialogue: "Aarav, the clinic needs ₹7,000 right now before they can start the treatment. Do we have funds available?",
    },
  },
  availableDecisions: march2020Decisions,
  reflection: {
    prompt: "What made this decision most challenging under uncertainty?",
    options: [
      {
        id: "ref-urgency",
        label: "The hospital bill had to be paid immediately — there was no time to wait.",
      },
      {
        id: "ref-market-drop",
        label: "Market prices had fallen steeply, making selling units feel like locked-in loss.",
      },
      {
        id: "ref-locked-deposit",
        label: "Breaking the FD meant losing interest and disrupting my laptop goal.",
      },
      {
        id: "ref-reserve-depletion",
        label: "Using the emergency reserve left me with very little buffer for the next surprise.",
      },
    ],
  },
  terms: simulationFixtureTerms,
};
