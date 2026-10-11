"use client";

import { locales, startingCapital } from "@gullak/content";
import { inrToPaise, startingCash } from "@gullak/engine";
import { Experience, GradeGroup, LearnerProfile, LearningFormat } from "@gullak/types";
import { Button } from "@gullak/ui/components/button";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { Gullu } from "./game/gullu";

export const ONBOARDING_STORAGE_KEY = "gullak-onboarding-profile";
export function readProfile(): LearnerProfile | null {
  try {
    const value = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!value) return null;
    const result = LearnerProfile.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

const TOTAL_STEPS = 4;

const choiceClass =
  "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background";
const inputClass =
  "h-11 w-full rounded-lg border bg-background px-3 font-normal outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30";

type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
  optionLabel: (value: T) => string;
};

function ChoiceGroup<T extends string>({ label, options, selected, onSelect, optionLabel }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold tracking-tight">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              data-selected={isSelected}
              onClick={() => onSelect(option)}
              className={choiceClass}
            >
              {optionLabel(option)}
              {isSelected ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function saveLocally(profile: LearnerProfile): boolean {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    // Private mode or blocked storage: the learner can still continue this session.
    return false;
  }
}

export function Onboarding({ onFinish }: { onFinish?: (profile: LearnerProfile) => void } = {}) {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [gradeGroup, setGradeGroup] = useState<GradeGroup | null>(null);
  const [experience, setExperience] = useState<Experience>("none");
  // null = "Mix it up": every format, and the format bandit learns from use.
  const [chosenFormats, setChosenFormats] = useState<LearningFormat[] | null>(null);
  const [goalLabel, setGoalLabel] = useState("");
  const [targetInr, setTargetInr] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [savedLocally, setSavedLocally] = useState(true);
  const [createdProfile, setCreatedProfile] = useState<LearnerProfile | null>(null);

  const goalStarted = Boolean(goalLabel || targetInr || targetDate);
  const goalComplete = Boolean(goalLabel.trim() && Number(targetInr) > 0 && targetDate);
  const canContinue = (step !== 1 || gradeGroup !== null) && (step !== 3 || !goalStarted || goalComplete);
  const cash = gradeGroup ? startingCash(startingCapital, gradeGroup, experience) : null;

  function toggleFormat(format: LearningFormat) {
    setChosenFormats((current) => {
      if (!current) return [format];
      if (!current.includes(format)) return [...current, format];
      const next = current.filter((f) => f !== format);
      return next.length > 0 ? next : null;
    });
  }

  function clearGoal() {
    setGoalLabel("");
    setTargetInr("");
    setTargetDate("");
  }

  function complete() {
    if (!gradeGroup) return;
    const now = new Date().toISOString();
    const parsed = LearnerProfile.safeParse({
      id: crypto.randomUUID(),
      ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
      gradeGroup,
      experience,
      locale,
      preferredFormats: chosenFormats ?? [...LearningFormat.options],
      createdAt: now,
      ...(goalComplete
        ? {
            goal: {
              id: crypto.randomUUID(),
              label: goalLabel.trim(),
              targetPaise: inrToPaise(Number(targetInr)),
              targetDate,
              currentSavingsPaise: 0,
              createdAt: now,
            },
          }
        : {}),
    });
    if (!parsed.success) return;
    setCreatedProfile(parsed.data);
    setSavedLocally(saveLocally(parsed.data));
    setStep(TOTAL_STEPS);
  }

  function next() {
    if (step === TOTAL_STEPS - 1) complete();
    else setStep((current) => current + 1);
  }

  function setLanguage(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  // The format and goal steps are optional; grade group is not.
  const canSkipStep = step === 2 || step === 3;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="size-9 rounded-xl border border-border bg-card grid place-items-center overflow-hidden p-0.5">
            <Gullu state="wave" size={32} />
          </div>
          {t("brand")}
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="language">
            {t("languageLabel")}
          </label>
          <select
            id="language"
            value={locale}
            onChange={(event) => setLanguage(event.target.value)}
            className="h-9 rounded-lg border bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {locales.locales.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
          <PlayMoneyBadge label={t("playMoney")} />
        </div>
      </header>

      <section
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10 sm:py-16"
        aria-live="polite"
      >
        {step < TOTAL_STEPS ? (
          <div className="mb-8 flex items-center gap-3">
            <p className="shrink-0 text-sm font-medium">{t("progress", { current: step + 1, total: TOTAL_STEPS })}</p>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-200"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {step === 0 ? (
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4">
              <Gullu state="wave" size={88} label="Gullu greeting you" />
              <div className="rounded-2xl border-2 border-foreground bg-card p-3 text-xs sm:text-sm font-medium shadow-[2px_2px_0_#171717]">
                &quot;Namaste! I&apos;m Gullu, your companion. Let&apos;s set up your journey!&quot;
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t("time")}</p>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{t("welcomeTitle")}</h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">{t("welcomeDescription")}</p>

            <div className="space-y-2 pt-1 text-left">
              <label htmlFor="learner-name" className="text-sm font-semibold tracking-tight text-foreground block">
                {t("nameLabel")}
              </label>
              <input
                id="learner-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder={t("namePlaceholder")}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
            </div>

            <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{t("guardrail")}</div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("aboutTitle")}</h1>
              <p className="text-muted-foreground">{t("aboutDescription")}</p>
            </div>
            <ChoiceGroup
              label={t("gradeLabel")}
              options={GradeGroup.options}
              selected={gradeGroup}
              onSelect={setGradeGroup}
              optionLabel={(value) => t(`grade.${value}`)}
            />
            <ChoiceGroup
              label={t("experienceLabel")}
              options={Experience.options}
              selected={experience}
              onSelect={setExperience}
              optionLabel={(value) => t(`experience.${value}`)}
            />
            {cash !== null ? (
              <p className="text-sm text-muted-foreground">{t("cashPreview", { cash: formatInr(cash) })}</p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("formatTitle")}</h1>
              <p className="text-muted-foreground">{t("formatDescription")}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setChosenFormats(null)}
                aria-pressed={chosenFormats === null}
                data-selected={chosenFormats === null}
                className={`${choiceClass} sm:col-span-2`}
              >
                <span>{t("mixItUp")}</span>
                {chosenFormats === null ? <Check className="size-4" aria-hidden="true" /> : null}
              </button>
              {LearningFormat.options.map((format) => {
                const selected = chosenFormats?.includes(format) ?? false;
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => toggleFormat(format)}
                    aria-pressed={selected}
                    data-selected={selected}
                    className={choiceClass}
                  >
                    <span>{t(`format.${format}`)}</span>
                    {selected ? <Check className="size-4" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">{t("formatHint")}</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-7">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("goalTitle")}</h1>
              <p className="text-muted-foreground">{t("goalDescription")}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium sm:col-span-2">
                <span>{t("goalNameLabel")}</span>
                <input
                  value={goalLabel}
                  onChange={(event) => setGoalLabel(event.target.value)}
                  maxLength={80}
                  placeholder={t("goalNamePlaceholder")}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{t("goalAmountLabel")}</span>
                <input
                  value={targetInr}
                  onChange={(event) => setTargetInr(event.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder={t("goalAmountPlaceholder")}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{t("goalDateLabel")}</span>
                <input
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  type="date"
                  className={inputClass}
                />
              </label>
            </div>
            {goalStarted && !goalComplete ? <p className="text-sm text-destructive">{t("goalIncomplete")}</p> : null}
          </div>
        ) : null}

        {step === TOTAL_STEPS ? (
          <div className="max-w-xl space-y-6">
            <span className="grid size-12 place-items-center rounded-full bg-foreground text-background">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t("readyTitle")}</h1>
            <p className="text-lg leading-8 text-muted-foreground">{t("readyDescription")}</p>
            <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              {savedLocally ? t("savedLocally") : t("notSaved")}
            </div>
          </div>
        ) : null}
      </section>

      {step < TOTAL_STEPS ? (
        <footer className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 border-t pt-5">
          <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            <ArrowLeft aria-hidden="true" />
            {t("back")}
          </Button>
          <div className="flex items-center gap-2">
            {canSkipStep ? (
              <Button
                variant="ghost"
                onClick={() => {
                  if (step === 2) setChosenFormats(null);
                  else clearGoal();
                  next();
                }}
              >
                {t("skip")}
              </Button>
            ) : null}
            <Button onClick={next} disabled={!canContinue}>
              {step === TOTAL_STEPS - 1 ? t("finish") : t("continue")}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </footer>
      ) : (
        <footer className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button variant="ghost" onClick={() => setStep(1)}>
            {t("reviewProfile")}
          </Button>
          <Button
            className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90 font-semibold"
            onClick={() => {
              if (!onFinish) {
                router.push("/learn");
                return;
              }
              const profile = createdProfile ?? readProfile();
              if (profile) onFinish(profile);
            }}
          >
            {t("startLearning")}
            <ArrowRight aria-hidden="true" />
          </Button>
        </footer>
      )}
    </main>
  );
}
