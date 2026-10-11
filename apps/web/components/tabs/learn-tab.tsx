"use client";

import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { cn } from "@gullak/ui/lib/utils";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { useState } from "react";

interface LearnTabProps {
  gradeGroup: string;
  onLaunchLesson: (topicId: string) => void;
  onLaunchSpotAndSort: () => void;
}

interface TopicCard {
  id: string;
  title: string;
  pillar: "plan-budget" | "save-manage" | "investing" | "stay-safe";
  description: string;
  gradeGroup: string[];
  formats: string[];
  isUnlocked: boolean;
  isCompleted?: boolean;
  durationMinutes: number;
  activityType?: "lesson" | "spot-and-sort" | "sim";
}

const curriculumTopics: TopicCard[] = [
  // Plan & Budget
  {
    id: "needs-vs-wants",
    title: "Needs vs Wants",
    pillar: "plan-budget",
    description: "Learn how to spot budget leaks and prioritize essentials before spending on impulse items.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["story", "spot-and-sort", "quiz"],
    isUnlocked: true,
    isCompleted: true,
    durationMinutes: 3,
    activityType: "spot-and-sort",
  },
  {
    id: "money-basics",
    title: "Pocket Money & Income Basics",
    pillar: "plan-budget",
    description: "Tracking daily coins, kirana udhaar, and understanding where family money flows.",
    gradeGroup: ["grade-6-7", "grade-8-10"],
    formats: ["story", "visual", "quiz"],
    isUnlocked: true,
    isCompleted: true,
    durationMinutes: 4,
    activityType: "lesson",
  },
  {
    id: "budgeting-uneven-income",
    title: "Budgeting for Uneven Income",
    pillar: "plan-budget",
    description: "How auto drivers and daily earners manage bills in dry months.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["simulation", "calculator", "quiz"],
    isUnlocked: true,
    durationMinutes: 6,
    activityType: "lesson",
  },
  {
    id: "inflation",
    title: "Inflation & Why Prices Rise",
    pillar: "plan-budget",
    description: "Why ₹100 today buys fewer samosas than 10 years ago.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["visual", "formula", "quiz"],
    isUnlocked: true,
    durationMinutes: 5,
    activityType: "lesson",
  },

  // Save & Manage
  {
    id: "emergency-fund",
    title: "The 3-Month Emergency Fund",
    pillar: "save-manage",
    description: "Build a liquid reserve to survive medical bills and income shocks without debt.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["story", "visual", "quiz"],
    isUnlocked: true,
    isCompleted: true,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "bank-accounts-upi",
    title: "Bank Accounts & Safe UPI",
    pillar: "save-manage",
    description: "Opening a teen savings account, understanding IFSC, and paying safely via QR.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["story", "visual", "quiz"],
    isUnlocked: true,
    durationMinutes: 4,
    activityType: "lesson",
  },
  {
    id: "fixed-deposit",
    title: "Fixed Deposit & Early Penalties",
    pillar: "save-manage",
    description: "How bank FDs lock interest rates and what happens if you break them early.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["calculator", "simulation", "quiz"],
    isUnlocked: true,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "recurring-deposit",
    title: "Recurring Deposit (RD) Discipline",
    pillar: "save-manage",
    description: "Depositing ₹500 every month automatically to build your first ₹6,000 lump sum.",
    gradeGroup: ["grade-6-7", "grade-8-10"],
    formats: ["formula", "calculator", "quiz"],
    isUnlocked: true,
    durationMinutes: 4,
    activityType: "lesson",
  },

  // Understand Investing
  {
    id: "compounding",
    title: "The Magic of Compounding",
    pillar: "investing",
    description: "Why saving at age 15 beats saving at age 25, calculated with real exponential curves.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["formula", "visual", "quiz"],
    isUnlocked: true,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "gold-and-sgb",
    title: "Gold: Physical vs Sovereign Bonds",
    pillar: "investing",
    description: "Understanding traditional jewellery storage vs 2.5% earning RBI Sovereign Gold Bonds.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["visual", "story", "quiz"],
    isUnlocked: false,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "mutual-funds-sip",
    title: "Mutual Funds & SIP Basics",
    pillar: "investing",
    description: "Pooling money to buy a basket of companies without picking individual stocks.",
    gradeGroup: ["grade-11-12"],
    formats: ["simulation", "calculator", "quiz"],
    isUnlocked: false,
    durationMinutes: 7,
    activityType: "lesson",
  },
  {
    id: "index-funds-diversification",
    title: "Index Funds & Market Ups/Downs",
    pillar: "investing",
    description: "Owning India's top 50 companies at low cost, and holding through volatility.",
    gradeGroup: ["grade-11-12"],
    formats: ["simulation", "visual", "quiz"],
    isUnlocked: false,
    durationMinutes: 6,
    activityType: "lesson",
  },

  // Stay Financially Safe
  {
    id: "upi-and-phishing-scams",
    title: "Spotting Phishing & OTP Scams",
    pillar: "stay-safe",
    description: "Why real banks never call asking for PIN, OTP, or remote screen sharing apps.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["story", "spot-and-sort", "quiz"],
    isUnlocked: true,
    isCompleted: true,
    durationMinutes: 4,
    activityType: "spot-and-sort",
  },
  {
    id: "the-doubling-scheme",
    title: "The Doubling Scheme (Ponzi Drills)",
    pillar: "stay-safe",
    description: "Lucky Bhai's 'Give ₹1,000 get ₹2,000 in 7 days' trick exposed with simple maths.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["story", "simulation", "quiz"],
    isUnlocked: true,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "fake-loan-apps",
    title: "Trap of Instant Loan Apps",
    pillar: "stay-safe",
    description: "Contact book permissions, predatory 300% APR fees, and how to verify RBI NBFC registration.",
    gradeGroup: ["grade-8-10", "grade-11-12"],
    formats: ["story", "visual", "quiz"],
    isUnlocked: true,
    durationMinutes: 5,
    activityType: "lesson",
  },
  {
    id: "reporting-fraud-1930",
    title: "Reporting Cyber Fraud (1930)",
    pillar: "stay-safe",
    description: "Golden hour protocol: what to do within 2 hours of accidental UPI fraud.",
    gradeGroup: ["grade-6-7", "grade-8-10", "grade-11-12"],
    formats: ["visual", "quiz"],
    isUnlocked: true,
    durationMinutes: 3,
    activityType: "lesson",
  },
];

