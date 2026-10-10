import { Experience, GradeGroup, Locale, UnlockRule } from "@gullak/types";
import { z } from "zod";
import localesJson from "../config/locales.json";
import startingCapitalJson from "../config/starting-capital.json";
import topicGraphJson from "../config/topic-graph.json";

export const StartingCapitalConfig = z.object({
  defaultInr: z.number().int().positive(),
  rows: z.array(z.object({ gradeGroup: GradeGroup, experience: Experience, inr: z.number().int().positive() })),
});

/** Finds one prerequisite cycle (as a path of topic ids), or null if the graph is acyclic. */
export function findPrerequisiteCycle(rules: readonly UnlockRule[]): string[] | null {
  const requires = new Map(rules.map((r) => [r.topicId, r.requiresTopicIds]));
  const state = new Map<string, "visiting" | "done">();
  const path: string[] = [];
  const visit = (id: string): string[] | null => {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "visiting") return [...path.slice(path.indexOf(id)), id];
    state.set(id, "visiting");
    path.push(id);
    for (const next of requires.get(id) ?? []) {
      const cycle = visit(next);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(id, "done");
    return null;
  };
  for (const rule of rules) {
    const cycle = visit(rule.topicId);
    if (cycle) return cycle;
  }
  return null;
}

export const TopicGraphConfig = z.object({ topics: z.array(UnlockRule).min(1) }).superRefine(({ topics }, ctx) => {
  const byId = new Map(topics.map((t) => [t.topicId, t]));
  if (byId.size !== topics.length) ctx.addIssue({ code: "custom", message: "duplicate topicId" });
  for (const topic of topics) {
    for (const req of topic.requiresTopicIds) {
      const prereq = byId.get(req);
      if (!prereq) {
        ctx.addIssue({ code: "custom", message: `${topic.topicId} requires unknown topic ${req}` });
        continue;
      }
      // Otherwise a learner in that grade group could never open the topic.
      for (const grade of topic.gradeGroups) {
        if (!prereq.gradeGroups.includes(grade)) {
          ctx.addIssue({
            code: "custom",
            message: `${topic.topicId} (${grade}) requires ${req}, not taught to ${grade}`,
          });
        }
      }
    }
  }
  const cycle = findPrerequisiteCycle(topics);
  if (cycle) ctx.addIssue({ code: "custom", message: `prerequisite cycle: ${cycle.join(" → ")}` });
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
export const topicGraph = TopicGraphConfig.parse(topicGraphJson);
export const locales = LocalesConfig.parse(localesJson);

/** Every topic's unlock rule, in curriculum order (pillar by pillar). */
export const allUnlockRules: readonly UnlockRule[] = topicGraph.topics;
