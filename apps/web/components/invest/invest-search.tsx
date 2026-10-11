"use client";

import type { InstrumentSearchResult, LearnerProfile } from "@gullak/types";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { ChevronRight, Eye, Lock, Search, Unlock } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { availableCashPaise, formatUnits, searchListings, type TradeAccess, tradeAccess } from "@/lib/invest";
import { type LearnerState, readLearnerState, readProfile } from "@/lib/learner-state";

const SUGGESTIONS = ["nifty", "bank", "pharma", "gold", "it"] as const;

export function instrumentHref(symbol: string) {
  return `/portfolio/invest/${encodeURIComponent(symbol)}`;
}

/** Reads the learner's profile and play-money state, and follows changes from other screens. */
export function useLearner() {
  const [learner, setLearner] = useState<{ profile: LearnerProfile; state: LearnerState } | null>(null);
  useEffect(() => {
    const load = () => {
      const profile = readProfile();
      setLearner(profile ? { profile, state: readLearnerState() } : null);
    };
    load();
    window.addEventListener("gullak-state-change", load);
    return () => window.removeEventListener("gullak-state-change", load);
  }, []);
  return learner;
}

export function AccessLabel({ access }: { access: TradeAccess }) {
  const t = useTranslations("invest");
  const Icon = access.status === "open" ? Unlock : access.status === "view-only" ? Eye : Lock;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold ${access.status === "open" ? "text-foreground" : "text-muted-foreground"}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {t(`status.${access.status}`)}
    </span>
  );
}

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; results: InstrumentSearchResult[] };

export function InvestSearch() {
  const t = useTranslations("invest");
  const tLearner = useTranslations("learner");
  const locale = useLocale();
  const learner = useLearner();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearch({ status: "idle" });
      return;
    }
    // `attempt` re-runs the same query after a failed search.
    void attempt;
    const controller = new AbortController();
    setSearch({ status: "loading" });
    const timer = window.setTimeout(() => {
      searchListings(q, controller.signal)
        .then((results) => setSearch(results ? { status: "done", results } : { status: "error" }))
        .catch(() => {
          /* Aborted by a newer query. */
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, attempt]);

  if (!learner) return null;
  const { profile, state } = learner;
  const cash = availableCashPaise(profile, state);

  return (
    <section className="max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-balance">{t("title")}</h1>
          <PlayMoneyBadge label={tLearner("playMoney")} />
        </div>
        <p className="max-w-prose text-base text-muted-foreground">{t("intro")}</p>
        <p className="text-lg font-bold tabular-nums">{t("cash", { amount: formatInr(cash) })}</p>
      </header>

      <div className="space-y-3">
        <label htmlFor={inputId} className="block text-base font-semibold">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            maxLength={60}
            className="min-h-13 w-full rounded-xl border-2 border-foreground bg-card py-3 pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring/40"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("tryLabel")}</span>
          {SUGGESTIONS.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => setQuery(word)}
              className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="space-y-3">
        {search.status === "loading" ? <p className="text-muted-foreground">{t("searching")}</p> : null}
        {search.status === "error" ? (
          <div className="flex flex-wrap items-center gap-3">
            <p>{t("searchFailed")}</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="min-h-11 rounded-lg border-2 border-foreground px-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("retry")}
            </button>
          </div>
        ) : null}
        {search.status === "done" && search.results.length === 0 ? (
          <p>{t("noResults", { query: query.trim() })}</p>
        ) : null}
        {search.status === "done" && search.results.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {search.results.map((result) => (
              <li key={result.symbol}>
                <Link
                  href={instrumentHref(result.symbol)}
                  className="flex min-h-18 items-center gap-4 py-3 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block text-base font-bold leading-snug">{result.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {result.symbol} · {result.exchange} · {t(`kind.${result.kind}`)}
                    </span>
                    <AccessLabel access={tradeAccess(result.kind, profile.gradeGroup, state.passedTopics)} />
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <section aria-labelledby="holdings-title" className="space-y-3">
        <h2 id="holdings-title" className="text-2xl font-bold">
          {t("holdingsTitle")}
        </h2>
        {state.paperHoldings.length === 0 ? (
          <p className="text-muted-foreground">{t("holdingsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {state.paperHoldings.map((holding) => (
              <li key={holding.symbol} className="flex min-h-16 items-center gap-3 py-3">
                <Link
                  href={instrumentHref(holding.symbol)}
                  className="min-w-0 flex-1 rounded-lg hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="block truncate font-bold">{holding.name}</span>
                  <span className="block text-sm text-muted-foreground tabular-nums">
                    {t("holdingLine", {
                      units: formatUnits(holding.milliUnits, locale),
                      cost: formatInr(holding.costPaise),
                    })}
                  </span>
                </Link>
                <Link
                  href={`${instrumentHref(holding.symbol)}?side=sell`}
                  aria-label={t("sellHolding", { name: holding.name })}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-lg border-2 border-foreground px-4 text-sm font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t("sell")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
        <p>{t("habit")}</p>
        <p>{t("guardrail")}</p>
      </footer>
    </section>
  );
}
