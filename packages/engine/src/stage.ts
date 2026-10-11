import type { Stage } from "@gullak/types";
import { z } from "zod";

const ClassNumber = z.number().int().min(6).max(12);

/** Draft-stage selection only; does not migrate legacy grade groups or grant progress. */
export function stageForClass(classNumber: unknown): Stage {
  const value = ClassNumber.parse(classNumber);
  if (value <= 7) return "foundation-explorers";
  if (value <= 9) return "money-navigators";
  return "financial-strategists";
}
