"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { LearnerProgress } from "@/lib/use-progress-summary";
import { Gullu } from "../game/gullu";
import { SpeechBubble } from "../game/speech-bubble";
import { PortfolioTab } from "./portfolio-tab";

interface GulluTabProps {
  gradeGroup: string;
  virtualCashPaise: number;
  progress: LearnerProgress;
}

export function GulluTab({ gradeGroup, virtualCashPaise, progress }: GulluTabProps) {
  const t = useTranslations("home.gullu");
  const tProgress = useTranslations("progressData");
  const tLearner = useTranslations("learner");
  const [tapCount, setTapCount] = useState(0);
  const tipKeys = ["tickle", "basket", "small", "kintsugi"] as const;
  // Store which line Gullu is saying, not the text, so it follows a language switch.
  const gulluSpeech = tapCount === 0 ? t("greeting") : t(`tips.${tipKeys[(tapCount - 1) % tipKeys.length]!}`);

  function handleGulluTap() {
    setTapCount((c) => c + 1);
  }

  return (
    <div className="space-y-6 px-3 sm:px-6 py-4 max-w-4xl mx-auto">
      <h1 className="sr-only">{t("heading")}</h1>
      {/* Living Gullu Character Hero Card */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        <div className="flex flex-col items-center">
          <Gullu state="happy" size={130} reactionKey={tapCount} onTap={handleGulluTap} tapLabel={t("tapLabel")} />
          <span className="text-xs font-extrabold text-muted-foreground mt-1">{t("tapHint")}</span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase">
              {tProgress("livingGullak", { level: progress.level })}
            </span>
            {progress.streakDays > 0 ? (
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
                {tProgress("streakChip", { days: progress.streakDays })}
              </span>
            ) : null}
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-bold tabular-nums text-foreground">
              {tProgress("xpShort", { xp: progress.xp })}
            </span>
          </div>

          {progress.hasProgress ? null : (
            <p className="text-xs font-semibold text-muted-foreground">{tProgress("emptyBody")}</p>
          )}

          <SpeechBubble speakerName="Gullu" variant="paper" tailPosition="left" className="text-left">
            {gulluSpeech}
          </SpeechBubble>

          <p className="text-xs text-muted-foreground font-medium">{t("habitNote")}</p>
        </div>
      </section>

      {/* Portfolio Title & Embed (Preserves existing PortfolioTab without edits) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t("insideTitle")}</h2>
            <p className="text-xs text-muted-foreground font-semibold">{t("insideDescription")}</p>
          </div>
          <PlayMoneyBadge label={tLearner("playMoney")} />
        </div>

        {/* Mount existing PortfolioTab */}
        <PortfolioTab gradeGroup={gradeGroup} startingPaise={virtualCashPaise} />
      </section>
    </div>
  );
}
