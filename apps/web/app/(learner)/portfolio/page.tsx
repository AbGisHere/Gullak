"use client";

import { startingCapital } from "@gullak/content";
import { holdingValuePaise, pricePaiseFromRupees, startingCash } from "@gullak/engine";
import { PaperPortfolio } from "@gullak/ui/components/paper-portfolio";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GulluTip } from "@/components/help/gullu-tip";
import { TermHelp } from "@/components/help/term-help";
import { instrumentHref } from "@/components/invest/invest-search";
import { fetchQuote } from "@/lib/invest";
import { readLearnerState, readProfile } from "@/lib/learner-state";
import { paperHoldingItem, startingPortfolio } from "@/lib/portfolio-adapter";

export default function PortfolioPage() {
  const t = useTranslations("learner");
  const tInvest = useTranslations("invest");
  const [model, setModel] = useState(() => startingPortfolio(startingCapital.defaultInr * 100));
  useEffect(() => {
    const profile = readProfile();
    if (!profile) return;
    const state = readLearnerState();
    const build = (values: Map<string, { valuePaise: number; asOf: string }>) =>
      startingPortfolio(
        startingCash(startingCapital, profile.gradeGroup, profile.experience),
        state.practiceCashPaise,
        {
          cashDeltaPaise: state.liveCashDeltaPaise,
          holdings: state.paperHoldings.map((h) => {
            const live = values.get(h.symbol);
            return paperHoldingItem(h, live?.valuePaise, live?.asOf);
          }),
        },
      );
    setModel(build(new Map()));
    // Holdings show their cost first, then today's play-money value once live prices arrive.
    const controller = new AbortController();
    Promise.all(
      state.paperHoldings.map(async (h) => {
        const quote = await fetchQuote(h.symbol, controller.signal);
        return quote
          ? ([
              h.symbol,
              { valuePaise: holdingValuePaise(h, pricePaiseFromRupees(quote.price)), asOf: quote.asOf },
            ] as const)
          : null;
      }),
    ).then((entries) => {
      if (!controller.signal.aborted && entries.some(Boolean))
        setModel(build(new Map(entries.filter((e) => e !== null))));
    });
    return () => controller.abort();
  }, []);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">{t("portfolioTitle")}</h1>
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
      <p className="max-w-prose text-sm text-muted-foreground">{tInvest("openHint")}</p>
      <GulluTip place="portfolio" className="flex max-w-xl items-start gap-3 py-2" />
      <PaperPortfolio
        portfolio={model}
        renderHoldingAction={(holding) => (
          <Link
            href={`${instrumentHref(holding.id)}?side=sell`}
            aria-label={tInvest("sellHolding", { name: holding.name })}
            className="inline-flex min-h-11 items-center rounded-lg border-2 border-foreground px-4 text-sm font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tInvest("sell")}
          </Link>
        )}
        labels={{
          paperPortfolioTitle: t("paperPortfolioTitle"),
          playMoneyBadge: t("playMoney"),
          availableCash: t("availableCash"),
        }}
      />
    </div>
  );
}
