"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { Award, CheckCircle2, Home, Lock, ShieldCheck, ShoppingBag, Wallet } from "lucide-react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { useId, useLayoutEffect, useReducer, useRef, useState } from "react";
import { ConfirmDialog } from "../confirm-dialog";
import en from "./messages/en.json";
import hi from "./messages/hi.json";
import te from "./messages/te.json";
import { initialQuests, QUESTS, type QuestId, questHasProgress, questReducer, questUnlocked } from "./quest-state";

const messages = { en, hi, te };
const icons = { sort: ShoppingBag, scam: ShieldCheck, budget: Wallet, compare: ShoppingBag };
const buttonClass =
  "min-h-11 rounded-xl border border-border px-4 py-3 text-base font-semibold hover:bg-muted active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50";

type ResetCopy = { title: string; description: string; confirm: string; cancel: string };

export function QuestBoard() {
  const locale = useLocale();
  // Read app-level strings here: the nested provider below only carries this game's messages.
  const tSafety = useTranslations("safety");
  const resetCopy: ResetCopy = {
    title: tSafety("resetQuests.title"),
    description: tSafety("resetQuests.description"),
    confirm: tSafety("resetQuests.confirm"),
    cancel: tSafety("resetQuests.cancel"),
  };
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ missionsGame: messages[locale as keyof typeof messages] ?? en }}
    >
      <Board resetCopy={resetCopy} />
    </NextIntlClientProvider>
  );
}

