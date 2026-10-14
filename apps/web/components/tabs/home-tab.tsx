"use client";

import type { LearnerProfile } from "@gullak/types";
import { ArrowRight, Award, BookOpen, CalendarDays, Compass, Gauge, PiggyBank } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { FirstRunHint } from "@/components/help/first-run-hint";
import type { TopicSummary } from "@/components/learn-map";
import { RecommendationCard } from "@/components/recommendation-card";
import { StageBadge } from "@/components/stage-badge";
import type { LearnerState } from "@/lib/learner-state";

interface HomeTabProps {
  placement: LearnerState["placement"];
  onStartPlacement: () => void;
  onLaunchShopping: () => void;
  profile: LearnerProfile;
  topics: TopicSummary[];
  daysPractised: number;
  onNavigateToTab: (tab: "home" | "twin" | "learn" | "gullu" | "rewards") => void;
  onLaunchActivity: (activityType: "lesson" | "spot-and-sort" | "simulation" | "rewind") => void;
}

export function HomeTab({
  placement,
  onStartPlacement,
  profile,
  topics,
  daysPractised,
  onNavigateToTab,
  onLaunchActivity,
  onLaunchShopping,
}: HomeTabProps) {
  const t = useTranslations("nextLearning");
  const dashboard = useTranslations("dashboard");
  const tPlacement = useTranslations("placement");
  const taken = placement && !placement.skipped;
  const placementCard = useRef<HTMLElement>(null);
  return (
    <div className="max-w-5xl space-y-8">
      <FirstRunHint
        key={profile.id}
        learnerId={profile.id}
        onDismiss={() => placementCard.current?.querySelector<HTMLButtonElement>("button")?.focus()}
      />
      <section
        ref={placementCard}
        aria-labelledby="placement-card"
        data-testid="placement-card"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-foreground p-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <Gauge className="mt-1 size-6 shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            <h2 id="placement-card" className="text-xl font-bold">
              {taken
                ? tPlacement("cardDone", { passed: placement.passed, rounds: placement.rounds })
                : tPlacement("cardTitle")}
            </h2>
            <StageBadge gradeGroup={profile.gradeGroup} />
            <p className="text-muted-foreground">{taken ? tPlacement("cardDoneBody") : tPlacement("cardBody")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStartPlacement}
          className={
            taken
              ? "min-h-12 rounded-lg border-2 border-foreground px-5 font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              : "min-h-12 rounded-lg bg-foreground px-5 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          }
        >
          {taken ? tPlacement("retake") : tPlacement("start")}
        </button>
      </section>
      <RecommendationCard topics={topics} profile={profile} />
      <div className="flex items-start gap-3 border-b border-brand-ink/20 pb-6">
        <CalendarDays aria-hidden="true" className="mt-1 size-5 shrink-0" />
        <div>
          <p className="font-semibold">{dashboard("daysPractised", { days: daysPractised })}</p>
          <p className="mt-1 text-base text-muted-foreground">{t("practiceCount")}</p>
        </div>
      </div>
      <section aria-labelledby="explore-title">
        <h2 id="explore-title" className="text-2xl font-bold">
          {t("explore")}
        </h2>
        <div className="mt-4 divide-y divide-brand-ink/20">
          {[
            { title: t("shopping"), description: t("shoppingDescription"), icon: BookOpen, action: onLaunchShopping },
            {
              title: t("lane"),
              description: t("laneDescription"),
              icon: BookOpen,
              action: () => onNavigateToTab("learn"),
            },
            {
              title: t("story"),
              description: t("storyDescription"),
              icon: Compass,
              action: () => onNavigateToTab("twin"),
            },
            {
              title: t("gullak"),
              description: t("gullakDescription"),
              icon: PiggyBank,
              action: () => onNavigateToTab("gullu"),
            },
            {
              title: t("rewards"),
              description: t("rewardsDescription"),
              icon: Award,
              action: () => onNavigateToTab("rewards"),
            },
            {
              title: t("drill"),
              description: t("drillDescription"),
              icon: CalendarDays,
              action: () => onLaunchActivity("spot-and-sort"),
            },
          ].map(({ title, description, icon: Icon, action }) => (
            <button
              key={title}
              type="button"
              onClick={action}
              className="flex min-h-20 w-full items-center gap-4 py-4 text-left hover:bg-brand-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon aria-hidden="true" className="size-6 shrink-0" />
              <span className="flex-1">
                <span className="block text-lg font-bold">{title}</span>
                <span className="mt-1 block text-base text-muted-foreground">{description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
