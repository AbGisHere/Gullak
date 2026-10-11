import { Experience } from "@gullak/types";

const PRIORS: Record<Experience, number> = { none: 0.1, some: 0.3, regular: 0.5 };

/** Onboarding-only initialization; never reset saved mastery or use this to unlock lessons. */
export function initialMastery(experience: unknown): number {
  return PRIORS[Experience.parse(experience)];
}
