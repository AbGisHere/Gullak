/**
 * Localized Interface Copy definitions for @gullak/ui.
 *
 * Architecture:
 * - Packages/ui remains framework-neutral and next-intl agnostic.
 * - All components accept an optional `labels?: Partial<...Labels>` prop.
 * - English fallback defaults are centralized here so components remain immediately
 *   usable without boilerplate, while allowing parents/apps/next-intl to inject
 *   Hindi, Telugu, or custom translations easily.
 * - Learning content (definitions, examples, story dialogue) remains purely in data props.
 */

/* -------------------------------------------------------------------------- */
/*                                MoneyDecoder                                */
/* -------------------------------------------------------------------------- */

export interface MoneyDecoderLabels {
  badgeTitle: string;
  closeAria: string;
  triggerAriaPrefix: string;
  plainMeaning: string;
  whyItMatters: string;
  whereYouSeeIt: string;
  realLifeExample: string;
  watchOut: string;
  gotIt: string;
}

export const defaultMoneyDecoderLabels: MoneyDecoderLabels = {
  badgeTitle: "Money Decoder",
  closeAria: "Close decoder",
  triggerAriaPrefix: "Decode term:",
  plainMeaning: "Plain Meaning",
  whyItMatters: "Why It Matters Here",
  whereYouSeeIt: "Where You'll Encounter This",
  realLifeExample: "Real-life Example",
  watchOut: "Watch Out / Common Myth",
  gotIt: "Got it",
};

/* -------------------------------------------------------------------------- */
/*                                StoryChoices                                */
/* -------------------------------------------------------------------------- */

export interface StoryChoicesLabels {
  storyChoiceBadge: string;
  stepPrefix: string;
  speakerYou: string;
  speakerScene: string;
  keyTerms: string;
  whatWillYouDo: string;
  whatChanged: string;
  whyThisMatters: string;
  whatToCheckNext: string;
  tryAnotherPath: string;
  nextScene: string;
  finishScenario: string;
  scenarioCompleted: string;
  summaryObservation: string;
  replayStory: string;
}

export const defaultStoryChoicesLabels: StoryChoicesLabels = {
  storyChoiceBadge: "Story Choice",
  stepPrefix: "Step",
  speakerYou: "You",
  speakerScene: "Scene",
  keyTerms: "Key Terms:",
  whatWillYouDo: "What will you do?",
  whatChanged: "What this choice changed",
  whyThisMatters: "Why this matters",
  whatToCheckNext: "What to check next",
  tryAnotherPath: "Try Another Path",
  nextScene: "Next Scene",
  finishScenario: "Finish Scenario",
  scenarioCompleted: "Scenario Completed",
  summaryObservation: "Summary Observation",
  replayStory: "Replay Story",
};

/* -------------------------------------------------------------------------- */
/*                                 SpotAndSort                                */
/* -------------------------------------------------------------------------- */

export interface SpotAndSortLabels {
  spotAndSortBadge: string;
  progressOf: string;
  terms: string;
  chooseCategory: string;
  categoryMatched: string;
  alternativeCategory: string;
  whyThisFits: string;
  whatToNotice: string;
  cluePrefix: string;
  tryAnother: string;
  nextItem: string;
  completeRound: string;
  roundComplete: string;
  replayRound: string;
  summaryPattern: (matched: number, total: number) => string;
}

export const defaultSpotAndSortLabels: SpotAndSortLabels = {
  spotAndSortBadge: "Spot & Sort",
  progressOf: "of",
  terms: "Terms:",
  chooseCategory: "Choose Category",
  categoryMatched: "Category Matched",
  alternativeCategory: "Alternative Category",
  whyThisFits: "Why this fits",
  whatToNotice: "What to notice",
  cluePrefix: "Try this clue next time:",
  tryAnother: "Try Another",
  nextItem: "Next Item",
  completeRound: "Complete Round",
  roundComplete: "Round Complete",
  replayRound: "Replay Round",
  summaryPattern: (matched, total) =>
    `Classified ${matched} of ${total} items matching target criteria on initial attempt.`,
};

/* -------------------------------------------------------------------------- */
/*                                 TopicLesson                                */
/* -------------------------------------------------------------------------- */

