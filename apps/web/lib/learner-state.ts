import { IndianSymbol, type LearnerProfile, ListedKind } from "@gullak/types";
import { z } from "zod";

export { readProfile } from "@/components/onboarding";

import { ONBOARDING_STORAGE_KEY } from "@/components/onboarding";

import { initialMastery } from "./mastery";

export const LEARNER_STATE_KEY = "gullak-learner-state";
const LearnerStateSchema = z.object({
  passedTopics: z.array(z.string()),
  quizAttempts: z.array(z.object({ topicId: z.string(), score: z.number().min(0).max(1), at: z.string() })),
  mastery: z.record(z.string(), z.number().min(0).max(1)),
  practiceCashPaise: z.number().int().safe(),
  /** Completed activities (lessons, sorts, missions); older saved states have none. */
  activities: z
    .array(z.object({ id: z.string().min(1), at: z.string(), xp: z.number().int().min(0).max(100).optional() }))
    .default([]),
  /** Live paper-trading holdings of real Indian listings, bought with play money. */
  paperHoldings: z
    .array(
      z.object({
        symbol: IndianSymbol,
        name: z.string().min(1),
        kind: ListedKind,
        milliUnits: z.number().int().safe().positive(),
        costPaise: z.number().int().safe().nonnegative(),
        openedAt: z.string(),
      }),
    )
    .default([]),
  /** Net play money moved by Live trades (sales minus purchases); added to starting and Practice cash. */
  liveCashDeltaPaise: z.number().int().safe().default(0),
  /** Play money set aside for surprises; it leaves free cash and is never invested. */
  emergencyReservePaise: z.number().int().safe().nonnegative().default(0),
  /** The learner's own reserve target, if they set one. */
  reserveTargetPaise: z.number().int().safe().positive().nullable().default(null),
  /** Saving goals; each holds play money moved out of free cash. */
  goals: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().trim().min(1).max(60),
        targetPaise: z.number().int().safe().positive(),
        /** `YYYY-MM`, the month the learner wants to reach it by. */
        targetMonth: z
          .string()
          .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
          .nullable(),
        savedPaise: z.number().int().safe().nonnegative(),
        createdAt: z.string(),
      }),
    )
    .max(20)
    .default([]),
});
export type LearnerState = z.infer<typeof LearnerStateSchema>;

export const emptyState = (): LearnerState => ({
  passedTopics: [],
  quizAttempts: [],
  mastery: {},
  practiceCashPaise: 0,
  activities: [],
  paperHoldings: [],
  liveCashDeltaPaise: 0,
  emergencyReservePaise: 0,
  reserveTargetPaise: null,
  goals: [],
});

export function readLearnerState(): LearnerState {
  try {
    const raw = window.localStorage.getItem(LEARNER_STATE_KEY);
    if (!raw) return emptyState();
    const result = LearnerStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : emptyState();
  } catch {
    return emptyState();
  }
}

/** Saves progress on this device. Returns false when storage is full or blocked, so callers can offer a retry. */
export function saveLearnerState(state: LearnerState): boolean {
  try {
    window.localStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("gullak-state-change"));
    return true;
  } catch {
    // Keep the current session usable when storage is unavailable.
    return false;
  }
}

/** Removes this device's learner profile and progress (shared-phone "switch learner"). */
export function clearLearnerData(): void {
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.localStorage.removeItem(LEARNER_STATE_KEY);
    window.dispatchEvent(new Event("gullak-state-change"));
  } catch {
    // Storage blocked: nothing persisted to clear.
  }
}

/** Records a completed activity as progress evidence. XP counts each activity id once. */
export function recordActivity(id: string, xp?: number): void {
  const state = readLearnerState();
  const at = new Date().toISOString();
  saveLearnerState({ ...state, activities: [...state.activities, xp === undefined ? { id, at } : { id, at, xp }] });
}

/** Clears this device's learner progress, e.g. when a shared phone switches learner. */
export function clearLearnerState(): void {
  try {
    window.localStorage.removeItem(LEARNER_STATE_KEY);
    window.dispatchEvent(new Event("gullak-state-change"));
  } catch {
    // Storage unavailable: nothing persisted to clear.
  }
}

export function initialStateForProfile(profile: LearnerProfile): LearnerState {
  const state = readLearnerState();
  const mastery = { ...state.mastery };
  if (Object.keys(mastery).length === 0) {
    mastery["money-in"] = initialMastery(profile.experience);
    mastery["money-out"] = initialMastery(profile.experience);
  }
  return { ...state, mastery };
}
