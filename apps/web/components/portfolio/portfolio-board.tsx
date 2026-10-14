"use client";

import { holdingValuePaise, pricePaiseFromRupees } from "@gullak/engine";
import type { LearnerProfile, ListedKind } from "@gullak/types";
import { formatInr } from "@gullak/ui/lib/format";
import { cn } from "@gullak/ui/lib/utils";
import { BookOpen, ChartLine, ShieldCheck, Target, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { instrumentHref } from "@/components/invest/invest-search";
import { availableCashPaise, fetchQuote, formatUnits } from "@/lib/invest";
import { type LearnerState, saveLearnerState } from "@/lib/learner-state";
import {
  addGoal,
  addToGoal,
  addToReserve,
  type JarError,
  type JarOutcome,
  monthlyToReach,
  removeGoal,
  setReserveTarget,
  takeFromGoal,
  takeFromReserve,
} from "@/lib/money-jars";

type Section = "investments" | "reserve" | "goals";
type Holding = LearnerState["paperHoldings"][number];
type Goal = LearnerState["goals"][number];

/** Holdings are grouped by what they are, in the order the invest search lists them. */
const KIND_ORDER: ListedKind[] = ["stock", "mutual-fund", "etf", "index"];
const BUCKET_TONE = {
  cash: "bg-muted-foreground/45",
  reserve: "bg-brand-lime",
  goals: "bg-brand-coral",
  investments: "bg-brand-lilac",
} as const;

/** Rupees typed by the learner → whole paise, or null when it isn't a positive amount. */
export function rupeesToPaise(text: string): number | null {
  const cleaned = text.replace(/[,\s₹]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const paise = Math.round(Number(cleaned) * 100);
  return Number.isSafeInteger(paise) && paise > 0 ? paise : null;
}

/**
 * The learner's whole play-money picture in four buckets: free cash, the emergency reserve, saving goals
 * and investments. The reserve and goals only move cash between jars; nothing here buys or sells.
 */
export function PortfolioBoard({
  profile,
  state,
  totalCashPaise,
}: {
  profile: LearnerProfile;
  state: LearnerState;
  totalCashPaise: number;
}) {
  const t = useTranslations("portfolioBoard");
  const locale = useLocale();
  const [section, setSection] = useState<Section>("investments");
  const [values, setValues] = useState<Map<string, number>>(new Map());

  // Holdings show their cost first, then today's play-money value once live prices arrive. Prices are
  // refetched only when what is held changes, not on every move between jars.
  const holdingsRef = useRef(state.paperHoldings);
  holdingsRef.current = state.paperHoldings;
  const heldKey = state.paperHoldings.map((h) => `${h.symbol}:${h.milliUnits}`).join(",");
  useEffect(() => {
    if (!heldKey) return;
    const controller = new AbortController();
    Promise.all(
      holdingsRef.current.map(async (h) => {
        const quote = await fetchQuote(h.symbol, controller.signal);
        return quote ? ([h.symbol, holdingValuePaise(h, pricePaiseFromRupees(quote.price))] as const) : null;
      }),
    ).then((entries) => {
      if (!controller.signal.aborted) setValues(new Map(entries.filter((e) => e !== null)));
    });
    return () => controller.abort();
  }, [heldKey]);

  const freeCash = availableCashPaise(profile, state);
  const goalsSaved = state.goals.reduce((sum, g) => sum + g.savedPaise, 0);
  const investments = state.paperHoldings.reduce((sum, h) => sum + (values.get(h.symbol) ?? h.costPaise), 0);
  const total = totalCashPaise + investments;
  const buckets = [
    { id: "cash", label: t("freeCash"), paise: freeCash, icon: Wallet },
    { id: "reserve", label: t("reserve"), paise: state.emergencyReservePaise, icon: ShieldCheck },
    { id: "goals", label: t("goals"), paise: goalsSaved, icon: Target },
    { id: "investments", label: t("investments"), paise: investments, icon: ChartLine },
  ] as const;
  const money = (paise: number) => formatInr(paise, { locale: locale === "en" ? "en-IN" : `${locale}-IN` });

  function save(outcome: JarOutcome): JarError | null {
    if (!outcome.ok) return outcome.reason;
    return saveLearnerState(outcome.state) ? null : "invalid-amount";
  }

  const tabs: { id: Section; label: string }[] = [
    { id: "investments", label: t("tabInvestments", { count: state.paperHoldings.length }) },
    { id: "reserve", label: t("reserve") },
    { id: "goals", label: t("tabGoals", { count: state.goals.length }) },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="portfolio-total" className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="portfolio-total" className="text-sm font-semibold text-muted-foreground">
            {t("total")}
          </h2>
        </div>
        <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums" data-testid="portfolio-total-value">
          {money(total)}
        </p>
        <div className="mt-5 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          {buckets.map((b) =>
            b.paise > 0 && total > 0 ? (
              <div key={b.id} className={BUCKET_TONE[b.id]} style={{ width: `${(b.paise / total) * 100}%` }} />
            ) : null,
          )}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {buckets.map((b) => (
            <div key={b.id} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", BUCKET_TONE[b.id])} />
                {b.label}
              </dt>
              <dd className="mt-0.5 font-bold tabular-nums" data-testid={`bucket-${b.id}`}>
                {money(b.paise)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">{t("bucketsNote")}</p>
      </section>

      <nav aria-label={t("sectionsLabel")} className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={section === tab.id}
            onClick={() => setSection(tab.id)}
            className="min-h-11 rounded-lg px-2 py-1 text-xs leading-tight font-semibold sm:px-3 sm:text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {section === "investments" ? (
        <Investments holdings={state.paperHoldings} values={values} money={money} locale={locale} />
      ) : section === "reserve" ? (
        <Reserve state={state} freeCash={freeCash} money={money} save={save} />
      ) : (
        <Goals state={state} freeCash={freeCash} money={money} save={save} locale={locale} />
      )}
    </div>
  );
}

function Investments({
  holdings,
  values,
  money,
  locale,
}: {
  holdings: Holding[];
  values: Map<string, number>;
  money: (paise: number) => string;
  locale: string;
}) {
  const t = useTranslations("portfolioBoard");
  const tInvest = useTranslations("invest");
  if (holdings.length === 0) {
    return (
      <Panel title={t("investments")} icon={<ChartLine className="size-5" aria-hidden="true" />}>
        <p className="text-muted-foreground">{t("noInvestments")}</p>
        <Link
          href="/portfolio/invest"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-foreground px-5 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("browse")}
        </Link>
      </Panel>
    );
  }
  const groups = KIND_ORDER.map((kind) => ({ kind, items: holdings.filter((h) => h.kind === kind) })).filter(
    (g) => g.items.length > 0,
  );
  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const subtotal = group.items.reduce((sum, h) => sum + (values.get(h.symbol) ?? h.costPaise), 0);
        return (
          <section key={group.kind} aria-labelledby={`group-${group.kind}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3 border-b pb-2">
              <h3 id={`group-${group.kind}`} className="text-lg font-bold">
                {t(`kind.${group.kind}`)} <span className="text-muted-foreground">({group.items.length})</span>
              </h3>
              <span className="font-semibold tabular-nums">{money(subtotal)}</span>
            </div>
            <ul className="divide-y">
              {group.items.map((h) => {
                const value = values.get(h.symbol);
                const change = value === undefined ? null : value - h.costPaise;
                return (
                  <li key={h.symbol} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={instrumentHref(h.symbol)}
                        className="font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {h.name}
                      </Link>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {t("holdingLine", {
                          symbol: h.symbol.replace(/\.(NS|BO)$/, ""),
                          units: formatUnits(h.milliUnits, locale === "en" ? "en-IN" : `${locale}-IN`),
                          cost: money(h.costPaise),
                        })}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="font-bold">{money(value ?? h.costPaise)}</p>
                      <p
                        className={cn(
                          "text-sm",
                          change === null
                            ? "text-muted-foreground"
                            : change >= 0
                              ? "text-success-ink"
                              : "text-destructive",
                        )}
                      >
                        {change === null ? t("atCost") : `${change >= 0 ? "+" : "−"}${money(Math.abs(change))}`}
                      </p>
                    </div>
                    <Link
                      href={`${instrumentHref(h.symbol)}?side=sell`}
                      aria-label={tInvest("sellHolding", { name: h.name })}
                      className="inline-flex min-h-11 items-center rounded-lg border-2 border-foreground px-4 text-sm font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {tInvest("sell")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="text-xs text-muted-foreground">{t("valuesNote")}</p>
    </div>
  );
}

function Reserve({
  state,
  freeCash,
  money,
  save,
}: {
  state: LearnerState;
  freeCash: number;
  money: (paise: number) => string;
  save: (outcome: JarOutcome) => JarError | null;
}) {
  const t = useTranslations("portfolioBoard");
  const target = state.reserveTargetPaise;
  const reserve = state.emergencyReservePaise;
  const pct = target ? Math.min(100, Math.round((reserve / target) * 100)) : null;
  return (
    <Panel title={t("reserve")} icon={<ShieldCheck className="size-5" aria-hidden="true" />}>
      <div className="max-w-prose space-y-2">
        <p className="font-semibold">{t("reserveHowTitle")}</p>
        <p className="text-muted-foreground">{t("reserveHowBody")}</p>
      </div>
      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <p className="text-sm text-muted-foreground">{t("reserveNow")}</p>
        <p className="text-3xl font-extrabold tabular-nums" data-testid="reserve-amount">
          {money(reserve)}
        </p>
        {target && pct !== null ? (
          <>
            <div
              role="progressbar"
              aria-label={t("reserveProgress")}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-background"
            >
              <div className="h-full rounded-full bg-brand-lime" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground tabular-nums">
              {t("ofTarget", { pct, target: money(target) })}
            </p>
          </>
        ) : null}
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <MoveForm
          label={t("amountLabel")}
          hint={t("freeCashHint", { cash: money(freeCash) })}
          primary={t("moveIn")}
          secondary={reserve > 0 ? t("takeOut") : undefined}
          onPrimary={(paise) => save(addToReserve(state, freeCash, paise))}
          onSecondary={(paise) => save(takeFromReserve(state, paise))}
          testId="reserve"
        />
        <MoveForm
          label={t("targetLabel")}
          hint={t("targetHint")}
          primary={t("setTarget")}
          secondary={target ? t("clearTarget") : undefined}
          secondaryNeedsAmount={false}
          onPrimary={(paise) => save(setReserveTarget(state, paise))}
          onSecondary={() => save(setReserveTarget(state, null))}
          testId="reserve-target"
        />
      </div>
      <LessonLink href="/learn/emergency-fund" label={t("reserveLesson")} />
    </Panel>
  );
}

function Goals({
  state,
  freeCash,
  money,
  save,
  locale,
}: {
  state: LearnerState;
  freeCash: number;
  money: (paise: number) => string;
  save: (outcome: JarOutcome) => JarError | null;
  locale: string;
}) {
  const t = useTranslations("portfolioBoard");
  const ids = useId();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Goal | null>(null);
  const monthName = useMemo(
    () => new Intl.DateTimeFormat(locale === "en" ? "en-IN" : `${locale}-IN`, { month: "short", year: "numeric" }),
    [locale],
  );
  const formatMonth = (value: string) => monthName.format(new Date(`${value}-01T00:00:00`));

  function create(event: FormEvent) {
    event.preventDefault();
    const paise = rupeesToPaise(amount);
    if (!label.trim()) return setError(t("errors.name"));
    if (paise === null) return setError(t("errors.invalid-amount"));
    const failure = save(addGoal(state, { label, targetPaise: paise, targetMonth: month || null }));
    if (failure) return setError(t(`errors.${failure}`));
    setLabel("");
    setAmount("");
    setMonth("");
    setError(null);
  }

  const field =
    "min-h-11 w-full rounded-lg border bg-background px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <div className="space-y-6">
      <Panel title={t("newGoal")} icon={<Target className="size-5" aria-hidden="true" />}>
        <p className="max-w-prose text-muted-foreground">{t("goalsIntro")}</p>
        <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end" noValidate>
          <label className="grid gap-1 text-sm font-semibold" htmlFor={`${ids}-name`}>
            {t("goalName")}
            <input
              id={`${ids}-name`}
              value={label}
              maxLength={60}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("goalNamePlaceholder")}
              className={cn(field, "font-normal")}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold" htmlFor={`${ids}-amount`}>
            {t("goalTarget")}
            <input
              id={`${ids}-amount`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              className={cn(field, "font-normal tabular-nums")}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold" htmlFor={`${ids}-month`}>
            {t("goalBy")}
            <input
              id={`${ids}-month`}
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={cn(field, "font-normal")}
            />
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-foreground px-5 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("addGoal")}
          </button>
        </form>
        <p role="status" className="mt-2 min-h-5 text-sm text-destructive">
          {error}
        </p>
      </Panel>

      {state.goals.length === 0 ? (
        <p className="text-muted-foreground">{t("noGoals")}</p>
      ) : (
        <ul className="space-y-4" aria-label={t("goals")}>
          {state.goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.savedPaise / goal.targetPaise) * 100));
            const monthly = monthlyToReach(goal);
            const reached = goal.savedPaise >= goal.targetPaise;
            return (
              <li key={goal.id} className="rounded-2xl border bg-card p-5" data-testid="goal">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold break-words">{goal.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.targetMonth ? t("goalByMonth", { month: formatMonth(goal.targetMonth) }) : t("noDate")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoving(goal)}
                    aria-label={t("removeGoal", { name: goal.label })}
                    className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div
                  role="progressbar"
                  aria-label={t("goalProgress", { name: goal.label })}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"
                >
                  <div className="h-full rounded-full bg-brand-coral" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-sm tabular-nums">
                  <span className="font-bold">{money(goal.savedPaise)}</span>{" "}
                  <span className="text-muted-foreground">
                    {t("savedOf", { target: money(goal.targetPaise), pct })}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reached
                    ? t("reached")
                    : monthly !== null && goal.targetMonth
                      ? t("perMonth", { amount: money(monthly), month: formatMonth(goal.targetMonth) })
                      : null}
                </p>
                <div className="mt-4">
                  <MoveForm
                    label={t("amountLabel")}
                    hint={t("freeCashHint", { cash: money(freeCash) })}
                    primary={t("addMoney")}
                    secondary={goal.savedPaise > 0 ? t("takeBack") : undefined}
                    onPrimary={(paise) => save(addToGoal(state, freeCash, goal.id, paise))}
                    onSecondary={(paise) => save(takeFromGoal(state, goal.id, paise))}
                    testId={`goal-${goal.id}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <LessonLink href="/learn/setting-goals" label={t("goalsLesson")} />
      {removing ? (
        <ConfirmDialog
          title={t("removeTitle", { name: removing.label })}
          description={
            removing.savedPaise > 0 ? t("removeBodySaved", { amount: money(removing.savedPaise) }) : t("removeBody")
          }
          confirmLabel={t("removeConfirm")}
          cancelLabel={t("removeCancel")}
          onConfirm={() => {
            save(removeGoal(state, removing.id));
            setRemoving(null);
          }}
          onCancel={() => setRemoving(null)}
        />
      ) : null}
    </div>
  );
}

/** One amount box with a primary move (in) and an optional secondary move (out). */
function MoveForm({
  label,
  hint,
  primary,
  secondary,
  secondaryNeedsAmount = true,
  onPrimary,
  onSecondary,
  testId,
}: {
  label: string;
  hint: string;
  primary: string;
  secondary?: string | undefined;
  secondaryNeedsAmount?: boolean;
  onPrimary: (paise: number) => JarError | null;
  onSecondary: (paise: number) => JarError | null;
  testId: string;
}) {
  const t = useTranslations("portfolioBoard");
  const id = useId();
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function run(action: (paise: number) => JarError | null, needsAmount: boolean) {
    const paise = needsAmount ? rupeesToPaise(text) : 0;
    if (paise === null) return setMessage({ ok: false, text: t("errors.invalid-amount") });
    const failure = action(paise);
    if (failure) return setMessage({ ok: false, text: t(`errors.${failure}`) });
    setText("");
    setMessage({ ok: true, text: t("saved") });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        run(onPrimary, true);
      }}
      data-testid={`${testId}-form`}
    >
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="1000"
          aria-describedby={`${id}-hint`}
          className="min-h-11 w-32 flex-1 rounded-lg border bg-background px-3 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-foreground px-4 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {primary}
        </button>
        {secondary ? (
          <button
            type="button"
            onClick={() => run(onSecondary, secondaryNeedsAmount)}
            className="min-h-11 rounded-lg border-2 border-foreground px-4 font-bold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {secondary}
          </button>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
        {hint}
      </p>
      <p role="status" className={cn("mt-1 min-h-5 text-sm", message?.ok ? "text-success-ink" : "text-destructive")}>
        {message?.text}
      </p>
    </form>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6" aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function LessonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <BookOpen className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
