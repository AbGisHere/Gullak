"use client";

import { allUnlockRules, topicWorlds } from "@gullak/content";
import { isTopicCompleted, isTopicOpen } from "@gullak/engine";
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FirstRunHint } from "@/components/help/first-run-hint";
import { TermHelp } from "@/components/help/term-help";
import { readProfile } from "@/lib/learner-state";
import { initialMastery } from "@/lib/mastery";
import { useLearnerState } from "@/lib/use-learner-state";

export type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  pillar: string;
  concepts: string[];
  playable: boolean;
};

export function LearnMap({ topics }: { topics: TopicSummary[] }) {
  const t = useTranslations("learner");
  const state = useLearnerState();
  const [profile, setProfile] = useState<ReturnType<typeof readProfile>>(null);
  useEffect(() => setProfile(readProfile()), []);
  const grade = profile?.gradeGroup ?? "grade-8-10";
  const rules = allUnlockRules.filter((rule) => rule.gradeGroups.includes(grade));
  const progress = useMemo(
    () =>
      new Map(
        rules.map((rule) => {
          const scores = state.quizAttempts
            .filter((attempt) => attempt.topicId === rule.topicId)
            .map((attempt) => attempt.score);
          return [rule.topicId, { bestQuizScore: Math.max(-1, ...scores) }];
        }),
      ),
    [rules, state.quizAttempts],
  );
  const recommendedId = rules
    .filter(
      (rule) =>
        isTopicOpen(rule, rules, progress) &&
        !isTopicCompleted(rule, progress) &&
        topics.some((topic) => topic.id === rule.topicId && topic.playable),
    )
    .reduce<string | null>((best, rule) => {
      const topic = topics.find((item) => item.id === rule.topicId);
      const masteryValues =
        topic?.concepts.map((id) => state.mastery[id] ?? initialMastery(profile?.experience ?? "none")) ?? [];
      const mastery = masteryValues.length
        ? masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length
        : 0;
      if (!best) return rule.topicId;
      const bestTopic = topics.find((item) => item.id === best);
      const bestValues =
        bestTopic?.concepts.map((id) => state.mastery[id] ?? initialMastery(profile?.experience ?? "none")) ?? [];
      const bestMastery = bestValues.length ? bestValues.reduce((sum, value) => sum + value, 0) / bestValues.length : 0;
      return mastery < bestMastery ? rule.topicId : best;
    }, null);

  return (
    <div className="space-y-9">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{t("learnTitle")}</h1>
        <p className="max-w-prose text-lg leading-7 text-muted-foreground">{t("learnDescription")}</p>
      </header>
      <FirstRunHint className="max-w-3xl" />
      {recommendedId ? (
        <section
          aria-label={t("recommendedNext")}
          className="grid gap-4 rounded-2xl bg-brand-lime p-5 text-foreground sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"
        >
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="size-4" aria-hidden="true" />
              {t("recommendedNext")}
            </p>
            <h2 className="text-2xl font-extrabold">
              {topics.find((topic) => topic.id === recommendedId)?.title ?? recommendedId}
            </h2>
            <p className="max-w-prose text-sm">
              {t("recommendationReason")} <TermHelp term="mastery" />
            </p>
          </div>
          <Link
            href={`/learn/${recommendedId}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-4 font-bold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("continueLearning")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}
      {topicWorlds.map((world) => {
        const group = rules.filter((rule) => world.topicIds.includes(rule.topicId));
        // A world with topics, none for this grade, is hidden; a world with no topics yet says so.
        if (!group.length && world.topicIds.length) return null;
        return (
          <section key={world.id} className="space-y-3" aria-labelledby={`world-${world.id}`}>
            <h2 id={`world-${world.id}`} className="border-b pb-2 text-xl font-bold">
              {t(`world.${world.id}`)}
            </h2>
            {group.length ? null : <p className="text-sm text-muted-foreground">{t("worldComing")}</p>}
            <ul className="divide-y divide-border empty:hidden">
              {group.map((rule) => {
                const topic = topics.find((item) => item.id === rule.topicId);
                const passed = isTopicCompleted(rule, progress);
                const open = isTopicOpen(rule, rules, progress);
                const status = passed ? "passed" : open ? "open" : "locked";
                return (
                  <li key={rule.topicId} className="flex min-h-[76px] items-center gap-3 py-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border bg-background"
                      aria-hidden="true"
                    >
                      {passed ? (
                        <Check className="size-4" />
                      ) : open ? (
                        <span className="size-2 rounded-full bg-brand-lime" />
                      ) : (
                        <LockKeyhole className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{topic?.title ?? rule.topicId.replaceAll("-", " ")}</h3>
                      <p className="text-sm text-muted-foreground">{topic?.summary ?? t("topicContentComing")}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                      {t(`status.${status}`)}
                    </span>
                    {open && !passed && topic?.playable ? (
                      <Link
                        className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                        href={`/learn/${rule.topicId}`}
                        aria-label={`${t("openTopic")} ${topic?.title ?? rule.topicId}`}
                      >
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
