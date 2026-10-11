import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import hi from "../messages/hi.json";
import te from "../messages/te.json";
import { type GulluTipContext, gulluTipAt, gulluTipKeys, lastQuizOutcome, TIP_WORLD_SLUGS } from "./gullu-tips";

function lookup(messages: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[key];
    return undefined;
  }, messages);
}

const contexts: GulluTipContext[] = (["map", "gullu", "portfolio", "practice"] as const).flatMap((place) =>
  [true, false].flatMap((isNewLearner) =>
    [null, "passed", "retry"].flatMap((lastQuiz) =>
      [undefined, ...TIP_WORLD_SLUGS].map((worldSlug) => ({
        place,
        isNewLearner,
        worldSlug,
        lastQuiz: lastQuiz as GulluTipContext["lastQuiz"],
      })),
    ),
  ),
);

describe("gulluTipKeys", () => {
  it("welcomes a new learner on the map before anything else", () => {
    expect(gulluTipKeys({ place: "map", isNewLearner: true, worldSlug: "candy-economy" })[0]).toBe("newWelcome");
  });

  it("leads with the latest quiz outcome once the learner has progress", () => {
    expect(gulluTipKeys({ place: "map", isNewLearner: false, lastQuiz: "passed" })[0]).toBe("quizPassed");
    expect(gulluTipKeys({ place: "gullu", isNewLearner: false, lastQuiz: "retry" })[0]).toBe("quizRetry");
  });

  it("uses the current world's tip and ignores unknown worlds", () => {
    expect(gulluTipKeys({ place: "map", isNewLearner: false, worldSlug: "bankopolis" })).toContain("world.bankopolis");
    expect(gulluTipKeys({ place: "map", isNewLearner: false, worldSlug: "not-a-world" })).toEqual(["habit"]);
  });

  it("keeps portfolio and practice tips on their own screens", () => {
    expect(gulluTipKeys({ place: "portfolio", isNewLearner: true })).toEqual(["portfolioPaper", "portfolioSteady"]);
    expect(gulluTipKeys({ place: "practice", isNewLearner: false })).toEqual(["practiceUnknown", "practiceReserve"]);
  });

  it("has a translated message for every tip in every locale", () => {
    const keys = new Set(contexts.flatMap(gulluTipKeys));
    for (const messages of [en, hi, te]) {
      for (const key of keys) {
        const value = lookup(messages, `help.tips.${key}`);
        expect(typeof value, key).toBe("string");
        expect((value as string).length, key).toBeGreaterThan(0);
      }
    }
  });
});

describe("gulluTipAt", () => {
  const context: GulluTipContext = { place: "map", isNewLearner: true, worldSlug: "candy-economy" };

  it("is deterministic and cycles in order", () => {
    const keys = gulluTipKeys(context);
    expect(gulluTipAt(context, 0)).toBe(keys[0]);
    expect(gulluTipAt(context, 1)).toBe(keys[1]);
    expect(gulluTipAt(context, keys.length)).toBe(keys[0]);
    expect(gulluTipAt(context, 1)).toBe(gulluTipAt(context, 1));
  });

  it("falls back to the first tip for invalid tap counts", () => {
    expect(gulluTipAt(context, -3)).toBe("newWelcome");
    expect(gulluTipAt(context, Number.NaN)).toBe("newWelcome");
  });
});

describe("lastQuizOutcome", () => {
  const marks: Record<string, number> = { "needs-vs-wants": 0.7, budgeting: 0.8 };
  const passMarkFor = (id: string) => marks[id];

  it("returns null without attempts", () => {
    expect(lastQuizOutcome([], passMarkFor)).toBeNull();
  });

  it("judges the most recent attempt against its own pass mark", () => {
    const attempts = [
      { topicId: "needs-vs-wants", score: 0.9, at: "2026-10-10T10:00:00.000Z" },
      { topicId: "budgeting", score: 0.75, at: "2026-10-11T10:00:00.000Z" },
    ];
    expect(lastQuizOutcome(attempts, passMarkFor)).toBe("retry");
    expect(lastQuizOutcome(attempts.slice(0, 1), passMarkFor)).toBe("passed");
  });

  it("ignores attempts on unknown topics", () => {
    expect(lastQuizOutcome([{ topicId: "gone", score: 1, at: "2026-10-11T00:00:00.000Z" }], passMarkFor)).toBeNull();
  });
});