export function LearnTab({ gradeGroup, onLaunchLesson, onLaunchSpotAndSort }: LearnTabProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");

  const pillars = [
    { id: "all", label: "All Pillars", icon: Sparkles },
    { id: "plan-budget", label: "Plan & Budget", icon: Compass },
    { id: "save-manage", label: "Save & Manage", icon: TrendingUp },
    { id: "investing", label: "Understand Investing", icon: BookOpen },
    { id: "stay-safe", label: "Stay Financially Safe", icon: ShieldAlert },
  ];

  const filteredTopics = curriculumTopics.filter(
    (topic) => selectedPillar === "all" || topic.pillar === selectedPillar,
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-4 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-xs font-black uppercase">
              Curriculum Map
            </span>
            <span className="rounded-full bg-brand-lilac text-brand-ink px-2.5 py-0.5 text-xs font-bold">
              Class {gradeGroup === "6-7" ? "6–7" : gradeGroup === "8-10" ? "8–10" : "11–12"}
            </span>
            <PlayMoneyBadge label="Learn By Doing" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-brand-ink mt-1">
            The Four Vanguard Pillars
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Progressive mastery tree. Passing quizzes and simulation activities unlocks advanced portfolio instruments.
          </p>
        </div>
      </div>

      {/* Pillar Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isSelected = selectedPillar === pillar.id;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setSelectedPillar(pillar.id)}
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all border",
                isSelected
                  ? "bg-brand-ink text-brand-paper border-brand-ink shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:bg-brand-muted hover:text-brand-ink",
              )}
            >
              <Icon className={cn("size-3.5", isSelected ? "text-brand-lime" : "")} />
              <span>{pillar.label}</span>
            </button>
          );
        })}
      </div>

      {/* Topic Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTopics.map((topic) => {
          const pillarBorder =
            topic.pillar === "plan-budget"
              ? "border-l-4 border-l-brand-lime"
              : topic.pillar === "save-manage"
                ? "border-l-4 border-l-brand-lilac"
                : topic.pillar === "investing"
                  ? "border-l-4 border-l-brand-yellow"
                  : "border-l-4 border-l-brand-coral";

          return (
            <div
              key={topic.id}
              className={cn(
                "flex flex-col justify-between rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all hover:shadow-md",
                pillarBorder,
                !topic.isUnlocked && "opacity-60 bg-brand-muted/30",
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Clock className="size-3" />
                    <span>~{topic.durationMinutes} mins</span>
                  </div>

                  {topic.isCompleted ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-black">
                      <CheckCircle2 className="size-3" /> Mastered
                    </span>
                  ) : topic.isUnlocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-brand-muted text-brand-ink px-2.5 py-0.5 text-xs font-bold">
                      <Unlock className="size-3" /> Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-semibold">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-brand-ink">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{topic.description}</p>
                </div>

                {/* Formats Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="rounded-lg border border-border/80 bg-brand-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/80"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">
                  {topic.pillar === "plan-budget"
                    ? "Plan & Budget"
                    : topic.pillar === "save-manage"
                      ? "Save & Manage"
                      : topic.pillar === "investing"
                        ? "Understand Investing"
                        : "Stay Financially Safe"}
                </span>

                {topic.isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (topic.activityType === "spot-and-sort") {
                        onLaunchSpotAndSort();
                      } else {
                        onLaunchLesson(topic.id);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-ink px-3.5 py-2 text-xs font-bold text-brand-paper hover:bg-brand-ink/90 transition-transform active:scale-95 shadow-2xs"
                  >
                    <span>{topic.activityType === "spot-and-sort" ? "Play Activity" : "Start Lesson"}</span>
                    <ArrowRight className="size-3 text-brand-lime" />
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Lock className="size-3" /> Complete prerequisite
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
