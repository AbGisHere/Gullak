"use client";

import type { MoneyTermData } from "@gullak/ui/components/money-decoder";
import { PaperPortfolio } from "@gullak/ui/components/paper-portfolio";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { exampleStudentPortfolio, portfolioFixtureTerms } from "@gullak/ui/fixtures/portfolio-fixtures";
import { formatInr } from "@gullak/ui/lib/format";
import { CheckCircle2, PiggyBank, PlusCircle } from "lucide-react";
import { useState } from "react";

interface PortfolioTabProps {
  gradeGroup?: string;
}

export function PortfolioTab({ gradeGroup: _gradeGroup }: PortfolioTabProps) {
  const [portfolioData, setPortfolioData] = useState(exampleStudentPortfolio);
  const [activeTerm, setActiveTerm] = useState<MoneyTermData | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  function handleQuickAddPiggy(amountPaise: number) {
    if (portfolioData.cashPaise < amountPaise) {
      setActionNotice("Not enough free cash in hand!");
      return;
    }
    setPortfolioData((prev) => ({
      ...prev,
      cashPaise: prev.cashPaise - amountPaise,
      holdings: prev.holdings.map((h) =>
        h.id === "holding-piggy-bank" ? { ...h, currentValuePaise: h.currentValuePaise + amountPaise } : h,
      ),
    }));
    setActionNotice(`Successfully added ${formatInr(amountPaise)} to your Emergency Piggy Bank!`);
    setTimeout(() => setActionNotice(null), 3000);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-4 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-xs font-black uppercase">
              Paper Ledger
            </span>
            <PlayMoneyBadge label="100% Virtual Play Money" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-brand-ink mt-1">
            Paper Portfolio &amp; Goals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real prices from AMFI and RBI card rates. Scored on liquidity discipline, never gambling returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddAction((prev) => !prev)}
          className="flex items-center gap-2 rounded-2xl bg-brand-ink px-4 py-2.5 text-xs font-bold text-brand-paper hover:bg-brand-ink/90 transition-transform active:scale-95 self-start shadow-xs"
        >
          <PlusCircle className="size-4 text-brand-lime" />
          <span>Save to Piggy Bank</span>
        </button>
      </div>

      {actionNotice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950 p-4 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Quick Deposit Action Card */}
      {showAddAction && (
        <div className="rounded-3xl border-2 border-brand-lime bg-card p-5 sm:p-6 shadow-md space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-brand-ink">
              <PiggyBank className="size-5 text-brand-coral" />
              <span>Transfer from Cash to Liquid Reserve</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAction(false)}
              className="text-muted-foreground hover:text-brand-ink text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Move unallocated pocket cash into your emergency cache. This increases your Liquidity Safety buffer.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickAddPiggy(50000)}
              className="rounded-xl border border-border bg-brand-paper px-4 py-2 text-xs font-bold text-brand-ink hover:bg-brand-lime transition-colors"
            >
              + ₹500
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddPiggy(100000)}
              className="rounded-xl border border-border bg-brand-paper px-4 py-2 text-xs font-bold text-brand-ink hover:bg-brand-lime transition-colors"
            >
              + ₹1,000
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddPiggy(200000)}
              className="rounded-xl border border-border bg-brand-paper px-4 py-2 text-xs font-bold text-brand-ink hover:bg-brand-lime transition-colors"
            >
              + ₹2,000
            </button>
          </div>
        </div>
      )}

      {/* R2's PaperPortfolio Component */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <PaperPortfolio
          portfolio={portfolioData}
          onTermOpen={(termKey) => {
            const found = portfolioFixtureTerms[termKey as keyof typeof portfolioFixtureTerms];
            if (found) setActiveTerm(found);
          }}
          onHoldingOpen={(_id) => {
            // Holding opened
          }}
          onGoalOpen={(_goalId) => {
            // Goal opened
          }}
        />
      </div>

      {/* Embedded MoneyDecoder Modal */}
      {activeTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="rounded-full bg-brand-lime text-brand-ink px-2.5 py-0.5 text-xs font-black uppercase">
                Portfolio Decoder
              </span>
              <button
                type="button"
                onClick={() => setActiveTerm(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-brand-muted hover:text-brand-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-black text-brand-ink">{activeTerm.term}</h3>
            <p className="text-xs font-semibold text-brand-coral">{activeTerm.expandedName}</p>

            <div className="space-y-3 text-xs sm:text-sm text-brand-ink/90 leading-relaxed">
              <div className="rounded-xl bg-brand-paper p-3 border border-border">
                <p className="font-bold text-xs text-muted-foreground uppercase">Plain Meaning</p>
                <p className="mt-1">{activeTerm.plainMeaning}</p>
              </div>

              <div className="rounded-xl bg-brand-paper p-3 border border-border">
                <p className="font-bold text-xs text-muted-foreground uppercase">Where You See It</p>
                <ul className="mt-1 list-disc list-inside">
                  {activeTerm.whereYouSeeIt.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {activeTerm.misconception && (
                <div className="rounded-xl bg-brand-yellow/30 p-3 border border-brand-yellow">
                  <p className="font-bold text-xs text-brand-ink uppercase">Common Misconception</p>
                  <p className="mt-1">{activeTerm.misconception}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTerm(null)}
                className="rounded-xl bg-brand-ink px-5 py-2 text-xs font-bold text-brand-paper"
              >
                Close Decoder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
