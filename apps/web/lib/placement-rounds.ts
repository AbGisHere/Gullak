import { resolve } from "node:path";
import { loadTopic } from "@gullak/content/server";
import { variantsForGrade } from "@gullak/engine";
import { GradeGroup } from "@gullak/types";
import { type PlacementRound, placementTopicIds } from "./placement";

/** Server-side: every class group's placement rounds, each using the quiz written for that group. */
export async function loadPlacementRounds(locale: string): Promise<Record<GradeGroup, PlacementRound[]>> {
  const root = process.cwd().endsWith("/apps/web")
    ? resolve(process.cwd(), "../../packages/content/topics")
    : resolve(process.cwd(), "packages/content/topics");
  const entries = await Promise.all(
    GradeGroup.options.map(async (grade) => {
      const rounds: PlacementRound[] = [];
      for (const topicId of placementTopicIds(grade)) {
        let round: PlacementRound | null = null;
        for (const candidate of [locale, "en"]) {
          try {
            const topic = await loadTopic(root, topicId, candidate);
            const quiz = variantsForGrade(topic.content.variants, grade).find((v) => v.format === "quiz");
            if (quiz?.format === "quiz") round = { topicId, title: topic.content.title, quiz };
            break;
          } catch {
            /* fall back to English */
          }
        }
        // A placement never skips a lesson: it stops where content is missing.
        if (!round) break;
        rounds.push(round);
      }
      return [grade, rounds] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<GradeGroup, PlacementRound[]>;
}
