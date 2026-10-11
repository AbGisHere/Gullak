import { describe, expect, it } from "vitest";
import { initialQuests, QUESTS, questHasProgress, questReducer, questUnlocked } from "./quest-state";

describe("local quest progression", () => {
  it("allows wrong answers to retry without XP loss or advancing", () => {
    const wrong = questReducer(initialQuests(), { type: "answer", questId: "sort", stepId: "water", choice: "want" });
    expect(wrong.progress.sort).toBe(0);
    expect(wrong.xp).toBe(0);
    expect(wrong.feedback?.correct).toBe(false);
    const retry = questReducer(wrong, { type: "answer", questId: "sort", stepId: "water", choice: "need" });
    expect(retry.progress.sort).toBe(1);
    expect(retry.feedback?.correct).toBe(true);
    expect(retry.xp).toBe(0);
  });
  it("awards once on completion, ignores repeated actions and unlocks dependent quests", () => {
    let state = initialQuests();
    expect(questUnlocked(state, QUESTS[2])).toBe(false);
    const locked = { type: "answer", questId: "budget", stepId: "plan", choice: "balanced" } as const;
    expect(questReducer(state, locked)).toBe(state);
    const first = { type: "answer", questId: "sort", stepId: "water", choice: "need" } as const;
    state = questReducer(state, first);
    expect(questReducer(state, first)).toBe(state);
    const last = { type: "answer", questId: "sort", stepId: "toy", choice: "want" } as const;
    state = questReducer(state, last);
    expect(state.xp).toBe(20);
    expect(questReducer(state, last)).toBe(state);
    expect(questUnlocked(state, QUESTS[2])).toBe(true);
    expect(questUnlocked(state, QUESTS[3])).toBe(false);
    state = questReducer(state, locked);
    expect(questUnlocked(state, QUESTS[3])).toBe(true);
  });
  it("completes the daily board independently of the optional family mission", () => {
    let state = initialQuests();
    for (const quest of QUESTS) {
      for (const step of quest.steps)
        state = questReducer(state, { type: "answer", questId: quest.id, stepId: step.id, choice: step.correct });
    }
    expect(state.progress).toEqual({ sort: 2, scam: 1, budget: 1, compare: 1 });
    expect(state.xp).toBe(100);
    expect(state.familyDone).toBe(false);
    state = questReducer(state, { type: "family" });
    expect(state.xp).toBe(110);
    expect(questReducer(state, { type: "family" })).toBe(state);
    expect(questReducer(state, { type: "reset" })).toEqual(initialQuests());
  });
  it("ignores invalid or stale step choices", () => {
    const state = initialQuests();
    expect(questReducer(state, { type: "answer", questId: "sort", stepId: "toy", choice: "want" })).toBe(state);
    expect(questReducer(state, { type: "answer", questId: "sort", stepId: "water", choice: "made-up" })).toBe(state);
  });

  it("reports progress only after an answer or the family check", () => {
    const state = initialQuests();
    expect(questHasProgress(state)).toBe(false);
    expect(
      questHasProgress(questReducer(state, { type: "answer", questId: "sort", stepId: "water", choice: "need" })),
    ).toBe(true);
    expect(questHasProgress(questReducer(state, { type: "family" }))).toBe(true);
    expect(questHasProgress(questReducer(questReducer(state, { type: "family" }), { type: "reset" }))).toBe(false);
  });
});
