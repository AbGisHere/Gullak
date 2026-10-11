"use client";

import { CalendarDays, CircleHelp, RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { ShellFrame } from "./shell-frame";

export type NavTab = "world" | "learn" | "gullu" | "rewards" | "profile" | "home" | "twin" | "portfolio" | "missions";

interface AppShellProps {
  onSelectTab: (tab: NavTab) => void;
  gradeGroup: string;
  /** Distinct days practised, accumulated without resets (0 for a new learner). */
  daysPractised: number;
  /** XP derived from passed quizzes and completed activities. */
  xp: number;
  level: number;
  onOpenSettings: () => void;
  onResetOnboarding: () => void;
  children: ReactNode;
}

export function AppShell({
  onSelectTab,
  gradeGroup,
  daysPractised,
  xp,
  level,
  onOpenSettings,
  onResetOnboarding,
  children,
}: AppShellProps) {
  const tProgress = useTranslations("progressData");
  const tGrade = useTranslations("onboarding.grade");
  const t = useTranslations("home.shell");
  const tHelp = useTranslations("help");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const gradeDisplay = tGrade(gradeGroup);

  return (
    <ShellFrame
      onHome={() => onSelectTab("home")}
      headerEnd={
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-label={t("learnerMenu")}
            aria-expanded={showProfileMenu}
            className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-2 sm:px-3 text-xs sm:text-sm font-semibold hover:border-foreground/40 transition-colors"
          >
            {daysPractised > 0 ? (
              <>
                <span className="hidden items-center gap-1 text-foreground sm:flex">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <span className="font-bold" aria-hidden="true">
                    {t("daysPractisedShort", { days: daysPractised })}
                  </span>
                  <span className="sr-only">{t("daysPractisedLabel", { days: daysPractised })}</span>
                </span>
                <span className="hidden text-muted-foreground font-normal sm:inline-block">|</span>
              </>
            ) : null}
            <span className="tabular-nums">{tProgress("xpShort", { xp })}</span>
          </button>

          {showProfileMenu && (
            <>
              <button
                type="button"
                aria-label={t("closeLearnerMenu")}
                className="fixed inset-0 z-40 bg-transparent cursor-default border-0 p-0"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card p-2 shadow-lg animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-xs text-muted-foreground">{t("currentProfile")}</p>
                  <p className="text-sm font-bold text-foreground">{gradeDisplay}</p>
                  <p className="text-xs text-muted-foreground font-medium tabular-nums">
                    {tProgress("levelSummary", { level, xp })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="size-4" aria-hidden="true" />
                  <span>{t("changeClass")}</span>
                </button>
                <Link
                  href="/help"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <CircleHelp className="size-4" aria-hidden="true" />
                  <span>{tHelp("link")}</span>
                </Link>
                {/* Destructive action sits apart from routine settings and always asks first. */}
                <div aria-hidden="true" className="my-1.5 border-t border-border/60" />
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetOnboarding();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  <span>{t("resetOnboarding")}</span>
                </button>
              </div>
            </>
          )}
        </div>
      }
    >
      {children}
    </ShellFrame>
  );
}
