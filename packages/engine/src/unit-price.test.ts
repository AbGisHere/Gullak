import { describe, expect, it } from "vitest";
import { compareUnitPrices } from "./index";

const left = { pricePaise: 1000, quantity: 5, unit: "piece" };
const right = { pricePaise: 1800, quantity: 10, unit: "piece" };

describe("exact virtual unit-price comparison", () => {
  it("compares price per piece rather than total pack price", () => {
    expect(compareUnitPrices({ isVirtual: true, left, right })).toBe("right");
  });

  it("returns the left pack when it costs less per piece", () => {
    expect(compareUnitPrices({ isVirtual: true, left: right, right: left })).toBe("left");
  });

  it("reports equal unit costs across different pack sizes", () => {
    expect(compareUnitPrices({ isVirtual: true, left, right: { ...right, pricePaise: 2000 } })).toBe("equal");
  });

  it.each(["gram", "millilitre"])("compares normalized %s quantities", (unit) => {
    expect(compareUnitPrices({ isVirtual: true, left: { ...left, unit }, right: { ...right, unit } })).toBe("right");
  });

  it("does not round fractional paise per unit into a tie", () => {
    expect(
      compareUnitPrices({
        isVirtual: true,
        left: { ...left, pricePaise: 1, quantity: 3 },
        right: { ...right, pricePaise: 1, quantity: 4 },
      }),
    ).toBe("right");
  });

  it.each([
    [0, 1, "left"],
    [1, 0, "right"],
    [0, 0, "equal"],
  ] as const)("compares zero-price boundary %s versus %s", (leftPrice, rightPrice, expected) => {
    expect(
      compareUnitPrices({
        isVirtual: true,
        left: { ...left, pricePaise: leftPrice },
        right: { ...right, pricePaise: rightPrice },
      }),
    ).toBe(expected);
  });

  it("distinguishes large ratios whose cross products differ by just one", () => {
    // For M = 2^53 - 1: M*(M-2) < (M-1)^2 by exactly 1.
    // Floating-point division or multiplication loses this distinction.
    expect(
      compareUnitPrices({
        isVirtual: true,
        left: { ...left, pricePaise: 9007199254740991, quantity: 9007199254740990 },
        right: { ...right, pricePaise: 9007199254740990, quantity: 9007199254740989 },
      }),
    ).toBe("left");
  });

  it("reports a large exact tie without serializing bigint values", () => {
    const pack = { ...left, pricePaise: 9007199254740991, quantity: 9007199254740991 };
    expect(JSON.stringify(compareUnitPrices({ isVirtual: true, left: pack, right: pack }))).toBe('"equal"');
  });

  it("does not mutate frozen caller input", () => {
    const request = Object.freeze({
      isVirtual: true,
      left: Object.freeze({ ...left }),
      right: Object.freeze({ ...right }),
    });
    expect(compareUnitPrices(request)).toBe("right");
    expect(request).toEqual({ isVirtual: true, left, right });
  });

  it.each([
    { isVirtual: false, left, right },
    { isVirtual: true, left, right: { ...right, unit: "gram" } },
    { isVirtual: true, left: { ...left, quantity: 0 }, right },
    { isVirtual: true, left, right: { ...right, pricePaise: -1 } },
    { isVirtual: true, left, right: { ...right, pricePaise: Number.MAX_SAFE_INTEGER + 1 } },
    null,
  ])("rejects invalid caller input before arithmetic %#", (input) => {
    expect(() => compareUnitPrices(input)).toThrowError(expect.objectContaining({ name: "ZodError" }));
  });
});
