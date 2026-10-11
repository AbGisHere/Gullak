import { CurriculumBriefContext, LessonDraft } from "@gullak/types";
import { validateCurriculumBrief } from "./curriculum-brief";
import { checkModelOutput } from "./guardrails";

/** Offline structural checks and existing advice screening only; never human approval or publication. */
export function validateLessonDraft(input: unknown, briefInput: unknown, contextInput: unknown): LessonDraft {
  const context = CurriculumBriefContext.parse(contextInput);
  const brief = validateCurriculumBrief(briefInput, context);
  return LessonDraft.superRefine((draft, ctx) => {
    const fail = (message: string, path: (string | number)[] = []) => ctx.addIssue({ code: "custom", message, path });
    for (const field of ["topicId", "gradeGroup", "locale"] as const)
      if (draft[field] !== brief[field]) fail(`${field} must match the brief`, [field]);
    const variant = draft.variant;
    if (variant.audience[0] !== draft.gradeGroup)
      fail("variant audience must match the draft grade", ["variant", "audience"]);
    const canonical = new Set(context.meta.concepts.map((concept) => concept.id));
    const declared = new Set(variant.conceptIds);
    if (declared.size !== variant.conceptIds.length)
      fail("variant concept ids must be unique", ["variant", "conceptIds"]);
    if (variant.conceptIds.some((id) => !canonical.has(id)))
      fail("variant concept must belong to the canonical topic", ["variant", "conceptIds"]);
    if (brief.keyIdeas.some((idea) => !declared.has(idea.conceptId)))
      fail("variant must declare every key idea concept", ["variant", "conceptIds"]);

    const texts: string[] = [];
    switch (variant.format) {
      case "transcript":
        texts.push(variant.markdown);
        break;
      case "audio":
        texts.push(variant.ttsText);
        break;
      case "story":
        if (new Set(variant.panels.map((panel) => panel.id)).size !== variant.panels.length)
          fail("story panel ids must be unique", ["variant", "panels"]);
        for (const panel of variant.panels) texts.push(panel.text, panel.speaker ?? "");
        break;
      case "quiz": {
        if (new Set(variant.questions.map((question) => question.id)).size !== variant.questions.length)
          fail("quiz question ids must be unique", ["variant", "questions"]);
        const assessed = new Set(variant.questions.map((question) => question.conceptId));
        if (brief.quizObjectives.some((objective) => !assessed.has(objective.conceptId)))
          fail("quiz objectives must all have an assessed concept", ["variant", "questions"]);
        variant.questions.forEach((question, index) => {
          const path = ["variant", "questions", index];
          if (!declared.has(question.conceptId) || !canonical.has(question.conceptId))
            fail("question concept must be declared and canonical", [...path, "conceptId"]);
          const options = new Set(question.options.map((option) => option.id));
          if (options.size !== question.options.length) fail("quiz option ids must be unique", [...path, "options"]);
          if (!options.has(question.correctOptionId))
            fail("quiz answer key must name an existing option", [...path, "correctOptionId"]);
          texts.push(question.prompt, question.explanation, ...question.options.map((option) => option.text));
        });
        break;
      }
    }
    if (texts.some((value) => !checkModelOutput(value).allowed)) fail("draft contains investment advice", ["variant"]);
  }).parse(input);
}
