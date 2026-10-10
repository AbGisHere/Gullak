import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Locale, Slug, Topic, TopicContent, TopicMeta } from "@gullak/types";

/** Server-side file loader. Identifiers are validated before constructing any path. */
export async function loadTopic(directory: string, topicId: string, locale: string): Promise<Topic> {
  return (await loadVersionedTopic(directory, topicId, locale)).topic;
}

/** Hash the same exact UTF-8 bytes that are validated and used for grading. */
export async function loadVersionedTopic(directory: string, topicId: string, locale: string) {
  Slug.parse(topicId);
  Locale.parse(locale);
  const [meta, content] = await Promise.all([
    readFile(resolve(directory, topicId, "topic.json"), "utf8"),
    readFile(resolve(directory, topicId, `${locale}.json`), "utf8"),
  ]);
  const topic = Topic.parse({
    meta: TopicMeta.parse(JSON.parse(meta)),
    content: TopicContent.parse(JSON.parse(content)),
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
  return { topic, contentVersion: createHash("sha256").update(content, "utf8").digest("hex") };
}
