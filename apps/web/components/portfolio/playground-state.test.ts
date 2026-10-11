import { describe, expect, it } from "vitest";
import { GOALS, goalProgress, initialPlayground, playgroundReducer, STARTING_WALLET } from "./playground-state";

describe("fictional savings ledger", () => {
  it("moves integer paise from wallet to jar immediately", () => {
    const state = playgroundReducer(initialPlayground(), { kind: "save", amountPaise: 5000 });
    expect(state.walletPaise).toBe(95000);
    expect(state.savedPaise).toBe(5000);
    expect(state.depositSequence).toBe(1);
    expect(goalProgress(state).percent).toBe(25);
  });
  it("conserves coins through repeated savings and spending, rejects overdrafts", () => {
    let state = initialPlayground();
    for (let index = 0; index < 12; index++) state = playgroundReducer(state, { kind: "save", amountPaise: 10000 });
    expect(state.savedPaise).toBe(STARTING_WALLET);
    expect(state.walletPaise).toBe(0);
    expect(state.feedback).toBe("insufficient");
    expect(state.history).toHaveLength(10);
    state = playgroundReducer(state, { kind: "undo" });
    state = playgroundReducer(state, { kind: "spend", amountPaise: 5000 });
    expect(state.savedPaise + state.walletPaise + state.spentPaise).toBe(STARTING_WALLET);
    expect(state.spentPaise).toBe(5000);
  });
  it.each([0, -100, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid transfers (%s)",
    (amountPaise) => {
      const state = playgroundReducer(initialPlayground(), { kind: "save", amountPaise });
      expect(state.walletPaise).toBe(STARTING_WALLET);
      expect(state.savedPaise).toBe(0);
      expect(state.history).toHaveLength(0);
    },
  );
  it("switches goal without duplicating money, caps progress and reaches every goal", () => {
    let state = playgroundReducer(initialPlayground(), { kind: "save", amountPaise: 50000 });
    expect(goalProgress(state)).toMatchObject({ percent: 100, remainingPaise: 0, reached: true });
    state = playgroundReducer(state, { kind: "goal", goalId: "bicycle" });
    expect(goalProgress(state)).toMatchObject({ percent: 50, remainingPaise: 50000, reached: false });
    expect(state.savedPaise).toBe(50000);
    state = playgroundReducer(state, { kind: "save", amountPaise: 50000 });
    for (const goal of GOALS) expect(goalProgress({ ...state, goalId: goal.id }).reached).toBe(true);
  });
  it("undoes both types of move and restores the initial state on reset", () => {
    let state = playgroundReducer(initialPlayground(), { kind: "save", amountPaise: 10000 });
    state = playgroundReducer(state, { kind: "spend", amountPaise: 5000 });
    state = playgroundReducer(state, { kind: "undo" });
    expect(state.spentPaise).toBe(0);
    state = playgroundReducer(state, { kind: "undo" });
    expect(state.savedPaise).toBe(0);
    expect(state.walletPaise).toBe(STARTING_WALLET);
    expect(playgroundReducer(state, { kind: "undo" })).toBe(state);
    expect(playgroundReducer(state, { kind: "reset" })).toEqual({ ...initialPlayground(), feedback: "reset" });
  });
});
