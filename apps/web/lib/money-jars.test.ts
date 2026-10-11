import { describe, expect, it } from "vitest";
import type { LearnerState } from "./learner-state";
import {
  addGoal,
  addToGoal,
  addToReserve,
  monthlyToReach,
  monthsUntil,
  removeGoal,
  setReserveTarget,
  takeFromGoal,
  takeFromReserve,
} from "./money-jars";

const state = (): LearnerState => ({
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
  placement: null,
});
const now = new Date("2026-10-11T10:00:00Z");

function ok(outcome: ReturnType<typeof addToReserve>): LearnerState {
  if (!outcome.ok) throw new Error(outcome.reason);
  return outcome.state;
}

describe("emergency reserve", () => {
  it("moves free cash in and back out", () => {
    const filled = ok(addToReserve(state(), 500_000, 200_000));
    expect(filled.emergencyReservePaise).toBe(200_000);
    expect(ok(takeFromReserve(filled, 50_000)).emergencyReservePaise).toBe(150_000);
  });

  it("refuses more than free cash or more than saved", () => {
    expect(addToReserve(state(), 100, 101)).toEqual({ ok: false, reason: "not-enough-cash" });
    expect(takeFromReserve(state(), 1)).toEqual({ ok: false, reason: "not-enough-saved" });
  });

  it("rejects zero, negative and fractional amounts", () => {
    for (const amount of [0, -5, 1.5, Number.NaN]) {
      expect(addToReserve(state(), 1_000, amount)).toEqual({ ok: false, reason: "invalid-amount" });
    }
  });

  it("sets and clears a target", () => {
    expect(ok(setReserveTarget(state(), 300_000)).reserveTargetPaise).toBe(300_000);
    expect(ok(setReserveTarget(state(), null)).reserveTargetPaise).toBeNull();
    expect(setReserveTarget(state(), 0)).toEqual({ ok: false, reason: "invalid-amount" });
  });
});

describe("saving goals", () => {
  it("adds a goal, funds it, takes some back and removes it", () => {
    const created = ok(
      addGoal(state(), { label: "  New bicycle ", targetPaise: 800_000, targetMonth: "2027-06" }, now),
    );
    const goal = created.goals[0];
    expect(goal).toMatchObject({ label: "New bicycle", savedPaise: 0, targetMonth: "2027-06" });
    const id = goal?.id ?? "";
    const funded = ok(addToGoal(created, 300_000, id, 300_000));
    expect(funded.goals[0]?.savedPaise).toBe(300_000);
    expect(addToGoal(funded, 0, id, 1)).toEqual({ ok: false, reason: "not-enough-cash" });
    expect(takeFromGoal(funded, id, 300_001)).toEqual({ ok: false, reason: "not-enough-saved" });
    expect(ok(takeFromGoal(funded, id, 100_000)).goals[0]?.savedPaise).toBe(200_000);
    expect(ok(removeGoal(funded, id)).goals).toEqual([]);
  });

  it("rejects an empty name, a bad month and unknown goals", () => {
    expect(addGoal(state(), { label: " ", targetPaise: 100, targetMonth: null })).toEqual({
      ok: false,
      reason: "invalid-amount",
    });
    expect(addGoal(state(), { label: "Book", targetPaise: 100, targetMonth: "2027-13" })).toEqual({
      ok: false,
      reason: "invalid-amount",
    });
    expect(addToGoal(state(), 100, "missing", 10)).toEqual({ ok: false, reason: "unknown-goal" });
    expect(removeGoal(state(), "missing")).toEqual({ ok: false, reason: "unknown-goal" });
  });
});

describe("goal planning", () => {
  it("counts the target month itself", () => {
    expect(monthsUntil("2026-10", now)).toBe(1);
    expect(monthsUntil("2027-03", now)).toBe(6);
    expect(monthsUntil("2026-01", now)).toBe(0);
  });

  it("splits what is left evenly with no interest assumed", () => {
    const goal = {
      id: "g",
      label: "Phone",
      targetPaise: 600_000,
      targetMonth: "2027-03",
      savedPaise: 0,
      createdAt: now.toISOString(),
    };
    expect(monthlyToReach(goal, now)).toBe(100_000);
    expect(monthlyToReach({ ...goal, savedPaise: 600_000 }, now)).toBe(0);
    expect(monthlyToReach({ ...goal, targetMonth: null }, now)).toBeNull();
    expect(monthlyToReach({ ...goal, targetMonth: "2025-01" }, now)).toBe(600_000);
  });
});
