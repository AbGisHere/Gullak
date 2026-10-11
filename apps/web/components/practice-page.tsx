"use client";

import { PracticeSimulation } from "@gullak/ui/components/practice-simulation";
import { precomputedMarch2020Outcomes } from "@gullak/ui/fixtures/simulation-fixtures";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GulluTip } from "@/components/help/gullu-tip";
import { readLearnerState, saveLearnerState } from "@/lib/learner-state";
import { episodeToSimulation } from "@/lib/practice-adapter";

export function PracticePage() {
  const t = useTranslations("learner");
  const [model] = useState(episodeToSimulation);
  const [state, setState] = useState(model.state);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="max-w-3xl space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">{t("practiceTitle")}</h1>
        <p className="text-lg text-muted-foreground">{t("practiceDescription")}</p>
      </header>
      <GulluTip place="practice" className="flex max-w-xl items-start gap-3" />
      <PracticeSimulation
        episode={model.episode}
        state={state}
        onDecision={({ decisionId }) => {
          if (decisionId === "__continue") return setState((current) => ({ ...current, phase: "active" }));
          if (decisionId === "__acknowledge") return setState((current) => ({ ...current, phase: "decision" }));
          if (decisionId === "__consequence_continue")
            return setState((current) => ({ ...current, phase: "reflection" }));
          const outcome = precomputedMarch2020Outcomes[decisionId];
          if (outcome) {
            setState((current) => ({ ...current, phase: "consequence", resolvedOutcome: outcome }));
          }
        }}
        onReflection={() => setState((current) => ({ ...current, phase: "complete" }))}
        onEpisodeComplete={() => {
          const next = readLearnerState();
          saveLearnerState({
            ...next,
            practiceCashPaise: state.portfolio.cashPaise,
          });
          setState(model.state);
        }}
        labels={{
          practiceEpisode: t("practiceEpisode"),
          playMoney: t("playMoney"),
          beginScenario: t("beginScenario"),
          amountNeeded: t("amountNeeded"),
          whatAreMyOptions: t("whatAreMyOptions"),
          seeTradeoffsAction: t("seeTradeoffs"),
          finishEpisode: t("finishEpisode"),
        }}
      />
    </div>
  );
}
