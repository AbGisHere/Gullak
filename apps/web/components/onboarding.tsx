"use client";

import type { AgeBand, Experience, LearningFormat, LearnerProfile } from "@gullak/types";
import { Button } from "@gullak/ui/components/button";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { ArrowLeft, ArrowRight, Check, Sprout } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const ONBOARDING_STORAGE_KEY = "gullak-onboarding-profile";

const ageBands: AgeBand[] = ["teen", "college", "first-job", "parent"];
const experienceLevels: Experience[] = ["none", "some", "regular"];
const formats: LearningFormat[] = ["story", "visual", "video", "simulation", "audio"];

type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  optionLabel: (value: T) => string;
};

function ChoiceGroup<T extends string>({ label, options, selected, onSelect, optionLabel }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold tracking-tight">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
              className="flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background"
              data-selected={isSelected}
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

export function Onboarding() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ageBand, setAgeBand] = useState<AgeBand>("college");
  const [experience, setExperience] = useState<Experience>("none");
  const [preferredFormats, setPreferredFormats] = useState<LearningFormat[]>(["story"]);
  const [goalLabel, setGoalLabel] = useState("");
  const [targetInr, setTargetInr] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const goalStarted = Boolean(goalLabel || targetInr || targetDate);
  const goalComplete = Boolean(goalLabel.trim() && Number(targetInr) > 0 && targetDate);
  const canContinue = step !== 3 || !goalStarted || goalComplete;
  const startingCash = useMemo(() => {
    const cashByAgeAndExperience: Record<AgeBand, Record<Experience, number>> = {
      teen: { none: 500_000, some: 750_000, regular: 1_000_000 },
      college: { none: 1_000_000, some: 1_500_000, regular: 2_000_000 },
      "first-job": { none: 5_000_000, some: 7_500_000, regular: 10_000_000 },
      parent: { none: 10_000_000, some: 15_000_000, regular: 20_000_000 },
    };
    return cashByAgeAndExperience[ageBand][experience];
  }, [ageBand, experience]);

  function toggleFormat(format: LearningFormat) {
    setPreferredFormats((current) => {
      if (current.includes(format)) return current.length === 1 ? current : current.filter((item) => item !== format);
      return [...current, format];
    });
  }

  function complete() {
    const targetPaise = Math.round(Number(targetInr) * 100);
    const profile: LearnerProfile = {
      id: crypto.randomUUID(),
      ageBand,
      experience,
      locale,
      preferredFormats,
      createdAt: new Date().toISOString(),
      ...(goalComplete
        ? {
            goal: {
              id: crypto.randomUUID(),
              label: goalLabel.trim(),
              targetPaise,
              targetDate,
              currentSavingsPaise: 0,
              createdAt: new Date().toISOString(),
            },
          }
        : {}),
    };
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));
    setStep(4);
  }

  function setLanguage(nextLocale: string) {
    document.cookie = `GULLAK_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const totalSteps = 4;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background"><Sprout className="size-5" aria-hidden="true" /></span>
          {t("brand")}
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="language">{t("languageLabel")}</label>
          <select id="language" value={locale} onChange={(event) => setLanguage(event.target.value)} className="h-9 rounded-lg border bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
          <PlayMoneyBadge label={t("playMoney")} />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10 sm:py-16" aria-live="polite">
        {step < totalSteps ? (
          <div className="mb-8 flex items-center gap-3">
            <p className="shrink-0 text-sm font-medium">{t("progress", { current: step + 1, total: totalSteps })}</p>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-foreground transition-[width] duration-200" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
            </div>
          </div>
        ) : null}

        {step === 0 ? (
          <div className="max-w-xl space-y-6">
            <p className="text-sm font-medium text-muted-foreground">{t("time")}</p>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{t("welcomeTitle")}</h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">{t("welcomeDescription")}</p>
            <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{t("guardrail")}</div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            <div className="space-y-2"><h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("aboutTitle")}</h1><p className="text-muted-foreground">{t("aboutDescription")}</p></div>
            <ChoiceGroup label={t("ageLabel")} options={ageBands} selected={ageBand} onSelect={setAgeBand} optionLabel={(value) => t(`age.${value}`)} />
            <ChoiceGroup label={t("experienceLabel")} options={experienceLevels} selected={experience} onSelect={setExperience} optionLabel={(value) => t(`experience.${value}`)} />
            <p className="text-sm text-muted-foreground">{t("cashPreview", { cash: formatInr(startingCash) })}</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <div className="space-y-2"><h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("formatTitle")}</h1><p className="text-muted-foreground">{t("formatDescription")}</p></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {formats.map((format) => {
                const selected = preferredFormats.includes(format);
                return <button key={format} type="button" onClick={() => toggleFormat(format)} aria-pressed={selected} data-selected={selected} className="flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background"><span>{t(`format.${format}`)}</span>{selected ? <Check className="size-4" aria-hidden="true" /> : null}</button>;
              })}
            </div>
            <p className="text-sm text-muted-foreground">{t("formatHint")}</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-7">
            <div className="space-y-2"><h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("goalTitle")}</h1><p className="text-muted-foreground">{t("goalDescription")}</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>{t("goalNameLabel")}</span><input value={goalLabel} onChange={(event) => setGoalLabel(event.target.value)} maxLength={80} placeholder={t("goalNamePlaceholder")} className="h-11 w-full rounded-lg border bg-background px-3 font-normal outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30" /></label>
              <label className="space-y-2 text-sm font-medium"><span>{t("goalAmountLabel")}</span><input value={targetInr} onChange={(event) => setTargetInr(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder={t("goalAmountPlaceholder")} className="h-11 w-full rounded-lg border bg-background px-3 font-normal outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30" /></label>
              <label className="space-y-2 text-sm font-medium"><span>{t("goalDateLabel")}</span><input value={targetDate} onChange={(event) => setTargetDate(event.target.value)} type="date" className="h-11 w-full rounded-lg border bg-background px-3 font-normal outline-none focus:border-ring focus:ring-3 focus:ring-ring/30" /></label>
            </div>
            {goalStarted && !goalComplete ? <p className="text-sm text-destructive">{t("goalIncomplete")}</p> : null}
            <button type="button" onClick={() => { setGoalLabel(""); setTargetInr(""); setTargetDate(""); }} className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground">{t("skipGoal")}</button>
          </div>
        ) : null}

        {step === 4 ? <div className="max-w-xl space-y-6"><span className="grid size-12 place-items-center rounded-full bg-foreground text-background"><Check className="size-6" aria-hidden="true" /></span><h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t("readyTitle")}</h1><p className="text-lg leading-8 text-muted-foreground">{t("readyDescription")}</p><div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t("savedLocally")}</div></div> : null}
      </section>

      {step < totalSteps ? <footer className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 border-t pt-5"><Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ArrowLeft aria-hidden="true" />{t("back")}</Button><div className="flex items-center gap-2"><Button variant="ghost" onClick={() => complete()}>{t("skip")}</Button><Button onClick={() => step === totalSteps - 1 ? complete() : setStep((current) => current + 1)} disabled={!canContinue}>{step === totalSteps - 1 ? t("finish") : t("continue")}<ArrowRight aria-hidden="true" /></Button></div></footer> : <footer className="mx-auto flex w-full max-w-2xl border-t pt-5"><Button onClick={() => setStep(1)}>{t("reviewProfile")}</Button></footer>}
    </main>
  );
}
