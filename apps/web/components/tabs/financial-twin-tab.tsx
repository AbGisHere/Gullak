"use client";

import { FinancialRewind, type FinancialRewindLabels } from "@gullak/ui/components/financial-rewind";
import type { DecisionPayload, ReflectionPayload } from "@gullak/ui/components/practice-simulation";
import { formatInr } from "@gullak/ui/lib/format";
import { defaultFinancialRewindLabels } from "@gullak/ui/lib/labels";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  type HouseholdDecision,
  householdFixture,
  isHouseholdDecision,
  STORY_STAGES,
} from "../financial-twin/household-fixture";
import { JourneyFrame } from "../financial-twin/journey-frame";
import { MoneyState } from "../financial-twin/money-state";
import { rewindPaths } from "../financial-twin/rewind-paths";
import { StoryConsequence } from "../financial-twin/story-consequence";
import { StoryDecision } from "../financial-twin/story-decision";
import { StoryReflection } from "../financial-twin/story-reflection";
import { StoryScene } from "../financial-twin/story-scene";

/** This tab owns presentation state only; it does not award mastery or unlocks. */
export function FinancialTwinTab() {
  const t = useTranslations("twin.story");
  const common = useTranslations("onboarding");
  const locale = useLocale();
  const [stageIndex, setStageIndex] = useState(0);
  const [speaker, setSpeaker] = useState<"nani" | "amma" | "gullu">("nani");
  const [decision, setDecision] = useState<HouseholdDecision>();
  const [reflection, setReflection] = useState<string>();
  const [viewedAlternatives, setViewedAlternatives] = useState<string[]>([]);
  const fixture = householdFixture((key) => t(key));
  const { episode, state, outcomes, decisions } = fixture;
  const stage = STORY_STAGES[stageIndex] ?? "arrive";
  const outcome = decision ? outcomes[decision] : undefined;
  const paths = decision ? rewindPaths(decision, decisions, outcomes) : null;
  const bill = formatInr(state.currentEvent?.amountPaise ?? 1500000, { locale });
  const rewindLabels = Object.fromEntries(
    Object.keys(defaultFinancialRewindLabels).map((key) => [key, t(`rewindLabels.${key}`)]),
  ) as unknown as FinancialRewindLabels;

  function handleDecision(payload: DecisionPayload) {
    if (
      payload.episodeId !== episode.episodeId ||
      payload.eventId !== state.currentEvent?.id ||
      !isHouseholdDecision(payload.decisionId)
    )
      return;
    setDecision(payload.decisionId);
    setReflection(undefined);
    setViewedAlternatives(
      decisions
        .filter((option) => option.id !== payload.decisionId)
        .slice(0, 1)
        .map((option) => option.id),
    );
    setStageIndex(4);
  }
  function handleReflection(payload: ReflectionPayload) {
    if (
      payload.episodeId === episode.episodeId &&
      payload.eventId === state.currentEvent?.id &&
      state.reflection?.options.some((option) => option.id === payload.reflectionId)
    )
      setReflection(payload.reflectionId);
  }
  const image = stageIndex < 3 ? "story-hero" : stage === "reflection" ? "resolution-scene" : "crisis-scene";
  const imageAlt = stageIndex < 3 ? "arrivalArt" : stage === "reflection" ? "resolutionArt" : "crisisArt";
  const showArt = stageIndex < 4 || stage === "reflection";
  const nextLabels = ["enter", "inspect", "faceBill", "", "rewind", "reflect", "replay"];

  return (
    <JourneyFrame
      stageId={stage}
      stageIndex={stageIndex}
      stageCount={STORY_STAGES.length}
      stageLabel={t(`stages.${stage}`)}
      progressLabel={common("progress", { current: stageIndex + 1, total: STORY_STAGES.length })}
      playMoneyLabel={common("playMoney")}
      backLabel={common("back")}
      onBack={stageIndex > 0 ? () => setStageIndex(stageIndex - 1) : undefined}
      nextLabel={stage !== "decision" ? t(nextLabels[stageIndex] ?? "enter") : undefined}
      nextDisabledReason={stage === "reflection" && !reflection ? t("reflectFirst") : undefined}
      onNext={
        stage === "decision"
          ? undefined
          : () => {
              if (stage === "reflection") {
                setStageIndex(0);
                setDecision(undefined);
                setReflection(undefined);
                setViewedAlternatives([]);
                setSpeaker("nani");
              } else setStageIndex(stageIndex + 1);
            }
      }
    >
      <div
        className={
          showArt
            ? "grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8"
            : "space-y-6 sm:space-y-8"
        }
      >
        {showArt && (
          <figure className="overflow-hidden rounded-2xl bg-muted lg:sticky lg:top-24">
            <Image
              src={`/assets/${image}.jpg`}
              alt={t(imageAlt)}
              width={1376}
              height={768}
              sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 75vw, 100vw"
              priority={stageIndex === 0}
              className="h-auto w-full object-contain"
            />
          </figure>
        )}
        <div className="min-w-0 space-y-6 sm:space-y-8">
          {stage === "arrive" && (
            <StoryScene
              title={t("arrivalTitle")}
              setting={t("arrivalSetting")}
              speaker={t("gullu")}
              dialogue={t("arrivalDialogue")}
              character={{ variant: "blob", pose: "explaining", expression: "friendly", accent: "lime" }}
            />
          )}
          {stage === "household" && (
            <div className="space-y-5">
              <fieldset className="flex flex-wrap gap-2">
                <legend className="mb-3 text-base font-semibold">{t("talkTo")}</legend>
                {(["nani", "amma", "gullu"] as const).map((id) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={speaker === id}
                    onClick={() => setSpeaker(id)}
                    className={`min-h-12 rounded-xl border px-5 py-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${speaker === id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >
                    {t(id)}
                  </button>
                ))}
              </fieldset>
              <StoryScene
                title={t("householdTitle")}
                setting={t("householdSetting")}
                speaker={t(speaker)}
                dialogue={t(`dialogue.${speaker}`)}
                character={{
                  variant: speaker === "amma" ? "arch" : speaker === "nani" ? "pillar" : "blob",
                  pose: "explaining",
                  expression: "friendly",
                  accent: "lilac",
                }}
              />
            </div>
          )}
          {stage === "money" && (
            <>
              <StoryScene
                title={t("moneyTitle")}
                setting={t("moneySetting")}
                speaker={t("amma")}
                dialogue={t("moneyDialogue")}
                character={{ variant: "arch", pose: "explaining", expression: "thinking", accent: "lilac" }}
              />
              <MoneyState
                portfolio={state.portfolio}
                locale={locale}
                labels={{
                  heading: t("moneyHeading"),
                  availableCash: t("reserveName"),
                  emergencyReserve: t("reserveName"),
                  playMoney: common("playMoney"),
                }}
              />
            </>
          )}
          {stage === "decision" && (
            <>
              <StoryScene
                title={t("billTitle")}
                setting={t("billDescription")}
                speaker={t("amma")}
                dialogue={t("billDialogue", { bill })}
                character={{ variant: "arch", pose: "cautious", expression: "concerned", accent: "lilac" }}
              />
              <p className="border-y border-border py-4 text-xl font-bold tabular-nums">{t("billDue", { bill })}</p>
              <StoryDecision
                episode={episode}
                state={state}
                onDecision={handleDecision}
                heading={t("decisionHeading")}
                selectedDecisionId={decision}
              />
              <p className="text-sm leading-relaxed text-muted-foreground">{t("assumptions")}</p>
            </>
          )}
          {stage === "consequence" && outcome && (
            <>
              <StoryConsequence
                outcome={outcome}
                labels={{
                  heading: t("consequenceTitle"),
                  changed: t("changed"),
                  tradeoff: t("tradeoff"),
                  unknown: t("unknown"),
                }}
              />
              <StoryScene
                title={t("gulluAsks")}
                setting={outcome.learningExplanation}
                speaker={t("gullu")}
                dialogue={outcome.characterReaction?.dialogue ?? t("uncertainty")}
                character={{ variant: "blob", pose: "pondering", expression: "thinking", accent: "lilac" }}
              />
            </>
          )}
          {stage === "rewind" && paths && (
            <>
              <FinancialRewind
                key={decision}
                episodeId={episode.episodeId}
                {...paths}
                labels={rewindLabels}
                uncertaintyMessage={t("uncertainty")}
                onAlternativeView={({ alternativeId }) =>
                  setViewedAlternatives((previous) =>
                    previous.includes(alternativeId) ? previous : [...previous, alternativeId],
                  )
                }
                onReturnToChosen={() => setStageIndex(4)}
                className="[&_button]:min-h-12 [&_button]:text-base [&_p]:text-base [&_span]:text-sm [&_.font-mono]:font-sans [&_.font-mono]:text-base [&_h3]:text-xl [&_.text-brand-lilac]:text-foreground [&_.text-brand-coral]:text-foreground"
              />
              <p className="text-base text-muted-foreground" role="status">
                {t("compared", { count: viewedAlternatives.length, total: paths.alternatives.length })}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("assumptions")}</p>
            </>
          )}
          {stage === "reflection" && (
            <>
              <StoryScene
                title={t("reflectionTitle")}
                setting={t("reflectionSetting")}
                speaker={t("nani")}
                dialogue={t("reflectionDialogue")}
                character={{ variant: "pillar", pose: "saving", expression: "friendly", accent: "lime" }}
              />
              <StoryReflection
                episode={episode}
                state={state}
                onReflection={handleReflection}
                selectedReflectionId={reflection}
                acknowledgement={reflection ? t(`reflections.${reflection}.feedback`) : undefined}
              />
              {reflection && (
                <p
                  className="rounded-xl bg-brand-lime p-5 text-base leading-relaxed text-brand-ink dark:text-brand-on-accent"
                  role="status"
                >
                  {t("takeHome")}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </JourneyFrame>
  );
}
