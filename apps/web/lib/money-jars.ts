import type { LearnerState } from "./learner-state";

/**
 * The emergency reserve and saving goals are jars of play money moved out of free cash. Moving money
 * in or out never buys or sells anything; it only changes which jar the cash sits in.
 */
export type JarOutcome = { ok: true; state: LearnerState } | { ok: false; reason: JarError };
export type JarError = "invalid-amount" | "not-enough-cash" | "not-enough-saved" | "unknown-goal" | "too-many-goals";

type Goal = LearnerState["goals"][number];
const MAX_GOALS = 20;

const validAmount = (paise: number) => Number.isSafeInteger(paise) && paise > 0;

/** Moves free cash into the emergency reserve. */
export function addToReserve(state: LearnerState, freeCashPaise: number, amountPaise: number): JarOutcome {
  if (!validAmount(amountPaise)) return { ok: false, reason: "invalid-amount" };
  if (amountPaise > freeCashPaise) return { ok: false, reason: "not-enough-cash" };
  return { ok: true, state: { ...state, emergencyReservePaise: state.emergencyReservePaise + amountPaise } };
}

/** Moves money from the emergency reserve back to free cash. */
export function takeFromReserve(state: LearnerState, amountPaise: number): JarOutcome {
  if (!validAmount(amountPaise)) return { ok: false, reason: "invalid-amount" };
  if (amountPaise > state.emergencyReservePaise) return { ok: false, reason: "not-enough-saved" };
  return { ok: true, state: { ...state, emergencyReservePaise: state.emergencyReservePaise - amountPaise } };
}

/** Sets (or clears, with null) the learner's own reserve target. */
export function setReserveTarget(state: LearnerState, targetPaise: number | null): JarOutcome {
  if (targetPaise !== null && !validAmount(targetPaise)) return { ok: false, reason: "invalid-amount" };
  return { ok: true, state: { ...state, reserveTargetPaise: targetPaise } };
}

/** Adds a new, empty saving goal. */
export function addGoal(
  state: LearnerState,
  goal: { label: string; targetPaise: number; targetMonth: string | null },
  now = new Date(),
): JarOutcome {
  const label = goal.label.trim().slice(0, 60);
  if (!label || !validAmount(goal.targetPaise)) return { ok: false, reason: "invalid-amount" };
  if (goal.targetMonth !== null && !/^\d{4}-(0[1-9]|1[0-2])$/.test(goal.targetMonth))
    return { ok: false, reason: "invalid-amount" };
  if (state.goals.length >= MAX_GOALS) return { ok: false, reason: "too-many-goals" };
  const created: Goal = {
    id: `goal-${now.getTime().toString(36)}-${state.goals.length}`,
    label,
    targetPaise: goal.targetPaise,
    targetMonth: goal.targetMonth,
    savedPaise: 0,
    createdAt: now.toISOString(),
  };
  return { ok: true, state: { ...state, goals: [...state.goals, created] } };
}

function updateGoal(state: LearnerState, id: string, change: (goal: Goal) => Goal | JarError): JarOutcome {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return { ok: false, reason: "unknown-goal" };
  const next = change(goal);
  if (typeof next === "string") return { ok: false, reason: next };
  return { ok: true, state: { ...state, goals: state.goals.map((g) => (g.id === id ? next : g)) } };
}

/** Moves free cash into one goal. */
export function addToGoal(state: LearnerState, freeCashPaise: number, id: string, amountPaise: number): JarOutcome {
  if (!validAmount(amountPaise)) return { ok: false, reason: "invalid-amount" };
  if (amountPaise > freeCashPaise) return { ok: false, reason: "not-enough-cash" };
  return updateGoal(state, id, (goal) => ({ ...goal, savedPaise: goal.savedPaise + amountPaise }));
}

/** Moves money from one goal back to free cash. */
export function takeFromGoal(state: LearnerState, id: string, amountPaise: number): JarOutcome {
  if (!validAmount(amountPaise)) return { ok: false, reason: "invalid-amount" };
  return updateGoal(state, id, (goal) =>
    amountPaise > goal.savedPaise ? "not-enough-saved" : { ...goal, savedPaise: goal.savedPaise - amountPaise },
  );
}

/** Deletes a goal; whatever it held goes back to free cash. */
export function removeGoal(state: LearnerState, id: string): JarOutcome {
  if (!state.goals.some((g) => g.id === id)) return { ok: false, reason: "unknown-goal" };
  return { ok: true, state: { ...state, goals: state.goals.filter((g) => g.id !== id) } };
}

/** Whole months from `now` until the end of `targetMonth` (`YYYY-MM`); 0 once it has passed. */
export function monthsUntil(targetMonth: string, now = new Date()): number {
  const [year, month] = targetMonth.split("-").map(Number) as [number, number];
  return Math.max(0, (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1)) + 1);
}

/** Play money to set aside each month to reach a goal by its month, with no interest assumed; null without a month. */
export function monthlyToReach(goal: Goal, now = new Date()): number | null {
  if (!goal.targetMonth) return null;
  const remaining = Math.max(0, goal.targetPaise - goal.savedPaise);
  if (remaining === 0) return 0;
  const months = monthsUntil(goal.targetMonth, now);
  return months === 0 ? remaining : Math.ceil(remaining / months);
}
