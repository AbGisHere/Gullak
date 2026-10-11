import { resolve } from "node:path";
import { allUnlockRules } from "@gullak/content";
import { loadTopic } from "@gullak/content/server";
import type { TopicSummary } from "@/components/learn-map";

export async function loadTopicSummaries(locale: string): Promise<TopicSummary[]> {
  const root = process.cwd().endsWith("/apps/web")
    ? resolve(process.cwd(), "../../packages/content/topics")
    : resolve(process.cwd(), "packages/content/topics");
  return Promise.all(
    allUnlockRules.map(async (rule): Promise<TopicSummary> => {
      for (const candidate of [locale, "en"]) {
        try {
          const topic = await loadTopic(root, rule.topicId, candidate);
          return {
            id: rule.topicId,
            title: topic.content.title,
            summary: topic.content.summary,
            pillar: rule.pillar,
            concepts: topic.meta.concepts.map((concept) => concept.id),
            playable: topic.content.variants.some((variant) => variant.format === "quiz"),
          };
        } catch {
          /* Keep the graph entry visible while authored content is still in progress. */
        }
      }
      return {
        id: rule.topicId,
        title: rule.topicId.replaceAll("-", " "),
        summary: "",
        pillar: rule.pillar,
        concepts: [],
        playable: false,
      };
    }),
  );
}
