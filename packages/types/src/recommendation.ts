import { z } from "zod";
import { GradeGroup, Slug } from "./common";
import { UnlockRule } from "./unlock";

const Probability = z.number().min(0).max(1);
const RecommendationTopic = UnlockRule.extend({
  /** Canonical concepts from TopicMeta, in authored order. */
  conceptIds: z.array(Slug).min(1),
}).strict();

/** Ranking input only. The caller supplies existing mastery, never synthetic fitted parameters. */
export const RecommendationRequest = z
  .object({
    gradeGroup: GradeGroup,
    /** Prerequisite graph order is the deterministic tie-breaker. */
    topics: z.array(RecommendationTopic),
    /** Best quiz score by topic; absence means not passed. */
    progress: z.record(Slug, Probability),
    /** Complete topic-scoped concept probabilities. No implicit prior resets. */
    mastery: z.record(Slug, z.record(Slug, Probability)),
  })
  .strict()
  .superRefine(({ topics, progress, mastery }, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    const byId = new Map(topics.map((topic) => [topic.topicId, topic]));
    if (byId.size !== topics.length) fail("topic ids must be unique");
    for (const topic of topics) {
      if (new Set(topic.conceptIds).size !== topic.conceptIds.length) fail("concept ids must be unique per topic");
      if (new Set(topic.requiresTopicIds).size !== topic.requiresTopicIds.length)
        fail("prerequisite ids must be unique");
      for (const prerequisiteId of topic.requiresTopicIds) {
        const prerequisite = byId.get(prerequisiteId);
        if (!prerequisite) fail("unknown prerequisite topic");
        else if (topic.gradeGroups.some((grade) => !prerequisite.gradeGroups.includes(grade)))
          fail("prerequisites must cover the topic's grade groups");
      }
      const values = mastery[topic.topicId];
      if (!values || topic.conceptIds.some((id) => values[id] === undefined)) fail("missing concept mastery");
      if (values && Object.keys(values).some((id) => !topic.conceptIds.includes(id))) fail("unknown mastery concept");
    }
    if (Object.keys(progress).some((id) => !byId.has(id))) fail("unknown progress topic");
    if (Object.keys(mastery).some((id) => !byId.has(id))) fail("unknown mastery topic");

    // Reject cycles even if malformed progress happens to mark every topic passed.
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      for (const prerequisite of byId.get(id)?.requiresTopicIds ?? []) if (visit(prerequisite)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    if (topics.some((topic) => visit(topic.topicId))) fail("prerequisite cycle");
  });
export type RecommendationRequest = z.infer<typeof RecommendationRequest>;

/** Reason codes are internal metadata; consuming UI must translate them. */
export const NextRecommendation = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("topic"),
        topicId: Slug,
        reason: z.enum(["foundation-topic", "prerequisite-readiness"]),
      })
      .strict(),
    z
      .object({
        kind: z.literal("review"),
        topicId: Slug,
        conceptId: Slug,
        reason: z.enum(["weak-concept", "all-open-topics-passed"]),
      })
      .strict(),
  ])
  .nullable();
export type NextRecommendation = z.infer<typeof NextRecommendation>;
