import { CurriculumBrief, CurriculumBriefContext } from "@gullak/types";
import { z } from "zod";

const ContextualBrief = z
  .object({ brief: CurriculumBrief, context: CurriculumBriefContext })
  .superRefine(({ brief, context }, ctx) => {
    const { meta, rule, supportedLocales } = context;
    if (brief.topicId !== meta.id || brief.topicId !== rule.topicId) {
      ctx.addIssue({
        code: "custom",
        message: "brief, metadata and graph topic ids must agree",
        path: ["brief", "topicId"],
      });
    }
    if (meta.pillar !== rule.pillar) {
      ctx.addIssue({
        code: "custom",
        message: "metadata and graph pillars must agree",
        path: ["context", "rule", "pillar"],
      });
    }
    if (!rule.gradeGroups.includes(brief.gradeGroup)) {
      ctx.addIssue({
        code: "custom",
        message: "topic is not taught to this grade group",
        path: ["brief", "gradeGroup"],
      });
    }
    if (!supportedLocales.includes(brief.locale)) {
      ctx.addIssue({ code: "custom", message: "brief locale is not supported", path: ["brief", "locale"] });
    }
    const concepts = new Set(meta.concepts.map((concept) => concept.id));
    for (const field of ["keyIdeas", "quizObjectives"] as const) {
      brief[field].forEach((entry, index) => {
        if (!concepts.has(entry.conceptId)) {
          ctx.addIssue({
            code: "custom",
            message: "concept does not belong to canonical topic metadata",
            path: ["brief", field, index, "conceptId"],
          });
        }
      });
    }
  });

/**
 * Offline structural/context validation only. Success is not content approval,
 * factual verification, privacy scanning or permission to generate/publish.
 * Caller supplies canonical content; this function has no I/O or provider calls.
 */
export function validateCurriculumBrief(input: unknown, context: unknown): CurriculumBrief {
  return ContextualBrief.parse({ brief: input, context }).brief;
}
