import { describe, expect, it } from "vitest";
import { Activity, Episode, GradeGroup, Holding, LearnerProfile, StoryActivity, UnlockRule } from "./index";

const uuid = "8f14e45f-ceea-467f-a0e6-1c2f1a3b4d5e";
const now = "2026-10-10T10:00:00+05:30";

describe("grade groups", () => {
  it("are the three school grade groups", () => {
    expect(GradeGroup.options).toEqual(["grade-6-7", "grade-8-10", "grade-11-12"]);
  });

  it("replace age bands on the learner profile", () => {
    const base = { id: uuid, experience: "none", locale: "en", preferredFormats: ["quiz"], createdAt: now };
    expect(LearnerProfile.safeParse({ ...base, gradeGroup: "grade-6-7" }).success).toBe(true);
    expect(LearnerProfile.safeParse({ ...base, gradeGroup: "college" }).success).toBe(false);
    expect(LearnerProfile.safeParse({ ...base, ageBand: "teen" }).success).toBe(false);
  });
});

describe("unlock rules", () => {
  it("need a pillar and at least one grade group, and default the rest", () => {
    const rule = UnlockRule.parse({ topicId: "needs-vs-wants", pillar: "plan-and-budget", gradeGroups: ["grade-6-7"] });
    expect(rule).toMatchObject({ requiresTopicIds: [], passMark: 0.6, unlocksInstruments: [], unlocksActivityIds: [] });
    expect(UnlockRule.safeParse({ topicId: "x", pillar: "plan-and-budget", gradeGroups: [] }).success).toBe(false);
    expect(UnlockRule.safeParse({ topicId: "x", pillar: "money", gradeGroups: ["grade-6-7"] }).success).toBe(false);
  });
});

describe("holdings", () => {
  it("accept a piggy bank as a deposit with no tenure", () => {
    const h = Holding.parse({
      id: uuid,
      instrumentId: "piggy-bank",
      openedAt: now,
      type: "deposit",
      kind: "piggy-bank",
      principalPaise: 50_000,
      ratePercent: 0,
      rateAsOf: "2026-10-10",
      rateSource: "none",
    });
    expect(h.kind).toBe("piggy-bank");
  });

  it("keep deposit and market kinds apart", () => {
    const market = {
      id: uuid,
      instrumentId: "x",
      openedAt: now,
      type: "market",
      symbol: "S",
      units: 1,
      costBasisPaise: 1,
    };
    expect(Holding.safeParse({ ...market, kind: "etf" }).success).toBe(true);
    expect(Holding.safeParse({ ...market, kind: "fixed-deposit" }).success).toBe(false);
  });
});

describe("spot & sort", () => {
  const round = {
    kind: "spot-sort",
    id: "needs-or-wants",
    locale: "en",
    title: "Need or want?",
    topicIds: ["needs-vs-wants"],
    prompt: "Sort it",
    categories: [
      { id: "need", label: "Need" },
      { id: "want", label: "Want" },
    ],
    items: [{ id: "rice", text: "Rice", correctCategoryId: "need", explanation: "Food is a need." }],
  };

  it("accepts a valid round", () => {
    expect(Activity.parse(round).kind).toBe("spot-sort");
  });

  it("rejects an item whose answer is not a category", () => {
    const bad = { ...round, items: [{ ...round.items[0], correctCategoryId: "maybe" }] };
    expect(Activity.safeParse(bad).success).toBe(false);
  });

  it("needs at least two categories", () => {
    expect(Activity.safeParse({ ...round, categories: [round.categories[0]] }).success).toBe(false);
  });
});

