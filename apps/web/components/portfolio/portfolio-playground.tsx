"use client";

import { MoneyDecoder, type MoneyDecoderLabels } from "@gullak/ui/components/money-decoder";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { Coins, RotateCcw, Undo2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { useId, useReducer, useState } from "react";
import { Gullu } from "../game/gullu";
import en from "./messages/en.json";
import hi from "./messages/hi.json";
import te from "./messages/te.json";
import { GOALS, goalProgress, initialPlayground, playgroundReducer } from "./playground-state";

const actionClass =
  "min-h-11 rounded-xl border border-border px-4 py-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 hover:bg-muted active:bg-muted";
const messages = { en, hi, te };
// Authored outcome fixtures, not a market calculator or forecast.
const events = ["oneDown", "bothDown", "oneUp"] as const;
const outcomes = {
  concentrated: { oneDown: 80, bothDown: 80, oneUp: 120 },
  spread: { oneDown: 90, bothDown: 80, oneUp: 110 },
};

export function PortfolioPlayground({ gradeGroup, startingPaise }: { gradeGroup?: string; startingPaise?: number }) {
  const locale = useLocale();
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ portfolioGame: messages[locale as keyof typeof messages] ?? en }}
    >
      <Playground gradeGroup={gradeGroup} startingPaise={startingPaise} />
    </NextIntlClientProvider>
  );
}

