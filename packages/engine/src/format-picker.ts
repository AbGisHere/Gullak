import { FormatPickerRequest, type FormatSelection, type GradeGroup, LearningFormat } from "@gullak/types";

/**
 * The variants a class group should see. A version written for this group (its `audience` names it)
 * replaces general versions of the same format, so a quiz written for Class 6–7 is the one a Class 6–7
 * learner takes. Authored order is kept.
 */
export function variantsForGrade<V extends { format: string; audience?: readonly GradeGroup[] | undefined }>(
  variants: readonly V[],
  gradeGroup: GradeGroup,
): V[] {
  const eligible = variants.filter((v) => !v.audience || v.audience.includes(gradeGroup));
  const tailored = new Set(eligible.filter((v) => v.audience !== undefined).map((v) => v.format));
  return eligible.filter((v) => v.audience !== undefined || !tailored.has(v.format));
}

/**
 * Select a lesson presentation from one topic in an already-resolved locale.
 * Pure and repeatable: authored order breaks ties; no RNG, network or session state.
 * Quizzes remain available separately for assessment, never as the initial lesson.
 */
export function pickLessonVariant(input: unknown): FormatSelection {
  const { gradeGroup, preferredFormats, variants, selectionIndex } = FormatPickerRequest.parse(input);
  const eligible = variantsForGrade(variants, gradeGroup).filter((variant) => variant.format !== "quiz");
  const first = eligible[0];
  if (!first) return { status: "unavailable", reason: "no-eligible-variant" };

  // Onboarding's default and Skip store all formats, not an explicit preference for video.
  const mixed = preferredFormats.length === 0 || LearningFormat.options.every((f) => preferredFormats.includes(f));
  if (mixed) {
    const formats = [...new Set(eligible.map((variant) => variant.format))];
    const format = formats[selectionIndex % formats.length];
    const variant = eligible.find((candidate) => candidate.format === format)!;
    return { status: "selected", variantId: variant.id, format: variant.format, reason: "mixed-format" };
  }
  for (const format of preferredFormats) {
    const variant = eligible.find((candidate) => candidate.format === format);
    if (variant)
      return { status: "selected", variantId: variant.id, format: variant.format, reason: "preferred-format" };
  }
  return { status: "selected", variantId: first.id, format: first.format, reason: "fallback-format" };
}