function Board({ resetCopy }: { resetCopy: ResetCopy }) {
  const t = useTranslations("missionsGame");
  const [state, dispatch] = useReducer(questReducer, undefined, initialQuests);
  const [activeId, setActiveId] = useState<QuestId | null>(null);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const boardHeadingRef = useRef<HTMLHeadingElement>(null);
  const launchers = useRef<Partial<Record<QuestId, HTMLButtonElement | null>>>({});
  const activityId = useId();
  const quest = QUESTS.find((item) => item.id === activeId);
  const feedback = state.feedback?.questId === activeId ? state.feedback : null;
  const step = quest?.steps[state.progress[quest.id]];
  const displayedStep = quest?.steps.find((item) => item.id === feedback?.stepId);
  const completedCount = QUESTS.filter((item) => state.progress[item.id] === item.steps.length).length;
  useLayoutEffect(() => {
    if (!activeId) return;
    if (awaitingContinue) feedbackRef.current?.focus();
    else headingRef.current?.focus();
  }, [activeId, awaitingContinue]);

  function close() {
    const previous = activeId;
    setActiveId(null);
    setAwaitingContinue(false);
    setSelected(null);
    const launcher = previous ? launchers.current[previous] : null;
    if (launcher && !launcher.disabled) launcher.focus();
    else boardHeadingRef.current?.focus();
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <header className="space-y-3">
        <h1
          ref={boardHeadingRef}
          tabIndex={-1}
          className="text-3xl font-extrabold tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-ring sm:text-4xl"
        >
          {t("title")}
        </h1>
        <PlayMoneyBadge label={t("virtual")} />
        <p className="max-w-prose">{t("instructions")}</p>
        <p className="max-w-prose text-sm text-muted-foreground">{t("local")}</p>
        <p className="text-lg font-bold tabular-nums" data-testid="practice-xp">
          {t("xp", { xp: state.xp })}
        </p>
        <p className="flex items-center gap-2">
          <Award aria-hidden="true" className="size-5" />
          {t(completedCount >= 2 ? "cosmetic" : "cosmeticLocked")}
        </p>
      </header>
      <section aria-label={t("daily")} className="grid gap-4 sm:grid-cols-2">
        {QUESTS.map((item) => {
          const Icon = icons[item.id];
          const done = state.progress[item.id] === item.steps.length;
          const unlocked = questUnlocked(state, item);
          return (
            <article
              key={item.id}
              className={`flex flex-col gap-3 rounded-2xl border border-border p-5 ${done ? "bg-muted" : "bg-card"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon aria-hidden="true" className="size-7" />
                <span className="text-sm font-semibold">
                  {t(item.difficulty)} · {t("reward", { xp: item.xp })}
                </span>
              </div>
              <h2 className="text-xl font-bold">{t(`${item.id}.title`)}</h2>
              <p>{t(`${item.id}.objective`)}</p>
              <p className="flex items-center gap-2 font-semibold">
                {done ? (
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                ) : !unlocked ? (
                  <Lock aria-hidden="true" className="size-5" />
                ) : null}
                {done ? t("done") : unlocked ? t("open") : t("locked", { quest: t(`${item.prerequisite}.title`) })}
              </p>
              <progress
                aria-label={t(`${item.id}.title`)}
                max={item.steps.length}
                value={state.progress[item.id]}
                className="h-3 w-full accent-brand-ink"
              />
              <p className="text-sm tabular-nums">
                {t("progress", { done: state.progress[item.id], total: item.steps.length })}
              </p>
              <button
                ref={(element) => {
                  launchers.current[item.id] = element;
                }}
                type="button"
                disabled={!unlocked || done}
                aria-expanded={activeId === item.id}
                aria-controls={activeId === item.id ? activityId : undefined}
                className={`${buttonClass} mt-auto bg-brand-ink text-brand-paper`}
                onClick={() => {
                  setActiveId(item.id);
                  setAwaitingContinue(false);
                  setSelected(null);
                  setResetNotice(false);
                }}
              >
                {done ? t("done") : t(state.progress[item.id] > 0 ? "continue" : "start")}
              </button>
            </article>
          );
        })}
      </section>
      {quest && (
        <section
          id={activityId}
          aria-labelledby={`${activityId}-title`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2
            id={`${activityId}-title`}
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t(`${quest.id}.title`)}
          </h2>
          <p>{t("choose")}</p>
          {step && !awaitingContinue && (
            <fieldset className="space-y-4">
              <legend className="max-w-prose text-lg font-semibold">{t(`${quest.id}.${step.id}`)}</legend>
              <div className="mt-3 flex flex-col gap-2">
                {step.options.map((choice) => (
                  <button
                    key={`${step.id}-${choice}`}
                    type="button"
                    aria-pressed={selected === choice}
                    className={`${buttonClass} text-left ${selected === choice ? "bg-foreground text-background border-foreground" : "bg-background"}`}
                    onClick={() => {
                      setSelected(choice);
                      dispatch({ type: "answer", questId: quest.id, stepId: step.id, choice });
                      setAwaitingContinue(true);
                    }}
                  >
                    {t(`${quest.id}.${choice}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {awaitingContinue && feedback && displayedStep && (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              className="space-y-3 rounded-xl bg-muted p-4 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <p className="font-bold">{t(feedback.correct ? "correct" : "incorrect")}</p>
              <p>{t(`${quest.id}.${displayedStep.id}Why`)}</p>
              {state.progress[quest.id] === quest.steps.length ? (
                <p className="font-bold">{t("completed")}</p>
              ) : (
                <button
                  type="button"
                  className={`${buttonClass} bg-background`}
                  onClick={() => {
                    setAwaitingContinue(false);
                    setSelected(null);
                  }}
                >
                  {t(feedback.correct ? "next" : "retry")}
                </button>
              )}
            </div>
          )}
          <button type="button" className={buttonClass} onClick={close}>
            {t("close")}
          </button>
        </section>
      )}
      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Home aria-hidden="true" className="size-6" />
          {t("familyTitle")}
        </h2>
        <p className="max-w-prose">{t("familyInstructions")}</p>
        <p className="max-w-prose text-sm">{t("familySkip")}</p>
        <button
          type="button"
          disabled={state.familyDone}
          className={buttonClass}
          onClick={() => {
            dispatch({ type: "family" });
            setResetNotice(false);
          }}
        >
          {t(state.familyDone ? "familyDone" : "familyCheck")}
        </button>
        <p role="status" aria-live="polite">
          {state.familyDone ? t("familyDone") : ""}
        </p>
      </section>
      <button
        type="button"
        className={buttonClass}
        onClick={() => (questHasProgress(state) ? setConfirmingReset(true) : setResetNotice(true))}
      >
        {t("reset")}
      </button>
      {confirmingReset ? (
        <ConfirmDialog
          title={resetCopy.title}
          description={resetCopy.description}
          confirmLabel={resetCopy.confirm}
          cancelLabel={resetCopy.cancel}
          onConfirm={() => {
            setConfirmingReset(false);
            dispatch({ type: "reset" });
            setActiveId(null);
            setAwaitingContinue(false);
            setSelected(null);
            setResetNotice(true);
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : null}
      <p role="status" aria-live="polite">
        {resetNotice ? t("resetDone") : ""}
      </p>
    </div>
  );
}
