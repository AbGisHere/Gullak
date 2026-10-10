/**
 * Hard guardrail: Gullak educates, it never recommends real products or tells
 * anyone to buy or sell. This runs BEFORE any LLM call and again on output.
 * Patterns are deliberately broad; a false positive costs a polite redirect,
 * a false negative costs trust.
 */

const ADVICE_REQUEST_PATTERNS: readonly RegExp[] = [
  /\b(should|shall|can)\s+i\s+(buy|sell|invest|put\s+(my\s+)?money)\b/i,
  /\b(which|what)\s+(stock|share|fund|mutual\s+fund|sip|coin|crypto)\s+(should|to|is\s+best)\b/i,
  /\b(best|top)\s+(stock|share|fund|mutual\s+fund|sip|investment)s?\s+(to|for)\b/i,
  /\b(recommend|suggest|tip)\b.*\b(stock|share|fund|investment|sip|buy|sell)\b/i,
  /\bis\s+.+\s+a\s+good\s+(buy|investment)\b/i,
  // Hindi / Hinglish
  /(kaunsa|konsa)\s+(share|stock|fund)/i,
  /(kharid(u|oon|na)|bech(u|oon|na))\s*(chahiye|kya)/i,
  /खरीद|बेच(ूं|ना)/,
  // Telugu
  /కొనాలా|అమ్మాలా/,
];

const ADVICE_OUTPUT_PATTERNS: readonly RegExp[] = [
  /\byou\s+should\s+(buy|sell|invest\s+in)\b/i,
  /\b(i|we)\s+recommend\s+(buying|selling|investing)\b/i,
  // Market instruments never have guaranteed returns (an FD's fixed rate is fine to explain).
  /\b(stocks?|shares?|mutual\s+funds?|index\s+funds?|sip|gold|crypto)\b[^.]*\b(guaranteed|will\s+definitely|sure\s+to)\b/i,
];

export type GuardrailVerdict = { allowed: true } | { allowed: false; reason: "investment-advice" };

export function checkLearnerQuestion(text: string): GuardrailVerdict {
  return ADVICE_REQUEST_PATTERNS.some((p) => p.test(text))
    ? { allowed: false, reason: "investment-advice" }
    : { allowed: true };
}

export function checkModelOutput(text: string): GuardrailVerdict {
  return ADVICE_OUTPUT_PATTERNS.some((p) => p.test(text))
    ? { allowed: false, reason: "investment-advice" }
    : { allowed: true };
}
