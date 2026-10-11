"use client";

import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { XP_PER_LEVEL } from "@/lib/progress-summary";
import type { LearnerProgress } from "@/lib/use-progress-summary";
import { MissionsTab } from "./missions-tab";

interface RewardsTabProps {
  gradeGroup: string;
  progress: LearnerProgress;
}

export function RewardsTab({ gradeGroup, progress }: RewardsTabProps) {
  const t = useTranslations("progressData");
  return (
    <div className="space-y-6 px-3 sm:px-6 py-4 max-w-4xl mx-auto">
      {/* Rewards Header Banner */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-muted">
            <Trophy className="size-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Rewards &amp; Achievements</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Earn XP and badges by protecting your family and completing take-home missions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl bg-muted p-3">
            <span className="text-xs font-bold uppercase text-muted-foreground">{t("xpLabel")}</span>
            <p className="text-lg font-bold tabular-nums text-foreground">{t("xpShort", { xp: progress.xp })}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("xpToNext", { remaining: XP_PER_LEVEL - progress.xpIntoLevel, next: progress.level + 1 })}
            </p>
          </div>

          <div className="rounded-2xl bg-muted p-3">
            <span className="text-xs font-bold uppercase text-muted-foreground">{t("streakLabel")}</span>
            <p className="text-lg font-bold text-foreground">{t("streakValue", { days: progress.streakDays })}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-muted p-3">
            <span className="text-xs font-bold uppercase text-muted-foreground">{t("topicsPassedLabel")}</span>
            <p className="text-lg font-bold tabular-nums text-foreground">{progress.topicsPassed}</p>
          </div>
        </div>

        {progress.hasProgress ? null : (
          <div className="rounded-2xl border-2 border-dashed border-[#171717]/30 dark:border-[#334155] p-4">
            <p className="font-display text-sm font-black text-[#171717] dark:text-[#F8FAFC]">{t("emptyTitle")}</p>
            <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8]">{t("emptyBody")}</p>
          </div>
        )}
      </section>

      {/* Mounts existing MissionsTab directly without touching its code */}
      <MissionsTab gradeGroup={gradeGroup} />
    </div>
  );
}
