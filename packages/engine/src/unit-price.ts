import { UnitPriceComparison } from "@gullak/types";

/** Exact fictional pack comparison; lower cost per unit does not imply affordability or suitability. */
export function compareUnitPrices(input: unknown): "left" | "right" | "equal" {
  const { left, right } = UnitPriceComparison.parse(input);
  const leftCross = BigInt(left.pricePaise) * BigInt(right.quantity);
  const rightCross = BigInt(right.pricePaise) * BigInt(left.quantity);
  if (leftCross === rightCross) return "equal";
  return leftCross < rightCross ? "left" : "right";
}
