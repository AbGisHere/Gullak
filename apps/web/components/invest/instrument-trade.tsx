"use client";

import { MILLI_UNITS, pricePaiseFromRupees } from "@gullak/engine";
import type { InstrumentQuote } from "@gullak/types";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { ArrowLeft, Eye, Lock, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useId, useState } from "react";
import { AccessLabel, useLearner } from "@/components/invest/invest-search";
import { applyTrade, availableCashPaise, fetchQuote, formatUnits, tradeAccess } from "@/lib/invest";
import { saveLearnerState } from "@/lib/learner-state";

export type UnlockLessons = Partial<Record<"stock" | "etf" | "mutual-fund", { topicId: string; title: string }>>;

type QuoteState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; quote: InstrumentQuote };
type Message = { tone: "done" | "error"; text: string } | null;

/** `"2.5"` → 2500 milli-units; whole units only when `whole`. Null when not a positive number. */
function parseUnits(value: string, whole: boolean): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (whole && !Number.isInteger(n)) return null;
  const milli = Math.round(n * MILLI_UNITS);
  return milli > 0 && Number.isSafeInteger(milli) ? milli : null;
}

export function InstrumentTrade({
  symbol,
  lessons,
  initialSide = "buy",
}: {
  symbol: string;
  lessons: UnlockLessons;
  initialSide?: "buy" | "sell";
}) {
  const t = useTranslations("invest");
  const tLearner = useTranslations("learner");
  const locale = useLocale();
  const learner = useLearner();
  const inputId = useId();
  const [quoteState, setQuoteState] = useState<QuoteState>({ status: "loading" });
  const [side, setSide] = useState<"buy" | "sell">(initialSide);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuote(symbol, controller.signal).then((quote) => {
      if (!controller.signal.aborted) setQuoteState(quote ? { status: "ready", quote } : { status: "unavailable" });
    });
    return () => controller.abort();
  }, [symbol]);

  const back = (
    <Link
      href="/portfolio/invest"
      className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t("back")}
    </Link>
  );

  if (!learner) return null;
  if (quoteState.status !== "ready")
    return (
      <section className="max-w-2xl space-y-6">
        {back}
        <h1 className="text-3xl font-extrabold tracking-tight break-words">{symbol}</h1>
        <p role="status" className={quoteState.status === "unavailable" ? "" : "text-muted-foreground"}>
          {quoteState.status === "unavailable" ? t("priceUnavailable") : t("loadingPrice")}
        </p>
      </section>
    );

  const { quote } = quoteState;
  const { profile, state } = learner;
  const cash = availableCashPaise(profile, state);
  const access = tradeAccess(quote.kind, profile.gradeGroup, state.passedTopics);
  const holding = state.paperHoldings.find((h) => h.symbol === quote.symbol);
  const isIndex = quote.kind === "index";
  const wholeUnits = quote.kind !== "mutual-fund";
  const pricePaise = pricePaiseFromRupees(quote.price);
  const priceText = isIndex
    ? t("points", { value: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(quote.price) })
    : formatInr(pricePaise, { decimals: 2 });
  const change = quote.previousClose ? (quote.price - quote.previousClose) / quote.previousClose : 0;
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(
    Math.abs(change),
  );
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const asOf = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(quote.asOf));
  const lesson = quote.kind === "index" ? undefined : lessons[quote.kind];
  const kindPlural = quote.kind === "index" ? "" : t(`kindPlural.${quote.kind}`);

  // Buying shares/ETFs takes a whole-unit count; funds take a rupee amount. Selling always takes units.
  const buyByAmount = side === "buy" && !wholeUnits;
  const amountPaise = buyByAmount && Number(value) > 0 ? Math.round(Number(value) * 100) : null;
  const milli = buyByAmount ? null : parseUnits(value, wholeUnits);
  const estimatePaise = buyByAmount ? amountPaise : milli ? Math.round((milli * pricePaise) / MILLI_UNITS) : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const order =
      side === "sell"
        ? milli
          ? ({ side: "sell", milliUnits: milli } as const)
          : null
        : buyByAmount
          ? amountPaise
            ? ({ side: "buy", amountPaise } as const)
            : null
          : milli
            ? ({ side: "buy", quantity: milli / MILLI_UNITS } as const)
            : null;
    if (!order) return setMessage({ tone: "error", text: t("errors.invalid-order") });
    const outcome = applyTrade(state, cash, quote, order);
    if (!outcome.ok)
      return setMessage({
        tone: "error",
        text: t(`errors.${outcome.reason}`, { cash: formatInr(cash, { decimals: 2 }) }),
      });
    if (!saveLearnerState(outcome.state)) return setMessage({ tone: "error", text: t("errors.save-failed") });
    setValue("");
    const units = formatUnits(outcome.milliUnits, locale);
    const amount = formatInr(outcome.amountPaise, { decimals: 2 });
    setMessage({ tone: "done", text: side === "buy" ? t("bought", { units, amount }) : t("sold", { units, amount }) });
  }

  return (
    <section className="max-w-2xl space-y-8">
      {back}
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{quote.name}</h1>
          <AccessLabel access={access} />
        </div>
        <p className="text-sm text-muted-foreground">
          {quote.symbol} · {quote.exchange} · {t(`kind.${quote.kind}`)}
        </p>
      </header>

      <div className="space-y-1 border-y border-border py-5">
        <p className="text-sm font-semibold text-muted-foreground">{isIndex ? t("indexLevel") : t("priceLabel")}</p>
        <p className="text-4xl font-extrabold tabular-nums">{priceText}</p>
        <p className="flex items-center gap-1.5 font-semibold">
          <ChangeIcon className="size-4" aria-hidden="true" />
          {change > 0 ? t("changeUp", { percent }) : change < 0 ? t("changeDown", { percent }) : t("changeFlat")}
        </p>
        <p className="text-sm text-muted-foreground">{t("asOf", { time: asOf })}</p>
      </div>

      {access.status === "view-only" ? (
        <div className="flex gap-3 rounded-2xl bg-muted p-5">
          <Eye className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">{t("viewOnlyTitle")}</h2>
            <p>{t("viewOnlyBody")}</p>
          </div>
        </div>
      ) : null}

      {access.status === "locked" || access.status === "not-in-class" ? (
        <div className="flex gap-3 rounded-2xl border-2 border-foreground p-5">
          <Lock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-3">
            <h2 className="text-lg font-bold">{t("lockedTitle")}</h2>
            <p>
              {access.status === "locked"
                ? t("lockedBody", { lesson: lesson?.title ?? access.topicId, kindPlural })
                : t("notInClassBody", { kindPlural })}
            </p>
            {access.status === "locked" ? (
              <Link
                href={`/learn/${access.topicId}`}
                className="inline-flex min-h-12 items-center rounded-lg bg-foreground px-5 font-bold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("lockedAction")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {access.status === "open" ? (
        <form onSubmit={submit} className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <fieldset className="inline-flex rounded-xl border-2 border-foreground p-1">
              <legend className="sr-only">{t("sideLabel")}</legend>
              {(["buy", "sell"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={side === option}
                  disabled={option === "sell" && !holding}
                  onClick={() => {
                    setSide(option);
                    setValue("");
                    setMessage(null);
                  }}
                  className="min-h-11 min-w-24 rounded-lg px-4 font-bold aria-pressed:bg-foreground aria-pressed:text-background disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t(option)}
                </button>
              ))}
            </fieldset>
            <PlayMoneyBadge label={tLearner("playMoney")} />
          </div>

          <p className="font-semibold tabular-nums">{t("cash", { amount: formatInr(cash, { decimals: 2 }) })}</p>
          {holding ? (
            <p className="tabular-nums">
              {t("youHold", {
                units: formatUnits(holding.milliUnits, locale),
                value: formatInr(Math.floor((holding.milliUnits * pricePaise) / MILLI_UNITS), { decimals: 2 }),
                cost: formatInr(holding.costPaise, { decimals: 2 }),
              })}
            </p>
          ) : null}

          <div className="space-y-2">
            <label htmlFor={inputId} className="block font-semibold">
              {side === "sell" ? t("sellUnitsLabel") : buyByAmount ? t("amountLabel") : t("quantityLabel")}
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                id={inputId}
                inputMode={wholeUnits && !buyByAmount ? "numeric" : "decimal"}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value.replace(/[^\d.]/g, ""));
                  setMessage(null);
                }}
                className="min-h-12 w-40 rounded-xl border-2 border-foreground bg-card px-4 text-lg font-bold tabular-nums outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
              />
              {side === "sell" && holding ? (
                <button
                  type="button"
                  onClick={() => setValue(String(holding.milliUnits / MILLI_UNITS))}
                  className="min-h-12 rounded-xl border border-border px-4 font-semibold hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t("sellAll")}
                </button>
              ) : null}
            </div>
            {estimatePaise ? (
              <p className="text-muted-foreground tabular-nums">
                {side === "buy"
                  ? t("estimate", { amount: formatInr(estimatePaise, { decimals: 2 }) })
                  : t("estimateSell", { amount: formatInr(estimatePaise, { decimals: 2 }) })}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center rounded-lg bg-foreground px-6 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {side === "buy" ? t("confirmBuy") : t("confirmSell")}
          </button>
          <p role="status" className={message?.tone === "error" ? "font-semibold text-destructive" : "font-semibold"}>
            {message?.text}
          </p>
        </form>
      ) : null}

      <footer className="space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
        <p>{t("habit")}</p>
        <p>{t("guardrail")}</p>
      </footer>
    </section>
  );
}
