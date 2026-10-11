"use client";

import { allUnlockRules } from "@gullak/content";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { type GulluTipPlace, gulluTipAt, lastQuizOutcome, type QuizOutcome } from "@/lib/gullu-tips";
import { readLearnerState } from "@/lib/learner-state";
import { Gullu } from "../game/gullu";
import { SpeechBubble } from "../game/speech-bubble";

type LearnerSignals = { hasProgress: boolean; lastQuiz: QuizOutcome | null };

function readSignals(): LearnerSignals {
  const state = readLearnerState();
  const lastQuiz = lastQuizOutcome(
    state.quizAttempts,
    (topicId) => allUnlockRules.find((rule) => rule.topicId === topicId)?.passMark,
  );
  return { hasProgress: state.quizAttempts.length > 0 || state.passedTopics.length > 0, lastQuiz };
}

interface GulluTipProps {
  place: GulluTipPlace;
  worldSlug?: string;
  /** Overrides the stored-progress check, e.g. when the screen knows about finished missions. */
  isNewLearner?: boolean;
  /** Taps on a Gullu the parent already renders. Omit to render Gullu here with its own taps. */
  taps?: number;
  className?: string;
  tailPosition?: "bottom-left" | "left";
}

/** Gullu's contextual, translated tip. The same context and tap count always give the same tip. */
export function GulluTip({ place, worldSlug, isNewLearner, taps, className, tailPosition }: GulluTipProps) {
  const t = useTranslations("help");
  const [signals, setSignals] = useState<LearnerSignals>({ hasProgress: false, lastQuiz: null });
  const [ownTaps, setOwnTaps] = useState(0);

  useEffect(() => {
    const update = () => setSignals(readSignals());
    update();
    window.addEventListener("gullak-state-change", update);
    return () => window.removeEventListener("gullak-state-change", update);
  }, []);

  const tapCount = taps ?? ownTaps;
  const key = gulluTipAt(
    { place, worldSlug, isNewLearner: isNewLearner ?? !signals.hasProgress, lastQuiz: signals.lastQuiz },
    tapCount,
  );
  const bubble = (
    <SpeechBubble
      speakerName={t("gullu.name")}
      variant="paper"
      tailPosition={tailPosition ?? (taps === undefined ? "left" : "bottom-left")}
      className={taps === undefined ? "flex-1" : className}
    >
      {t(`tips.${key}`)}
    </SpeechBubble>
  );

  if (taps !== undefined) return bubble;
  return (
    <div className={className ?? "flex items-start gap-3"}>
      <div className="flex shrink-0 flex-col items-center">
        <Gullu
          state="encouraging"
          size={64}
          reactionKey={ownTaps}
          onTap={() => setOwnTaps((count) => count + 1)}
          tapLabel={t("gullu.tapLabel")}
        />
      </div>
      {bubble}
    </div>
  );
}
