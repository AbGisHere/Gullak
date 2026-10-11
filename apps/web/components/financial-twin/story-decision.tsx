"use client";

import type { PracticeSimulationProps } from "@gullak/ui/components/practice-simulation";
import { ArrowRight, Check } from "lucide-react";

export interface StoryDecisionProps extends Pick<PracticeSimulationProps, "episode" | "state" | "onDecision"> {
  heading: string;
  selectedDecisionId?: string;
}

/** Emits the existing simulation payload; the host resolves every consequence. */
export function StoryDecision({ episode, state, onDecision, heading, selectedDecisionId }: StoryDecisionProps) {
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="mb-4 text-2xl font-bold">{heading}</legend>
      {state.availableDecisions?.map((option) => {
        const selected = selectedDecisionId === option.id;
        return (
          <div key={option.id} className="min-w-0">
            <button
              type="button"
              disabled={option.disabled || !state.currentEvent || !onDecision}
              aria-pressed={selected}
              aria-describedby={option.disabledReason ? `${option.id}-reason` : undefined}
              onClick={() => {
                if (!state.currentEvent) return;
                onDecision?.({
                  episodeId: episode.episodeId,
                  eventId: state.currentEvent.id,
                  decisionId: option.id,
                });
              }}
              className={`flex min-h-14 w-full items-start gap-4 rounded-xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-foreground bg-brand-lime text-brand-ink"
                  : "border-border bg-card text-card-foreground hover:border-foreground"
              }`}
              data-testid={`twin-decision-${option.id}`}
            >
              <span className="min-w-0 flex-1 space-y-2">
                <span className="block break-words text-lg font-bold">{option.label}</span>
                <span className="block break-words text-base leading-relaxed">{option.description}</span>
                {option.financialDetail && (
                  <span className="block break-words text-base leading-relaxed">{option.financialDetail}</span>
                )}
              </span>
              {selected ? (
                <Check className="mt-1 size-5 shrink-0" aria-hidden="true" />
              ) : (
                <ArrowRight className="mt-1 size-5 shrink-0" aria-hidden="true" />
              )}
            </button>
            {option.disabledReason && (
              <p id={`${option.id}-reason`} className="mt-2 text-base text-muted-foreground">
                {option.disabledReason}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
