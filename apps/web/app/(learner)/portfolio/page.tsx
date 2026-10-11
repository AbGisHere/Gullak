"use client";

import type { LearnerProfile } from "@gullak/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GulluTip } from "@/components/help/gullu-tip";
import { TermHelp } from "@/components/help/term-help";
import { PortfolioBoard } from "@/components/portfolio/portfolio-board";
import { totalCashPaise } from "@/lib/invest";
import { readProfile } from "@/lib/learner-state";
import { useLearnerState } from "@/lib/use-learner-state";

export default function PortfolioPage() {
  const t = useTranslations("learner");
  const tInvest = useTranslations("invest");
  const state = useLearnerState();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  useEffect(() => setProfile(readProfile()), []);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("portfolioTitle")}</h1>
          <TermHelp term="portfolio" />
        </div>
        <Link
          href="/portfolio/invest"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-foreground px-5 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          {tInvest("openButton")}
        </Link>
      </div>
      <p className="max-w-prose text-muted-foreground">
        {t("portfolioDescription")} <TermHelp term="playMoney" />
      </p>
      <GulluTip place="portfolio" className="flex max-w-xl items-start gap-3 py-2" />
      {profile ? (
        <PortfolioBoard profile={profile} state={state} totalCashPaise={totalCashPaise(profile, state)} />
      ) : null}
    </div>
  );
}
