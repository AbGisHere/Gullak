"use client";

import { Character } from "@gullak/ui/components/character";
import { FinancialRewind } from "@gullak/ui/components/financial-rewind";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { march2020StartingPortfolio, precomputedMarch2020Outcomes } from "@gullak/ui/fixtures/simulation-fixtures";
import { cn } from "@gullak/ui/lib/utils";
import { AlertTriangle, ArrowLeft, ArrowRight, History, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type SceneId = "lane" | "crisis" | "choice" | "multiverse";

interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  speech: string;
  variant: "blob" | "pillar" | "spark" | "arch";
  pose: "neutral" | "pondering" | "celebrating" | "explaining" | "cautious" | "saving";
  accent: "lime" | "lilac" | "coral" | "yellow" | "ink" | "muted";
  warning?: string;
}

const laneCast: CharacterProfile[] = [
  {
    id: "gullu",
    name: "Gullu",
    role: "The Living Gullak",
    speech:
      "Namaste! I am your family's savings guardian. A Fixed Deposit is great for earning 7% interest, but never lock all your savings away. You ALWAYS need an instant liquid buffer for emergencies!",
    variant: "blob",
    pose: "saving",
    accent: "lime",
  },
  {
    id: "nani",
    name: "Nani",
    role: "The Grandmother",
    speech:
      "Beta, for 20 years I saved every single rupee in my earthen clay gullak on the kitchen shelf. The bank manager convinced me to put ₹50,000 in an FD... but now this clinic bill has arrived!",
    variant: "pillar",
    pose: "cautious",
    accent: "yellow",
  },
  {
    id: "amma",
    name: "Amma",
    role: "Tiffin Center Owner",
    speech:
      "Vegetable prices at Moazzam Jahi market fluctuate every sunrise. Lockdown rumors are everywhere. If the tiffin center closes, our daily cash earnings drop to zero.",
    variant: "spark",
    pose: "pondering",
    accent: "coral",
  },
  {
    id: "lucky",
    name: "Lucky Bhai",
    role: "The Neighborhood Trickster",
    speech:
      "Arrey bhai jaan! Why keep money in boring bank accounts? Put it into my 'Double Money in 21 Days' lottery scheme, guaranteed 50% profit every month!",
    warning: "Watch out! Classic Ponzi scam. Never hand money to unregulated schemes.",
    variant: "arch",
    pose: "explaining",
    accent: "coral",
  },
];

