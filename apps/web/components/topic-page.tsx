"use client";

import { topicWorlds } from "@gullak/content";
import { gradeQuiz, variantsForGrade } from "@gullak/engine";
import type { GradeGroup, Topic, UnlockRule } from "@gullak/types";
import { TopicLesson, type TopicLessonLabels } from "@gullak/ui/components/topic-lesson";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TermHelp } from "@/components/help/term-help";
import { STAGE_TONE, StageBadge } from "@/components/stage-badge";
import { restoreQuizDraft } from "@/lib/form-safety";
import { readLearnerState, readProfile, saveLearnerState } from "@/lib/learner-state";
import { DEFAULT_MASTERY_PARAMS, initialMastery, updateMastery } from "@/lib/mastery";
import { topicToLesson } from "@/lib/topic-adapter";
import { useLearnerState } from "@/lib/use-learner-state";

interface QuizSession {
  answers: Record<string, string>;
  result: { score: number; passed: boolean } | null;
  saveFailed: boolean;
}

const emptyQuizSession: QuizSession = { answers: {}, result: null, saveFailed: false };

export function TopicPage({ topic, rule }: { topic: Topic; rule: UnlockRule }) {
  const t = useTranslations("learner");
  const tQuiz = useTranslations("safety.quiz");
  const tStage = useTranslations("stage");
  const tGrade = useTranslations("onboarding.grade");
  const state = useLearnerState();
  const [quizSessions, setQuizSessions] = useState<Record<string, QuizSession>>({});
  const [previewGrade, setPreviewGrade] = useState<GradeGroup | null>(null);
  const [profile, setProfile] = useState<ReturnType<typeof readProfile>>(null);
  const [profileRead, setProfileRead] = useState(false);
  const gradeGroup = profile?.gradeGroup ?? "grade-8-10";
  const shownGrade = previewGrade ?? gradeGroup;
  const isPreview = shownGrade !== gradeGroup;
  const quiz = profileRead
    ? variantsForGrade(topic.content.variants, shownGrade).find((variant) => variant.format === "quiz")
    : undefined;
  const sessionKey = `${topic.meta.id}:${shownGrade}:${quiz?.id ?? ""}`;
  const { answers, result, saveFailed } = quizSessions[sessionKey] ?? emptyQuizSession;
  function changeQuizSession(change: (current: QuizSession) => QuizSession) {
    setQuizSessions((current) => ({
      ...current,
      [sessionKey]: change(current[sessionKey] ?? emptyQuizSession),
    }));
  }
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!result) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }, [result]);
  useEffect(() => {
    setProfile(readProfile());
    setProfileRead(true);
  }, []);
  const tailored = topic.content.variants.some((variant) => variant.audience !== undefined);
  // Preserve existing own-class drafts; comparison drafts must never share their key.
  const draftKey = `gullak-quiz-draft:${topic.meta.id}:${quiz?.id ?? ""}${isPreview ? `:preview:${shownGrade}` : ""}`;
  // Keep unchecked answers for this tab session, so a reload or a stray tap on the nav loses nothing.
  useEffect(() => {
    if (!quiz) return;
    let restored: Record<string, string> = {};
    try {
      restored = restoreQuizDraft(window.sessionStorage.getItem(draftKey), quiz.questions);
    } catch {
      // Storage blocked: start with an empty quiz.
    }
    setQuizSessions((current) =>
      current[sessionKey]
        ? current
        : {
            ...current,
            [sessionKey]: { ...emptyQuizSession, answers: restored },
          },
    );
  }, [draftKey, quiz, sessionKey]);
  function chooseAnswer(questionId: string, optionId: string) {
    const next = { ...answers, [questionId]: optionId };
    changeQuizSession(() => ({ answers: next, result: null, saveFailed: false }));
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      // Storage blocked: answers still live in memory for this visit.
    }
  }
  const lesson = topicToLesson(topic, shownGrade);
  const world = topicWorlds.find((item) => item.topicIds.includes(rule.topicId));
  function submitQuiz() {
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) return;
    const score = gradeQuiz(quiz, {
      variantId: quiz.id,
      answers: quiz.questions.map((question) => ({ questionId: question.id, optionId: answers[question.id] ?? "" })),
    });
    const passed = score >= rule.passMark;
    if (isPreview) {
      changeQuizSession((current) => ({ ...current, result: { score, passed }, saveFailed: false }));
      return;
    }
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
    const saved = saveLearnerState({
      ...next,
      mastery,
      passedTopics: passed ? [...new Set([...next.passedTopics, topic.meta.id])] : next.passedTopics,
      quizAttempts: [...next.quizAttempts, { topicId: topic.meta.id, score, at: new Date().toISOString() }],
    });
    changeQuizSession((current) => ({ ...current, result: { score, passed }, saveFailed: !saved }));
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
        {profileRead ? <StageBadge gradeGroup={gradeGroup} /> : null}
      </header>
      {profileRead && tailored && rule.gradeGroups.length > 1 ? (
        <section aria-labelledby="class-compare" className="space-y-2 rounded-2xl border p-4">
          <h2 id="class-compare" className="text-sm font-bold">
            {tStage("compareLabel")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {rule.gradeGroups.map((grade) => (
              <button
                key={grade}
                type="button"
                aria-pressed={shownGrade === grade}
                onClick={() => setPreviewGrade(grade === gradeGroup ? null : grade)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-foreground aria-pressed:bg-muted"
              >
                <span aria-hidden="true" className={`size-2.5 rounded-full ${STAGE_TONE[grade]}`} />
                {grade === gradeGroup
                  ? tStage("yours", { grade: tGrade(grade) })
                  : tStage("option", { stage: tStage(`name.${grade}`), grade: tGrade(grade) })}
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {previewGrade
              ? tStage("previewing", { grade: tGrade(previewGrade), own: tGrade(gradeGroup) })
              : tStage("compareHint")}
          </p>
        </section>
      ) : null}
      <section aria-label={t("lessonSection")} key={shownGrade}>
        <TopicLesson lesson={lesson} labels={lessonLabels} hideTitle />
      </section>
      {quiz ? (
        <section className="space-y-5 border-t pt-7" aria-labelledby="quiz-title">
          <div>
            <h2 id="quiz-title" className="text-2xl font-bold">
              {t("quizTitle")}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {isPreview ? (
                tStage("practiceOnly")
              ) : (
                <>
                  {t("quizInstruction")} <TermHelp term="mastery" />
                </>
              )}
            </p>
          </div>
          {quiz.questions.map((question, index) => (
            <fieldset key={question.id} className="space-y-3">
              <legend className="text-base font-semibold">
                {index + 1}. {question.prompt}
              </legend>
              <div className="grid gap-2">
                {question.options.map((option) => {
                  const correct = result && option.id === question.correctOptionId;
                  const incorrect = result && answers[question.id] === option.id && !correct;
                  return (
                    <label
                      key={option.id}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                        correct
                          ? "border-brand-ink bg-brand-lime text-brand-ink dark:text-brand-on-accent"
                          : incorrect
                            ? "border-brand-ink bg-brand-coral text-brand-ink dark:text-brand-on-accent"
                            : "has-[:checked]:border-foreground has-[:checked]:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => chooseAnswer(question.id, option.id)}
                        aria-describedby={result ? `quiz-feedback-${question.id}` : undefined}
                        className="size-4 accent-current"
                      />
                      <span className="flex-1">{option.text}</span>
                      {correct ? <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" /> : null}
                      {incorrect ? <XCircle aria-hidden="true" className="size-5 shrink-0" /> : null}
                    </label>
                  );
                })}
              </div>
              {result ? (
                <div id={`quiz-feedback-${question.id}`} className="space-y-2 rounded-xl bg-muted p-4">
                  <p className="flex items-center gap-2 font-semibold">
                    {answers[question.id] === question.correctOptionId ? (
                      <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
                    ) : (
                      <XCircle aria-hidden="true" className="size-5 shrink-0" />
                    )}
                    {t(answers[question.id] === question.correctOptionId ? "answerCorrect" : "answerIncorrect")}
                  </p>
                  {answers[question.id] !== question.correctOptionId ? (
                    <p>
                      {t("correctAnswer", {
                        answer: question.options.find((option) => option.id === question.correctOptionId)?.text ?? "",
                      })}
                    </p>
                  ) : null}
                  <p className="text-base leading-7">
                    <span className="font-semibold">{t("answerReason")} </span>
                    {question.explanation}
                  </p>
                </div>
              ) : null}
            </fieldset>
          ))}
          <button
            type="button"
            onClick={submitQuiz}
            disabled={remaining > 0 || result !== null}
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
            <div
              ref={resultRef}
              role="status"
              tabIndex={-1}
              aria-label={t("quizResults")}
              className="scroll-mt-24 space-y-4 rounded-xl bg-muted p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <p className="flex items-center gap-2 font-bold">
                {result.passed && !isPreview ? <CheckCircle2 className="size-5" aria-hidden="true" /> : null}
                {isPreview
                  ? tStage("practiceScore", { score: Math.round(result.score * 100) })
                  : result.passed
                    ? t("quizPassed", { score: Math.round(result.score * 100) })
                    : t("quizRetry", { score: Math.round(result.score * 100), mark: Math.round(rule.passMark * 100) })}
              </p>
              {!isPreview ? (
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
              ) : null}
              {result.passed && !saveFailed && !isPreview ? (
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
