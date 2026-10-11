import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { stageForClass } from "./index";

describe("stageForClass", () => {
  it.each([
    [6, "foundation-explorers"],
    [7, "foundation-explorers"],
    [8, "money-navigators"],
    [9, "money-navigators"],
    [10, "financial-strategists"],
    [11, "financial-strategists"],
    [12, "financial-strategists"],
  ] as const)("maps Class %s to %s", (classNumber, expected) => {
    expect(stageForClass(classNumber)).toBe(expected);
  });

  it.each(
    [5, 13, 0, -1, 6.5, 9.9, NaN, Infinity, -Infinity, "8", "grade-8-10", null, undefined, true, [], {}].map(
      (classNumber) => ({ classNumber }),
    ),
  )("rejects invalid class $classNumber without coercion or fallback", ({ classNumber }) => {
    expect(() => stageForClass(classNumber)).toThrow(ZodError);
  });
});
