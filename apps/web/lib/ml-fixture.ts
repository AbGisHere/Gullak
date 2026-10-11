import { recommendNext } from "@gullak/engine";
import { MlFixtureInput, MlFixtureResult, RecommendationRequest } from "@gullak/types";
import { z } from "zod";

const FixtureContext = z
  .object({
    mode: MlFixtureInput.shape.mode,
    modelVersion: MlFixtureInput.shape.modelVersion,
    gradeGroup: MlFixtureInput.shape.gradeGroup,
    topics: MlFixtureInput.shape.topics,
    progress: MlFixtureInput.shape.progress,
  })
  .strict();

/** Inactive frontend boundary. Does not display, fetch, store or activate estimates. */
export function consumeMlFixtureResult(input: unknown, expectedContext: unknown): MlFixtureResult {
  const result = MlFixtureResult.parse(input);
  const context = FixtureContext.parse(expectedContext);
  if (result.modelVersion !== context.modelVersion || result.gradeGroup !== context.gradeGroup)
    throw new Error("fixture context mismatch");
  const topics = new Map(context.topics.map((topic) => [topic.topicId, topic]));
  if (Object.keys(result.evidenceCounts).some((id) => !topics.has(id))) throw new Error("unknown evidence-count topic");
  for (const topic of context.topics) {
    if (!Object.hasOwn(result.mastery, topic.topicId)) throw new Error("missing own topic mastery");
    if (topic.conceptIds.some((id) => !Object.hasOwn(result.mastery[topic.topicId]!, id)))
      throw new Error("missing own concept mastery");
    if (!Object.hasOwn(result.evidenceCounts, topic.topicId)) throw new Error("missing evidence-count topic");
    const counts = result.evidenceCounts[topic.topicId]!;
    if (
      topic.conceptIds.some((id) => !Object.hasOwn(counts, id)) ||
      Object.keys(counts).some((id) => !topic.conceptIds.includes(id))
    )
      throw new Error("invalid evidence-count concepts");
  }
  const request = RecommendationRequest.parse({
    gradeGroup: context.gradeGroup,
    topics: context.topics,
    progress: context.progress,
    mastery: result.mastery,
  });
  // Compare canonical parsed objects, not caller property order, and never trust a supplied locked target.
  if (JSON.stringify(result.next) !== JSON.stringify(recommendNext(request)))
    throw new Error("fixture recommendation mismatch");
  return result;
}
