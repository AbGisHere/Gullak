"use client";

import { allUnlockRules, topicWorlds } from "@gullak/content";
import { isTopicCompleted, isTopicOpen } from "@gullak/engine";
import type { LearnerProfile } from "@gullak/types";
import { ArrowRight, Check, Store } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FirstRunHint } from "@/components/help/first-run-hint";
import { TermHelp } from "@/components/help/term-help";
import { RecommendationCard } from "@/components/recommendation-card";
import { readProfile } from "@/lib/learner-state";
import { useLearnerState } from "@/lib/use-learner-state";

export type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  pillar: string;
  concepts: string[];
  playable: boolean;
};

type LearnMapProps = {
  topics: TopicSummary[];
  profile?: LearnerProfile;
  gradeGroup?: string;
  onLaunchLesson?: (topicId: string) => void;
};

export function LearnMap({ topics, profile: suppliedProfile, gradeGroup, onLaunchLesson }: LearnMapProps) {
  const t = useTranslations("lane");
  const learner = useTranslations("learner");
  const state = useLearnerState();
  const [storedProfile, setStoredProfile] = useState<ReturnType<typeof readProfile>>(null);
  useEffect(() => setStoredProfile(readProfile()), []);
  const profile = suppliedProfile ?? storedProfile;
  const grade = gradeGroup ?? profile?.gradeGroup ?? "grade-8-10";
  const rules = useMemo(
    () => allUnlockRules.filter((rule) => rule.gradeGroups.some((group) => group === grade)),
    [grade],
  );
  const progress = useMemo(
    () =>
      new Map(
        rules.map((rule) => [
          rule.topicId,
          {
            bestQuizScore: Math.max(
              -1,
              ...state.quizAttempts
                .filter((attempt) => attempt.topicId === rule.topicId)
                .map((attempt) => attempt.score),
            ),
          },
        ]),
      ),
    [rules, state.quizAttempts],
  );
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  return (
    <div className="space-y-10">
      {profile ? <RecommendationCard topics={topics} profile={profile} /> : null}
      <section aria-labelledby="lane-title" className="space-y-7">
        <header className="max-w-2xl space-y-3">
          <h1 id="lane-title" className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {t("description")} <TermHelp term="mastery" />
          </p>
        </header>
        <FirstRunHint className="max-w-3xl" />
        <ol className="relative space-y-7 before:absolute before:bottom-8 before:left-1 before:top-8 before:w-6 before:rounded-full before:bg-muted after:absolute after:bottom-8 after:left-4 after:top-8 after:border-l after:border-dashed after:border-border sm:before:left-3 sm:after:left-6">
          {topicWorlds.map((world) => {
            const group = rules.filter((rule) => world.topicIds.includes(rule.topicId));
            if (!group.length && world.topicIds.length) return null;
            const visited = group.length > 0 && group.every((rule) => isTopicCompleted(rule, progress));
            const open = group.some(
              (rule) => isTopicOpen(rule, rules, progress) && topicById.get(rule.topicId)?.playable,
            );
            return (
              <li key={world.id} className="relative pl-12 sm:pl-16">
                <span
                  className="absolute left-0 top-8 z-10 grid size-8 place-items-center rounded-full border border-border bg-background sm:left-2"
                  aria-hidden="true"
                >
                  {visited ? <Check className="size-4" /> : <Store className="size-4" />}
                </span>
                <section
                  aria-labelledby={`world-${world.id}`}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <header
                    className={
                      open || visited
                        ? "border-b border-border bg-brand-lime px-4 py-5 sm:px-6"
                        : "border-b border-border bg-muted px-4 py-5 sm:px-6"
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2
                        id={`world-${world.id}`}
                        className="text-xl font-extrabold tracking-tight text-brand-ink sm:text-2xl"
                      >
                        {learner(`world.${world.id}`)}
                      </h2>
                      <p className="text-sm font-semibold text-brand-ink">
                        {t(visited ? "shopVisited" : open ? "shopOpen" : group.length ? "shopLater" : "coming")}
                      </p>
                    </div>
                  </header>
                  <div aria-hidden="true" className="flex h-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((panel) => (
                      <span
                        key={panel}
                        className={`flex-1 rounded-b-md ${panel % 2 ? "bg-muted" : open || visited ? "bg-brand-lime" : "bg-border"}`}
                      />
                    ))}
                  </div>
                  {group.length ? (
                    <ul className="divide-y divide-border px-4 sm:px-6">
                      {group.map((rule) => {
                        const topic = topicById.get(rule.topicId);
                        const passed = isTopicCompleted(rule, progress);
                        const available = isTopicOpen(rule, rules, progress);
                        const canEnter = available && topic?.playable;
                        const prerequisites = rule.requiresTopicIds
                          .filter((id) => {
                            const prerequisite = rules.find((item) => item.topicId === id);
                            return prerequisite && !isTopicCompleted(prerequisite, progress);
                          })
                          .map((id) => topicById.get(id)?.title ?? id.replaceAll("-", " "))
                          .join(", ");
                        const action = (
                          <>
                            {t(passed ? "review" : "enter")}
                            <ArrowRight aria-hidden="true" className="size-4" />
                          </>
                        );
                        const actionClass =
                          "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-ink px-4 text-sm font-bold text-brand-paper hover:bg-brand-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
                        return (
                          <li
                            key={rule.topicId}
                            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                          >
                            <div className="min-w-0 max-w-prose space-y-1.5">
                              <h3 className="flex items-start gap-2 font-bold">
                                {passed ? <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : null}
                                {topic?.title ?? rule.topicId.replaceAll("-", " ")}
                              </h3>
                              <p className="text-base leading-6 text-muted-foreground">
                                {topic?.summary ?? learner("topicContentComing")}
                              </p>
                              {!available ? (
                                <p className="text-sm leading-6 text-muted-foreground">
                                  {t("opensAfter", { topics: prerequisites })}
                                </p>
                              ) : null}
                              {available && !topic?.playable ? (
                                <p className="text-sm text-muted-foreground">{t("coming")}</p>
                              ) : null}
                            </div>
                            {canEnter ? (
                              onLaunchLesson ? (
                                <button
                                  type="button"
                                  className={actionClass}
                                  onClick={() => onLaunchLesson(rule.topicId)}
                                  aria-label={`${t(passed ? "review" : "enter")}: ${topic.title}`}
                                >
                                  {action}
                                </button>
                              ) : (
                                <Link
                                  className={actionClass}
                                  href={`/learn/${rule.topicId}`}
                                  aria-label={`${t(passed ? "review" : "enter")}: ${topic.title}`}
                                >
                                  {action}
                                </Link>
                              )
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-4 py-5 text-base text-muted-foreground sm:px-6">{learner("worldComing")}</p>
                  )}
                </section>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
