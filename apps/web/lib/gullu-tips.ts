/**
 * Gullu's tips: deterministic, contextual and translated.
 * Returns message keys under `help.tips`; the caller translates them.
 * Tips never point at anything outside the screen they are shown on.
 */

export const TIP_WORLD_SLUGS = [
  "candy-economy",
  "savings-quest",
  "bankopolis",
  "market-mayhem",
  "grow-your-money",
  "stock-street",
  "life-simulator",
  "finance-tycoon",
] as const;
export type TipWorldSlug = (typeof TIP_WORLD_SLUGS)[number];

export type GulluTipPlace = "map" | "gullu" | "portfolio" | "practice";
export type QuizOutcome = "passed" | "retry";

export interface GulluTipContext {
  place: GulluTipPlace;
  /** No quiz attempts or finished missions yet. */
  isNewLearner: boolean;
  /** The world the learner is currently in, when the screen knows it. */
  worldSlug?: string | undefined;
  /** Outcome of the learner's most recent quiz, if any. */
  lastQuiz?: QuizOutcome | null | undefined;
}

function isWorldSlug(slug: string | undefined): slug is TipWorldSlug {
  return slug !== undefined && (TIP_WORLD_SLUGS as readonly string[]).includes(slug);
}

/** Ordered tip keys for a context. Never empty. */
export function gulluTipKeys(context: GulluTipContext): string[] {
  const quiz = context.lastQuiz === "passed" ? ["quizPassed"] : context.lastQuiz === "retry" ? ["quizRetry"] : [];
  const world = isWorldSlug(context.worldSlug) ? [`world.${context.worldSlug}`] : [];

  switch (context.place) {
    case "map":
      return context.isNewLearner ? ["newWelcome", "newPlayMoney", ...world] : [...quiz, ...world, "habit"];
    case "gullu":
      return context.isNewLearner
        ? ["gulluGrow", "newPlayMoney", "gulluKintsugi"]
        : [...quiz, "gulluGrow", ...world, "gulluKintsugi"];
    case "portfolio":
      return ["portfolioPaper", "portfolioSteady"];
    case "practice":
      return ["practiceUnknown", "practiceReserve"];
  }
}

/** The tip shown after `taps` taps on Gullu: cycles through the context's tips in order. */
export function gulluTipAt(context: GulluTipContext, taps: number): string {
  const keys = gulluTipKeys(context);
  const index = Number.isSafeInteger(taps) && taps > 0 ? taps % keys.length : 0;
  return keys[index] ?? keys[0] ?? "habit";
}

/**
 * Outcome of the most recent quiz attempt, judged against that topic's pass mark.
 * Attempts are ordered by their ISO timestamp; unknown topics are ignored.
 */
export function lastQuizOutcome(
  attempts: readonly { topicId: string; score: number; at: string }[],
  passMarkFor: (topicId: string) => number | undefined,
): QuizOutcome | null {
  let latest: { topicId: string; score: number; at: string } | undefined;
  for (const attempt of attempts) {
    if (passMarkFor(attempt.topicId) === undefined) continue;
    if (!latest || attempt.at >= latest.at) latest = attempt;
  }
  if (!latest) return null;
  const mark = passMarkFor(latest.topicId) ?? 1;
  return latest.score >= mark ? "passed" : "retry";
}
