import { allUnlockRules, startingCapital } from "@gullak/content";
import { buyUnits, MILLI_UNITS, pricePaiseFromRupees, sellUnits, startingCash } from "@gullak/engine";
import {
  type GradeGroup,
  InstrumentQuote,
  InstrumentSearchResult,
  type LearnerProfile,
  type ListedKind,
} from "@gullak/types";
import { z } from "zod";
import type { LearnerState } from "./learner-state";

/** The lesson whose quiz unlocks a kind of listing, read from the topic graph. Indices are view-only. */
export function unlockTopicId(kind: ListedKind): string | null {
  if (kind === "index") return null;
  return allUnlockRules.find((rule) => rule.unlocksInstruments.includes(kind))?.topicId ?? null;
}

export type TradeAccess =
  | { status: "open" }
  | { status: "view-only" }
  | { status: "locked"; topicId: string }
  | { status: "not-in-class"; topicId: string };

/** Whether this learner may trade a kind of listing: only after passing the lesson that teaches it. */
export function tradeAccess(kind: ListedKind, gradeGroup: GradeGroup, passedTopics: readonly string[]): TradeAccess {
  const topicId = unlockTopicId(kind);
  if (kind === "index" || !topicId) return { status: "view-only" };
  if (passedTopics.includes(topicId)) return { status: "open" };
  const rule = allUnlockRules.find((r) => r.topicId === topicId);
  if (rule && !rule.gradeGroups.includes(gradeGroup)) return { status: "not-in-class", topicId };
  return { status: "locked", topicId };
}

/** Play money available for Live trades: starting cash, plus Practice results, plus trade cash flows. */
export function availableCashPaise(profile: LearnerProfile, state: LearnerState): number {
  return (
    startingCash(startingCapital, profile.gradeGroup, profile.experience) +
    state.practiceCashPaise +
    state.liveCashDeltaPaise
  );
}

export type TradeOrder =
  | { side: "buy"; quantity: number }
  | { side: "buy"; amountPaise: number }
  | { side: "sell"; milliUnits: number };

export type TradeOutcome =
  | { ok: true; state: LearnerState; milliUnits: number; amountPaise: number }
  | { ok: false; reason: "invalid-order" | "not-enough-cash" | "below-smallest-unit" | "not-enough-units" };

/** Applies one play-money trade to the stored learner state; never touches anything else. */
export function applyTrade(
  state: LearnerState,
  cashPaise: number,
  quote: InstrumentQuote,
  order: TradeOrder,
  now = new Date(),
): TradeOutcome {
  const pricePaise = pricePaiseFromRupees(quote.price);
  const existing = state.paperHoldings.find((h) => h.symbol === quote.symbol);
  const holding = existing ? { milliUnits: existing.milliUnits, costPaise: existing.costPaise } : undefined;
  const result =
    order.side === "sell"
      ? holding
        ? sellUnits({ cashPaise, holding, pricePaise, milliUnits: order.milliUnits })
        : ({ ok: false, reason: "not-enough-units" } as const)
      : buyUnits({
          cashPaise,
          ...(holding ? { holding } : {}),
          pricePaise,
          ...("quantity" in order ? { quantity: order.quantity } : { amountPaise: order.amountPaise }),
        });
  if (!result.ok) return result;
  const others = state.paperHoldings.filter((h) => h.symbol !== quote.symbol);
  const updated =
    result.holding.milliUnits === 0
      ? others
      : [
          ...others,
          {
            symbol: quote.symbol,
            name: quote.name,
            kind: quote.kind,
            milliUnits: result.holding.milliUnits,
            costPaise: result.holding.costPaise,
            openedAt: existing?.openedAt ?? now.toISOString(),
          },
        ];
  return {
    ok: true,
    milliUnits: result.milliUnits,
    amountPaise: result.amountPaise,
    state: {
      ...state,
      paperHoldings: updated,
      liveCashDeltaPaise: state.liveCashDeltaPaise + (result.cashPaise - cashPaise),
    },
  };
}

/** `2523` milli-units → `2.523`; whole units print without decimals. */
export function formatUnits(milliUnits: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(milliUnits / MILLI_UNITS);
}

const ApiQuote = z.object({ data: z.object({ quote: InstrumentQuote }) });
const ApiSearch = z.object({ data: z.object({ results: z.array(InstrumentSearchResult) }) });

/** Live price through Gullak's cached route; `null` when Yahoo or the network is unavailable. */
export async function fetchQuote(symbol: string, signal?: AbortSignal): Promise<InstrumentQuote | null> {
  try {
    const response = await fetch(`/api/market/live/${encodeURIComponent(symbol)}`, { signal });
    if (!response.ok) return null;
    return ApiQuote.parse(await response.json()).data.quote;
  } catch {
    return null;
  }
}

export async function searchListings(
  query: string,
  signal?: AbortSignal,
  category?: string,
): Promise<InstrumentSearchResult[] | null> {
  try {
    const params = new URLSearchParams({ q: query, ...(category ? { category } : {}) });
    const response = await fetch(`/api/market/search?${params}`, { signal });
    if (!response.ok) return null;
    return ApiSearch.parse(await response.json()).data.results;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return null;
  }
}