export interface TopicLessonLabels {
  pillars: {
    "plan-budget": string;
    "save-manage": string;
    "understand-investing": string;
    "stay-safe": string;
  };
  sectionLabels?: {
    start: string;
    experience: string;
    notice: string;
    decode: string;
    understand: string;
    workedExample: string;
    practiceSort: string;
    decide: string;
    reflect: string;
    transfer: string;
    recap: string;
  };
  stepOf: (current: number, total: number) => string;
  theHook: string;
  whatYoullExplore: string;
  estimatedTime: (minutes: number) => string;
  theDilemma: string;
  noticePattern: string;
  guidingQuestion: string;
  keyTakeawayPrefix: string;
  keyRelationships: string;
  whatThisDemonstratesPrefix: string;
  reflectOnTradeoff: string;
  perspectivePrefix: string;
  newContext: string;
  transferPrinciplePrefix: string;
  summaryPrinciples: string;
  nextRecommendedActivityPrefix: string;
  lessonCompleted: string;
  completedSummary: (stepsCount: number) => string;
  pillarLabelPrefix: string;
  targetPrefix: string;
  replayLesson: string;
  previous: string;
  continueAction: string;
  finishLesson: string;
  stepNotFound: string;
}

export const defaultTopicLessonLabels: TopicLessonLabels = {
  pillars: {
    "plan-budget": "Plan & Budget",
    "save-manage": "Save & Manage",
    "understand-investing": "Understand Investing",
    "stay-safe": "Stay Financially Safe",
  },
  sectionLabels: {
    start: "Start",
    experience: "Experience",
    notice: "Notice",
    decode: "Decode",
    understand: "Understand",
    workedExample: "Worked Example",
    practiceSort: "Practice Sort",
    decide: "Decide",
    reflect: "Reflect",
    transfer: "Transfer",
    recap: "Recap",
  },
  stepOf: (current, total) => `${current} of ${total}`,
  theHook: "The Hook",
  whatYoullExplore: "What You'll Explore",
  estimatedTime: (minutes) => `Estimated time: ~${minutes} minutes`,
  theDilemma: "The Dilemma",
  noticePattern: "Notice the Pattern",
  guidingQuestion: "Guiding Question",
  keyTakeawayPrefix: "Key Takeaway: ",
  keyRelationships: "Key Relationships",
  whatThisDemonstratesPrefix: "What This Demonstrates: ",
  reflectOnTradeoff: "Reflect On The Trade-off",
  perspectivePrefix: "Perspective: ",
  newContext: "New Context",
  transferPrinciplePrefix: "Transfer Principle: ",
  summaryPrinciples: "Summary Principles",
  nextRecommendedActivityPrefix: "Next Recommended Activity: ",
  lessonCompleted: "Lesson Complete",
  completedSummary: (stepsCount) =>
    `You completed all ${stepsCount} learning steps across authentic financial vocabulary and decision trade-offs.`,
  pillarLabelPrefix: "Pillar: ",
  targetPrefix: "Target: ",
  replayLesson: "Replay Lesson",
  previous: "Previous",
  continueAction: "Continue",
  finishLesson: "Finish Lesson",
  stepNotFound: "Error: Step not found in lesson.",
};

/* -------------------------------------------------------------------------- */
/*                               PaperPortfolio                               */
/* -------------------------------------------------------------------------- */

export interface PaperPortfolioLabels {
  paperPortfolioTitle: string;
  playMoneyBadge: string;
  asOfPrefix: string;
  totalVirtualPortfolioValue: string;
  availableCash: string;
  emergencyBuffer: string;
  linkedToGoals: string;
  lockedConditional: string;
  liquidityAndAccess: string;
  liquidityFastSubtitle: string;
  availableNow: string;
  conditionalAccess: string;
  longerTermMarket: string;
  emergencyReserveStatus: string;
  emergencyReserveSubtitle: string;
  currentBuffer: string;
  ofTargetSuffix: string;
  yourHoldings: (count: number) => string;
  filterAll: string;
  filterDeposits: string;
  filterMarket: string;
  currentValue: string;
  interestRate: string;
  units: string;
  partOfGoalPrefix: string;
  valuedAsOfPrefix: string;
  whyHeldBtn: string;
  financialGoals: (count: number) => string;
  purposeDrivenSaving: string;
  targetDatePrefix: string;
  targetPrefix: string;
  assetDiversification: string;
  portfolioBalance: string;
  diversificationDefaultNote: string;
  liquidCash: string;
  closeDetailsAria: string;
  currentVirtualValue: string;
  liquidityRole: string;
  whyAssetHeld: string;
  defaultEducationalNote: string;
  accessEarlyWithdrawalConditions: string;
  relevantFinancialTerms: string;
  done: string;
  tabOverview: string;
  tabHoldings: (count: number) => string;
  tabLiquidity: string;
  tabGoals: (count: number) => string;
  portfolioSectionsAria: string;
  liquidityDistributionAria: (pctNow: number, pctCond: number, pctLong: number) => string;
}

