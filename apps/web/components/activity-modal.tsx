"use client";

import type { GradeGroup } from "@gullak/types";
import { Character } from "@gullak/ui/components/character";
import { CoinShopSimulation } from "@gullak/ui/components/coin-shop-simulation";
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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getCandyEconomyLesson1 } from "@/lib/candy-economy-lesson";
import { XP_PER_ACTIVITY } from "@/lib/progress-summary";
import { ConfirmDialog } from "./confirm-dialog";

export type ActivityType = "lesson" | "spot-and-sort" | "simulation" | "rewind" | "coin-shop";

interface ActivityModalProps {
  activityType: ActivityType;
  topicId?: string | null;
  gradeGroup?: GradeGroup;
  onClose: () => void;
  onActivitySuccess?: () => void;
}

export function ActivityModal({ activityType, topicId, gradeGroup, onClose, onActivitySuccess }: ActivityModalProps) {
  const tProgress = useTranslations("progressData");
  const tSafety = useTranslations("safety");
  const [completed, setCompleted] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  // Leaving mid-activity drops the learner's choices, so ask first; once finished, just close.
  function requestClose() {
    if (completed) onClose();
    else setConfirmingLeave(true);
  }
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
            onClick={requestClose}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand-ink transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to App</span>
          </button>

          <span className="rounded-full bg-brand-lime text-brand-ink px-3 py-0.5 text-xs font-black uppercase tracking-wider">
            {activityType === "lesson" && "Interactive Lesson"}
            {activityType === "spot-and-sort" && "Spot & Sort Activity"}
            {activityType === "coin-shop" && "Candyville Coin Shop"}
            {activityType === "simulation" && "Practice Simulation"}
            {activityType === "rewind" && "Money Multiverse Rewind"}
          </span>

          <button
            type="button"
            onClick={requestClose}
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
              <TopicLesson
                lesson={
                  topicId === "money-basics"
                    ? getCandyEconomyLesson1(gradeGroup ?? "grade-6-7")
                    : exampleEmergencyFundLesson
                }
                onLessonComplete={handleComplete}
              />
            )}

            {activityType === "coin-shop" && <CoinShopSimulation onComplete={handleComplete} />}

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
              <span className="rounded-full bg-success/15 text-success-ink px-3 py-1 text-xs font-black uppercase">
                {tProgress("activityDoneBadge")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink">{tProgress("activityDoneTitle")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {tProgress("activityDoneBody")}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-brand-paper p-4 text-left max-w-md mx-auto space-y-2 text-xs font-semibold">
              <div className="flex items-center gap-2 text-success-ink">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{tProgress("activityXp", { xp: XP_PER_ACTIVITY })}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink">
                <Sparkles className="size-4 text-brand-coral shrink-0" />
                <span>{tProgress("activityUnlockNote")}</span>
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
      {confirmingLeave ? (
        <ConfirmDialog
          title={tSafety("leaveActivity.title")}
          description={tSafety("leaveActivity.description")}
          confirmLabel={tSafety("leaveActivity.confirm")}
          cancelLabel={tSafety("leaveActivity.cancel")}
          onConfirm={() => {
            setConfirmingLeave(false);
            onClose();
          }}
          onCancel={() => setConfirmingLeave(false)}
        />
      ) : null}
    </div>
  );
}
