"use client";

import type { LearnerProfile } from "@gullak/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { TopicSummary } from "@/components/learn-map";
import { readLearnerState, saveLearnerState } from "@/lib/learner-state";
import { initialiseRecommendationEvidence, learningRecommendation } from "@/lib/learning-recommendation";
import { useLearnerState } from "@/lib/use-learner-state";

export function RecommendationCard({ topics, profile }: { topics: TopicSummary[]; profile: LearnerProfile }) {
  const t = useTranslations("nextLearning");
  const state = useLearnerState();
  const { topic, reason, review } = learningRecommendation(topics, profile.gradeGroup, state);
  return (
    <section aria-labelledby="next-learning-title" className="rounded-2xl bg-brand-lime p-6 text-brand-ink sm:p-8">
      <h1 id="next-learning-title" className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      {topic ? (
        <>
          <h2 className="mt-6 text-2xl font-bold">{topic.title}</h2>
          <p className="mt-2 max-w-prose text-base leading-relaxed">{t(`reason.${reason}`)}</p>
          {reason === "missing-evidence" ? (
            <button
              type="button"
              onClick={() => saveLearnerState(initialiseRecommendationEvidence(topics, profile, readLearnerState()))}
              className="mt-3 min-h-11 text-left font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("initialise")}
            </button>
          ) : null}
          <p className="mt-3 max-w-prose text-base leading-relaxed">{topic.summary}</p>
          <Link
            href={`/learn/${topic.id}`}
            className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg bg-brand-ink px-5 font-bold text-brand-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
          >
            {t(review ? "review" : "start")}
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </>
      ) : (
        <p className="mt-4 text-base">{t("empty")}</p>
      )}
    </section>
  );
}
