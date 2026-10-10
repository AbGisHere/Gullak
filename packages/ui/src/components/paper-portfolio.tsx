import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  Coins,
  Landmark,
  Layers,
  Lock,
  PiggyBank,
  ShieldCheck,
  Target,
  TrendingUp,
  Unlock,
  Wallet,
  X,
} from "lucide-react";
import * as React from "react";
import { formatInr } from "../lib/format";
import { defaultPaperPortfolioLabels, type PaperPortfolioLabels } from "../lib/labels";
import { cn } from "../lib/utils";
import { Character } from "./character";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";
import { PlayMoneyBadge } from "./play-money-badge";

export type { PaperPortfolioLabels };

export type InstrumentKind =
  | "savings"
  | "fixed-deposit"
  | "recurring-deposit"
  | "gold"
  | "mutual-fund"
  | "index-fund"
  | "stock";

export type LiquidityCategory = "available-now" | "conditional" | "long-term";

export interface PortfolioHoldingItem {
  id: string;
  instrumentId: string;
  name: string;
  type: "deposit" | "market";
  kind: InstrumentKind;
  currentValuePaise: number;
  principalPaise?: number;
  units?: number;
  symbol?: string;
  ratePercent?: number;
  tenureMonths?: number;
  openedAt: string;
  asOf: string;
  liquidityCategory: LiquidityCategory;
  liquidityNote?: string;
  linkedGoalId?: string;
  linkedGoalLabel?: string;
  changePaise?: number;
  educationalNote?: string;
  terms?: MoneyTermData[];
}

export interface PortfolioGoalItem {
  id: string;
  label: string;
  targetPaise: number;
  targetDate: string;
  currentSavingsPaise: number;
  linkedHoldingIds?: string[];
}

export interface EmergencyReserveInfo {
  targetPaise?: number;
  currentReservePaise: number;
  monthlyExpensesPaise?: number;
  monthsCovered?: number;
  statusNote?: string;
}

export interface PortfolioViewModel {
  id: string;
  learnerId?: string;
  isVirtual: true;
  asOf: string;
  cashPaise: number;
  startingCashPaise?: number;
  holdings: PortfolioHoldingItem[];
  emergencyReserve: EmergencyReserveInfo;
  goals: PortfolioGoalItem[];
  terms?: Record<string, MoneyTermData>;
  liquidityDescriptions?: Record<LiquidityCategory, string>;
  allocationDescription?: string;
}

export interface PaperPortfolioProps {
  portfolio: PortfolioViewModel;
  labels?: Partial<PaperPortfolioLabels>;
  onHoldingOpen?: (holdingId: string) => void;
  onGoalOpen?: (goalId: string) => void;
  onTermOpen?: (term: string) => void;
  onActionRequest?: (action: string, payload?: unknown) => void;
  className?: string;
  defaultTab?: "overview" | "holdings" | "liquidity" | "goals";
}

/** Helpers to compute portfolio totals */
export function calculatePortfolioTotals(portfolio: PortfolioViewModel) {
  const holdingsValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValuePaise, 0);
  const totalValuePaise = portfolio.cashPaise + holdingsValue;

  const availableNowPaise =
    portfolio.cashPaise +
    portfolio.holdings
      .filter((h) => h.liquidityCategory === "available-now")
      .reduce((sum, h) => sum + h.currentValuePaise, 0);

  const conditionalPaise = portfolio.holdings
    .filter((h) => h.liquidityCategory === "conditional")
    .reduce((sum, h) => sum + h.currentValuePaise, 0);

  const longTermPaise = portfolio.holdings
    .filter((h) => h.liquidityCategory === "long-term")
    .reduce((sum, h) => sum + h.currentValuePaise, 0);

  const linkedToGoalsPaise = portfolio.holdings
    .filter((h) => Boolean(h.linkedGoalId))
    .reduce((sum, h) => sum + h.currentValuePaise, 0);

  return {
    holdingsValue,
    totalValuePaise,
    availableNowPaise,
    conditionalPaise,
    longTermPaise,
    linkedToGoalsPaise,
  };
}

/** Icon mapper for instrument kinds */
export function getInstrumentIcon(kind: InstrumentKind) {
  switch (kind) {
    case "savings":
      return PiggyBank;
    case "fixed-deposit":
      return Landmark;
    case "recurring-deposit":
      return Clock;
    case "gold":
      return Coins;
    case "mutual-fund":
    case "index-fund":
    case "stock":
      return TrendingUp;
    default:
      return Wallet;
  }
}

