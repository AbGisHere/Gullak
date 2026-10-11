"use client";

import { Character } from "@gullak/ui/components/character";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { ArrowRight, BookOpen, Flame, Gamepad2, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface HomeTabProps {
  gradeGroup: string;
  virtualCashPaise: number;
  streakDays: number;
  habitScore: number;
  onNavigateToTab: (tab: "home" | "twin" | "learn" | "portfolio" | "missions") => void;
  onLaunchActivity: (activityType: "lesson" | "spot-and-sort" | "simulation" | "rewind") => void;
}

export function HomeTab({
  gradeGroup,
  virtualCashPaise,
  streakDays,
  habitScore,
  onNavigateToTab,
  onLaunchActivity,
}: HomeTabProps) {
  const tDash = useTranslations("dashboard");

  const gradeDisplay =
    gradeGroup === "grade-6-7"
      ? "Class 6–7 · Foundation"
      : gradeGroup === "grade-11-12"
        ? "Class 11–12 · Wealth"
        : "Class 8–10 · Decisions";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6 px-3.5 py-3 sm:px-6 sm:py-6">
      {/* 1. Playful Character Introduction Banner (Who Gullu is & Today's State) */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-brand-ink bg-[#FFFDF7] p-3.5 sm:p-5 shadow-[4px_4px_0px_#171717]">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Mascot in tactile frame */}
          <div className="relative shrink-0 flex items-center justify-center size-14 sm:size-20 rounded-2xl bg-brand-lime border-2 border-brand-ink shadow-[2px_2px_0px_#171717]">
            <Character variant="blob" pose="celebrating" accent="ink" size="sm" className="sm:hidden" />
            <Character variant="blob" pose="celebrating" accent="ink" size="md" className="hidden sm:inline-block" />
            <span className="absolute -bottom-1 -right-1 flex size-5 sm:size-6 items-center justify-center rounded-full bg-brand-ink text-brand-lime font-black text-[10px] sm:text-xs border border-brand-paper">
              ✓
            </span>
          </div>

          {/* Speech Bubble */}
          <div className="flex-1 space-y-1 sm:space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="rounded-full bg-brand-ink text-brand-paper px-2.5 py-0.5 text-[10px] sm:text-xs font-black tracking-wide">
                {gradeDisplay}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/40 border border-brand-ink/30 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-brand-ink">
                <Flame className="size-3 text-brand-coral fill-brand-coral" />
                {tDash("streakDays", { days: streakDays })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/40 border border-brand-ink/30 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-brand-ink">
                <TrendingUp className="size-3 text-emerald-800" />
                {tDash("habitScore", { score: habitScore })}
              </span>
            </div>

            <h1 className="text-sm sm:text-2xl font-black tracking-tight text-brand-ink leading-tight">
              &quot;Namaste Kabir! Markets fluctuate, but smart habits win.&quot;
            </h1>

            <p className="hidden sm:block text-xs sm:text-sm text-brand-ink/80 font-medium max-w-2xl">
              I am <strong className="text-brand-ink font-bold">Gullu</strong>, your living family piggy bank. Today in
              our Hyderabad lane, Nani is facing an urgent hospital bill during the lockdown. Let&apos;s protect her
              savings!
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE VISUAL CENTERPIECE: Today's Featured Financial Story Challenge */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-brand-ink bg-card shadow-[6px_6px_0px_#171717] transition-all hover:shadow-[8px_8px_0px_#171717]">
        {/* Large Story Illustration Banner */}
        <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full overflow-hidden border-b-2 border-brand-ink bg-muted">
          <Image
            src="/assets/crisis-scene.jpg"
            alt="Nani worried about a medical clinic bill in her Hyderabad home with student and Gullu"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Overlaid Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-coral text-brand-paper border-2 border-brand-ink px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#171717]">
              Today&apos;s Challenge · Episode 2
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
            <PlayMoneyBadge label="Play Money" />
          </div>

          {/* Bottom Title on Image for Mobile */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:hidden text-white">
            <span className="text-[10px] font-bold text-brand-lime flex items-center gap-1">
              <Sparkles className="size-3" /> Nani&apos;s Household Dilemma
            </span>
            <h2 className="text-base font-black leading-tight text-white drop-shadow-md">
              The March 2020 Crash &amp; ₹15,000 Bill
            </h2>
          </div>
        </div>

        {/* Story Details & Immediate Action */}
        <div className="p-4 sm:p-7 space-y-3.5 sm:space-y-5 bg-[#FFFDF7]">
          <div className="space-y-1.5 hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-lilac text-brand-ink px-3 py-0.5 text-xs font-black uppercase tracking-wider border border-brand-ink">
                Story Dilemma
              </span>
              <span className="text-xs font-bold text-brand-coral flex items-center gap-1">
                <Sparkles className="size-3.5" /> High Stakes Decision
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-ink leading-tight">
              The March 2020 Crash &amp; Nani&apos;s ₹15,000 Hospital Bill
            </h2>

            <p className="text-sm sm:text-base text-brand-ink/80 leading-relaxed max-w-3xl">
              Lockdown arrived in Hyderabad. Markets plummeted 30%, Amma&apos;s tiffin center was shuttered, and an
              emergency clinic bill arrived on Nani&apos;s table. Will you break her 7% Fixed Deposit early, panic-sell
              index funds at rock bottom, or rely on your liquid emergency reserve?
            </p>
          </div>

          <p className="text-xs text-brand-ink/80 leading-relaxed sm:hidden">
            Lockdown struck Hyderabad. Markets plunged 30% and an emergency ₹15,000 hospital bill arrived. Choose
            Nani&apos;s path without destroying the family&apos;s investments.
          </p>

          {/* Visual Stakes Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 py-1">
            <div className="rounded-2xl border-2 border-brand-ink bg-brand-coral/15 p-2.5 sm:p-3 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-brand-coral">
                Emergency Bill
              </span>
              <span className="text-base sm:text-lg font-black text-brand-ink">₹15,000</span>
            </div>
            <div className="rounded-2xl border-2 border-brand-ink bg-brand-lime/25 p-2.5 sm:p-3 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Gullak Reserve
              </span>
              <span className="text-base sm:text-lg font-black text-brand-ink">₹20,000</span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border-2 border-brand-ink bg-brand-lilac/25 p-2.5 sm:p-3 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-purple-900">
                Fixed Deposit (Locked)
              </span>
              <span className="text-base sm:text-lg font-black text-brand-ink">₹50,000</span>
            </div>
          </div>

          {/* THE ONE OBVIOUS PRIMARY ACTION BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab("twin")}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl border-2 border-brand-ink bg-brand-lime px-8 py-4 sm:py-5 text-base sm:text-lg font-black text-brand-ink shadow-[4px_4px_0px_#171717] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#171717] active:translate-y-[2px] active:shadow-[1px_1px_0px_#171717] cursor-pointer group"
            >
              <span>Play Episode: Choose Nani&apos;s Path</span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => onLaunchActivity("simulation")}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-brand-ink bg-white px-5 py-3.5 text-xs sm:text-sm font-black text-brand-ink shadow-[2px_2px_0px_#171717] hover:bg-brand-muted active:translate-y-0.5 cursor-pointer"
            >
              <Gamepad2 className="size-4" />
              <span>Direct Practice Sim</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Secondary Exploration (Playful Asymmetric Layout: Micro-Drop + Living Piggy Bank) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Micro-Drop Drill Card */}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-brand-ink bg-brand-lilac/30 p-5 sm:p-6 shadow-[4px_4px_0px_#171717] space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-brand-ink text-brand-paper px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                2-Min Micro-Drop
              </span>
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                <Zap className="size-3.5 fill-current" /> Quick Habit
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-brand-ink leading-snug">
              Need vs Want: Swiggy Biryani or Ration Rice?
            </h3>
            <p className="text-xs sm:text-sm text-brand-ink/80 leading-relaxed">
              Test your financial reflexes in 30 seconds. Sort daily Hyderabad expenses before temptation drains the
              purse.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onLaunchActivity("spot-and-sort")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-ink bg-white px-4 py-3 text-xs sm:text-sm font-black text-brand-ink shadow-[2px_2px_0px_#171717] hover:bg-brand-lime transition-all active:translate-y-0.5 cursor-pointer"
          >
            <span>Play 2-Min Drill</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Nani's Living Piggy Bank Card */}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-brand-ink bg-brand-yellow/30 p-5 sm:p-6 shadow-[4px_4px_0px_#171717] space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-brand-ink text-brand-paper px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                Living Gullak Status
              </span>
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> Protected
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-brand-ink leading-snug">
              {formatInr(virtualCashPaise)} Virtual Savings in Gullak
            </h3>
            <p className="text-xs sm:text-sm text-brand-ink/80 leading-relaxed">
              Your liquid safety buffer is active. Safe from scam calls, panic selling, and premature bank penalties.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab("portfolio")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-ink bg-white px-4 py-3 text-xs sm:text-sm font-black text-brand-ink shadow-[2px_2px_0px_#171717] hover:bg-brand-yellow transition-all active:translate-y-0.5 cursor-pointer"
          >
            <span>Open Paper Portfolio</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* 4. Curriculum Road Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-ink/30 bg-brand-paper px-4 py-3 text-center sm:text-left">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-ink/80">
          <BookOpen className="size-4 text-brand-ink" />
          <span>Want to explore lessons? 4 Pillars: Plan &amp; Budget, Save, Invest &amp; Stay Safe</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToTab("learn")}
          className="text-xs font-black text-brand-ink underline underline-offset-4 hover:text-brand-coral cursor-pointer"
        >
          Explore Learning Map →
        </button>
      </div>
    </div>
  );
}
