/** Terms with a plain-language definition under `help.terms` in every locale. */
export const HELP_TERMS = [
  "xp",
  "mastery",
  "daysPractised",
  "habitScore",
  "playMoney",
  "portfolio",
  "interest",
  "inflation",
  "sip",
  "nav",
  "previousClose",
  "dayRange",
  "week52Range",
  "volume",
  "oneYearChange",
  "indexPoints",
  "stock",
  "etf",
  "mutualFund",
  "fundCategory",
] as const;
export type HelpTerm = (typeof HELP_TERMS)[number];
