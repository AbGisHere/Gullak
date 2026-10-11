"use client";

import { startingCapital } from "@gullak/content";
import { startingCash } from "@gullak/engine";
import { PaperPortfolio } from "@gullak/ui/components/paper-portfolio";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { readLearnerState, readProfile } from "@/lib/learner-state";
import { startingPortfolio } from "@/lib/portfolio-adapter";

export default function PortfolioPage() {
  const t = useTranslations("learner");
  const [model, setModel] = useState(() => startingPortfolio(startingCapital.defaultInr * 100));
  useEffect(() => {
    const profile = readProfile();
    if (profile)
      setModel(
        startingPortfolio(
          startingCash(startingCapital, profile.gradeGroup, profile.experience),
          readLearnerState().practiceCashPaise,
        ),
      );
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-extrabold tracking-tight">{t("portfolioTitle")}</h1>
      <p className="max-w-prose text-muted-foreground">{t("portfolioDescription")}</p>
      <PaperPortfolio
        portfolio={model}
        labels={{
          paperPortfolioTitle: t("paperPortfolioTitle"),
          playMoneyBadge: t("playMoney"),
          availableCash: t("availableCash"),
        }}
      />
    </div>
  );
}
