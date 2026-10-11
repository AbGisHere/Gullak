/** Terms with a plain-language definition under `help.terms` in every locale. */
export const HELP_TERMS = [
  "xp",
  "mastery",
  "streak",
  "habitScore",
  "playMoney",
  "portfolio",
  "interest",
  "inflation",
  "sip",
  "nav",
] as const;
export type HelpTerm = (typeof HELP_TERMS)[number];
