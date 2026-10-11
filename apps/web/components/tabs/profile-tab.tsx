"use client";

import { locales } from "@gullak/content";
import type { GradeGroup } from "@gullak/types";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { cn } from "@gullak/ui/lib/utils";
import { Globe, Laptop, Moon, RotateCcw, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";

interface ProfileTabProps {
  gradeGroup: string;
  onUpdateGrade: (grade: GradeGroup) => void;
  onResetOnboarding: () => void;
  displayName?: string;
  onUpdateDisplayName?: (name: string) => void;
}

export function ProfileTab({
  gradeGroup,
  onUpdateGrade,
  onResetOnboarding,
  displayName = "",
  onUpdateDisplayName,
}: ProfileTabProps) {
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [nameInput, setNameInput] = useState(displayName);

  function handleLanguageChange(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const gradeOptions: { id: GradeGroup; label: string; desc: string }[] = [
    { id: "grade-6-7", label: "Class 6–7", desc: "Season 1 · Needs vs Wants, Piggy Bank, UPI basics" },
    { id: "grade-8-10", label: "Class 8–10", desc: "Season 2 · Budgeting, FD, Compounding, Hospital Bill sim" },
    { id: "grade-11-12", label: "Class 11–12", desc: "Season 3 · Gold, Index Funds, SIP, Stocks & Family Future" },
  ];

  return (
    <div className="space-y-6 px-3 sm:px-6 py-4 max-w-xl mx-auto">
      {/* Profile Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-muted">
            <User className="size-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {displayName ? `Learner: ${displayName}` : "Learner Profile"}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Manage your school class, language, appearance, and shared-phone profile.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs font-bold text-muted-foreground">Status:</span>
          <PlayMoneyBadge label="100% Play Money" />
        </div>
      </section>

      {/* Nickname / Display Name */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-base font-bold text-foreground">Nickname</h2>
        <p className="text-xs text-muted-foreground">What Gullu calls you during missions.</p>
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Bunty or Priya"
            maxLength={60}
            className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onUpdateDisplayName?.(nameInput)}
            className="g-btn px-4 py-2 text-xs font-bold"
          >
            Save
          </button>
        </div>
      </section>

      {/* Appearance: Light / Dark / System */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-foreground" />
          <h2 className="text-base font-bold text-foreground">Appearance</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose warm paper, deep midnight navy, or match your device system setting.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Laptop },
          ].map((item) => {
            const isSelected = theme === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center text-xs font-bold transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:border-foreground/40",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Class / Grade Group Selector */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-base font-bold text-foreground">Change Class Group</h2>
        <div className="space-y-2">
          {gradeOptions.map((opt) => {
            const isSelected = gradeGroup === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateGrade(opt.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:border-foreground/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{opt.label}</span>
                  {isSelected && <span className="text-xs font-bold">✓ Active</span>}
                </div>
                <p className="text-xs opacity-75 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language Switcher */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4" />
          <h2 className="text-base font-bold text-foreground">App Language</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {locales.locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageChange(l.code)}
              className={cn(
                "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                locale === l.code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-foreground hover:border-foreground/40",
              )}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </section>

      {/* Shared Phones: Reset / Replay */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="size-4 text-foreground" />
          <h2 className="text-base font-bold text-foreground">Shared Phone / Switch Learner</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Built for families sharing one phone. You can reset or restart onboarding so another student can create their
          profile.
        </p>

        <button
          type="button"
          onClick={onResetOnboarding}
          className="g-btn g-btn--paper w-full py-2.5 text-xs font-bold text-foreground border-destructive/60 hover:bg-destructive/10"
        >
          Reset Profile &amp; Replay Onboarding
        </button>
      </section>
    </div>
  );
}
