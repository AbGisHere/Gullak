/** Authored local practice; completion never changes curriculum mastery or unlocks. */
export const QUESTS = [
  {
    id: "sort",
    difficulty: "starter",
    prerequisite: null,
    xp: 20,
    steps: [
      { id: "water", options: ["need", "want"], correct: "need" },
      { id: "toy", options: ["need", "want"], correct: "want" },
    ],
  },
  {
    id: "scam",
    difficulty: "starter",
    prerequisite: null,
    xp: 20,
    steps: [{ id: "request", options: ["approve", "verify"], correct: "verify" }],
  },
  {
    id: "budget",
    difficulty: "builder",
    prerequisite: "sort",
    xp: 30,
    steps: [{ id: "plan", options: ["allTreats", "balanced", "noNeeds"], correct: "balanced" }],
  },
  {
    id: "compare",
    difficulty: "builder",
    prerequisite: "budget",
    xp: 30,
    steps: [{ id: "shop", options: ["small", "large", "same"], correct: "large" }],
  },
] as const;
export type QuestId = (typeof QUESTS)[number]["id"];
export type QuestDefinition = (typeof QUESTS)[number];
export type QuestFeedback = { questId: QuestId; stepId: string; correct: boolean } | null;
export interface QuestState {
  progress: Record<QuestId, number>;
  xp: number;
  familyDone: boolean;
  feedback: QuestFeedback;
}
export type QuestAction =
  | { type: "answer"; questId: QuestId; stepId: string; choice: string }
  | { type: "family" }
  | { type: "reset" };
export function initialQuests(): QuestState {
  return { progress: { sort: 0, scam: 0, budget: 0, compare: 0 }, xp: 0, familyDone: false, feedback: null };
}
/** True once the learner has done anything a reset would throw away. */
export function questHasProgress(state: QuestState): boolean {
  return state.familyDone || state.xp > 0 || Object.values(state.progress).some((step) => step > 0);
}
export function questUnlocked(state: QuestState, quest: QuestDefinition) {
  if (!quest.prerequisite) return true;
  const previous = QUESTS.find((item) => item.id === quest.prerequisite);
  return !!previous && state.progress[previous.id] === previous.steps.length;
}
export function questReducer(state: QuestState, action: QuestAction): QuestState {
  if (action.type === "reset") return initialQuests();
  if (action.type === "family")
    return state.familyDone ? state : { ...state, familyDone: true, xp: state.xp + 10, feedback: null };
  const quest = QUESTS.find((item) => item.id === action.questId);
  if (!quest || !questUnlocked(state, quest)) return state;
  const stepIndex = state.progress[quest.id];
  const step = quest.steps[stepIndex];
  // Ignore stale/repeated actions: a completed step can never earn XP twice.
  if (!step || step.id !== action.stepId || !step.options.some((choice) => choice === action.choice)) return state;
  const correct = action.choice === step.correct;
  const next = stepIndex + (correct ? 1 : 0);
  return {
    ...state,
    progress: { ...state.progress, [quest.id]: next },
    xp: state.xp + (correct && next === quest.steps.length ? quest.xp : 0),
    feedback: { questId: quest.id, stepId: step.id, correct },
  };
}
