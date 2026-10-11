import { SchoolClass, type Stage } from "@gullak/types";

/** Draft-stage selection only; does not migrate legacy grade groups or grant progress. */
export function stageForClass(classNumber: unknown): Stage {
  const value = SchoolClass.parse(classNumber);
  if (value <= 7) return "foundation-explorers";
  if (value <= 9) return "money-navigators";
  return "financial-strategists";
}
