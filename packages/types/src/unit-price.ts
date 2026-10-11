import { z } from "zod";
import { NonNegativePaise } from "./common";

/** Compare like quantities only; callers normalize kilograms/litres before this boundary. */
export const UnitPricePack = z
  .object({
    pricePaise: NonNegativePaise,
    quantity: z.number().int().safe().positive(),
    unit: z.enum(["piece", "gram", "millilitre"]),
  })
  .strict();
export type UnitPricePack = z.infer<typeof UnitPricePack>;

/** Fictional teaching packs, not market quotes or purchase recommendations. */
export const UnitPriceComparison = z
  .object({ isVirtual: z.literal(true), left: UnitPricePack, right: UnitPricePack })
  .strict()
  .refine((input) => input.left.unit === input.right.unit, {
    message: "pack units must match",
    path: ["right", "unit"],
  });
export type UnitPriceComparison = z.infer<typeof UnitPriceComparison>;
