import { z } from "zod";
import { GradeGroup, IsoDate, Locale, NonNegativePaise, Paise, RatePercent, Slug } from "./common";
import { DepositKind, MarketKind } from "./instrument";

/**
 * A Practice episode for the life + market sim (docs/curriculum.md › Practice vs Live).
 * It replays real history month by month: the learner budgets income, saves into
 * the instruments the episode opens (if they've unlocked them), and life events
 * force them to raise cash. Episodes are data, stored one file per locale at
 * `packages/content/episodes/<id>/<locale>.json`. Live mode runs the same engine
 * on current prices and has no episode.
 */

/** Something that happens to the learner's money. */
export const LifeEvent = z.object({
  id: Slug,
  title: z.string().min(1),
  description: z.string().min(1),
  /** Negative = a cost the learner must pay; positive = money coming in. */
  cashDeltaPaise: Paise.refine((v) => v !== 0, "must change cash"),
  /**
   * A cost that can't be skipped: if cash is short, the learner must raise it
   * (emergency fund, breaking a deposit early, or selling units at that day's price).
   */
  mustPay: z.boolean().default(false),
});
export type LifeEvent = z.infer<typeof LifeEvent>;

/** A deposit open in the episode, on terms of the time. */
export const EpisodeDeposit = z.object({
  type: z.literal("deposit"),
  instrumentId: Slug,
  kind: DepositKind,
  label: z.string().min(1),
  ratePercent: RatePercent,
  tenureMonths: z.number().int().positive().optional(),
  /** Interest-rate cut, in percentage points, for breaking it before maturity. */
  earlyExitPenaltyPercent: RatePercent.default(0),
  rateAsOf: IsoDate,
  /** Where the rate comes from; `assumption` until a real snapshot backs it. */
  rateSource: z.string().min(1),
});
export type EpisodeDeposit = z.infer<typeof EpisodeDeposit>;

/** A market instrument open in the episode, priced from a committed snapshot. */
export const EpisodeMarketInstrument = z.object({
  type: z.literal("market"),
  instrumentId: Slug,
  kind: MarketKind,
  /** Generic label shown to learners (never a recommendation); the snapshot names the real series. */
  label: z.string().min(1),
  /** Snapshot file in `/data/snapshots` without `.json`, e.g. `amfi-120716`. */
  snapshot: Slug,
});
export type EpisodeMarketInstrument = z.infer<typeof EpisodeMarketInstrument>;

export const EpisodeInstrument = z.discriminatedUnion("type", [EpisodeDeposit, EpisodeMarketInstrument]);
export type EpisodeInstrument = z.infer<typeof EpisodeInstrument>;

/** A holding the persona already has when the episode starts. */
export const EpisodeStartingHolding = z.object({
  instrumentId: Slug,
  amountPaise: NonNegativePaise.refine((v) => v > 0, "must be positive"),
  openedOn: IsoDate,
});
export type EpisodeStartingHolding = z.infer<typeof EpisodeStartingHolding>;

export const Episode = z
  .object({
    id: Slug,
    locale: Locale,
    title: z.string().min(1),
    /** Scene-setting shown before month one. */
    intro: z.string().min(1),
    topicIds: z.array(Slug).min(1),
    gradeGroups: z.array(GradeGroup).min(1),
    startDate: IsoDate,
    endDate: IsoDate,
    persona: z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      startingCashPaise: NonNegativePaise,
      monthlyIncomePaise: NonNegativePaise,
      /** Costs that come every month before the learner splits the rest. */
      monthlyNeedsPaise: NonNegativePaise,
    }),
    instruments: z.array(EpisodeInstrument).min(1),
    startingHoldings: z.array(EpisodeStartingHolding).default([]),
    /** Events that always happen on a date, e.g. the hospital bill in March 2020. */
    scheduledEvents: z.array(LifeEvent.extend({ on: IsoDate })).default([]),
    /** The event deck: each can happen in any month with this chance. */
    randomEvents: z.array(LifeEvent.extend({ monthlyChance: z.number().gt(0).max(1) })).default([]),
    /**
     * Shown after the episode: the learner's choice side by side with the
     * alternatives, valued on `compareOn`. The lesson never teaches timing the
     * market: nobody knew tomorrow, and an emergency fund meant not having to choose.
     */
    reveal: z.object({
      compareOn: IsoDate,
      lesson: z.string().min(1),
    }),
  })
  .superRefine((e, ctx) => {
    const issue = (message: string, path: (string | number)[] = []) => ctx.addIssue({ code: "custom", message, path });
    if (e.startDate >= e.endDate) issue("startDate must be before endDate", ["startDate"]);
    const ids = new Set(e.instruments.map((i) => i.instrumentId));
    if (ids.size !== e.instruments.length) issue("duplicate instrumentId", ["instruments"]);
    for (const [i, h] of e.startingHoldings.entries()) {
      if (!ids.has(h.instrumentId)) issue(`unknown instrument ${h.instrumentId}`, ["startingHoldings", i]);
      if (h.openedOn > e.startDate)
        issue("starting holdings must open on or before startDate", ["startingHoldings", i]);
    }
    for (const [i, ev] of e.scheduledEvents.entries()) {
      if (ev.on < e.startDate || ev.on > e.endDate) issue(`${ev.id} is outside the episode`, ["scheduledEvents", i]);
    }
    if (e.reveal.compareOn < e.startDate || e.reveal.compareOn > e.endDate) {
      issue("reveal.compareOn must be inside the episode", ["reveal", "compareOn"]);
    }
    const eventIds = [...e.scheduledEvents, ...e.randomEvents].map((ev) => ev.id);
    if (new Set(eventIds).size !== eventIds.length) issue("duplicate event id", ["scheduledEvents"]);
  });
export type Episode = z.infer<typeof Episode>;
