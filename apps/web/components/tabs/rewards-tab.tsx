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
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 sm:p-6 shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFD84D]">
            <Trophy className="size-6 text-[#171717]" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#171717] dark:text-[#F8FAFC]">
              Rewards &amp; Achievements
            </h1>
            <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8] font-semibold">
              Earn XP and badges by protecting your family and completing take-home missions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#DFFF3F]/30 dark:bg-[#DFFF3F]/15 p-3">
            <span className="text-[10px] font-black uppercase text-[#171717]/70 dark:text-[#94A3B8]">
              {t("xpLabel")}
            </span>
            <p className="font-display text-lg font-black tabular-nums text-[#171717] dark:text-[#F8FAFC]">
              {t("xpShort", { xp: progress.xp })}
            </p>
            <p className="text-[11px] font-semibold text-[#171717]/70 dark:text-[#94A3B8]">
              {t("xpToNext", { remaining: XP_PER_LEVEL - progress.xpIntoLevel, next: progress.level + 1 })}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FF6847]/20 dark:bg-[#FF6847]/15 p-3">
            <span className="text-[10px] font-black uppercase text-[#171717]/70 dark:text-[#94A3B8]">
              {t("streakLabel")}
            </span>
            <p className="font-display text-lg font-black text-[#FF6847] dark:text-[#FF8A65]">
              {t("streakValue", { days: progress.streakDays })}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#CBB5FF]/30 dark:bg-[#CBB5FF]/15 p-3">
            <span className="text-[10px] font-black uppercase text-[#171717]/70 dark:text-[#94A3B8]">
              {t("topicsPassedLabel")}
            </span>
            <p className="font-display text-lg font-black tabular-nums text-[#171717] dark:text-[#F8FAFC]">
              {progress.topicsPassed}
            </p>
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
