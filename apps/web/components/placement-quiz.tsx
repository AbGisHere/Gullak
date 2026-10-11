"use client";

import type { LearnerProfile } from "@gullak/types";
import { cn } from "@gullak/ui/lib/utils";
import { CheckCircle2, Gauge } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StageBadge } from "@/components/stage-badge";
import { readLearnerState, saveLearnerState } from "@/lib/learner-state";
import { PLACEMENT_ROUNDS, type PlacementRound, recordPlacementRound } from "@/lib/placement";

type Phase =
  | { kind: "intro" }
  | { kind: "round"; index: number }
  | { kind: "between"; index: number }
  | { kind: "done" };

/**
 * Sign-up placement: up to N real lesson checks for the learner's class, stopping at the first one not
 * passed. Each passed round is that lesson passed, so the learner's path starts where their knowledge ends.
 */
export function PlacementQuiz({
  profile,
  rounds: allRounds,
  onClose,
}: {
  profile: LearnerProfile;
  rounds: PlacementRound[];
  onClose: () => void;
}) {
  const t = useTranslations("placement");
  const rounds = allRounds.slice(0, PLACEMENT_ROUNDS[profile.experience]);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [passed, setPassed] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  function finish(passedCount: number, skipped: boolean) {
    const state = readLearnerState();
    saveLearnerState({
      ...state,
      placement: { at: new Date().toISOString(), passed: passedCount, rounds: rounds.length, skipped },
    });
  }

  function checkRound(index: number) {
    const round = rounds[index];
    if (!round) return;
    const outcome = recordPlacementRound(readLearnerState(), round, answers, profile.experience);
    saveLearnerState(outcome.state);
    setLastScore(outcome.score);
    setAnswers({});
    window.scrollTo({ top: 0 });
    if (outcome.passed && index + 1 < rounds.length) {
      setPassed(index + 1);
      setPhase({ kind: "between", index });
      return;
    }
    const total = outcome.passed ? index + 1 : index;
    setPassed(total);
    finish(total, false);
    setPhase({ kind: "done" });
  }

  const shell = "mx-auto max-w-2xl space-y-6";

  if (phase.kind === "intro") {
    return (
      <section aria-labelledby="placement-title" className={shell}>
        <div className="space-y-3">
          <Gauge className="size-8" aria-hidden="true" />
          <h1 id="placement-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <StageBadge gradeGroup={profile.gradeGroup} />
          <p className="text-lg leading-7 text-muted-foreground">{t("intro", { rounds: rounds.length })}</p>
          <p className="text-sm text-muted-foreground">{t("roundsByLevel")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase({ kind: "round", index: 0 })}
            disabled={rounds.length === 0}
            className="min-h-12 rounded-lg bg-foreground px-6 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            {t("start")}
          </button>
          <button
            type="button"
            onClick={() => {
              finish(0, true);
              onClose();
            }}
            className="min-h-12 rounded-lg border-2 border-foreground px-6 font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("skip")}
          </button>
        </div>
      </section>
    );
  }

  if (phase.kind === "between") {
    const next = rounds[phase.index + 1];
    return (
      <section aria-labelledby="placement-between" className={shell} role="status">
        <CheckCircle2 className="size-8 text-success-ink" aria-hidden="true" />
        <h1 id="placement-between" className="text-3xl font-extrabold tracking-tight">
          {t("roundPassed", { title: rounds[phase.index]?.title ?? "" })}
        </h1>
        <p className="text-muted-foreground">
          {t("scoreLine", { score: Math.round((lastScore ?? 0) * 100) })} {t("nextUp", { title: next?.title ?? "" })}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase({ kind: "round", index: phase.index + 1 })}
            className="min-h-12 rounded-lg bg-foreground px-6 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("nextRound")}
          </button>
          <button
            type="button"
            onClick={() => {
              finish(passed, false);
              setPhase({ kind: "done" });
            }}
            className="min-h-12 rounded-lg border-2 border-foreground px-6 font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("stopHere")}
          </button>
        </div>
      </section>
    );
  }

  if (phase.kind === "done") {
    const nextTitle = rounds[passed]?.title;
    return (
      <section aria-labelledby="placement-done" className={shell} role="status">
        <h1 id="placement-done" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t(passed === 0 ? "resultFresh" : passed === rounds.length ? "resultAll" : "resultSome", { passed })}
        </h1>
        <StageBadge gradeGroup={profile.gradeGroup} />
        <p className="text-lg leading-7 text-muted-foreground">
          {passed === 0 ? t("resultFreshBody") : t("resultBody", { passed, rounds: rounds.length })}{" "}
          {nextTitle ? t("startsAt", { title: nextTitle }) : null}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="inline-flex min-h-12 items-center rounded-lg bg-foreground px-6 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("toPath")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-lg border-2 border-foreground px-6 font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("toHome")}
          </button>
        </div>
      </section>
    );
  }

  const round = rounds[phase.index];
  if (!round) return null;
  const remaining = round.quiz.questions.length - Object.keys(answers).length;
  return (
    <section aria-labelledby="placement-round" className={shell}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          {t("roundOf", { round: phase.index + 1, rounds: rounds.length })}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {rounds.map((r, i) => (
            <span
              key={r.topicId}
              className={cn("h-1.5 flex-1 rounded-full", i <= phase.index ? "bg-foreground" : "bg-muted")}
            />
          ))}
        </div>
        <h1 id="placement-round" className="text-3xl font-extrabold tracking-tight">
          {round.title}
        </h1>
      </div>
      {round.quiz.questions.map((question, index) => (
        <fieldset key={question.id} className="space-y-3">
          <legend className="text-base font-semibold">
            {index + 1}. {question.prompt}
          </legend>
          <div className="grid gap-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 has-[:checked]:border-foreground has-[:checked]:bg-muted"
              >
                <input
                  type="radio"
                  name={`placement-${question.id}`}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                  className="size-4 accent-foreground"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => checkRound(phase.index)}
          disabled={remaining > 0}
          className="min-h-12 rounded-lg bg-foreground px-6 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("checkRound")}
        </button>
        {remaining > 0 ? <p className="text-sm text-muted-foreground">{t("answerAll", { remaining })}</p> : null}
      </div>
    </section>
  );
}
