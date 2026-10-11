"use client";

import { locales } from "@gullak/content";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { CalendarDays, CircleHelp, RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { Gullu } from "./game/gullu";
import { PrimaryNav } from "./primary-nav";

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
  const tLearner = useTranslations("learner");
  const tGrade = useTranslations("onboarding.grade");
  const t = useTranslations("home.shell");
  const tHelp = useTranslations("help");
  const locale = useLocale();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  function setLanguage(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const gradeDisplay = tGrade(gradeGroup);

  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Gullu state="wave" size={32} />
            <span className="block text-lg font-extrabold tracking-tight leading-none">Gullak</span>
          </button>

          <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {gradeDisplay}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <PlayMoneyBadge label={tLearner("playMoney")} />

          {/* Language Switcher */}
          <div className="relative">
            <label className="sr-only" htmlFor="shell-language">
              {tLearner("language")}
            </label>
            <select
              id="shell-language"
              value={locale}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 sm:h-9 rounded-lg border border-border bg-background px-2 text-xs sm:text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring cursor-pointer"
            >
              {locales.locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Profile / Habit Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-label={t("learnerMenu")}
              aria-expanded={showProfileMenu}
              className="flex h-8 sm:h-9 items-center gap-1 sm:gap-2 rounded-xl border border-border bg-card px-2 sm:px-3 text-xs sm:text-sm font-semibold hover:border-foreground/40 transition-colors"
            >
              {daysPractised > 0 ? (
                <>
                  <span className="flex items-center gap-1 text-foreground">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <span className="font-bold" aria-hidden="true">
                      {t("daysPractisedShort", { days: daysPractised })}
                    </span>
                    <span className="sr-only">{t("daysPractisedLabel", { days: daysPractised })}</span>
                  </span>
                  <span className="hidden md:inline-block text-muted-foreground font-normal">|</span>
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
        </div>
      </header>

      {/* Main Container with Desktop Sidebar Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start">
        {/* Desktop sidebar from lg, the same breakpoint and destinations as the routed learner shell */}
        <aside className="sticky top-16 hidden lg:flex w-60 shrink-0 flex-col gap-6 border-r px-4 py-6 self-stretch">
          <PrimaryNav variant="sidebar" onHome={() => onSelectTab("home")} />
        </aside>

        {/* Primary Page Content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-10">{children}</main>
      </div>

      <PrimaryNav variant="bar" onHome={() => onSelectTab("home")} />
    </div>
  );
}
