"use client";

import { type ReactNode, useState } from "react";
import { exampleEmergencyFundLesson } from "../fixtures/lesson-fixtures";
import { exampleStudentPortfolio, portfolioFixtureTerms } from "../fixtures/portfolio-fixtures";
import {
  initialPracticeSimulationState,
  march2020EpisodeMetadata,
  precomputedMarch2020Outcomes,
} from "../fixtures/simulation-fixtures";
import { exampleNeedVsWantActivity } from "../fixtures/spot-and-sort-fixtures";
import { exampleScamStoryScenario } from "../fixtures/story-fixtures";
import { Character, type CharacterVariant } from "./character";
import { FinancialRewind } from "./financial-rewind";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";
import { PaperPortfolio } from "./paper-portfolio";
import { PracticeSimulation, type SimulationState } from "./practice-simulation";
import { SpotAndSort } from "./spot-and-sort";
import { StoryChoices } from "./story-choices";
import { TopicLesson } from "./topic-lesson";

// Existing localization samples from src/ui.test.tsx, copied verbatim because
// those test-local fixtures cannot be imported without executing the test suite.
const hindiTerm: MoneyTermData = {
  term: "परिपक्वता",
  expandedName: "सावधि जमा परिपक्वता अवधि",
  plainMeaning: "वह निर्धारित तारीख जब आपका जमा किया गया पैसा और उस पर मिला ब्याज वापस मिलता है।",
  whereYouSeeIt: ["बैंक पासबुक", "सावधि जमा प्रमाणपत्र", "मोबाइल बैंकिंग ऐप"],
  example: "यदि आपने ₹5,000 एक वर्ष के लिए जमा किए हैं, तो एक वर्ष पूर्ण होने की तिथि परिपक्वता तिथि है।",
  whyItMattersHere: "यदि आप परिपक्वता से पहले पैसा निकालते हैं, तो बैंक पेनल्टी काट सकता है।",
  misconception: "परिपक्वता से पहले कभी भी पूरा ब्याज नहीं मिलता।",
};
const teluguTerm: MoneyTermData = {
  term: "లిక్విడిటీ",
  expandedName: "ద్రవ్యలభ్యత / తక్షణ నగదు యాక్సెస్",
  plainMeaning: "మీ డబ్బును నష్టం లేకుండా ఎంత త్వరగా నగదుగా మార్చుకోవచ్చో తెలిపే సామర్థ్యం.",
  whereYouSeeIt: ["పొదుపు ఖాతా", "అత్యవసర నిధి"],
  example: "బ్యాంక్ ఖాతాలోని నగదు అత్యధిక లిక్విడిటీ కలిగి ఉంటుంది, కానీ స్థిరాస్తికి తక్కువ లిక్విడిటీ ఉంటుంది.",
};

function PreviewSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="min-w-0 border-t border-border pt-8">
      <h2 id={`${id}-heading`} className="mb-5 text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function R2Showcase() {
  const [state, setState] = useState<SimulationState>(initialPracticeSimulationState);
  const outcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-5xl">R2 visual preview</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Existing UI and demonstration fixtures only. All money is virtual. Simulation transitions select precomputed
          fixtures; no engines or services run here.
        </p>
      </header>
      <PreviewSection id="character" title="Character">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {(["blob", "pillar", "spark", "arch"] as CharacterVariant[]).map((variant) => (
            <figure key={variant} className="flex flex-col items-center gap-3">
              <Character variant={variant} size="lg" label={variant} />
              <figcaption>{variant}</figcaption>
            </figure>
          ))}
        </div>
      </PreviewSection>
      <PreviewSection id="decoder" title="MoneyDecoder">
        {Object.values(portfolioFixtureTerms)
          .slice(0, 3)
          .map((term) => (
            <span key={term.term} className="mr-4 inline-block py-2">
              <MoneyDecoder termData={term} />
            </span>
          ))}
      </PreviewSection>
      <PreviewSection id="story" title="StoryChoices">
        <StoryChoices scenario={exampleScamStoryScenario} />
      </PreviewSection>
      <PreviewSection id="sort" title="SpotAndSort">
        <SpotAndSort activity={exampleNeedVsWantActivity} />
      </PreviewSection>
      <PreviewSection id="lesson" title="TopicLesson">
        <TopicLesson lesson={exampleEmergencyFundLesson} />
      </PreviewSection>
      <PreviewSection id="portfolio" title="PaperPortfolio">
        <PaperPortfolio portfolio={exampleStudentPortfolio} />
      </PreviewSection>
      <PreviewSection id="practice" title="PracticeSimulation">
        <label className="mb-5 flex flex-wrap items-center gap-3">
          Fixture phase
          <select
            className="min-h-11 rounded-md border border-border bg-background px-3"
            value={state.phase}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                phase: event.target.value as SimulationState["phase"],
                resolvedOutcome: current.resolvedOutcome ?? outcome,
              }))
            }
          >
            {["briefing", "active", "decision", "resolving", "consequence", "reflection", "complete"].map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </label>
        <PracticeSimulation
          episode={march2020EpisodeMetadata}
          state={state}
          onDecision={({ decisionId }) => {
            setState((current) => {
              if (decisionId === "__continue") return { ...current, phase: "active" };
              if (decisionId === "__acknowledge") return { ...current, phase: "decision" };
              if (decisionId === "__consequence_continue") return { ...current, phase: "reflection" };
              const selected = precomputedMarch2020Outcomes[decisionId];
              return selected ? { ...current, phase: "consequence", resolvedOutcome: selected } : current;
            });
          }}
          onReflection={() => setState((current) => ({ ...current, phase: "complete" }))}
          onEpisodeComplete={() => setState(initialPracticeSimulationState)}
        />
      </PreviewSection>
      <PreviewSection id="rewind" title="FinancialRewind">
        <FinancialRewind
          episodeId={march2020EpisodeMetadata.episodeId}
          chosenPath={{
            decisionId: outcome.decisionId,
            decisionLabel: "Use Emergency Reserve",
            narrativeConsequence: outcome.narrativeConsequence,
            stateDelta: outcome.stateDelta,
            tradeoff: outcome.tradeoff,
            whatWasUnknown: outcome.whatWasUnknown,
            characterReaction: outcome.characterReaction,
          }}
          alternatives={outcome.alternativeOutcomes ?? []}
        />
      </PreviewSection>
      <PreviewSection id="hindi" title="Hindi localization sample">
        <div lang="hi" className="space-y-4">
          <p>{hindiTerm.plainMeaning}</p>
          <MoneyDecoder
            termData={hindiTerm}
            labels={{
              badgeTitle: "मुद्रा डिकोडर",
              closeAria: "डिकोडर बंद करें",
              triggerAriaPrefix: "शब्दावली डिकोड करें:",
              plainMeaning: "सरल अर्थ",
              whyItMatters: "यहाँ इसका महत्व",
              whereYouSeeIt: "आप इसे कहाँ देखेंगे",
              realLifeExample: "दैनिक जीवन का उदाहरण",
              watchOut: "सावधान रहें / आम गलतफहमी",
              gotIt: "समझ गया",
            }}
          />
        </div>
      </PreviewSection>
      <PreviewSection id="telugu" title="Telugu localization sample">
        <div lang="te" className="space-y-4">
          <p>{teluguTerm.plainMeaning}</p>
          <MoneyDecoder
            termData={teluguTerm}
            labels={{
              badgeTitle: "మనీ డీకోడర్",
              closeAria: "డీకోడర్ మూసివేయి",
              triggerAriaPrefix: "పదాన్ని డీకోడ్ చేయి:",
              plainMeaning: "స్పష్టమైన అర్థం",
              whereYouSeeIt: "మీరు దీనిని ఎక్కడ చూస్తారు",
              realLifeExample: "నిజ జీవిత ఉదాహరణ",
              gotIt: "అర్థమైంది",
            }}
          />
        </div>
      </PreviewSection>
    </main>
  );
}
