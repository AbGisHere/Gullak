import { fundCategories } from "@gullak/content";
import { describe, expect, it } from "vitest";
import { CATEGORY_IDS, categoryQueries, categorySearchWords, groupedCategories } from "./category-search";

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
});
