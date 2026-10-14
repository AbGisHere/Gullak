"use client";

import { locales } from "@gullak/content";
import type { GradeGroup } from "@gullak/types";
import { cn } from "@gullak/ui/lib/utils";
import { Globe, Laptop, Moon, RotateCcw, Sun, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("home.profile");
  const tGrade = useTranslations("onboarding.grade");
  const tHelp = useTranslations("help");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [nameInput, setNameInput] = useState(displayName);

  function handleLanguageChange(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const gradeOptions: { id: GradeGroup; label: string; desc: string }[] = (
    ["grade-6-7", "grade-8-10", "grade-11-12"] as const
  ).map((id) => ({ id, label: tGrade(id), desc: t(`gradeTopics.${id}`) }));

  return (
    <div className="space-y-6 px-3 sm:px-6 py-4 max-w-xl mx-auto">
      {/* Profile Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border border-border bg-brand-lime">
            <User className="size-6 text-foreground dark:text-brand-on-accent" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {displayName ? t("titleNamed", { name: displayName }) : t("title")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">{t("description")}</p>
          </div>
        </div>
        <Link href="/help" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
          {tHelp("link")}
        </Link>
      </section>

      {/* Nickname / Display Name */}
      <section className="rounded-2xl border border-border bg-card p-5  space-y-3">
        <h2 id="profile-nickname" className="text-base font-bold text-foreground">
          {t("nickname")}
        </h2>
        <p className="text-xs text-muted-foreground">{t("nicknameDescription")}</p>
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            aria-labelledby="profile-nickname"
            placeholder={t("nicknamePlaceholder")}
            maxLength={60}
            className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onUpdateDisplayName?.(nameInput)}
            className="g-btn px-4 py-2 text-xs font-bold"
          >
            {t("save")}
          </button>
        </div>
      </section>

      {/* Appearance: Light / Dark / System */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-foreground dark:text-[#FFD84D]" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">{t("appearance")}</h2>
        </div>
        <p className="text-xs text-muted-foreground">{t("appearanceDescription")}</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light", label: t("theme.light"), icon: Sun },
            { id: "dark", label: t("theme.dark"), icon: Moon },
            { id: "system", label: t("theme.system"), icon: Laptop },
          ].map((item) => {
            const isSelected = theme === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center text-xs font-bold transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:border-foreground/40",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Class / Grade Group Selector */}
      <section className="rounded-2xl border border-border bg-card p-5  space-y-3">
        <h2 className="text-base font-bold text-foreground">{t("classGroup")}</h2>
        <div className="space-y-2">
          {gradeOptions.map((opt) => {
            const isSelected = gradeGroup === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateGrade(opt.id)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:border-foreground/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{opt.label}</span>
                  {isSelected && <span className="text-xs font-bold">{t("active")}</span>}
                </div>
                <p className="text-xs opacity-80 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language Switcher */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">{t("language")}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {locales.locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageChange(l.code)}
              aria-pressed={locale === l.code}
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
          <RotateCcw className="size-4 text-brand-coral" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">{t("sharedTitle")}</h2>
        </div>
        <p className="text-xs text-muted-foreground">{t("sharedDescription")}</p>

        <button
          type="button"
          onClick={onResetOnboarding}
          className="g-btn g-btn--paper w-full py-2.5 text-xs font-bold text-brand-coral-ink border-brand-coral-ink hover:bg-brand-coral/10"
        >
          {t("reset")}
        </button>
      </section>
    </div>
  );
}
