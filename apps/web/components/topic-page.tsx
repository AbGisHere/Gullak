"use client";

import { topicWorlds } from "@gullak/content";
import { gradeQuiz } from "@gullak/engine";
import type { Topic, UnlockRule } from "@gullak/types";
import { TopicLesson, type TopicLessonLabels } from "@gullak/ui/components/topic-lesson";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TermHelp } from "@/components/help/term-help";
import { restoreQuizDraft } from "@/lib/form-safety";
import { readLearnerState, readProfile, saveLearnerState } from "@/lib/learner-state";
import { DEFAULT_MASTERY_PARAMS, initialMastery, updateMastery } from "@/lib/mastery";
import { topicToLesson } from "@/lib/topic-adapter";
import { useLearnerState } from "@/lib/use-learner-state";

export function TopicPage({ topic, rule }: { topic: Topic; rule: UnlockRule }) {
  const t = useTranslations("learner");
  const tQuiz = useTranslations("safety.quiz");
  const state = useLearnerState();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const quiz = topic.content.variants.find((variant) => variant.format === "quiz");
  const draftKey = `gullak-quiz-draft:${topic.meta.id}`;
  // Keep unchecked answers for this tab session, so a reload or a stray tap on the nav loses nothing.
  useEffect(() => {
    if (!quiz) return;
    try {
      setAnswers(restoreQuizDraft(window.sessionStorage.getItem(draftKey), quiz.questions));
    } catch {
      // Storage blocked: start with an empty quiz.
    }
  }, [draftKey, quiz]);
  function chooseAnswer(questionId: string, optionId: string) {
    setAnswers((current) => {
      const next = { ...current, [questionId]: optionId };
      try {
        window.sessionStorage.setItem(draftKey, JSON.stringify(next));
      } catch {
        // Storage blocked: answers still live in memory for this visit.
      }
      return next;
    });
  }
  const [profile, setProfile] = useState<ReturnType<typeof readProfile>>(null);
  useEffect(() => setProfile(readProfile()), []);
  const gradeGroup = profile?.gradeGroup ?? "grade-8-10";
  const lesson = topicToLesson(topic, gradeGroup);
  const world = topicWorlds.find((item) => item.topicIds.includes(rule.topicId));
  function submitQuiz() {
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) return;
    const score = gradeQuiz(quiz, {
      variantId: quiz.id,
      answers: quiz.questions.map((question) => ({ questionId: question.id, optionId: answers[question.id] ?? "" })),
    });
    const next = readLearnerState();
    const mastery = { ...next.mastery };
    quiz.questions.forEach((question) => {
      const current = mastery[question.conceptId] ?? initialMastery(profile?.experience ?? "none");
      mastery[question.conceptId] = updateMastery(
        current,
        answers[question.id] === question.correctOptionId,
        DEFAULT_MASTERY_PARAMS,
      );
    });
    const passed = score >= rule.passMark;
    const saved = saveLearnerState({
      ...next,
      mastery,
      passedTopics: passed ? [...new Set([...next.passedTopics, topic.meta.id])] : next.passedTopics,
      quizAttempts: [...next.quizAttempts, { topicId: topic.meta.id, score, at: new Date().toISOString() }],
    });
    setResult({ score, passed });
    setSaveFailed(!saved);
    if (saved) {
      try {
        window.sessionStorage.removeItem(draftKey);
      } catch {
        // Nothing to clear.
      }
    }
  }
  const remaining = quiz ? quiz.questions.length - Object.keys(answers).length : 0;
  const lessonLabels: Partial<TopicLessonLabels> = {
    pillars: {
      "plan-budget": t("pillar.plan-and-budget"),
      "save-manage": t("pillar.save-and-manage"),
      "understand-investing": t("pillar.understand-investing"),
      "stay-safe": t("pillar.stay-safe"),
    },
    stepOf: (current, total) => t("stepOf", { current, total }),
    theHook: t("lesson.theHook"),
    whatYoullExplore: t("lesson.whatYoullExplore"),
    estimatedTime: (minutes) => t("lesson.estimatedTime", { minutes }),
    previous: t("lesson.previous"),
    continueAction: t("lesson.continue"),
    finishLesson: t("lesson.finish"),
    lessonCompleted: t("lesson.completed"),
  };
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/learn"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("backToLearn")}
      </Link>
      <header className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          {world ? t(`world.${world.id}`) : t(`pillar.${rule.pillar}`)}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{topic.content.title}</h1>
        <p className="text-lg leading-7 text-muted-foreground">{topic.content.summary}</p>
      </header>
      <section aria-label={t("lessonSection")}>
        <TopicLesson lesson={lesson} labels={lessonLabels} hideTitle />
      </section>
      {quiz ? (
        <section className="space-y-5 border-t pt-7" aria-labelledby="quiz-title">
          <div>
            <h2 id="quiz-title" className="text-2xl font-bold">
              {t("quizTitle")}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {t("quizInstruction")} <TermHelp term="mastery" />
            </p>
          </div>
          {quiz.questions.map((question, index) => (
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
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => chooseAnswer(question.id, option.id)}
                      className="size-4 accent-foreground"
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            onClick={submitQuiz}
            disabled={remaining > 0}
            aria-describedby={remaining > 0 ? "quiz-remaining" : undefined}
            className="min-h-12 rounded-lg bg-foreground px-5 font-bold text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("submitQuiz")}
          </button>
          {remaining > 0 ? (
            <p id="quiz-remaining" className="text-sm text-muted-foreground">
              {tQuiz("answerAll", { remaining })}
            </p>
          ) : null}
          {saveFailed ? (
            <div role="alert" className="space-y-3 rounded-xl border-2 border-destructive p-4">
              <p className="text-sm font-medium">{tQuiz("saveFailed")}</p>
              <button
                type="button"
                onClick={submitQuiz}
                className="min-h-11 rounded-lg border-2 border-foreground px-4 text-sm font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {tQuiz("retrySave")}
              </button>
            </div>
          ) : null}
          {result ? (
            <div role="status" className="space-y-4 rounded-xl bg-muted p-4">
              <p className="flex items-center gap-2 font-bold">
                {result.passed ? <CheckCircle2 className="size-5" aria-hidden="true" /> : null}
                {result.passed
                  ? t("quizPassed", { score: Math.round(result.score * 100) })
                  : t("quizRetry", { score: Math.round(result.score * 100), mark: Math.round(rule.passMark * 100) })}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {topic.meta.concepts.map((concept) => {
                  const value = state.mastery[concept.id] ?? initialMastery(profile?.experience ?? "none");
                  return (
                    <div key={concept.id}>
                      <div className="mb-1 flex justify-between gap-2 text-sm">
                        <span>
                          {t("masteryLabel")} · {concept.label}
                        </span>
                        <span>{Math.round(value * 100)}%</span>
                      </div>
                      <progress
                        className="h-2 w-full accent-foreground"
                        value={value}
                        max={1}
                        aria-label={`${concept.label} ${Math.round(value * 100)}%`}
                      />
                    </div>
                  );
                })}
              </div>
              {result.passed && !saveFailed ? (
                <Link
                  href="/learn"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
                >
                  {t("newTopicsUnlocked")}
                  <ArrowLeft className="size-4 rotate-180" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
