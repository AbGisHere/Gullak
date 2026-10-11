"use client";

import { Character } from "@gullak/ui/components/character";
import { FinancialRewind } from "@gullak/ui/components/financial-rewind";
import { PracticeSimulation, type SimulationState } from "@gullak/ui/components/practice-simulation";
import { SpotAndSort } from "@gullak/ui/components/spot-and-sort";
import { TopicLesson } from "@gullak/ui/components/topic-lesson";
import { exampleEmergencyFundLesson } from "@gullak/ui/fixtures/lesson-fixtures";
import {
  initialPracticeSimulationState,
  march2020EpisodeMetadata,
  precomputedMarch2020Outcomes,
} from "@gullak/ui/fixtures/simulation-fixtures";
import { exampleNeedVsWantActivity } from "@gullak/ui/fixtures/spot-and-sort-fixtures";
import { ArrowLeft, CheckCircle2, Sparkles, X } from "lucide-react";
import { useState } from "react";

export type ActivityType = "lesson" | "spot-and-sort" | "simulation" | "rewind";

interface ActivityModalProps {
  activityType: ActivityType;
  onClose: () => void;
  onActivitySuccess?: () => void;
}

export function ActivityModal({ activityType, onClose, onActivitySuccess }: ActivityModalProps) {
  const [completed, setCompleted] = useState(false);
  const [simState, setSimState] = useState<SimulationState>(initialPracticeSimulationState);

  function handleComplete() {
    setCompleted(true);
    onActivitySuccess?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand-ink transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to App</span>
          </button>

          <span className="rounded-full bg-brand-lime text-brand-ink px-3 py-0.5 text-xs font-black uppercase tracking-wider">
            {activityType === "lesson" && "Interactive Lesson"}
            {activityType === "spot-and-sort" && "Spot & Sort Activity"}
            {activityType === "simulation" && "Practice Simulation"}
            {activityType === "rewind" && "Money Multiverse Rewind"}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close activity"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-brand-muted hover:text-brand-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        {!completed ? (
          <div className="rounded-2xl border border-border bg-brand-paper p-3 sm:p-5">
            {activityType === "lesson" && (
              <TopicLesson lesson={exampleEmergencyFundLesson} onLessonComplete={handleComplete} />
            )}

            {activityType === "spot-and-sort" && (
              <SpotAndSort activity={exampleNeedVsWantActivity} onComplete={handleComplete} />
            )}

            {activityType === "simulation" && (
              <div className="space-y-4">
                <PracticeSimulation
                  episode={march2020EpisodeMetadata}
                  state={simState}
                  onDecision={({ decisionId }) => {
                    setSimState((current) => {
                      if (decisionId === "__continue") return { ...current, phase: "active" };
                      if (decisionId === "__acknowledge") return { ...current, phase: "decision" };
                      if (decisionId === "__consequence_continue") return { ...current, phase: "reflection" };
                      const selected = precomputedMarch2020Outcomes[decisionId];
                      return selected ? { ...current, phase: "consequence", resolvedOutcome: selected } : current;
                    });
                  }}
                  onReflection={() => setSimState((current) => ({ ...current, phase: "complete" }))}
                  onEpisodeComplete={handleComplete}
                />
              </div>
            )}

            {activityType === "rewind" && (
              <div className="space-y-4">
                <FinancialRewind
                  episodeId={march2020EpisodeMetadata.episodeId}
                  chosenPath={{
                    decisionId: precomputedMarch2020Outcomes["decision-emergency-reserve"]!.decisionId,
                    decisionLabel: "Use Emergency Reserve",
                    narrativeConsequence:
                      precomputedMarch2020Outcomes["decision-emergency-reserve"]!.narrativeConsequence,
                    stateDelta: precomputedMarch2020Outcomes["decision-emergency-reserve"]!.stateDelta,
                    tradeoff: precomputedMarch2020Outcomes["decision-emergency-reserve"]!.tradeoff,
                    whatWasUnknown: precomputedMarch2020Outcomes["decision-emergency-reserve"]!.whatWasUnknown,
                    characterReaction: precomputedMarch2020Outcomes["decision-emergency-reserve"]!.characterReaction,
                  }}
                  alternatives={precomputedMarch2020Outcomes["decision-emergency-reserve"]!.alternativeOutcomes ?? []}
                />
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="rounded-2xl bg-brand-ink px-6 py-2.5 text-xs font-bold text-brand-paper hover:bg-brand-ink/90"
                  >
                    Mark Activity Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Celebratory Completion Screen */
          <div className="p-6 sm:p-10 text-center space-y-6 animate-in zoom-in-95">
            <div className="flex justify-center">
              <div className="grid size-24 place-items-center rounded-3xl bg-brand-ink text-brand-paper shadow-md">
                <Character variant="blob" pose="celebrating" accent="lime" size="xl" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-black uppercase">
                Activity Completed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink">Great Job! Mastery Score Updated</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Your decision has been recorded into the knowledge profile. Gullu is proud of your financial discipline!
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-brand-paper p-4 text-left max-w-md mx-auto space-y-2 text-xs font-semibold">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>+10 Habit Points added to Living Gullak</span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink">
                <Sparkles className="size-4 text-brand-coral shrink-0" />
                <span>Prerequisite unlocked for next topic in graph</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-brand-ink px-8 py-3 text-sm font-bold text-brand-paper hover:bg-brand-ink/90 transition-transform active:scale-95 shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