function Playground({ gradeGroup, startingPaise }: { gradeGroup?: string; startingPaise?: number }) {
  const t = useTranslations("portfolioGame");
  const locale = useLocale();
  const [state, dispatch] = useReducer(playgroundReducer, startingPaise, initialPlayground);
  const [allocation, setAllocation] = useState<"concentrated" | "spread">("concentrated");
  const [event, setEvent] = useState<(typeof events)[number]>("oneDown");
  const reducedMotion = useReducedMotion();
  const goalId = useId();
  const scenarioId = useId();
  const goal = goalProgress(state);
  const money = (paise: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-IN" : `${locale}-IN`, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  const decoderLabels: MoneyDecoderLabels = {
    badgeTitle: t("decoderBadge"),
    closeAria: t("decoderClose"),
    triggerAriaPrefix: t("decoderTrigger"),
    plainMeaning: t("decoderMeaning"),
    whyItMatters: t("decoderWhy"),
    whereYouSeeIt: t("decoderWhere"),
    realLifeExample: t("decoderExample"),
    watchOut: t("decoderWatch"),
    gotIt: t("decoderDone"),
  };
  const feedbackKey =
    state.feedback === "saved"
      ? "savedFeedback"
      : state.feedback === "spent"
        ? "spentFeedback"
        : state.feedback === "reset"
          ? "resetFeedback"
          : state.feedback;
  const olderLearner = ["grade-8-10", "grade-11-12", "8-10", "11-12"].includes(gradeGroup ?? "");
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t("title")}</h1>
        <PlayMoneyBadge label={t("virtual")} />
        <p className="max-w-prose text-base">{t("instructions")}</p>
        <p className="max-w-prose text-sm text-muted-foreground">{t("local")}</p>
      </header>
      <section
        className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 md:grid-cols-[1fr_2fr]"
        aria-labelledby={`${goalId}-jar`}
      >
        <div className="space-y-3">
          <h2 id={`${goalId}-jar`} className="text-xl font-bold">
            {t("jar")}
          </h2>
          <div
            className="relative mx-auto flex h-48 w-44 items-end justify-center overflow-hidden rounded-2xl border border-border bg-muted"
            aria-hidden="true"
          >
            <div
              className="absolute inset-x-0 bottom-0 bg-brand-lime motion-safe:transition-[height] motion-safe:duration-300"
              style={{ height: `${Math.min(100, state.savedPaise / 1000)}%` }}
            />
            <Gullu state={goal.reached ? "celebrate" : "idle"} size={104} className="relative mb-4" />
            {state.lastDepositPaise > 0 && (
              <motion.span
                key={state.depositSequence}
                initial={reducedMotion ? false : { y: -20, opacity: 1 }}
                animate={reducedMotion ? { opacity: 0 } : { y: 145, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
                className="absolute top-2 text-brand-ink"
              >
                <Coins className="size-8" />
              </motion.span>
            )}
          </div>
          <p className="text-xl font-bold tabular-nums" data-testid="jar-balance">
            {t("saved", { amount: money(state.savedPaise) })}
          </p>
          <p className="tabular-nums" data-testid="wallet-balance">
            {t("wallet", { amount: money(state.walletPaise) })}
          </p>
          <p className="tabular-nums">{t("spent", { amount: money(state.spentPaise) })}</p>
        </div>
        <div className="space-y-5">
          <fieldset className="space-y-3">
            <legend id={goalId} className="text-xl font-bold">
              {t("goals")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={state.goalId === item.id}
                  onClick={() => dispatch({ kind: "goal", goalId: item.id })}
                  className={`${actionClass} ${state.goalId === item.id ? "bg-foreground text-background border-foreground" : "bg-background"}`}
                >
                  {t("goalChoice", { name: t(item.id), amount: money(item.targetPaise) })}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="block font-semibold" htmlFor={`${goalId}-progress`}>
              {t(state.goalId)}
            </label>
            <progress
              id={`${goalId}-progress`}
              max={100}
              value={goal.percent}
              className="mt-2 h-4 w-full accent-brand-ink"
            />
            <p className="mt-2 tabular-nums" data-testid="goal-progress">
              {t("progress", { percent: goal.percent, remaining: money(goal.remainingPaise) })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000].map((amountPaise) => (
              <button
                key={amountPaise}
                type="button"
                className={`${actionClass} bg-brand-ink text-brand-paper`}
                onClick={() => dispatch({ kind: "save", amountPaise })}
              >
                <Coins className="mr-2 inline size-5" aria-hidden="true" />
                {t("deposit", { amount: money(amountPaise) })}
              </button>
            ))}
          </div>
          <button type="button" className={actionClass} onClick={() => dispatch({ kind: "spend", amountPaise: 5000 })}>
            {t("spend")}
          </button>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-20 space-y-2 rounded-xl bg-muted p-4 text-foreground"
          >
            <p>{t(feedbackKey)}</p>
            {state.feedback === "saved" &&
              Math.floor(state.savedPaise / 10000) >
                Math.floor((state.savedPaise - state.lastDepositPaise) / 10000) && (
                <p className="font-bold">{t("milestone", { amount: Math.floor(state.savedPaise / 10000) * 100 })}</p>
              )}
            {goal.reached && <p className="font-bold">{t("goalReached")}</p>}
          </div>
          <p className="max-w-prose">{t("tradeoff")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={state.history.length === 0}
              className={actionClass}
              onClick={() => dispatch({ kind: "undo" })}
            >
              <Undo2 className="mr-2 inline size-4" aria-hidden="true" />
              {t("undo")}
            </button>
            <button
              type="button"
              className={actionClass}
              onClick={() => {
                dispatch({ kind: "reset" });
                setAllocation("concentrated");
                setEvent("oneDown");
              }}
            >
              <RotateCcw className="mr-2 inline size-4" aria-hidden="true" />
              {t("reset")}
            </button>
          </div>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-bold">{t("decode")}</h2>
        <MoneyDecoder
          labels={decoderLabels}
          termData={{
            term: t("opportunity"),
            plainMeaning: t("meaning"),
            example: t("example"),
            whereYouSeeIt: [t("where")],
            whyItMattersHere: t("why"),
          }}
        />
      </section>
      {olderLearner && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby={scenarioId}>
          <h2 id={scenarioId} className="text-2xl font-bold">
            {t("scenarioTitle")}
          </h2>
          <p className="max-w-prose">{t("scenarioInstructions")}</p>
          <div className="flex flex-wrap gap-2">
            {(["concentrated", "spread"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={allocation === choice}
                onClick={() => setAllocation(choice)}
                className={`${actionClass} ${allocation === choice ? "bg-foreground text-background border-foreground" : "bg-background"}`}
              >
                {t(choice)}
              </button>
            ))}
          </div>
          <label className="block font-semibold" htmlFor={`${scenarioId}-event`}>
            {t("eventLabel")}
          </label>
          <select
            id={`${scenarioId}-event`}
            aria-describedby={`${scenarioId}-event-description`}
            className={`${actionClass} w-full bg-background`}
            value={event}
            onChange={(e) => {
              const selected = events.find((item) => item === e.target.value);
              if (selected) setEvent(selected);
            }}
          >
            {events.map((item) => (
              <option key={item} value={item}>
                {t(item)}
              </option>
            ))}
          </select>
          <p id={`${scenarioId}-event-description`} data-testid="scenario-event" className="max-w-prose">
            {t(event)}
          </p>
          <p role="status" aria-live="polite" className="text-lg font-bold tabular-nums">
            {t("scenarioResult", { value: outcomes[allocation][event] })}
          </p>
          <p className="max-w-prose">{t("scenarioLesson")}</p>
          <MoneyDecoder
            labels={decoderLabels}
            termData={{
              term: t("diversification"),
              plainMeaning: t("diversificationMeaning"),
              example: t("diversificationExample"),
              whereYouSeeIt: [],
              whyItMattersHere: t("diversificationWhy"),
            }}
          />
          <p className="max-w-prose text-sm">{t("assumptions")}</p>
        </section>
      )}
    </div>
  );
}
