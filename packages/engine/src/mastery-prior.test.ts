import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { initialMastery } from "./index";

describe("initialMastery", () => {
  it.each([
    ["none", 0.1],
    ["some", 0.3],
    ["regular", 0.5],
  ] as const)("initializes %s at exactly %s", (experience, expected) => {
    expect(initialMastery(experience)).toBe(expected);
  });
  it.each(["", "expert", null, undefined, 1, {}])(
    "rejects unknown experience %s rather than silently defaulting",
    (experience) => {
      expect(() => initialMastery(experience)).toThrow(ZodError);
    },
  );
});
