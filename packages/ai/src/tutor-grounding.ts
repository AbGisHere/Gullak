import type { GradeGroup, TopicContent } from "@gullak/types";
import { checkModelOutput } from "./guardrails";

export type TutorText = { variantId: string; field: string; text: string };

/** Internal extraction only; callers must establish editorial approval first. */
export function collectTutorText(content: TopicContent, gradeGroup: GradeGroup): TutorText[] {
  const texts: TutorText[] = [];
  for (const variant of content.variants) {
    if (variant.audience && !variant.audience.includes(gradeGroup)) continue;
    switch (variant.format) {
      case "transcript":
        texts.push({ variantId: variant.id, field: "markdown", text: variant.markdown });
        break;
      case "story":
        texts.push(
          ...variant.panels.map((panel, index) => ({
            variantId: variant.id,
            field: `panels[${index}].text`,
            text: panel.text,
          })),
        );
        break;
      case "audio":
        texts.push({ variantId: variant.id, field: "ttsText", text: variant.ttsText });
        break;
    }
  }
  return texts.filter((source) => checkModelOutput(source.text).allowed);
}

const QUESTION_STOPWORDS = new Set(
  "and are can come could did does explain for from has have how into its let like may please tell that the their them these they this understand was were what when where which who why will with would you your".split(
    " ",
  ),
);

function words(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [])];
}

/** Internal lexical selection only: no semantic-answer claim and no editorial approval. */
export function selectTutorExcerpt<Source extends { text: string }>(
  question: string,
  sources: readonly Source[],
):
  | { status: "selected"; source: Source; matchedTerms: string[] }
  | {
      status: "unavailable";
      reason: "insufficient-relevance" | "out-of-scope" | "no-safe-excerpt";
    } {
  const terms = words(question).filter((word) => !QUESTION_STOPWORDS.has(word));
  if (terms.length < 2) return { status: "unavailable", reason: "insufficient-relevance" };
  let matched = false;
  for (const source of sources) {
    const sourceWords = new Set(words(source.text));
    if (!terms.every((term) => sourceWords.has(term))) continue;
    matched = true;
    // Complete fields retain their caveats. Never cut, rewrite or join them.
    if (source.text.length <= 2000 && checkModelOutput(source.text).allowed) {
      return { status: "selected", source, matchedTerms: terms };
    }
  }
  return { status: "unavailable", reason: matched ? "no-safe-excerpt" : "out-of-scope" };
}
