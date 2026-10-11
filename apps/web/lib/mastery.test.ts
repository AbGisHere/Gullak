import { describe, expect, it } from "vitest";
import { DEFAULT_MASTERY_PARAMS, initialMastery, updateMastery } from "./mastery";

describe("temporary mastery model", () => {
  it("uses experience only for the starting prior", () => {
    expect(initialMastery("none")).toBe(0.1);
    expect(initialMastery("some")).toBe(0.3);
    expect(initialMastery("regular")).toBe(0.5);
  });

  it("moves belief with answer evidence", () => {
    expect(updateMastery(0.5, true, DEFAULT_MASTERY_PARAMS)).toBeGreaterThan(0.5);
    expect(updateMastery(0.5, false, DEFAULT_MASTERY_PARAMS)).toBeLessThan(0.5);
  });

  it("keeps repeated updates within probability bounds", () => {
    for (const correct of [true, false]) {
      let known = 0.2;
      for (let count = 0; count < 100; count++) known = updateMastery(known, correct);
      expect(known).toBeGreaterThanOrEqual(0);
      expect(known).toBeLessThanOrEqual(1);
    }
  });
});
