import { fundCategories } from "@gullak/content";
import { IndianSymbol } from "@gullak/types";
import { describe, expect, it } from "vitest";
import {
  CATEGORY_IDS,
  categoryQueries,
  categorySearchWords,
  fundCategoryInfo,
  groupedCategories,
  guessFundCategory,
  STARTER_STOCKS,
} from "./category-search";

describe("category search", () => {
  it("covers every SEBI category with search words and fund-house queries", () => {
    expect(CATEGORY_IDS.size).toBe(61);
    for (const { id } of fundCategories) {
      expect(categorySearchWords(id).every((w) => w.length >= 2)).toBe(true);
      expect(categoryQueries(id).length).toBeGreaterThanOrEqual(7);
    }
  });

  it("uses the words fund names actually contain", () => {
    expect(categorySearchWords("overnight")).toEqual(["overnight"]);
    expect(categorySearchWords("elss")).toEqual(["elss"]);
    expect(categoryQueries("liquid")).toContain("sbi liquid");
  });

  it("groups all 61 categories with names, in curriculum order", () => {
    const groups = groupedCategories();
    expect(groups.flatMap((g) => g.categories)).toHaveLength(61);
    expect(groups[0]?.categories[0]).toEqual({ id: "overnight", name: "Overnight fund" });
  });

  it("guesses a fund's category from its name, preferring the longest match", () => {
    expect(guessFundCategory("SBI Liquid Fund Direct Growth")).toBe("liquid");
    expect(guessFundCategory("UTI Nifty 50 Index Fund Dir Gr")).toBe("index-nifty-50");
    expect(guessFundCategory("Nippon India ETF Nifty BeES")).toBe("etf-index");
    expect(guessFundCategory("Mystery Scheme")).toBeNull();
    expect(guessFundCategory("Autumn Plan")).toBeNull();
  });

  it("gives each category's teaching text and lesson", () => {
    expect(fundCategoryInfo("liquid")).toMatchObject({ name: "Liquid fund", topicId: "money-market" });
    expect(fundCategoryInfo("nope")).toBeNull();
  });

  it("lists starter stocks as valid NSE symbols in A-Z order", () => {
    for (const stock of STARTER_STOCKS) expect(IndianSymbol.safeParse(stock.symbol).success, stock.symbol).toBe(true);
    expect(STARTER_STOCKS.map((s) => s.symbol)).toEqual([...STARTER_STOCKS.map((s) => s.symbol)].sort());
  });
});
