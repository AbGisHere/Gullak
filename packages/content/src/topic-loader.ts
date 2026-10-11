import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { GradeGroup, Locale, Slug, Topic, TopicContent, TopicMeta, TopicVariant } from "@gullak/types";
import { z } from "zod";

/**
 * Optional `<locale>.stages.json` beside a topic: extra versions written for particular class groups
 * (every one names its `audience`). It sits apart from `<locale>.json` so that file's exact, already
 * pinned bytes stay unchanged.
 */
export const TopicStages = z
  .object({
    topicId: Slug,
    locale: Locale,
    variants: z.array(TopicVariant.and(z.object({ audience: z.array(GradeGroup).min(1) }))).min(1),
  })
  .strict();

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Server-side file loader. Identifiers are validated before constructing any path. */
export async function loadTopic(directory: string, topicId: string, locale: string): Promise<Topic> {
  return (await loadVersionedTopic(directory, topicId, locale)).topic;
}

/** Hash the same exact UTF-8 bytes that are validated and used for grading. */
export async function loadVersionedTopic(directory: string, topicId: string, locale: string) {
  Slug.parse(topicId);
  Locale.parse(locale);
  const [meta, content, stagesText] = await Promise.all([
    readFile(resolve(directory, topicId, "topic.json"), "utf8"),
    readFile(resolve(directory, topicId, `${locale}.json`), "utf8"),
    readOptional(resolve(directory, topicId, `${locale}.stages.json`)),
  ]);
  const base = TopicContent.parse(JSON.parse(content));
  const stages = stagesText === null ? null : TopicStages.parse(JSON.parse(stagesText));
  if (stages && (stages.topicId !== topicId || stages.locale !== locale)) throw new Error("topic identity mismatch");
  const topic = Topic.parse({
    meta: TopicMeta.parse(JSON.parse(meta)),
    content: stages ? { ...base, variants: [...base.variants, ...stages.variants] } : base,
  });
  if (topic.meta.id !== topicId || topic.content.topicId !== topicId || topic.content.locale !== locale) {
    throw new Error("topic identity mismatch");
  }
  const concepts = new Set(topic.meta.concepts.map((c) => c.id));
  for (const quiz of topic.content.variants.filter((v) => v.format === "quiz")) {
    if (new Set(quiz.questions.map((q) => q.id)).size !== quiz.questions.length) throw new Error("duplicate question");
    for (const q of quiz.questions) {
      if (
        !concepts.has(q.conceptId) ||
        !q.options.some((o) => o.id === q.correctOptionId) ||
        new Set(q.options.map((o) => o.id)).size !== q.options.length
      )
        throw new Error("invalid answer key");
    }
  }
  if (new Set(topic.content.variants.map((v) => v.id)).size !== topic.content.variants.length)
    throw new Error("duplicate variant");
  // The version covers every byte that can be shown or graded: the base file, plus the stages file if any.
  const hash = createHash("sha256").update(content, "utf8");
  if (stagesText !== null) hash.update("\u0000", "utf8").update(stagesText, "utf8");
  return { topic, contentVersion: hash.digest("hex") };
}
