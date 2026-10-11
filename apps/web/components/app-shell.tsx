"use client";

import { locales } from "@gullak/content";
import { Character } from "@gullak/ui/components/character";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { cn } from "@gullak/ui/lib/utils";
import { Award, BookOpen, Briefcase, Compass, Home, RotateCcw, Settings, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";

export type NavTab = "home" | "twin" | "learn" | "portfolio" | "missions";

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  gradeGroup: string;
  streakDays?: number;
  habitScore?: number;
  onOpenSettings: () => void;
  onResetOnboarding: () => void;
  children: ReactNode;
}

export function AppShell({
  currentTab,
  onSelectTab,
  gradeGroup,
  streakDays = 3,
  habitScore = 88,
  onOpenSettings,
  onResetOnboarding,
  children,
}: AppShellProps) {
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  function setLanguage(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const gradeDisplay =
    gradeGroup === "grade-6-7" ? "Class 6–7" : gradeGroup === "grade-11-12" ? "Class 11–12" : "Class 8–10";

  const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
    { id: "home", label: tNav("home"), icon: Home },
    { id: "twin", label: tNav("twin"), icon: Compass },
    { id: "learn", label: tNav("learn"), icon: BookOpen },
    { id: "portfolio", label: tNav("portfolio"), icon: Briefcase },
    { id: "missions", label: tNav("missions"), icon: Award },
  ];

  return (
    <div className="flex min-h-svh w-full flex-col bg-brand-paper text-brand-ink selection:bg-brand-lime selection:text-brand-ink">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-border/80 bg-brand-paper/95 px-3 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-brand-ink text-brand-paper shadow-sm">
              <Character variant="blob" pose="saving" accent="lime" size="sm" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black tracking-tight leading-none">Gullak</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vanguard</span>
            </div>
          </button>

          <span className="hidden sm:inline-flex items-center rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
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
              className="flex h-8 sm:h-9 items-center gap-1 sm:gap-2 rounded-xl border border-border bg-card px-2 sm:px-3 text-xs sm:text-sm font-semibold hover:border-brand-ink/40 transition-colors"
            >
              <span className="flex items-center gap-1 text-brand-coral">
                🔥 <span className="font-bold">{streakDays}d</span>
              </span>
              <span className="hidden md:inline-block text-muted-foreground font-normal">|</span>
              <span className="hidden md:inline-block text-xs text-muted-foreground">Score {habitScore}</span>
            </button>

            {showProfileMenu && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 bg-transparent cursor-default border-0 p-0"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs text-muted-foreground">Current Profile</p>
                    <p className="text-sm font-bold text-brand-ink">{gradeDisplay}</p>
                    <p className="text-[11px] text-brand-coral font-medium">Habit score: {habitScore}/100</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSettings();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-muted transition-colors"
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
        <aside className="sticky top-16 hidden md:flex w-64 shrink-0 flex-col gap-6 border-r border-border/80 p-5 self-stretch">
          <div className="rounded-2xl bg-brand-muted p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Character variant="blob" pose="explaining" accent="lime" size="md" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Companion</p>
                <p className="text-base font-black text-brand-ink">Gullu</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              &quot;Never break an FD early if your emergency cache can cover the bill!&quot;
            </p>
          </div>

          <nav className="flex flex-col gap-1.5" aria-label="Desktop navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  data-active={isActive}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all text-left",
                    isActive
                      ? "bg-brand-ink text-brand-paper shadow-sm"
                      : "text-brand-ink hover:bg-brand-muted hover:text-brand-ink",
                  )}
                >
                  <Icon className={cn("size-5", isActive ? "text-brand-lime" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                  {item.id === "twin" && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        isActive ? "bg-brand-lime text-brand-ink" : "bg-brand-coral text-white",
                      )}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-dashed border-border p-4 bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
              <Sparkles className="size-3.5 text-brand-coral" />
              <span>Adaptive Loop</span>
            </div>
            <p className="text-xs text-brand-ink/80 leading-snug">
              Every quiz and simulation decision updates your knowledge profile and unlocks new paper assets.
            </p>
          </div>
        </aside>

        {/* Primary Page Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-10">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone only, fixed at bottom) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden h-16 items-center justify-around border-t border-border bg-brand-paper/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              data-active={isActive}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-bold transition-transform active:scale-95",
                isActive ? "text-brand-ink" : "text-muted-foreground hover:text-brand-ink",
              )}
            >
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-xl transition-colors",
                  isActive ? "bg-brand-ink text-brand-lime shadow-sm" : "bg-transparent text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <span className={cn("leading-none", isActive && "font-black text-brand-ink")}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
