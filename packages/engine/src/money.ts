import type { Paise } from "@gullak/types";

export const PAISE_PER_RUPEE = 100;

export function inrToPaise(rupees: number): Paise {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function paiseToInr(paise: Paise): number {
  return paise / PAISE_PER_RUPEE;
}
