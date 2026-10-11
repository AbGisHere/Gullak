import type { LearnerProfile } from "@gullak/types";
import { z } from "zod";

export { readProfile } from "@/components/onboarding";

import { initialMastery } from "./mastery";

export const LEARNER_STATE_KEY = "gullak-learner-state";
const LearnerStateSchema = z.object({
  passedTopics: z.array(z.string()),
  quizAttempts: z.array(z.object({ topicId: z.string(), score: z.number().min(0).max(1), at: z.string() })),
  mastery: z.record(z.string(), z.number().min(0).max(1)),
  practiceCashPaise: z.number().int().safe(),
});
export type LearnerState = z.infer<typeof LearnerStateSchema>;

const emptyState = (): LearnerState => ({ passedTopics: [], quizAttempts: [], mastery: {}, practiceCashPaise: 0 });

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

export function saveLearnerState(state: LearnerState): void {
  try {
    window.localStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("gullak-state-change"));
  } catch {
    // Keep the current session usable when storage is unavailable.
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
