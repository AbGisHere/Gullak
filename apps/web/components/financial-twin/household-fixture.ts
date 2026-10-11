import type { PortfolioViewModel } from "@gullak/ui/components/paper-portfolio";
import type {
  EpisodeMetadata,
  ResolvedOutcome,
  SimulationDecisionOption,
  SimulationState,
} from "@gullak/ui/components/practice-simulation";

export const STORY_STAGES = [
  "arrive",
  "household",
  "money",
  "decision",
  "consequence",
  "rewind",
  "reflection",
] as const;
export const HOUSEHOLD_DECISIONS = ["emergency", "fd", "market"] as const;
export type HouseholdDecision = (typeof HOUSEHOLD_DECISIONS)[number];
export type StoryCopy = (key: string) => string;

/**
 * Presentation fixtures, not an engine forecast. Starting positions come from
 * the shared Financial Twin tab; the 1,500,000 paise bill comes from
 * packages/content/episodes/march-2020-hospital-bill/en.json. Outcomes are
 * qualitative: no invented exit penalty, future price or portfolio valuation.
 */
export function householdFixture(t: StoryCopy) {
  const episode: EpisodeMetadata = {
    episodeId: "nani-hospital-bill",
    title: t("episodeTitle"),
    dateLabel: t("clock"),
    learningGoals: [t("learningGoal")],
  };
  const portfolio: PortfolioViewModel = {
    id: "nani-household",
    isVirtual: true,
    asOf: t("assumptions"),
    cashPaise: 2000000,
    emergencyReserve: { currentReservePaise: 2000000, statusNote: t("reserveNote") },
    holdings: [
      {
        id: "nani-fd",
        instrumentId: "fixed-deposit",
        name: t("fdName"),
        type: "deposit",
        kind: "fixed-deposit",
        currentValuePaise: 5000000,
        openedAt: "",
        asOf: "",
        liquidityCategory: "conditional",
        liquidityNote: t("fdNote"),
      },
      {
        id: "family-investment",
        instrumentId: "fictional-index-fund",
        name: t("marketName"),
        type: "market",
        kind: "index-fund",
        currentValuePaise: 3000000,
        openedAt: "",
        asOf: "",
        liquidityCategory: "long-term",
        liquidityNote: t("marketNote"),
      },
    ],
    goals: [],
  };
  const decisions: SimulationDecisionOption[] = HOUSEHOLD_DECISIONS.map((id) => ({
    id,
    label: t(`choices.${id}.label`),
    description: t(`choices.${id}.description`),
  }));
  const outcomes = Object.fromEntries(
    HOUSEHOLD_DECISIONS.map((id) => [
      id,
      {
        decisionId: id,
        narrativeConsequence: t(`choices.${id}.consequence`),
        stateDelta: t(`choices.${id}.delta`),
        financialConsequenceSummary: t(`choices.${id}.delta`),
        learningExplanation: t(`choices.${id}.learning`),
        tradeoff: t(`choices.${id}.tradeoff`),
        whatWasUnknown: t("uncertainty"),
        characterReaction: {
          variant: "blob",
          pose: "pondering",
          expression: "thinking",
          accent: "lilac",
          dialogue: t(`choices.${id}.reaction`),
        },
      } satisfies ResolvedOutcome,
    ]),
  ) as Record<HouseholdDecision, ResolvedOutcome>;
  const state: SimulationState = {
    phase: "decision",
    currentDateLabel: t("clock"),
    portfolio,
    protagonist: { variant: "blob", pose: "pondering", accent: "lime", label: t("gullu") },
    currentEvent: {
      id: "hospital-bill",
      title: t("billTitle"),
      description: t("billDescription"),
      amountPaise: 1500000,
    },
    availableDecisions: decisions,
    reflection: {
      prompt: t("reflectionPrompt"),
      options: ["reserve", "terms", "uncertainty"].map((id) => ({ id, label: t(`reflections.${id}.label`) })),
    },
  };
  return { episode, state, decisions, outcomes };
}

export function isHouseholdDecision(value: string): value is HouseholdDecision {
  return HOUSEHOLD_DECISIONS.some((id) => id === value);
}
