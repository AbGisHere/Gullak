/**
 * Small pure checks that stop a learner from submitting a state the app cannot save,
 * or from losing work they have already done. No storage or DOM access here.
 */

/** Largest savings goal onboarding accepts, in whole rupees (₹1 crore). Keeps paise a safe integer. */
export const MAX_GOAL_INR = 10_000_000;

export type GoalDraftIssue = "incomplete" | "amountZero" | "amountTooLarge" | "dateInvalid" | "dateInPast";

export interface GoalDraft {
  label: string;
  /** Digits typed by the learner (whole rupees). */
  amountInr: string;
  /** `YYYY-MM-DD` from a date input, or empty. */
  date: string;
}

/** Today's date as `YYYY-MM-DD` in the learner's local time zone. */
export function localIsoDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Returns the first problem with an optional savings goal, or null when it is either
 * untouched (skipped) or complete and valid. `today` is `YYYY-MM-DD`.
 */
export function goalDraftIssue(draft: GoalDraft, today: string): GoalDraftIssue | null {
  const label = draft.label.trim();
  const amount = draft.amountInr.trim();
  const date = draft.date.trim();
  if (!label && !amount && !date) return null;
  if (!label || !amount || !date) return "incomplete";
  if (!/^\d+$/.test(amount)) return "incomplete";
  const rupees = Number(amount);
  if (rupees <= 0) return "amountZero";
  if (rupees > MAX_GOAL_INR) return "amountTooLarge";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return "dateInvalid";
  if (date < today) return "dateInPast";
  return null;
}

export type QuizDraft = Record<string, string>;

/**
 * Restores saved quiz answers, keeping only answers that still match a current
 * question and one of its options. Anything malformed is dropped, never thrown.
 */
export function restoreQuizDraft(
  raw: string | null,
  questions: readonly { id: string; options: readonly { id: string }[] }[],
): QuizDraft {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
  const draft: QuizDraft = {};
  for (const question of questions) {
    const answer = (parsed as Record<string, unknown>)[question.id];
    if (typeof answer === "string" && question.options.some((option) => option.id === answer)) {
      draft[question.id] = answer;
    }
  }
  return draft;
}
