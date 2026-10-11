import { fundCategories } from "@gullak/content";
import categoryText from "@gullak/content/fund-categories/en.json";
import type { FundCategoryGroup } from "@gullak/types";

/**
 * Yahoo Finance search only matches words that appear in short Indian fund names
 * ("SBI Liquid Reg Gr"), so each SEBI category maps to the words its funds use.
 * Each word is searched on its own and with a few large fund-house names; results are merged.
 */
const SEARCH_WORDS: Partial<Record<string, string[]>> = {
  "ultra-short-duration": ["ultra short"],
  "low-duration": ["low duration", "savings"],
  "short-duration": ["short term", "short duration"],
  "short-and-mid-term": ["medium term", "income"],
  "medium-duration": ["medium duration"],
  "medium-to-long-duration": ["medium to long"],
  "long-duration": ["long duration", "long term"],
  "banking-and-psu": ["banking & psu"],
  "gilt-10-year-constant-maturity": ["10 year gilt", "constant maturity"],
  "index-debt": ["crisil ibx"],
  "dynamic-asset-allocation": ["dynamic asset", "balanced advantage"],
  "multi-asset-allocation": ["multi asset"],
  sif: ["sif"],
  "large-and-mid-cap": ["large & mid cap", "large and mid cap"],
  elss: ["elss"],
  "index-nifty-50": ["nifty 50 index"],
  "index-nifty-next-50": ["nifty next 50"],
  "index-sensex": ["sensex index"],
  "index-others": ["index"],
  "etf-index": ["nifty 50 etf", "bees"],
  "gold-etf": ["gold etf"],
  "etf-others": ["silver etf", "bank etf"],
  "sector-banking-financial-services": ["banking financial", "financial services"],
  "sector-infrastructure": ["infrastructure"],
  "sector-auto": ["auto"],
  "sector-energy-and-power": ["energy", "power"],
  "sector-pharma": ["pharma", "healthcare"],
  "sector-consumption": ["consumption"],
  "sector-services": ["services"],
  "sector-technology": ["technology", "digital"],
  "thematic-global": ["global"],
  "thematic-mnc": ["mnc"],
  "thematic-others": ["opportunities", "manufacturing"],
  "fof-domestic": ["fof"],
  "fof-overseas": ["nasdaq", "global fof"],
  "fof-others": ["fof"],
  "solution-childrens": ["children"],
  "solution-retirement": ["retirement"],
};

/** Big fund houses whose names make Yahoo's search return a category's funds reliably. */
export const FUND_HOUSES = ["sbi", "hdfc", "icici pru", "axis", "nippon india", "kotak"] as const;

const texts = categoryText.categories as Record<string, { name: string }>;

/** "Overnight fund" → ["overnight"]; overrides above where fund names use other words. */
export function categorySearchWords(categoryId: string): string[] {
  const own = SEARCH_WORDS[categoryId];
  if (own) return own;
  const name = texts[categoryId]?.name ?? categoryId.replaceAll("-", " ");
  return [
    name
      .replace(/\(.*?\)/g, "")
      .replace(/\bfunds?\b/gi, "")
      .trim()
      .toLowerCase(),
  ];
}

/** Every query to run for a category: each word alone, then the first word with each fund house. */
export function categoryQueries(categoryId: string): string[] {
  const words = categorySearchWords(categoryId);
  const first = words[0] ?? categoryId;
  return [...new Set([...words, ...FUND_HOUSES.map((house) => `${house} ${first}`)])];
}

export const CATEGORY_IDS = new Set(fundCategories.map((c) => c.id));

export type CategoryOption = { id: string; name: string };
/** The 61 categories, grouped in curriculum order, with their (English) names. */
export function groupedCategories(): { group: FundCategoryGroup; categories: CategoryOption[] }[] {
  const groups: { group: FundCategoryGroup; categories: CategoryOption[] }[] = [];
  for (const category of fundCategories) {
    let entry = groups.find((g) => g.group === category.group);
    if (!entry) {
      entry = { group: category.group, categories: [] };
      groups.push(entry);
    }
    entry.categories.push({ id: category.id, name: texts[category.id]?.name ?? category.id });
  }
  return groups;
}
