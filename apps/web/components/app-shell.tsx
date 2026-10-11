"use client";

import { locales } from "@gullak/content";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { cn } from "@gullak/ui/lib/utils";
import { Award, BookOpen, Compass, Flame, RotateCcw, Settings, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { Gullu } from "./game/gullu";

export type NavTab = "world" | "learn" | "gullu" | "rewards" | "profile" | "home" | "twin" | "portfolio" | "missions";

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  gradeGroup: string;
  /** Real consecutive learning days (0 for a new learner). */
  streakDays: number;
  /** XP derived from passed quizzes and completed activities. */
  xp: number;
  level: number;
  onOpenSettings: () => void;
  onResetOnboarding: () => void;
  children: ReactNode;
}

export function AppShell({
  currentTab,
  onSelectTab,
  gradeGroup,
  streakDays,
  xp,
  level,
  onOpenSettings,
  onResetOnboarding,
  children,
}: AppShellProps) {
  const tNav = useTranslations("nav");
  const tProgress = useTranslations("progressData");
  const locale = useLocale();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  function setLanguage(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const gradeDisplay =
    gradeGroup === "grade-6-7" ? "Class 6–7" : gradeGroup === "grade-11-12" ? "Class 11–12" : "Class 8–10";

  // The 5 primary bottom/sidebar navigation destinations of Gullu's Interactive World
  const navItems: { id: NavTab; label: string; icon: typeof Compass }[] = [
    { id: "world", label: tNav("world"), icon: Compass },
    { id: "learn", label: tNav("learn"), icon: BookOpen },
    { id: "gullu", label: tNav("gullu"), icon: Sparkles },
    { id: "rewards", label: tNav("rewards"), icon: Award },
    { id: "profile", label: tNav("profile"), icon: User },
  ];

  // Helper to determine if an item is active
  function isTabActive(itemId: NavTab): boolean {
    if (currentTab === itemId) return true;
    if (itemId === "world" && (currentTab === "home" || currentTab === "twin")) return true;
    if (itemId === "gullu" && currentTab === "portfolio") return true;
    if (itemId === "rewards" && currentTab === "missions") return true;
    return false;
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelectTab("world")}
            className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Gullu state="wave" size={32} />
            <div>
              <span className="block text-lg font-extrabold tracking-tight leading-none">Gullak</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vanguard</span>
            </div>
          </button>

          <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {gradeDisplay}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <PlayMoneyBadge label="Play Money" />

          {/* Language Switcher */}
          <div className="relative">
            <label className="sr-only" htmlFor="shell-language">
              Language
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
              aria-label="Learner menu"
              aria-expanded={showProfileMenu}
              className="flex h-8 sm:h-9 items-center gap-1 sm:gap-2 rounded-xl border border-border bg-card px-2 sm:px-3 text-xs sm:text-sm font-semibold hover:border-foreground/40 transition-colors"
            >
              {streakDays > 0 ? (
                <>
                  <span className="flex items-center gap-1 text-foreground">
                    <Flame className="size-3.5" aria-hidden="true" />
                    <span className="font-bold" aria-hidden="true">
                      {tProgress("streakShort", { days: streakDays })}
                    </span>
                    <span className="sr-only">{tProgress("streakAria", { days: streakDays })}</span>
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
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 bg-transparent cursor-default border-0 p-0"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card p-2 shadow-lg animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs text-muted-foreground">Current Profile</p>
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
                    <Settings className="size-4" />
                    <span>Change Grade & Goals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onResetOnboarding();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <RotateCcw className="size-4" />
                    <span>Reset / Replay Onboarding</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Desktop Sidebar Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start">
        {/* Desktop Sidebar (hidden on phone, visible md+) */}
        <aside className="sticky top-16 hidden md:flex w-60 shrink-0 flex-col gap-6 border-r px-4 py-6 self-stretch">
          <nav className="flex flex-col gap-2" aria-label="Desktop navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isTabActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  data-active={isActive}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Primary Page Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-10">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone only, fixed at bottom, thumb-friendly 48px+ targets) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around border-t bg-background px-1 pt-1 pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              data-active={isActive}
              className={cn(
                "flex flex-1 min-h-14 min-w-[48px] flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className={cn("leading-none", isActive && "font-bold")}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
