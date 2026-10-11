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