export function FinancialTwinTab() {
  const [currentScene, setCurrentScene] = useState<SceneId>("lane");
  const [activeCharacterId, setActiveCharacterId] = useState<string>("nani");
  const [selectedChoice, setSelectedChoice] = useState<"emergency" | "fd" | "market">("emergency");

  const defaultOutcome = precomputedMarch2020Outcomes["decision-emergency-reserve"]!;
  const outcome =
    selectedChoice === "fd"
      ? (precomputedMarch2020Outcomes["decision-break-fd"] ?? defaultOutcome)
      : selectedChoice === "market"
        ? (precomputedMarch2020Outcomes["decision-sell-market"] ?? defaultOutcome)
        : defaultOutcome;

  const chosenPathData = {
    decisionId: outcome.decisionId,
    decisionLabel:
      selectedChoice === "emergency"
        ? "Use Emergency Reserve"
        : selectedChoice === "fd"
          ? "Break Fixed Deposit Early"
          : "Sell Index Funds at Market Bottom",
    narrativeConsequence: outcome.narrativeConsequence,
    stateDelta: outcome.stateDelta,
    tradeoff: outcome.tradeoff,
    whatWasUnknown: outcome.whatWasUnknown,
    portfolioAfter: march2020StartingPortfolio,
    characterReaction: outcome.characterReaction,
  };

  const alternatives = defaultOutcome.alternativeOutcomes ?? [];

  const activeChar = laneCast.find((c) => c.id === activeCharacterId) ?? laneCast[0]!;

  const scenes: { id: SceneId; title: string; subtitle: string }[] = [
    { id: "lane", title: "1. The Household", subtitle: "Meet the family" },
    { id: "crisis", title: "2. The Crisis", subtitle: "₹15,000 hospital bill" },
    { id: "choice", title: "3. The Decision", subtitle: "Choose Nani's path" },
    { id: "multiverse", title: "4. Multiverse", subtitle: "Rewind & History" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-4 py-4 sm:px-6 sm:py-6">
      {/* Narrative Header & Story Stepper */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-lime text-brand-ink border border-brand-ink px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                Signature Experience
              </span>
              <PlayMoneyBadge label="Virtual Choices" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-brand-ink mt-1">
              Nani&apos;s Gullak &amp; The Multiverse
            </h1>
            <p className="text-xs sm:text-sm text-brand-ink/80 font-medium">
              Episode 2 · March 2020: The Lockdown Hospital Bill
            </p>
          </div>

          <span className="self-start rounded-full bg-brand-ink text-brand-paper px-3 py-1 text-xs font-black">
            Season 2 · Class 8–10
          </span>
        </div>

        {/* Clean Story Scene Indicator (Never a dense 7-item clutter) */}
        <div className="flex items-center justify-between gap-2 border-y-2 border-brand-ink/20 py-2.5 overflow-x-auto no-scrollbar">
          {scenes.map((s, idx) => {
            const isActive = currentScene === s.id;
            const isPassed = scenes.findIndex((x) => x.id === currentScene) > idx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentScene(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition-all shrink-0 cursor-pointer",
                  isActive
                    ? "bg-brand-ink text-brand-paper shadow-[2px_2px_0px_#DFFF3F]"
                    : isPassed
                      ? "bg-brand-muted text-brand-ink/90 hover:bg-brand-paper"
                      : "text-muted-foreground hover:text-brand-ink",
                )}
              >
                <span>{s.title}</span>
                {isPassed && <span className="text-brand-lime">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SCENE 1: THE HYDERABAD LANE & HOUSEHOLD (Interactive Dialogue)
      ========================================================================= */}
      {currentScene === "lane" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Visual Setting Banner */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-brand-ink shadow-[6px_6px_0px_#171717] bg-muted">
            <Image
              src="/assets/story-hero.jpg"
              alt="Nani, Kabir and Gullu in Hyderabad lane with Charminar in background"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                Setting the Scene
              </span>
              <h2 className="text-xl sm:text-3xl font-black drop-shadow-md text-white mt-1">
                The Courtyard in the Hyderabad Old City
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-2xl font-medium drop-shadow-sm">
                Tap on each family member to understand their money dilemma before the storm hits.
              </p>
            </div>
          </div>

          {/* Character Selector & Speech Balloon */}
          <div className="rounded-3xl border-2 border-brand-ink bg-[#FFFDF7] p-5 sm:p-7 shadow-[4px_4px_0px_#171717] space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground mr-1">
                Tap Character:
              </span>
              {laneCast.map((c) => {
                const isSelected = c.id === activeCharacterId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCharacterId(c.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border-2 border-brand-ink px-3 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer",
                      isSelected
                        ? "bg-brand-lime text-brand-ink shadow-[3px_3px_0px_#171717] translate-y-[-1px]"
                        : "bg-white text-brand-ink/80 hover:bg-brand-muted",
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] font-normal opacity-70">({c.role})</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Comic Speech Box */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 rounded-2xl border-2 border-brand-ink bg-brand-paper/80 p-4 sm:p-6 shadow-[2px_2px_0px_#171717]">
              <div className="shrink-0 flex items-center justify-center size-20 rounded-2xl border-2 border-brand-ink bg-white shadow-xs">
                <Character variant={activeChar.variant} pose={activeChar.pose} accent={activeChar.accent} size="md" />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-black text-brand-ink">{activeChar.name}</h3>
                  <span className="rounded-full bg-brand-ink text-brand-paper px-2 py-0.5 text-[10px] font-bold">
                    {activeChar.role}
                  </span>
                </div>

                <div className="relative rounded-2xl border-2 border-brand-ink/40 bg-white p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-brand-ink leading-relaxed">
                  <p>&quot;{activeChar.speech}&quot;</p>
                  {activeChar.warning && (
                    <p className="mt-2 text-xs font-bold text-brand-coral flex items-center gap-1">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      {activeChar.warning}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentScene("crisis")}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-ink bg-brand-lime px-6 py-3.5 text-sm sm:text-base font-black text-brand-ink shadow-[4px_4px_0px_#171717] hover:translate-y-[-2px] active:translate-y-[2px] cursor-pointer"
              >
                <span>Proceed to The Crisis Strikes</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCENE 2: THE ₹15,000 CRISIS (The Story Dilemma & Visual Virtual Money)
      ========================================================================= */}
      {currentScene === "crisis" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Visual Crisis Illustration */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-brand-ink shadow-[6px_6px_0px_#171717] bg-muted">
            <Image
              src="/assets/crisis-scene.jpg"
              alt="Nani worried about clinic bill with Kabir and Gullu"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-brand-coral text-brand-paper px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                Emergency Dilemma
              </span>
              <h2 className="text-xl sm:text-3xl font-black drop-shadow-md text-white mt-1">
                The Sudden Clinic Bill in March 2020
              </h2>
            </div>
          </div>

          {/* Dilemma Breakdown Card */}
          <div className="rounded-3xl border-2 border-brand-ink bg-[#FFFDF7] p-5 sm:p-7 shadow-[4px_4px_0px_#171717] space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-brand-ink">
                Lockdown Announced. Markets Down 30%. Bill Due Tonight.
              </h3>
              <p className="text-xs sm:text-sm text-brand-ink/80 leading-relaxed max-w-3xl">
                Nani slipped and injured her knee. The clinic bill is exactly{" "}
                <strong className="font-bold text-brand-coral">₹15,000</strong>. Meanwhile, the COVID lockdown has
                closed all shops, and the stock market just suffered its steepest crash in 12 years. Let&apos;s look at
                the family&apos;s available virtual money:
              </p>
            </div>

            {/* Visual Money Cards (Tactile & Clean) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Emergency Reserve */}
              <div className="rounded-2xl border-2 border-brand-ink bg-brand-lime/25 p-4 space-y-2 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                    Emergency Cache
                  </span>
                  <span className="rounded-full bg-brand-lime text-brand-ink px-2 py-0.5 text-[10px] font-black">
                    Liquid Cash
                  </span>
                </div>
                <p className="text-2xl font-black text-brand-ink">₹20,000</p>
                <p className="text-[11px] text-brand-ink/80 leading-snug">
                  Cash in savings account. Ready in 0 days with zero penalty.
                </p>
              </div>

              {/* Fixed Deposit */}
              <div className="rounded-2xl border-2 border-brand-ink bg-brand-yellow/25 p-4 space-y-2 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    Nani&apos;s Fixed Deposit
                  </span>
                  <span className="rounded-full bg-brand-yellow text-brand-ink px-2 py-0.5 text-[10px] font-black">
                    Locked 1 Yr
                  </span>
                </div>
                <p className="text-2xl font-black text-brand-ink">₹50,000</p>
                <p className="text-[11px] text-brand-ink/80 leading-snug">
                  Earns 7% interest. Early withdrawal triggers 1% interest penalty!
                </p>
              </div>

              {/* Index Funds */}
              <div className="rounded-2xl border-2 border-brand-ink bg-brand-lilac/30 p-4 space-y-2 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">
                    Index Mutual Fund
                  </span>
                  <span className="rounded-full bg-brand-lilac text-brand-ink px-2 py-0.5 text-[10px] font-black">
                    Crash Bottom
                  </span>
                </div>
                <p className="text-2xl font-black text-brand-ink">₹30,000</p>
                <p className="text-[11px] text-brand-ink/80 leading-snug">
                  Down 30% this week. Selling today locks in a permanent -₹9,000 loss!
                </p>
              </div>
            </div>

            {/* Bill Callout Banner */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink bg-brand-coral/20 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-6 text-brand-coral shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase text-brand-coral">The Hospital Requirement</p>
                  <p className="text-sm font-bold text-brand-ink">₹15,000 clinic discharge bill due immediately</p>
                </div>
              </div>
              <span className="text-xl font-black text-brand-ink">₹15,000</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentScene("lane")}
                className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand-ink cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Household</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScene("choice")}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-ink bg-brand-lime px-6 py-3.5 text-sm sm:text-base font-black text-brand-ink shadow-[4px_4px_0px_#171717] hover:translate-y-[-2px] active:translate-y-[2px] cursor-pointer"
              >
                <span>Make Nani&apos;s Decision</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCENE 3: THE DECISION (Interactive Branching Choices & Real Consequences)
      ========================================================================= */}
      {currentScene === "choice" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="rounded-3xl border-2 border-brand-ink bg-[#FFFDF7] p-5 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-6">
            <div className="space-y-1">
              <span className="rounded-full bg-brand-coral text-brand-paper px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                Critical Choice Point
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-brand-ink">
                How should Nani pay the ₹15,000 Hospital Bill?
              </h2>
              <p className="text-xs sm:text-sm text-brand-ink/80 font-medium">
                Every decision changes the family&apos;s financial future. Select a path below:
              </p>
            </div>

            {/* 3 Interactive Choice Cards */}
            <div className="space-y-3 sm:space-y-4">
              {/* Choice A: Break FD */}
              <button
                type="button"
                onClick={() => setSelectedChoice("fd")}
                aria-pressed={selectedChoice === "fd"}
                className={cn(
                  "w-full rounded-2xl border-2 border-brand-ink p-4 sm:p-5 transition-all cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-ring",
                  selectedChoice === "fd"
                    ? "bg-brand-yellow/30 shadow-[4px_4px_0px_#171717] translate-y-[-1px]"
                    : "bg-white hover:bg-brand-muted shadow-xs",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-200 border border-brand-ink px-2 py-0.5 text-[10px] font-black text-brand-ink uppercase">
                        Bank Penalty Path
                      </span>
                      <span className="text-xs font-bold text-amber-900">Break Fixed Deposit Early</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-brand-ink">
                      Liquidate ₹15,000 from Nani&apos;s 1-Year FD
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-ink/80">
                      The bank pays the bill today, but slashes the interest rate from 7% down to 4% with a 1% premature
                      penalty. Nani loses ₹1,500 medicine interest forever.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border-2 border-brand-ink text-xs font-black",
                        selectedChoice === "fd" ? "bg-brand-ink text-brand-paper" : "bg-white",
                      )}
                    >
                      {selectedChoice === "fd" ? "✓" : "A"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Choice B: Sell Market */}
              <button
                type="button"
                onClick={() => setSelectedChoice("market")}
                aria-pressed={selectedChoice === "market"}
                className={cn(
                  "w-full rounded-2xl border-2 border-brand-ink p-4 sm:p-5 transition-all cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-ring",
                  selectedChoice === "market"
                    ? "bg-brand-coral/25 shadow-[4px_4px_0px_#171717] translate-y-[-1px]"
                    : "bg-white hover:bg-brand-muted shadow-xs",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-red-200 border border-brand-ink px-2 py-0.5 text-[10px] font-black text-brand-ink uppercase">
                        Panic Sell Path
                      </span>
                      <span className="text-xs font-bold text-red-900">Sell Mutual Funds at Bottom</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-brand-ink">
                      Sell ₹15,000 worth of Index Funds during March 2020 crash
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-ink/80">
                      Markets crashed 30% this week. Selling shares during panic converts paper loss into ₹4,500
                      permanent cash destruction!
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border-2 border-brand-ink text-xs font-black",
                        selectedChoice === "market" ? "bg-brand-ink text-brand-paper" : "bg-white",
                      )}
                    >
                      {selectedChoice === "market" ? "✓" : "B"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Choice C: Use Emergency Reserve */}
              <button
                type="button"
                onClick={() => setSelectedChoice("emergency")}
                aria-pressed={selectedChoice === "emergency"}
                className={cn(
                  "w-full rounded-2xl border-2 border-brand-ink p-4 sm:p-5 transition-all cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-ring",
                  selectedChoice === "emergency"
                    ? "bg-brand-lime/35 shadow-[4px_4px_0px_#171717] translate-y-[-1px]"
                    : "bg-white hover:bg-brand-muted shadow-xs",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-lime border border-brand-ink px-2 py-0.5 text-[10px] font-black text-brand-ink uppercase">
                        The Gullak Way (Recommended)
                      </span>
                      <span className="text-xs font-bold text-emerald-900">Pay from Liquid Emergency Fund</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-brand-ink">
                      Use ₹15,000 from Family&apos;s Liquid Cache
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-ink/80">
                      Bill paid in 5 minutes! Investments and Fixed Deposits remain 100% untouched and continue
                      compounding uninterrupted.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border-2 border-brand-ink text-xs font-black",
                        selectedChoice === "emergency" ? "bg-brand-ink text-brand-paper" : "bg-white",
                      )}
                    >
                      {selectedChoice === "emergency" ? "✓" : "C"}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Instant Story Reaction Balloon */}
            <div className="rounded-2xl border-2 border-brand-ink bg-white p-4 shadow-sm flex items-center gap-4">
              <div className="shrink-0">
                <Character
                  variant="blob"
                  pose={selectedChoice === "emergency" ? "celebrating" : "cautious"}
                  accent={selectedChoice === "emergency" ? "lime" : "coral"}
                  size="sm"
                />
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {selectedChoice === "emergency" && (
                  <p>
                    <strong className="text-brand-ink font-bold">Gullu cheers:</strong> &quot;Brilliant decision! This
                    is why we maintain an emergency buffer. Nani receives treatment without interrupting any long-term
                    compounding.&quot;
                  </p>
                )}
                {selectedChoice === "fd" && (
                  <p>
                    <strong className="text-amber-900 font-bold">Gullu notes:</strong> &quot;The bill is paid, but
                    breaking the FD early hurt. Nani lost ₹1,500 interest that would have bought medicines next
                    month.&quot;
                  </p>
                )}
                {selectedChoice === "market" && (
                  <p>
                    <strong className="text-brand-coral font-bold">Gullu warns:</strong> &quot;Ouch! Selling during the
                    March 2020 bottom locked in permanent losses. If you held on, the index recovered 100% in 18
                    months!&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentScene("crisis")}
                className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand-ink cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Crisis</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScene("multiverse")}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-ink bg-brand-lime px-6 py-3.5 text-sm sm:text-base font-black text-brand-ink shadow-[4px_4px_0px_#171717] hover:translate-y-[-2px] active:translate-y-[2px] cursor-pointer"
              >
                <span>Enter Multiverse Rewind</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCENE 4: MULTIVERSE REWIND & REAL HISTORY REVEAL (Naturally Integrated)
      ========================================================================= */}
      {currentScene === "multiverse" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Counterfactual Comparison Engine */}
          <div className="rounded-3xl border-2 border-brand-ink bg-[#FFFDF7] p-5 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-brand-ink/20 pb-4">
              <div>
                <span className="rounded-full bg-brand-coral text-brand-paper px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                  Money Multiverse
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-brand-ink mt-1">
                  Financial Rewind: Your Path vs The Alternative
                </h2>
                <p className="text-xs sm:text-sm text-brand-ink/80 font-medium">
                  See what happens 12 months later based on your decision.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentScene("choice")}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-ink bg-white px-3 py-1.5 text-xs font-bold text-brand-ink hover:bg-brand-muted self-start cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Try Different Choice</span>
              </button>
            </div>

            {/* Embedded FinancialRewind Engine */}
            <div className="rounded-2xl border-2 border-brand-ink overflow-hidden bg-brand-paper">
              <FinancialRewind
                episodeId="practice-ep-march-2020"
                chosenPath={chosenPathData}
                alternatives={alternatives}
              />
            </div>
          </div>

          {/* 2. "FYI, This Really Happened" Historical Reveal */}
          <div className="rounded-3xl border-2 border-brand-ink bg-brand-yellow/25 p-5 sm:p-7 shadow-[4px_4px_0px_#171717] space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-ink text-brand-yellow px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                FYI · This Really Happened
              </span>
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <History className="size-3.5" /> Indian Market History
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-brand-ink leading-snug">
              March 23, 2020: Sensex Plunged 13.15% in a Single Day
            </h3>

            <div className="text-xs sm:text-sm text-brand-ink/90 space-y-2 leading-relaxed">
              <p>
                When nationwide lockdown began in March 2020, Indian stock markets suffered their fastest fall in
                history. Investors who did not have an emergency cash buffer panicked and were forced to sell good
                investments at the absolute bottom.
              </p>
              <p className="font-semibold text-brand-ink">
                By October 2021, the Sensex rallied from 25,638 to over 61,000 (+138% return!). Those who held an
                emergency fund never had to sell a single share and participated in India&apos;s greatest market
                recovery.
              </p>
            </div>
          </div>

          {/* 3. Celebratory Habit Mastery & Living Gullak Level Up */}
          <div className="rounded-3xl border-2 border-brand-ink bg-brand-lime/30 p-5 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-5">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-2xl border-2 border-brand-ink shadow-sm">
              <Image
                src="/assets/resolution-scene.jpg"
                alt="Nani celebrating joyfully with student and jumping Gullak"
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-ink text-brand-lime px-2.5 py-0.5 text-[10px] font-black uppercase">
                    Level Up
                  </span>
                  <span className="text-xs font-bold text-emerald-900">+15 Habit Points Earned</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-brand-ink">
                  Habit Mastered: Emergency Fund Discipline
                </h3>
                <p className="text-xs sm:text-sm text-brand-ink/80">
                  You protected Nani&apos;s household with virtual play money without touching locked investments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentScene("lane")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-ink bg-brand-ink text-brand-paper px-6 py-3.5 text-xs sm:text-sm font-black shadow-[3px_3px_0px_#DFFF3F] hover:bg-brand-ink/90 active:translate-y-0.5 cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>Replay Story Episode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
