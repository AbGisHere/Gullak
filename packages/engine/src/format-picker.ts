import { FormatPickerRequest, type FormatSelection, LearningFormat } from "@gullak/types";

/**
 * Select a lesson presentation from one topic in an already-resolved locale.
 * Pure and repeatable: authored order breaks ties; no RNG, network or session state.
 * Quizzes remain available separately for assessment, never as the initial lesson.
 */
export function pickLessonVariant(input: unknown): FormatSelection {
  const { gradeGroup, preferredFormats, variants, selectionIndex } = FormatPickerRequest.parse(input);
  const eligible = variants
    .filter((variant) => variant.format !== "quiz")
    .filter((variant) => !variant.audience || variant.audience.includes(gradeGroup));
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
