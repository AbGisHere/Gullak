"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { useState } from "react";
import { Gullu } from "../game/gullu";
import { SpeechBubble } from "../game/speech-bubble";
import { PortfolioTab } from "./portfolio-tab";

interface GulluTabProps {
  gradeGroup: string;
  virtualCashPaise: number;
  habitScore: number;
  streakDays: number;
}

export function GulluTab({ gradeGroup, virtualCashPaise: _virtualCashPaise, habitScore, streakDays }: GulluTabProps) {
  const [tapCount, setTapCount] = useState(0);
  const [gulluSpeech, setGulluSpeech] = useState(
    "Namaste! I am your living Gullak. When you save consistently and protect against scams, I grow stronger!",
  );

  function handleGulluTap() {
    setTapCount((c) => c + 1);
    const messages = [
      "Hehehe! That tickles! Coins are safe and warm inside me!",
      "Tip from Nani: Never put all your eggs in one basket!",
      "Did you know? Regular small savings beat irregular big bets!",
      "I was broken once, but Nani mended me with gold lacquer (kintsugi)!",
    ];
    setGulluSpeech(messages[tapCount % messages.length]!);
  }

  return (
    <div className="space-y-6 px-3 sm:px-6 py-4 max-w-4xl mx-auto">
      {/* Living Gullu Character Hero Card */}
      <section className="rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 sm:p-6 shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        <div className="flex flex-col items-center">
          <Gullu
            state="happy"
            size={130}
            reactionKey={tapCount}
            onTap={handleGulluTap}
            tapLabel="Tap Gullu to interact"
          />
          <span className="text-[11px] font-extrabold uppercase text-[#171717]/60 dark:text-[#94A3B8] mt-1">
            Tap me! ✨
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="rounded-full bg-[#171717] dark:bg-[#0B1120] text-[#DFFF3F] px-3 py-1 font-display text-xs font-black uppercase">
              Living Gullak · Level 2
            </span>
            <span className="rounded-full border border-[#171717] dark:border-[#334155] bg-[#DFFF3F] px-2.5 py-0.5 text-xs font-bold text-[#171717]">
              🔥 {streakDays} Day Streak
            </span>
            <span className="rounded-full border border-[#171717] dark:border-[#334155] bg-[#FFD84D] px-2.5 py-0.5 text-xs font-bold text-[#171717]">
              Score {habitScore}/100
            </span>
          </div>

          <SpeechBubble speakerName="Gullu" variant="paper" tailPosition="left" className="text-left">
            {gulluSpeech}
          </SpeechBubble>

          <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8] font-medium">
            Your Gullak character evolves with <em>consistent habits</em> (streaks, emergency funds, scam drills), never
            with lucky gambles!
          </p>
        </div>
      </section>

      {/* Portfolio Title & Embed (Preserves existing PortfolioTab without edits) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-black text-[#171717] dark:text-[#F8FAFC]">
              What&apos;s Inside Your Gullak
            </h2>
            <p className="text-xs text-[#171717]/70 dark:text-[#94A3B8] font-semibold">
              Paper portfolio of virtual instruments unlocked across curriculum topics.
            </p>
          </div>
          <PlayMoneyBadge label="Play Money" />
        </div>

        {/* Mount existing PortfolioTab */}
        <PortfolioTab gradeGroup={gradeGroup} />
      </section>
    </div>
  );
}
