import { fundCategories } from "@gullak/content";
import categoryText from "@gullak/content/fund-categories/en.json";
import type { FundCategoryGroup, InstrumentSearchResult } from "@gullak/types";

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

const texts = categoryText.categories as Record<string, { name: string; summary: string; watchOut: string }>;

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

/** The "Stocks" entry above the fund categories: a fixed starter list, so it opens without a search. */
export const STOCKS_CATEGORY = "stocks";

// Large, well-known NSE companies, listed only so learners can browse without typing.
// Alphabetical on purpose: this is not a ranking or a recommendation.
const LARGE_NSE_STOCKS: [symbol: string, name: string][] = [
  ["ADANIPORTS", "Adani Ports and Special Economic Zone"],
  ["APOLLOHOSP", "Apollo Hospitals Enterprise"],
  ["ASIANPAINT", "Asian Paints"],
  ["AXISBANK", "Axis Bank"],
  ["BAJAJFINSV", "Bajaj Finserv"],
  ["BAJFINANCE", "Bajaj Finance"],
  ["BEL", "Bharat Electronics"],
  ["BHARTIARTL", "Bharti Airtel"],
  ["BRITANNIA", "Britannia Industries"],
  ["CIPLA", "Cipla"],
  ["COALINDIA", "Coal India"],
  ["DRREDDY", "Dr. Reddy's Laboratories"],
  ["EICHERMOT", "Eicher Motors"],
  ["GRASIM", "Grasim Industries"],
  ["HCLTECH", "HCL Technologies"],
  ["HDFCBANK", "HDFC Bank"],
  ["HDFCLIFE", "HDFC Life Insurance"],
  ["HEROMOTOCO", "Hero MotoCorp"],
  ["HINDALCO", "Hindalco Industries"],
  ["HINDUNILVR", "Hindustan Unilever"],
  ["ICICIBANK", "ICICI Bank"],
  ["INFY", "Infosys"],
  ["ITC", "ITC"],
  ["JSWSTEEL", "JSW Steel"],
  ["KOTAKBANK", "Kotak Mahindra Bank"],
  ["LT", "Larsen & Toubro"],
  ["M&M", "Mahindra & Mahindra"],
  ["MARUTI", "Maruti Suzuki India"],
  ["NESTLEIND", "Nestle India"],
  ["NTPC", "NTPC"],
  ["ONGC", "Oil and Natural Gas Corporation"],
  ["POWERGRID", "Power Grid Corporation of India"],
  ["RELIANCE", "Reliance Industries"],
  ["SBILIFE", "SBI Life Insurance"],
  ["SBIN", "State Bank of India"],
  ["SUNPHARMA", "Sun Pharmaceutical Industries"],
  ["TATACONSUM", "Tata Consumer Products"],
  ["TATASTEEL", "Tata Steel"],
  ["TCS", "Tata Consultancy Services"],
  ["TECHM", "Tech Mahindra"],
  ["TITAN", "Titan Company"],
  ["TRENT", "Trent"],
  ["ULTRACEMCO", "UltraTech Cement"],
  ["WIPRO", "Wipro"],
];

export const STARTER_STOCKS: readonly InstrumentSearchResult[] = LARGE_NSE_STOCKS.map(([symbol, name]) => ({
  symbol: `${symbol}.NS`,
  name,
  exchange: "NSE",
  kind: "stock",
}));

/**
 * The SEBI category a fund's name points to ("SBI Liquid Fund Direct Growth" → "liquid"), or null.
 * The longest matching search word wins, so "nifty 50 index" beats "index".
 */
export function guessFundCategory(name: string): string | null {
  const text = ` ${name.toLowerCase().replace(/[^a-z0-9&]+/g, " ")} `;
  let best: { id: string; length: number } | null = null;
  for (const { id } of fundCategories)
    for (const word of categorySearchWords(id)) {
      const needle = ` ${word.replace(/[^a-z0-9&]+/g, " ").trim()} `;
      if (needle.trim().length >= 3 && text.includes(needle) && (!best || needle.length > best.length))
        best = { id, length: needle.length };
    }
  return best?.id ?? null;
}

/** A fund category's English teaching text and the lesson that covers it. */
export function fundCategoryInfo(
  categoryId: string,
): { name: string; summary: string; watchOut: string; topicId: string } | null {
  const category = fundCategories.find((c) => c.id === categoryId);
  const text = texts[categoryId];
  return category && text ? { ...text, topicId: category.topicId } : null;
}
