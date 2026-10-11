import { describe, expect, it } from "vitest";
import { UnitPriceComparison } from "./index";

const pack = { pricePaise: 1000, quantity: 5, unit: "piece" };
const input = { isVirtual: true, left: pack, right: { ...pack, pricePaise: 1800, quantity: 10 } };

describe("virtual unit-price comparison boundary", () => {
  it.each(["piece", "gram", "millilitre"])("accepts matching %s units", (unit) => {
    const request = { ...input, left: { ...pack, unit }, right: { ...input.right, unit } };
    expect(UnitPriceComparison.parse(request)).toEqual(request);
  });

  it("accepts zero-priced fictional packs", () => {
    expect(UnitPriceComparison.parse({ ...input, left: { ...pack, pricePaise: 0 } }).left.pricePaise).toBe(0);
  });

  it("accepts the safe integer boundary without rounding", () => {
    const request = {
      ...input,
      left: { ...pack, pricePaise: Number.MAX_SAFE_INTEGER, quantity: Number.MAX_SAFE_INTEGER },
    };
    expect(UnitPriceComparison.parse(request)).toEqual(request);
  });

  it.each([
    { ...input, isVirtual: false },
    { left: pack, right: pack },
    { ...input, recommendation: "buy" },
    { ...input, left: { ...pack, discount: 10 } },
    { ...input, right: { ...pack, unit: "gram" } },
    { ...input, left: { ...pack, unit: "kg" } },
    { ...input, left: { ...pack, pricePaise: -1 } },
    { ...input, left: { ...pack, pricePaise: 1.5 } },
    { ...input, left: { ...pack, pricePaise: Number.MAX_SAFE_INTEGER + 1 } },
    { ...input, left: { ...pack, pricePaise: Number.NaN } },
    { ...input, right: { ...pack, pricePaise: Number.POSITIVE_INFINITY } },
    { ...input, left: { ...pack, pricePaise: "1000" } },
    { ...input, left: { ...pack, quantity: 0 } },
    { ...input, left: { ...pack, quantity: -1 } },
    { ...input, left: { ...pack, quantity: 0.5 } },
    { ...input, right: { ...pack, quantity: Number.MAX_SAFE_INTEGER + 1 } },
    { ...input, right: { ...pack, quantity: Number.NaN } },
    { ...input, right: { ...pack, quantity: Number.POSITIVE_INFINITY } },
    { ...input, right: { ...pack, quantity: "5" } },
    { ...input, right: null },
    null,
  ])("rejects invalid or ambiguous input %#", (request) => {
    expect(UnitPriceComparison.safeParse(request).success).toBe(false);
  });
});
