import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { FundCategoryText } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { allUnlockRules, FundCategoriesConfig, fundCategories, locales } from "./config";

const textDir = fileURLToPath(new URL("../fund-categories/", import.meta.url));
const files = readdirSync(textDir).filter((f) => f.endsWith(".json"));

describe("fund categories", () => {
  it("each links to a topic in the graph", () => {
    const topics = new Set(allUnlockRules.map((r) => r.topicId));
    for (const c of fundCategories) expect(topics, c.id).toContain(c.topicId);
  });

  it("rejects duplicate ids", () => {
    const [first] = fundCategories;
    expect(() => FundCategoriesConfig.parse({ categories: [first, first] })).toThrow();
  });

  it("ships English text", () => {
    expect(files).toContain("en.json");
  });

  it.each(files)("%s has text for exactly the configured categories", (file) => {
    const text = FundCategoryText.parse(JSON.parse(readFileSync(`${textDir}${file}`, "utf8")));
    expect(file).toBe(`${text.locale}.json`);
    expect(locales.locales.map((l) => l.code)).toContain(text.locale);
    expect(Object.keys(text.categories).sort()).toEqual(fundCategories.map((c) => c.id).sort());
  });
});
