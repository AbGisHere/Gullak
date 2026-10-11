import type { FinancialRewindProps } from "@gullak/ui/components/financial-rewind";
import type { ResolvedOutcome, SimulationDecisionOption } from "@gullak/ui/components/practice-simulation";

/**
 * Assemble supplied outcomes for any chosen decision, without calculating money.
 * Pair-specific metrics are retained only when authored for the selected path.
 */
export function rewindPaths(
  selectedDecisionId: string,
  decisions: readonly SimulationDecisionOption[],
  outcomes: Readonly<Record<string, ResolvedOutcome>>,
): Pick<FinancialRewindProps, "chosenPath" | "alternatives"> | null {
  const selected = decisions.find((decision) => decision.id === selectedDecisionId);
  const outcome = outcomes[selectedDecisionId];
  if (!selected || !outcome || outcome.decisionId !== selected.id) return null;

  return {
    chosenPath: {
      decisionId: selected.id,
      decisionLabel: selected.label,
      narrativeConsequence: outcome.narrativeConsequence,
      stateDelta: outcome.stateDelta,
      tradeoff: outcome.tradeoff,
      whatWasUnknown: outcome.whatWasUnknown,
      characterReaction: outcome.characterReaction,
    },
    alternatives: decisions.flatMap((decision) => {
      if (decision.id === selected.id) return [];
      const authoredAlternative = outcome.alternativeOutcomes?.find(
        (alternative) => alternative.decisionId === decision.id,
      );
      if (authoredAlternative) return [authoredAlternative];
      const alternative = outcomes[decision.id];
      if (!alternative || alternative.decisionId !== decision.id) return [];
      return [
        {
          decisionId: decision.id,
          decisionLabel: decision.label,
          resultingSummary: alternative.narrativeConsequence,
          stateDelta: alternative.stateDelta,
          tradeoff: alternative.tradeoff,
          whatWasUnknown: alternative.whatWasUnknown,
          characterReaction: alternative.characterReaction,
        },
      ];
    }),
  };
}