describe("story choices", () => {
  const choice = (id: string, nextNodeId: string) => ({
    id,
    text: id,
    nextNodeId,
    consequence: "…",
    verdict: "safe",
  });
  const story = {
    kind: "story",
    id: "s",
    locale: "en",
    title: "S",
    topicIds: ["too-good-to-be-true"],
    startNodeId: "start",
    nodes: [
      { id: "start", text: "Start", choices: [choice("go", "end")] },
      { id: "end", text: "The end" },
    ],
  };

  it("accepts a valid graph and defaults cash changes to zero", () => {
    const parsed = StoryActivity.parse(story);
    expect(parsed.nodes[0]?.choices[0]?.cashDeltaPaise).toBe(0);
  });

  it("rejects choices to unknown nodes, unreachable nodes and stories with no ending", () => {
    const dangling = {
      ...story,
      nodes: [{ id: "start", text: "S", choices: [choice("go", "nowhere")] }, story.nodes[1]],
    };
    const orphan = { ...story, nodes: [...story.nodes, { id: "lost", text: "Never shown" }] };
    const loop = {
      ...story,
      nodes: [
        { id: "start", text: "A", choices: [choice("on", "next")] },
        { id: "next", text: "B", choices: [choice("back", "start")] },
      ],
    };
    for (const bad of [dangling, orphan, loop, { ...story, startNodeId: "missing" }]) {
      expect(StoryActivity.safeParse(bad).success).toBe(false);
    }
  });
});

describe("practice episodes", () => {
  const episode = {
    id: "e",
    locale: "en",
    title: "E",
    intro: "Intro",
    topicIds: ["market-ups-and-downs"],
    gradeGroups: ["grade-11-12"],
    startDate: "2020-01-01",
    endDate: "2020-06-30",
    persona: {
      name: "P",
      description: "D",
      startingCashPaise: 0,
      monthlyIncomePaise: 100,
      monthlyNeedsPaise: 50,
    },
    instruments: [
      {
        type: "deposit",
        instrumentId: "fd",
        kind: "fixed-deposit",
        label: "FD",
        ratePercent: 6,
        tenureMonths: 6,
        earlyExitPenaltyPercent: 1,
        rateAsOf: "2020-01-01",
        rateSource: "assumption",
      },
      { type: "market", instrumentId: "nifty", kind: "index-fund", label: "Index fund", snapshot: "amfi-120716" },
    ],
    scheduledEvents: [
      { id: "bill", on: "2020-03-23", title: "Bill", description: "D", cashDeltaPaise: -1500000, mustPay: true },
    ],
    randomEvents: [{ id: "gift", title: "Gift", description: "D", cashDeltaPaise: 2000, monthlyChance: 0.1 }],
    reveal: { compareOn: "2020-06-23", lesson: "Nobody knew tomorrow." },
  };

  it("accepts a valid episode", () => {
    const parsed = Episode.parse(episode);
    expect(parsed.startingHoldings).toEqual([]);
    expect(parsed.scheduledEvents[0]?.mustPay).toBe(true);
  });

  it("rejects events and reveals outside the episode, and a backwards range", () => {
    const late = { ...episode, scheduledEvents: [{ ...episode.scheduledEvents[0], on: "2021-01-01" }] };
    const reveal = { ...episode, reveal: { ...episode.reveal, compareOn: "2019-12-31" } };
    const backwards = { ...episode, endDate: "2019-06-30" };
    for (const bad of [late, reveal, backwards]) expect(Episode.safeParse(bad).success).toBe(false);
  });

  it("rejects starting holdings in instruments the episode doesn't open, and zero-cash events", () => {
    const holding = {
      ...episode,
      startingHoldings: [{ instrumentId: "gold", amountPaise: 100, openedOn: "2019-09-01" }],
    };
    const zero = { ...episode, randomEvents: [{ ...episode.randomEvents[0], cashDeltaPaise: 0 }] };
    for (const bad of [holding, zero]) expect(Episode.safeParse(bad).success).toBe(false);
  });

  it("rejects a market instrument with a deposit kind", () => {
    const bad = { ...episode, instruments: [{ ...episode.instruments[1], kind: "fixed-deposit" }] };
    expect(Episode.safeParse(bad).success).toBe(false);
  });
});
