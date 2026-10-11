"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { LearnerProgress } from "@/lib/use-progress-summary";
import { Gullu } from "../game/gullu";
import { GulluTip } from "../help/gullu-tip";
import { TermHelp } from "../help/term-help";
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
            {progress.activeDays > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted py-0.5 pl-2.5 pr-1 text-xs font-bold text-foreground">
                {tProgress("daysPractised", { days: progress.activeDays })}
                <TermHelp term="daysPractised" />
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted py-0.5 pl-2.5 pr-1 text-xs font-bold tabular-nums text-foreground">
              {tProgress("xpShort", { xp: progress.xp })}
              <TermHelp term="xp" />
            </span>
          </div>

          {progress.hasProgress ? null : (
            <p className="text-xs font-semibold text-muted-foreground">{tProgress("emptyBody")}</p>
          )}

          <GulluTip place="gullu" taps={tapCount} tailPosition="left" className="text-left" />

          <p className="text-xs text-muted-foreground font-medium">{t("habitNote")}</p>
        </div>
      </section>

      {/* Portfolio Title & Embed (Preserves existing PortfolioTab without edits) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold text-foreground">{t("insideTitle")}</h2>
              <TermHelp term="portfolio" />
            </div>
            <p className="text-xs text-muted-foreground font-semibold">{t("insideDescription")}</p>
          </div>
          <span className="inline-flex items-center gap-1">
            <PlayMoneyBadge label={tLearner("playMoney")} />
            <TermHelp term="playMoney" />
          </span>
        </div>

        {/* Mount existing PortfolioTab */}
        <PortfolioTab gradeGroup={gradeGroup} startingPaise={virtualCashPaise} />
      </section>
    </div>
  );
}
