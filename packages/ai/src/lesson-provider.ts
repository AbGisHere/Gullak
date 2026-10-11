import { LessonDraft } from "@gullak/types";
import { generateText, type LanguageModel, Output } from "ai";
import type { LessonDraftGenerator } from "./lesson-runner";

/** Explicitly invoked provider bridge. Use through generateLessonDraft for semantic validation. */
export function createLessonDraftGenerator(model: Exclude<LanguageModel, string>): LessonDraftGenerator {
  return async (request) => {
    const result = await generateText({
      model,
      system: request.system,
      prompt: request.prompt,
      output: Output.object({ schema: LessonDraft }),
      // The existing runner promises one attempt, not SDK-default hidden retries.
      maxRetries: 0,
    });
    return result.output;
  };
}