export const defaultPaperPortfolioLabels: PaperPortfolioLabels = {
  paperPortfolioTitle: "Paper Portfolio",
  playMoneyBadge: "Play Money",
  asOfPrefix: "As of ",
  totalVirtualPortfolioValue: "Total Virtual Portfolio Value",
  availableCash: "Available Cash",
  emergencyBuffer: "Emergency Buffer",
  linkedToGoals: "Linked to Goals",
  lockedConditional: "Locked / Conditional",
  liquidityAndAccess: "Liquidity & Access",
  liquidityFastSubtitle: "How fast you can access your money",
  availableNow: "Available Now",
  conditionalAccess: "Conditional Access",
  longerTermMarket: "Longer-Term / Market",
  emergencyReserveStatus: "Emergency Reserve Status",
  emergencyReserveSubtitle: "Accessible reserves kept available to absorb unexpected expenses.",
  currentBuffer: "Current Buffer",
  ofTargetSuffix: "target",
  yourHoldings: (count) => `Virtual Holdings (${count})`,
  filterAll: "All",
  filterDeposits: "Deposits",
  filterMarket: "Market",
  currentValue: "Current Value",
  interestRate: "Interest Rate",
  units: "units",
  partOfGoalPrefix: "Part of goal: ",
  valuedAsOfPrefix: "Valued as of ",
  whyHeldBtn: "Why this is held",
  financialGoals: (count) => `Financial Goals (${count})`,
  purposeDrivenSaving: "Purpose-driven saving",
  targetDatePrefix: "Target Date: ",
  targetPrefix: "Target: ",
  assetDiversification: "Asset Diversification",
  portfolioBalance: "Portfolio balance",
  diversificationDefaultNote:
    "Spreading money across multiple asset categories divides exposure across different return and risk characteristics.",
  liquidCash: "Liquid Cash",
  closeDetailsAria: "Close details",
  currentVirtualValue: "Current Virtual Value",
  liquidityRole: "Liquidity Role",
  whyAssetHeld: "Why this asset is held",
  defaultEducationalNote: "Asset held within the virtual portfolio according to this scenario's learning plan.",
  accessEarlyWithdrawalConditions: "Access & Early Withdrawal Conditions",
  relevantFinancialTerms: "Relevant Financial Terms",
  done: "Done",
  tabOverview: "Overview",
  tabHoldings: (count) => `Holdings (${count})`,
  tabLiquidity: "Liquidity & Buffer",
  tabGoals: (count) => `Goals (${count})`,
  instrumentKinds: {
    savings: "Savings Account",
    "fixed-deposit": "Fixed Deposit (FD)",
    "recurring-deposit": "Recurring Deposit (RD)",
    gold: "Sovereign Gold / Digital Gold",
    "mutual-fund": "Mutual Fund",
    "index-fund": "Index Fund",
    stock: "Equity Share",
  },
  monthsOfSuppliedExpenses: (months) =>
    `At the assumptions used in this scenario, this reserve represents about ${months} months of the supplied monthly expense amount.`,
  portfolioSectionsAria: "Portfolio sections",
  liquidityDistributionAria: (pctNow, pctCond, pctLong) =>
    `Liquidity distribution: ${pctNow}% available now, ${pctCond}% conditional access, ${pctLong}% longer-term market`,
};

/* -------------------------------------------------------------------------- */
/*                             PracticeSimulation                             */
/* -------------------------------------------------------------------------- */

export interface PracticeSimulationLabels {
  practiceEpisode: string;
  playMoney: string;
  beginScenario: string;
  whatYouWillExplore: string;
  amountNeeded: string;
  whatAreMyOptions: string;
  defaultProtagonistPrompt: string;
  processingDecision: string;
  calculatingOutcome: string;
  whatChanged: string;
  whyItMatters: string;
  whatTradeoff: string;
  whatWasUnknown: string;
  exploreAlternatives: string;
  exploreAlternativesSubtitle: string;
  rewindAndCompare: string;
  episodeComplete: string;
  episodeCompleteSubtitle: string;
  episodeCompleteNote: string;
  finishEpisode: string;
  continueAction: string;
  seeTradeoffsAction: string;
  confirmDecisionAction: string;
  selectOptionToProceed: string;
  portfolioAfterOutcome: string;
  yourReflection: string;
  selectReflectionOption: string;
  whatHelpedTradeoff: string;
  protagonistLabel: string;
  supportingCharacterLabel: string;
}

