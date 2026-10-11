"use client";

import { Character } from "@gullak/ui/components/character";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { cn } from "@gullak/ui/lib/utils";
import { CheckCircle2, Flame, Home, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";

interface MissionsTabProps {
  gradeGroup?: string;
}

interface TakeHomeMission {
  id: string;
  title: string;
  withPerson: string;
  questionToAsk: string;
  actionItem: string;
  whyItMatters: string;
  isCompleted: boolean;
  householdsProtected: number;
}

export function MissionsTab({ gradeGroup }: MissionsTabProps) {
  const [missions, setMissions] = useState<TakeHomeMission[]>([
    {
      id: "mission-emergency-reserve",
      title: "The Family Emergency Reserve Audit",
      withPerson: "Mother / Grandmother (Amma or Nani)",
      questionToAsk: "Where do we keep 1 month of urgent cash if the UPI server goes down or ATMs run dry?",
      actionItem:
        "Confirm that at least ₹2,000–₹5,000 is kept safe in liquid cash or a basic savings account, not locked in long FDs.",
      whyItMatters:
        "During the 2020 lockdowns, having instant liquid cash meant buying groceries without borrowing high-interest udhaar.",
      isCompleted: true,
      householdsProtected: 1,
    },
    {
      id: "mission-sms-hunt",
      title: "The Fake Electricity & OTP SMS Hunt",
      withPerson: "Father / Auto Driver (Nanna)",
      questionToAsk:
        "Can we check your phone SMS together for urgent threats like 'Electricity will be cut tonight at 9:30 PM'?",
      actionItem:
        "Identify any message with an unknown 10-digit mobile number claiming to be the electricity board. Teach them never to call back.",
      whyItMatters: "Elder family members are targeted most often by pressure-driven electricity cut SMS scams.",
      isCompleted: true,
      householdsProtected: 1,
    },
    {
      id: "mission-emi-check",
      title: "The 'Zero Cost EMI' Reality Check",
      withPerson: "Elder Brother / Sibling",
      questionToAsk:
        "If a phone says 'No Cost EMI', did you check the ₹199 processing fee and 18% GST on each installment?",
      actionItem: "Calculate the real total price vs paying with saved cash from a Recurring Deposit.",
      whyItMatters: "Fast loan apps and zero-cost marketing traps young earners into multi-year credit traps.",
      isCompleted: false,
      householdsProtected: 0,
    },
    {
      id: "mission-1930-helpline",
      title: "Save 1930 on the Family Speed Dial",
      withPerson: "All Family Members",
      questionToAsk: "Do you know the national cyber financial crime helpline number?",
      actionItem: "Save 1930 in every smartphone contact list as 'National Cyber Fraud Helpline'.",
      whyItMatters:
        "Reporting within the first 2 hours ('Golden Hour') allows banks to freeze the fraudster's account before withdrawal.",
      isCompleted: false,
      householdsProtected: 0,
    },
  ]);

  const [householdsCount, setHouseholdsCount] = useState(2);

  function toggleMissionCompletion(id: string) {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextState = !m.isCompleted;
          if (nextState) setHouseholdsCount((c) => c + 1);
          else setHouseholdsCount((c) => Math.max(1, c - 1));
          return { ...m, isCompleted: nextState, householdsProtected: nextState ? 1 : 0 };
        }
        return m;
      }),
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-4 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-xs font-black uppercase">
              Habits, Never Addictive
            </span>
            <span className="rounded-full bg-brand-lilac text-brand-ink px-2.5 py-0.5 text-xs font-bold">
              Class {gradeGroup === "6-7" ? "6–7" : gradeGroup === "8-10" ? "8–10" : "11–12"}
            </span>
            <PlayMoneyBadge label="Family Stewardship" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-brand-ink mt-1">
            Living Gullak &amp; Take-Home Missions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            &quot;Everyone built a game for a student. We built a way for one student to protect their whole
            family.&quot;
          </p>
        </div>
      </div>

      {/* Living Gullak Status Hero Card */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-brand-ink bg-card p-6 sm:p-8 shadow-sm">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 size-48 rounded-full bg-brand-yellow/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="grid size-20 sm:size-24 place-items-center rounded-3xl bg-brand-ink text-brand-paper shadow-md shrink-0">
              <Character variant="blob" pose="celebrating" accent="lime" size="xl" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-xs font-black uppercase">
                  Tier 2 · Glazed Terracotta Gullak
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Flame className="size-3.5 text-brand-coral" /> 3-Day Habit
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink">Gullu is Strong &amp; Vigilant</h2>
              <p className="text-xs sm:text-sm text-brand-ink/80 max-w-lg leading-relaxed">
                Gullu grows strictly with consistent habits (emergency reserves maintained, scams caught, take-home
                missions done), never with simulated wealth or gambling.
              </p>
            </div>
          </div>

          {/* Household Impact Metric */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-brand-ink bg-brand-lime p-5 text-center shrink-0 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-ink">
              <Users className="size-4" />
              <span>Reach Metric</span>
            </div>
            <p className="text-4xl font-black text-brand-ink mt-1">{householdsCount}</p>
            <p className="text-xs font-bold text-brand-ink/80">Households Protected</p>
          </div>
        </div>
      </section>

      {/* Family Take-Home Missions List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-brand-ink flex items-center gap-2">
              <Home className="size-5 text-brand-coral" />
              <span>Take-Home Missions with Parents</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              A 5-minute conversation with family makes you the home&apos;s money teacher.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {missions.filter((m) => m.isCompleted).length} / {missions.length} Finished
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={cn(
                "flex flex-col justify-between rounded-3xl border p-5 transition-all text-left",
                mission.isCompleted
                  ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border bg-card hover:border-brand-ink/40 shadow-xs",
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-[10px] font-bold text-brand-ink uppercase">
                    With: {mission.withPerson}
                  </span>
                  {mission.isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" /> Done
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-brand-coral">Pending</span>
                  )}
                </div>

                <h3 className="text-base font-black text-brand-ink">{mission.title}</h3>

                <div className="rounded-2xl border border-border/80 bg-brand-paper p-3 text-xs space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">Ask your family:</p>
                  <p className="text-brand-ink font-semibold italic">&quot;{mission.questionToAsk}&quot;</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{mission.actionItem}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">+1 Household Protected</span>
                <button
                  type="button"
                  onClick={() => toggleMissionCompletion(mission.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                    mission.isCompleted
                      ? "bg-emerald-700 text-white"
                      : "bg-brand-ink text-brand-paper hover:bg-brand-ink/90 active:scale-95",
                  )}
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>{mission.isCompleted ? "Completed" : "Mark as Done"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scam Hunter Badges Grid */}
      <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand-lime" />
          <h2 className="text-lg font-black text-brand-ink">Scam Hunter Badges</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl border border-border bg-brand-paper p-4 space-y-2">
            <div className="text-2xl">🛡️</div>
            <p className="text-xs font-black text-brand-ink">OTP Guardian</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Refused to share OTP with fake bank callers
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-brand-paper p-4 space-y-2">
            <div className="text-2xl">📱</div>
            <p className="text-xs font-black text-brand-ink">Fake App Buster</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Verified RBI NBFC license before downloading
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-brand-paper p-4 space-y-2">
            <div className="text-2xl">⚡</div>
            <p className="text-xs font-black text-brand-ink">Liquidity Shield</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Kept 3 months of emergency buffer safe</p>
          </div>

          <div className="rounded-2xl border border-border bg-brand-paper p-4 space-y-2">
            <div className="text-2xl">📞</div>
            <p className="text-xs font-black text-brand-ink">1930 First Responder</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Saved cyber fraud helpline in parent phone
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
