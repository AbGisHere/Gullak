import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import te from "../../messages/te.json";
import { HOUSEHOLD_DECISIONS, householdFixture, isHouseholdDecision, STORY_STAGES } from "./household-fixture";
import { rewindPaths } from "./rewind-paths";

for (const [locale, messages] of Object.entries({ en, hi, te })) {
  describe(`household fixture (${locale})`, () => {
    const errors: unknown[] = [];
    const t = createTranslator({ locale, messages, namespace: "twin.story", onError: (error) => errors.push(error) });
    const fixture = householdFixture((key) => t(key as Parameters<typeof t>[0]));
    it("resolves story copy in the existing locale messages", () => {
      expect(errors).toEqual([]);
      expect(fixture.episode.title).toBe(messages.twin.story.episodeTitle);
      expect(fixture.state.reflection?.options).toHaveLength(3);
    });
    it("keeps the canonical bill and assumed starting balances in integer paise", () => {
      expect(fixture.state.currentEvent?.amountPaise).toBe(1500000);
      expect(fixture.state.portfolio.isVirtual).toBe(true);
      expect(fixture.state.portfolio.cashPaise).toBe(2000000);
      expect(fixture.state.portfolio.holdings.map((h) => h.currentValuePaise)).toEqual([5000000, 3000000]);
      expect(fixture.state.portfolio.asOf).toBe(messages.twin.story.assumptions);
    });
    it("provides two distinct alternatives for each choice without fabricating a valuation", () => {
      for (const decision of HOUSEHOLD_DECISIONS) {
        const paths = rewindPaths(decision, fixture.decisions, fixture.outcomes);
        expect(paths?.chosenPath.decisionId).toBe(decision);
        expect(paths?.alternatives).toHaveLength(2);
        expect(paths?.alternatives.some((alt) => alt.decisionId === decision)).toBe(false);
        expect(paths?.chosenPath.portfolioAfter).toBeUndefined();
        expect(paths?.alternatives.every((alt) => !alt.portfolioAfter && !alt.comparisonMetrics)).toBe(true);
      }
    });
  });
}
it("has seven stages and accepts only authored decisions", () => {
  expect(STORY_STAGES).toHaveLength(7);
  expect(isHouseholdDecision("market")).toBe(true);
  expect(isHouseholdDecision("buy-real-product")).toBe(false);
});

it("keeps identical story keys in all three existing message files", () => {
  function keys(value: unknown, prefix = ""): string[] {
    if (!value || typeof value !== "object") return [prefix];
    return Object.entries(value)
      .flatMap(([key, child]) => keys(child, `${prefix}.${key}`))
      .sort();
  }
  expect(keys(hi.twin.story)).toEqual(keys(en.twin.story));
  expect(keys(te.twin.story)).toEqual(keys(en.twin.story));
});