export const defaultPracticeSimulationLabels: PracticeSimulationLabels = {
  practiceEpisode: "Practice Episode",
  playMoney: "Play Money",
  beginScenario: "Begin Scenario",
  whatYouWillExplore: "What you will explore",
  amountNeeded: "Amount needed:",
  whatAreMyOptions: "What are my options?",
  defaultProtagonistPrompt: "How should I handle this expense right now?",
  processingDecision: "Processing your decision…",
  calculatingOutcome: "Calculating what happens next in this scenario.",
  whatChanged: "What Changed",
  whyItMatters: "Why It Matters",
  whatTradeoff: "What Trade-off Did You Make?",
  whatWasUnknown: "What Was Unknown?",
  exploreAlternatives: "Explore Alternative Paths",
  exploreAlternativesSubtitle: "Rewind this moment to compare what trade-offs other options would have created.",
  rewindAndCompare: "Rewind & Compare",
  episodeComplete: "Episode Complete",
  episodeCompleteSubtitle: "You explored a fictional scenario and made a real financial decision under uncertainty.",
  episodeCompleteNote:
    "Nobody knew what would happen next — including professional fund managers. The important question was how much flexibility your financial setup gave you when the unexpected expense arrived.",
  finishEpisode: "Finish Episode",
  continueAction: "Continue",
  seeTradeoffsAction: "See Trade-offs & Next Steps",
  confirmDecisionAction: "Confirm Decision",
  selectOptionToProceed: "Select an option to proceed",
  portfolioAfterOutcome: "Portfolio After Decision",
  yourReflection: "Your Reflection",
  selectReflectionOption: "Select a reflection to continue",
  whatHelpedTradeoff: "What gave you flexibility during this expense?",
  protagonistLabel: "Protagonist",
  supportingCharacterLabel: "Supporting character",
};

/* -------------------------------------------------------------------------- */
/*                              FinancialRewind                               */
/* -------------------------------------------------------------------------- */

export interface FinancialRewindLabels {
  rewindBadge: string;
  playMoney: string;
  returnToYourPath: string;
  mainHeading: string;
  subtitle: string;
  uncertaintyDefault: string;
  selectAlternativeLabel: string;
  comparingPaths: string;
  pathDetails: string;
  viewSinglePath: string;
  compareWithYourChoice: string;
  yourChoice: string;
  whatHappened: string;
  tradeoffMade: string;
  resultingPortfolio: string;
  alternativePath: string;
  whatWouldHaveHappened: string;
  alternativeTradeoff: string;
  whatWasStillUnknown: string;
  alternativeResultingPortfolio: string;
  dimensionComparisonHeading: string;
  backToDecision: string;
  continueEpisode: string;
  alternative: string;
  alternativePathsAria: string;
  rewindReflectionAria: string;
  protagonistReviewingAlternatives: string;
}

export const defaultFinancialRewindLabels: FinancialRewindLabels = {
  rewindBadge: "Financial Rewind · Alternative Paths",
  playMoney: "Play Money",
  returnToYourPath: "Return to your path",
  mainHeading: "Rewind & Compare Decisions",
  subtitle:
    "Explore what trade-offs would have unfolded under alternative actions. There is no single \"correct\" answer — financial resilience is about having options when life surprises happen.",
  uncertaintyDefault:
    "At the time of this decision, the future was uncertain. Nobody knew what markets or conditions would do next.",
  selectAlternativeLabel: "Select an alternative path to examine:",
  comparingPaths: "Comparing Paths",
  pathDetails: "Path Details",
  viewSinglePath: "View Single Path",
  compareWithYourChoice: "Compare with Your Choice",
  yourChoice: "Your Choice",
  whatHappened: "What Happened",
  tradeoffMade: "Trade-off Made",
  resultingPortfolio: "Resulting Portfolio",
  alternativePath: "Alternative Path",
  whatWouldHaveHappened: "What Would Have Happened",
  alternativeTradeoff: "Alternative Trade-off",
  whatWasStillUnknown: "What Was Still Unknown",
  alternativeResultingPortfolio: "Alternative Resulting Portfolio",
  dimensionComparisonHeading: "Direct Dimension Comparison",
  backToDecision: "Back to Decision",
  continueEpisode: "Continue Episode",
  alternative: "Alternative",
  alternativePathsAria: "Alternative paths",
  rewindReflectionAria: "Rewind reflection options",
  protagonistReviewingAlternatives: "Protagonist reviewing alternatives",
};
