/** Local practice ledger, in integer paise; never the learner's paper portfolio. */
export const STARTING_WALLET = 100_000;
export const GOALS = [
  { id: "supplies", targetPaise: 20_000 },
  { id: "football", targetPaise: 50_000 },
  { id: "bicycle", targetPaise: 100_000 },
] as const;
export type GoalId = (typeof GOALS)[number]["id"];
export type LedgerMove = { kind: "save" | "spend"; amountPaise: number };
export interface PlaygroundState {
  walletPaise: number;
  savedPaise: number;
  spentPaise: number;
  goalId: GoalId;
  history: LedgerMove[];
  feedback: "ready" | "saved" | "spent" | "insufficient" | "undone" | "reset";
  depositSequence: number;
  lastDepositPaise: number;
}
export type PlaygroundAction = LedgerMove | { kind: "goal"; goalId: GoalId } | { kind: "undo" } | { kind: "reset" };
export function initialPlayground(): PlaygroundState {
  return {
    walletPaise: STARTING_WALLET,
    savedPaise: 0,
    spentPaise: 0,
    goalId: "supplies",
    history: [],
    feedback: "ready",
    depositSequence: 0,
    lastDepositPaise: 0,
  };
}
export function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  if (action.kind === "reset") return { ...initialPlayground(), feedback: "reset" };
  if (action.kind === "goal") return { ...state, goalId: action.goalId };
  if (action.kind === "undo") {
    const last = state.history.at(-1);
    if (!last) return state;
    return {
      ...state,
      walletPaise: state.walletPaise + last.amountPaise,
      savedPaise: state.savedPaise - (last.kind === "save" ? last.amountPaise : 0),
      spentPaise: state.spentPaise - (last.kind === "spend" ? last.amountPaise : 0),
      history: state.history.slice(0, -1),
      lastDepositPaise: 0,
      feedback: "undone",
    };
  }
  if (!Number.isSafeInteger(action.amountPaise) || action.amountPaise <= 0 || action.amountPaise > state.walletPaise)
    return { ...state, feedback: "insufficient", lastDepositPaise: 0 };
  return {
    ...state,
    walletPaise: state.walletPaise - action.amountPaise,
    savedPaise: state.savedPaise + (action.kind === "save" ? action.amountPaise : 0),
    spentPaise: state.spentPaise + (action.kind === "spend" ? action.amountPaise : 0),
    history: [...state.history, action],
    feedback: action.kind === "save" ? "saved" : "spent",
    depositSequence: state.depositSequence + (action.kind === "save" ? 1 : 0),
    lastDepositPaise: action.kind === "save" ? action.amountPaise : 0,
  };
}
export function goalProgress(state: PlaygroundState) {
  const goal = GOALS.find((item) => item.id === state.goalId) ?? GOALS[0];
  return {
    ...goal,
    percent: Math.min(100, Math.floor((state.savedPaise * 100) / goal.targetPaise)),
    remainingPaise: Math.max(0, goal.targetPaise - state.savedPaise),
    reached: state.savedPaise >= goal.targetPaise,
  };
}