/** Human-friendly name for instrument kind */
export function getInstrumentKindLabel(kind: InstrumentKind, labels?: PaperPortfolioLabels): string {
  if (labels?.instrumentKinds?.[kind]) {
    return labels.instrumentKinds[kind];
  }
  switch (kind) {
    case "savings":
      return "Savings Account";
    case "fixed-deposit":
      return "Fixed Deposit (FD)";
    case "recurring-deposit":
      return "Recurring Deposit (RD)";
    case "gold":
      return "Sovereign Gold / Digital Gold";
    case "mutual-fund":
      return "Mutual Fund";
    case "index-fund":
      return "Index Fund";
    case "stock":
      return "Equity Share";
  }
}

/** Badge formatting for liquidity */
export function getLiquidityBadge(category: LiquidityCategory, labels?: PaperPortfolioLabels) {
  switch (category) {
    case "available-now":
      return {
        label: labels?.availableNow ?? "Available Now",
        classes: "bg-brand-lime/20 text-brand-ink border-brand-lime/40",
        icon: Unlock,
      };
    case "conditional":
      return {
        label: labels?.conditionalAccess ?? "Conditional Access",
        classes: "bg-brand-yellow/20 text-brand-ink border-brand-yellow/40",
        icon: Lock,
      };
    case "long-term":
      return {
        label: labels?.longerTermMarket ?? "Longer-Term / Market",
        classes: "bg-brand-lilac/20 text-brand-ink border-brand-lilac/40",
        icon: Layers,
      };
  }
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

/**
 * 1. PortfolioSummary: Answers "What do I have? How much is available quickly? What is it for?"
 */
export function PortfolioSummary({
  portfolio,
  labels,
  onTermOpen,
  className,
}: {
  portfolio: PortfolioViewModel;
  labels?: Partial<PaperPortfolioLabels>;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const totals = calculatePortfolioTotals(portfolio);

  return (
    <section
      data-testid="portfolio-summary"
      aria-labelledby="portfolio-summary-title"
      className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground", className)}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <h2
            id="portfolio-summary-title"
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {l.paperPortfolioTitle}
          </h2>
          <PlayMoneyBadge label={l.playMoneyBadge} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span data-testid="portfolio-as-of">
            {l.asOfPrefix}
            {portfolio.asOf}
          </span>
        </div>
      </div>

      {/* Hero Value */}
      <div className="mt-4">
        <span className="text-xs font-medium text-muted-foreground">{l.totalVirtualPortfolioValue}</span>
        <div
          data-testid="portfolio-total-value"
          className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono"
        >
          {formatInr(totals.totalValuePaise)}
        </div>
      </div>

      {/* Micro Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-3 border-t border-border/60">
        <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Wallet className="h-3 w-3 text-brand-lime" aria-hidden="true" />
            <span>{l.availableCash}</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground" data-testid="portfolio-available-cash">
            {formatInr(portfolio.cashPaise)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-brand-lime" aria-hidden="true" />
            <span>{l.emergencyBuffer}</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground" data-testid="portfolio-emergency-reserve">
            {formatInr(portfolio.emergencyReserve.currentReservePaise)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Target className="h-3 w-3 text-brand-coral" aria-hidden="true" />
            <span>{l.linkedToGoals}</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground" data-testid="portfolio-linked-goals">
            {formatInr(totals.linkedToGoalsPaise)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3 text-brand-yellow" aria-hidden="true" />
            <span>{l.lockedConditional}</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground" data-testid="portfolio-locked-amount">
            {formatInr(totals.conditionalPaise)}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * 2. LiquidityBreakdown: Shows 3 categories (Available now, Conditional, Longer-term).
 * Explanations and descriptions are purely data-driven.
 */
export function LiquidityBreakdown({
  portfolio,
  labels,
  onTermOpen,
  className,
}: {
  portfolio: PortfolioViewModel;
  labels?: Partial<PaperPortfolioLabels>;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const totals = calculatePortfolioTotals(portfolio);
  const total = totals.totalValuePaise > 0 ? totals.totalValuePaise : 1;

  const pctNow = Math.round((totals.availableNowPaise / total) * 100);
  const pctCond = Math.round((totals.conditionalPaise / total) * 100);
  const pctLong = Math.max(0, 100 - pctNow - pctCond);

  const liquidityTerm = portfolio.terms?.Liquidity;

  return (
    <section
      data-testid="liquidity-breakdown"
      aria-labelledby="liquidity-breakdown-title"
      className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 id="liquidity-breakdown-title" className="text-base font-bold text-foreground">
            {l.liquidityAndAccess}
          </h3>
          {liquidityTerm && (
            <MoneyDecoder
              termData={liquidityTerm}
              gradeGroup="grade-8-10"
              onTermOpen={() => onTermOpen?.("Liquidity")}
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground">{l.liquidityFastSubtitle}</span>
      </div>

      {/* Accessible Segmented Bar */}
      <div className="mt-4">
        <div
          role="progressbar"
          aria-label={l.liquidityDistributionAria(pctNow, pctCond, pctLong)}
          aria-valuenow={pctNow}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted/60 p-0.5"
        >
          {pctNow > 0 && (
            <div
              style={{ width: `${pctNow}%` }}
              className="h-full rounded-l-full bg-brand-lime transition-all duration-300"
              title={`${l.availableNow}: ${pctNow}%`}
            />
          )}
          {pctCond > 0 && (
            <div
              style={{ width: `${pctCond}%` }}
              className="h-full bg-brand-yellow transition-all duration-300"
              title={`${l.conditionalAccess}: ${pctCond}%`}
            />
          )}
          {pctLong > 0 && (
            <div
              style={{ width: `${pctLong}%` }}
              className="h-full rounded-r-full bg-brand-lilac transition-all duration-300"
              title={`${l.longerTermMarket}: ${pctLong}%`}
            />
          )}
        </div>
      </div>

      {/* Plain text & screen-reader equivalent breakdown cards */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* Available Now */}
        <div className="rounded-xl border border-brand-lime/40 bg-brand-lime/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{l.availableNow}</span>
            <span className="text-xs font-mono font-semibold text-foreground">{pctNow}%</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground">{formatInr(totals.availableNowPaise)}</p>
          {portfolio.liquidityDescriptions?.["available-now"] && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {portfolio.liquidityDescriptions["available-now"]}
            </p>
          )}
        </div>

        {/* Conditional */}
        <div className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{l.conditionalAccess}</span>
            <span className="text-xs font-mono font-semibold text-foreground">{pctCond}%</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground">{formatInr(totals.conditionalPaise)}</p>
          {portfolio.liquidityDescriptions?.conditional && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">{portfolio.liquidityDescriptions.conditional}</p>
          )}
        </div>

        {/* Longer-term */}
        <div className="rounded-xl border border-brand-lilac/40 bg-brand-lilac/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{l.longerTermMarket}</span>
            <span className="text-xs font-mono font-semibold text-foreground">{pctLong}%</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-foreground">{formatInr(totals.longTermPaise)}</p>
          {portfolio.liquidityDescriptions?.["long-term"] && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">{portfolio.liquidityDescriptions["long-term"]}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 3. EmergencyReserveCard: Habit / resilience status without shaming language or prescriptive rules.
 */
export function EmergencyReserveCard({
  reserve,
  terms,
  labels,
  onTermOpen,
  className,
}: {
  reserve: EmergencyReserveInfo;
  terms?: Record<string, MoneyTermData>;
  labels?: Partial<PaperPortfolioLabels>;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const target = reserve.targetPaise ?? 0;
  const current = reserve.currentReservePaise;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;

  const emergencyTerm = terms?.["Emergency Fund"];

  const derivedNote =
    reserve.statusNote ??
    (reserve.monthsCovered !== undefined && l.monthsOfSuppliedExpenses
      ? l.monthsOfSuppliedExpenses(reserve.monthsCovered)
      : undefined);

  return (
    <section
      data-testid="emergency-reserve-card"
      aria-labelledby="emergency-reserve-title"
      className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-lime" aria-hidden="true" />
            <h3 id="emergency-reserve-title" className="text-base font-bold text-foreground">
              {l.emergencyReserveStatus}
            </h3>
            {emergencyTerm && (
              <MoneyDecoder
                termData={emergencyTerm}
                gradeGroup="grade-8-10"
                onTermOpen={() => onTermOpen?.("Emergency Fund")}
              />
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{l.emergencyReserveSubtitle}</p>
        </div>
        <Character variant="blob" pose="saving" accent="lime" size="sm" />
      </div>

      {/* Progress & metrics */}
      <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
          <span className="font-medium text-muted-foreground">{l.currentBuffer}</span>
          <span className="font-mono font-bold text-foreground">
            {formatInr(current)}{" "}
            {target > 0 && (
              <span className="font-normal text-muted-foreground">
                of {formatInr(target)} {l.ofTargetSuffix}
              </span>
            )}
          </span>
        </div>

        {target > 0 && (
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              style={{ width: `${pct}%` }}
              className="h-full rounded-full bg-brand-lime transition-all duration-300"
            />
          </div>
        )}

        {derivedNote && (
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed" data-testid="emergency-reserve-note">
            {derivedNote}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * 4. HoldingCard: Individual asset presentation with goal connection & decoder.
 */
export function HoldingCard({
  holding,
  labels,
  onOpen,
  onTermOpen,
  className,
}: {
  holding: PortfolioHoldingItem;
  labels?: Partial<PaperPortfolioLabels>;
  onOpen?: (holdingId: string) => void;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const Icon = getInstrumentIcon(holding.kind);
  const kindLabel = getInstrumentKindLabel(holding.kind, l);
  const liquidity = getLiquidityBadge(holding.liquidityCategory, l);
  const LiquidityIcon = liquidity.icon;

  return (
    <article
      data-testid={`holding-card-${holding.id}`}
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-foreground/30 shadow-xs",
        className,
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground leading-snug">{holding.name}</h4>
            <p className="text-[11px] text-muted-foreground">{kindLabel}</p>
          </div>
        </div>

        {/* Liquidity Pill */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
            liquidity.classes,
          )}
        >
          <LiquidityIcon className="h-2.5 w-2.5" aria-hidden="true" />
          {liquidity.label}
        </span>
      </div>

      {/* Financial Details */}
      <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-2 border-t border-border/50 pt-2.5">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {l.currentValue}
          </span>
          <div className="text-base font-extrabold font-mono text-foreground" data-testid="holding-current-value">
            {formatInr(holding.currentValuePaise)}
          </div>
        </div>

        {/* Secondary change or deposit info */}
        {holding.type === "deposit" && holding.ratePercent !== undefined && (
          <div className="text-right">
            <span className="text-[10px] font-medium text-muted-foreground">{l.interestRate}</span>
            <div className="text-xs font-semibold font-mono text-foreground">
              {holding.ratePercent}% p.a.
              {holding.tenureMonths && <span className="text-muted-foreground"> · {holding.tenureMonths}m</span>}
            </div>
          </div>
        )}

        {holding.type === "market" && holding.units !== undefined && (
          <div className="text-right">
            <span className="text-[10px] font-medium text-muted-foreground">{l.units}</span>
            <div className="text-xs font-semibold font-mono text-foreground">
              {holding.units} {l.units}
              {holding.changePaise !== undefined && (
                <span
                  className={cn(
                    "ml-1.5 font-normal text-[11px]",
                    holding.changePaise >= 0 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  ({holding.changePaise >= 0 ? "+" : ""}
                  {formatInr(holding.changePaise)})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Goal connection banner */}
      {holding.linkedGoalLabel && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-brand-coral/10 border border-brand-coral/25 px-2.5 py-1 text-xs text-foreground">
          <Target className="h-3 w-3 text-brand-coral shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-medium">
            {l.partOfGoalPrefix}
            <strong>{holding.linkedGoalLabel}</strong>
          </span>
        </div>
      )}

      {/* Liquidity Note / Early exit notice */}
      {holding.liquidityNote && (
        <p className="mt-2 text-[11px] text-muted-foreground leading-normal">{holding.liquidityNote}</p>
      )}

      {/* Interactive Detail Trigger with accessible 44px min-height */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-[10px] text-muted-foreground">
          {l.valuedAsOfPrefix}
          {holding.asOf}
        </span>
        <button
          type="button"
          onClick={() => onOpen?.(holding.id)}
          data-testid={`holding-detail-btn-${holding.id}`}
          className="inline-flex min-h-[44px] h-auto py-2 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <span>{l.whyHeldBtn}</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

/**
 * 5. HoldingsList: Collection of cards with filter tags.
 */
export function HoldingsList({
  holdings,
  labels,
  onHoldingOpen,
  onTermOpen,
  className,
}: {
  holdings: PortfolioHoldingItem[];
  labels?: Partial<PaperPortfolioLabels>;
  onHoldingOpen?: (holdingId: string) => void;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const [filter, setFilter] = React.useState<"all" | "deposit" | "market">("all");

  const filtered = holdings.filter((h) => {
    if (filter === "all") return true;
    return h.type === filter;
  });

  return (
    <section
      data-testid="holdings-list-section"
      aria-labelledby="holdings-list-title"
      className={cn("space-y-3", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="holdings-list-title" className="text-base font-bold text-foreground">
          {l.yourHoldings(holdings.length)}
        </h3>
        {/* Filter Pills with 44px touch-target area */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "min-h-[44px] h-auto rounded-lg px-3 py-2 font-medium transition-colors flex items-center",
              filter === "all"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.filterAll}
          </button>
          <button
            type="button"
            onClick={() => setFilter("deposit")}
            className={cn(
              "min-h-[44px] h-auto rounded-lg px-3 py-2 font-medium transition-colors flex items-center",
              filter === "deposit"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.filterDeposits}
          </button>
          <button
            type="button"
            onClick={() => setFilter("market")}
            className={cn(
              "min-h-[44px] h-auto rounded-lg px-3 py-2 font-medium transition-colors flex items-center",
              filter === "market"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.filterMarket}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((holding) => (
          <HoldingCard key={holding.id} holding={holding} labels={l} onOpen={onHoldingOpen} onTermOpen={onTermOpen} />
        ))}
      </div>
    </section>
  );
}

/**
 * 6. GoalsList: Educational connection between holdings and student goals.
 */
export function GoalsList({
  goals,
  labels,
  onGoalOpen,
  className,
}: {
  goals: PortfolioGoalItem[];
  labels?: Partial<PaperPortfolioLabels>;
  onGoalOpen?: (goalId: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };

  return (
    <section
      data-testid="goals-list-section"
      aria-labelledby="goals-list-title"
      className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-brand-coral" aria-hidden="true" />
          <h3 id="goals-list-title" className="text-base font-bold text-foreground">
            {l.financialGoals(goals.length)}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">{l.purposeDrivenSaving}</span>
      </div>

      <div className="mt-3.5 space-y-3">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentSavingsPaise / goal.targetPaise) * 100));
          return (
            <div
              key={goal.id}
              data-testid={`goal-item-${goal.id}`}
              className="rounded-xl border border-border/60 bg-muted/30 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{goal.label}</h4>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {l.targetDatePrefix}
                      {goal.targetDate}
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-brand-coral/15 px-2 py-0.5 text-xs font-mono font-bold text-foreground">
                  {pct}%
                </span>
              </div>

              {/* Progress track */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full rounded-full bg-brand-coral transition-all duration-300"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-foreground">{formatInr(goal.currentSavingsPaise)}</span>
                <span className="text-muted-foreground">
                  {l.targetPrefix}
                  {formatInr(goal.targetPaise)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * 7. AllocationView: Accessible educational diversification breakdown.
 */
export function AllocationView({
  portfolio,
  labels,
  onTermOpen,
  className,
}: {
  portfolio: PortfolioViewModel;
  labels?: Partial<PaperPortfolioLabels>;
  onTermOpen?: (term: string) => void;
  className?: string;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const totals = calculatePortfolioTotals(portfolio);
  const total = totals.totalValuePaise > 0 ? totals.totalValuePaise : 1;

  // Group by kind
  const allocationMap = new Map<InstrumentKind | "cash", number>();
  allocationMap.set("cash", portfolio.cashPaise);

  for (const h of portfolio.holdings) {
    const prev = allocationMap.get(h.kind) ?? 0;
    allocationMap.set(h.kind, prev + h.currentValuePaise);
  }

  const items = Array.from(allocationMap.entries())
    .filter(([_, val]) => val > 0)
    .map(([kind, val]) => {
      const pct = Math.round((val / total) * 100);
      return {
        kind,
        label: kind === "cash" ? l.liquidCash : getInstrumentKindLabel(kind, l),
        valuePaise: val,
        percentage: pct,
      };
    });

  const diversificationTerm = portfolio.terms?.Diversification;

  return (
    <section
      data-testid="allocation-view"
      aria-labelledby="allocation-view-title"
      className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-lilac" aria-hidden="true" />
          <h3 id="allocation-view-title" className="text-base font-bold text-foreground">
            {l.assetDiversification}
          </h3>
          {diversificationTerm && (
            <MoneyDecoder
              termData={diversificationTerm}
              gradeGroup="grade-8-10"
              onTermOpen={() => onTermOpen?.("Diversification")}
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground">{l.portfolioBalance}</span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        {portfolio.allocationDescription ?? l.diversificationDefaultNote}
      </p>

      {/* Segmented allocation strip */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted/60">
        {items.map((item, idx) => (
          <div
            key={item.kind}
            style={{ width: `${item.percentage}%` }}
            className={cn(
              "h-full transition-all duration-300",
              idx % 4 === 0 && "bg-brand-lime",
              idx % 4 === 1 && "bg-brand-lilac",
              idx % 4 === 2 && "bg-brand-yellow",
              idx % 4 === 3 && "bg-brand-coral",
            )}
            title={`${item.label}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Accessible Text Breakdown */}
      <div className="mt-3.5 divide-y divide-border/50">
        {items.map((item) => (
          <div key={item.kind} className="flex items-center justify-between py-2 text-xs">
            <span className="font-medium text-foreground">{item.label}</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="font-semibold text-foreground">{formatInr(item.valuePaise)}</span>
              <span className="w-9 text-right text-muted-foreground font-medium">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 8. HoldingDetailModal: Accessible dialog explaining why the holding is held.
 * Captures Escape key, moves initial focus to close button, and relies on semantic aria labels.
 */
export function HoldingDetailModal({
  holding,
  terms,
  labels,
  onClose,
  onTermOpen,
}: {
  holding: PortfolioHoldingItem;
  terms?: Record<string, MoneyTermData>;
  labels?: Partial<PaperPortfolioLabels>;
  onClose: () => void;
  onTermOpen?: (term: string) => void;
}) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const Icon = getInstrumentIcon(holding.kind);
  const kindLabel = getInstrumentKindLabel(holding.kind, l);
  const liquidity = getLiquidityBadge(holding.liquidityCategory, l);

  // Keyboard Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Initial focus move on open
  React.useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Collect terms to display: prioritize holding.terms, otherwise lookup in terms map
  const relevantTerms: MoneyTermData[] = holding.terms ?? [];
  if (relevantTerms.length === 0 && terms) {
    if (holding.type === "deposit") {
      if (terms.Tenure) relevantTerms.push(terms.Tenure);
      if (terms.Maturity) relevantTerms.push(terms.Maturity);
      if (terms["Premature Withdrawal"]) relevantTerms.push(terms["Premature Withdrawal"]);
    } else if (holding.type === "market") {
      if (terms.NAV) relevantTerms.push(terms.NAV);
      if (terms.Units) relevantTerms.push(terms.Units);
      if (terms.Diversification) relevantTerms.push(terms.Diversification);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-holding-title"
      data-testid="holding-detail-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl text-card-foreground animate-in slide-in-from-bottom sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="modal-holding-title" className="text-base font-bold text-foreground">
                {holding.name}
              </h3>
              <p className="text-xs text-muted-foreground">{kindLabel}</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            data-testid="modal-close-btn"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
            aria-label={l.closeDetailsAria}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Key Numbers */}
          <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
            <div>
              <span className="text-muted-foreground">{l.currentVirtualValue}</span>
              <p className="mt-0.5 text-base font-extrabold font-mono text-foreground">
                {formatInr(holding.currentValuePaise)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{l.liquidityRole}</span>
              <p className="mt-0.5 font-bold text-foreground">{liquidity.label}</p>
            </div>
          </div>

          {/* Educational Role */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.whyAssetHeld}</h4>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {holding.educationalNote ?? l.defaultEducationalNote}
            </p>
          </div>

          {/* Liquidity & Exit Terms */}
          {holding.liquidityNote && (
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <AlertCircle className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
                <span>{l.accessEarlyWithdrawalConditions}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{holding.liquidityNote}</p>
            </div>
          )}

          {/* Relevant terms to decode if supplied */}
          {relevantTerms.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs font-bold text-muted-foreground">{l.relevantFinancialTerms}</span>
              <div className="flex flex-wrap gap-2">
                {relevantTerms.map((term) => (
                  <MoneyDecoder
                    key={term.term}
                    termData={term}
                    gradeGroup="grade-8-10"
                    onTermOpen={() => onTermOpen?.(term.term)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold hover:bg-foreground/90 transition-colors"
          >
            {l.done}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Main Paper Portfolio Container                    */
/* -------------------------------------------------------------------------- */

export function PaperPortfolio({
  portfolio,
  labels,
  onHoldingOpen,
  onGoalOpen,
  onTermOpen,
  onActionRequest,
  className,
  defaultTab = "overview",
}: PaperPortfolioProps) {
  const l = { ...defaultPaperPortfolioLabels, ...labels };
  const [activeTab, setActiveTab] = React.useState<"overview" | "holdings" | "liquidity" | "goals">(defaultTab);
  const [selectedHoldingId, setSelectedHoldingId] = React.useState<string | null>(null);

  const handleOpenHolding = (id: string) => {
    setSelectedHoldingId(id);
    onHoldingOpen?.(id);
  };

  const selectedHolding = portfolio.holdings.find((h) => h.id === selectedHoldingId);

  return (
    <div data-testid="paper-portfolio-container" className={cn("w-full space-y-4 text-foreground", className)}>
      {/* Summary always visible at top */}
      <PortfolioSummary portfolio={portfolio} labels={l} onTermOpen={onTermOpen} />

      {/* Mobile-Friendly Section Switcher with 44px min-height touch targets */}
      <nav
        aria-label={l.portfolioSectionsAria}
        className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-muted/60 p-1.5 text-xs"
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          data-testid="portfolio-tab-overview"
          className={cn(
            "min-h-[44px] h-auto rounded-lg px-3.5 py-2.5 font-medium transition-colors whitespace-nowrap flex items-center",
            activeTab === "overview"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.tabOverview}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("holdings")}
          data-testid="portfolio-tab-holdings"
          className={cn(
            "min-h-[44px] h-auto rounded-lg px-3.5 py-2.5 font-medium transition-colors whitespace-nowrap flex items-center",
            activeTab === "holdings"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.tabHoldings(portfolio.holdings.length)}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("liquidity")}
          data-testid="portfolio-tab-liquidity"
          className={cn(
            "min-h-[44px] h-auto rounded-lg px-3.5 py-2.5 font-medium transition-colors whitespace-nowrap flex items-center",
            activeTab === "liquidity"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.tabLiquidity}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("goals")}
          data-testid="portfolio-tab-goals"
          className={cn(
            "min-h-[44px] h-auto rounded-lg px-3.5 py-2.5 font-medium transition-colors whitespace-nowrap flex items-center",
            activeTab === "goals"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.tabGoals(portfolio.goals.length)}
        </button>
      </nav>

      {/* Tab Panes */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <EmergencyReserveCard
              reserve={portfolio.emergencyReserve}
              terms={portfolio.terms}
              labels={l}
              onTermOpen={onTermOpen}
            />
            <LiquidityBreakdown portfolio={portfolio} labels={l} onTermOpen={onTermOpen} />
            <HoldingsList
              holdings={portfolio.holdings}
              labels={l}
              onHoldingOpen={handleOpenHolding}
              onTermOpen={onTermOpen}
            />
          </div>
        )}

        {activeTab === "holdings" && (
          <HoldingsList
            holdings={portfolio.holdings}
            labels={l}
            onHoldingOpen={handleOpenHolding}
            onTermOpen={onTermOpen}
          />
        )}

        {activeTab === "liquidity" && (
          <div className="space-y-4">
            <LiquidityBreakdown portfolio={portfolio} labels={l} onTermOpen={onTermOpen} />
            <EmergencyReserveCard
              reserve={portfolio.emergencyReserve}
              terms={portfolio.terms}
              labels={l}
              onTermOpen={onTermOpen}
            />
            <AllocationView portfolio={portfolio} labels={l} onTermOpen={onTermOpen} />
          </div>
        )}

        {activeTab === "goals" && (
          <div className="space-y-4">
            <GoalsList goals={portfolio.goals} labels={l} onGoalOpen={onGoalOpen} />
            <HoldingsList
              holdings={portfolio.holdings.filter((h) => Boolean(h.linkedGoalId))}
              labels={l}
              onHoldingOpen={handleOpenHolding}
              onTermOpen={onTermOpen}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedHolding && (
        <HoldingDetailModal
          holding={selectedHolding}
          terms={portfolio.terms}
          labels={l}
          onClose={() => setSelectedHoldingId(null)}
          onTermOpen={onTermOpen}
        />
      )}
    </div>
  );
}
