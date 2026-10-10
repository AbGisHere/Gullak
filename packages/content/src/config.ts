import { Experience, GradeGroup, Locale, UnlockRule } from "@gullak/types";
import { z } from "zod";
import localesJson from "../config/locales.json";
import startingCapitalJson from "../config/starting-capital.json";
import topicLadderJson from "../config/topic-ladder.json";

export const StartingCapitalConfig = z.object({
  defaultInr: z.number().int().positive(),
  rows: z.array(z.object({ gradeGroup: GradeGroup, experience: Experience, inr: z.number().int().positive() })),
});

export const TopicLadderConfig = z.object({
  ladder: z.array(UnlockRule).min(1),
  staySafe: z.array(UnlockRule),
});

export const LocalesConfig = z
  .object({
    defaultLocale: Locale,
    locales: z.array(z.object({ code: Locale, name: z.string().min(1), nativeName: z.string().min(1) })).min(1),
  })
  .refine((c) => c.locales.some((l) => l.code === c.defaultLocale), {
    message: "defaultLocale must be one of locales",
  });

export const startingCapital = StartingCapitalConfig.parse(startingCapitalJson);
export const topicLadder = TopicLadderConfig.parse(topicLadderJson);
export const locales = LocalesConfig.parse(localesJson);

/** Every unlock rule, ladder first, then the always-open stay-safe track. */
export const allUnlockRules: readonly UnlockRule[] = [...topicLadder.ladder, ...topicLadder.staySafe];
