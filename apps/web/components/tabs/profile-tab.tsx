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
  habitScore?: number;
  streakDays?: number;
  displayName?: string;
  onUpdateDisplayName?: (name: string) => void;
}

export function ProfileTab({
  gradeGroup,
  onUpdateGrade,
  onResetOnboarding,
  habitScore: _habitScore = 88,
  streakDays: _streakDays = 3,
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
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 sm:p-6 shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#DFFF3F]">
            <User className="size-6 text-[#171717]" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#171717] dark:text-[#F8FAFC]">
              {displayName ? `Learner: ${displayName}` : "Learner Profile"}
            </h1>
            <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8] font-semibold">
              Manage your school class, language, appearance, and shared-phone profile.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#171717]/10 dark:border-[#334155] pt-3">
          <span className="text-xs font-bold text-[#171717]/80 dark:text-[#94A3B8]">Status:</span>
          <PlayMoneyBadge label="100% Play Money" />
        </div>
      </section>

      {/* Nickname / Display Name */}
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
        <h2 className="font-display text-base font-black text-[#171717] dark:text-[#F8FAFC]">Nickname</h2>
        <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8]">What Gullu calls you during missions.</p>
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Bunty or Priya"
            maxLength={60}
            className="flex-1 rounded-xl border-2 border-[#171717] dark:border-[#334155] bg-transparent px-3 py-2 text-sm font-bold text-[#171717] dark:text-[#F8FAFC] outline-none placeholder:text-[#171717]/40 dark:placeholder:text-[#94A3B8]/40"
          />
          <button
            type="button"
            onClick={() => onUpdateDisplayName?.(nameInput)}
            className="g-btn px-4 py-2 text-xs font-black"
          >
            Save
          </button>
        </div>
      </section>

      {/* Appearance: Light / Dark / System */}
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-[#FFD84D]" />
          <h2 className="font-display text-base font-black text-[#171717] dark:text-[#F8FAFC]">Appearance</h2>
        </div>
        <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8]">
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
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-center font-display text-xs font-black transition-all",
                  isSelected
                    ? "border-[#171717] dark:border-[#DFFF3F] bg-[#DFFF3F] dark:bg-[#162032] text-[#171717] dark:text-[#DFFF3F] shadow-[2px_2px_0_#171717] dark:shadow-[2px_2px_0_#000000]"
                    : "border-[#171717]/30 dark:border-[#334155] bg-transparent text-[#171717] dark:text-[#F8FAFC] hover:border-[#171717] dark:hover:border-[#94A3B8]",
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
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
        <h2 className="font-display text-base font-black text-[#171717] dark:text-[#F8FAFC]">Change Class Group</h2>
        <div className="space-y-2">
          {gradeOptions.map((opt) => {
            const isSelected = gradeGroup === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateGrade(opt.id)}
                className={cn(
                  "w-full rounded-2xl border-2 p-3 text-left transition-all",
                  isSelected
                    ? "border-[#171717] dark:border-[#DFFF3F] bg-[#DFFF3F] dark:bg-[#162032] text-[#171717] dark:text-[#DFFF3F] shadow-[3px_3px_0_#171717] dark:shadow-[3px_3px_0_#000000]"
                    : "border-[#171717]/30 dark:border-[#334155] bg-transparent text-[#171717] dark:text-[#F8FAFC] hover:border-[#171717] dark:hover:border-[#94A3B8]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-black">{opt.label}</span>
                  {isSelected && <span className="text-xs font-black">✓ Active</span>}
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language Switcher */}
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4" />
          <h2 className="font-display text-base font-black text-[#171717] dark:text-[#F8FAFC]">App Language</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {locales.locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageChange(l.code)}
              className={cn(
                "rounded-xl border-2 p-2.5 text-center font-display text-xs font-black transition-all",
                locale === l.code
                  ? "border-[#171717] dark:border-[#FFD84D] bg-[#FFD84D] dark:bg-[#FFD84D]/20 text-[#171717] dark:text-[#FFD84D] shadow-[2px_2px_0_#171717] dark:shadow-[2px_2px_0_#000000]"
                  : "border-[#171717]/30 dark:border-[#334155] bg-transparent text-[#171717] dark:text-[#F8FAFC] hover:border-[#171717] dark:hover:border-[#94A3B8]",
              )}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </section>

      {/* Shared Phones: Reset / Replay */}
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="size-4 text-[#FF6847]" />
          <h2 className="font-display text-base font-black text-[#171717] dark:text-[#F8FAFC]">
            Shared Phone / Switch Learner
          </h2>
        </div>
        <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8]">
          Built for families sharing one phone. You can reset or restart onboarding so another student can create their
          profile.
        </p>

        <button
          type="button"
          onClick={onResetOnboarding}
          className="g-btn g-btn--paper w-full py-2.5 text-xs font-black text-[#FF6847] border-[#FF6847] hover:bg-[#FF6847]/10"
        >
          Reset Profile &amp; Replay Onboarding
        </button>
      </section>
    </div>
  );
}
