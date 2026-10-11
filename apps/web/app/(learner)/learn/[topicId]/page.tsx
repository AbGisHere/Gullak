import { resolve } from "node:path";
import { allUnlockRules } from "@gullak/content";
import { loadTopic } from "@gullak/content/server";
import type { Topic } from "@gullak/types";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { TopicPage } from "@/components/topic-page";

export default async function TopicRoute({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const rule = allUnlockRules.find((item) => item.topicId === topicId);
  if (!rule) notFound();
  const locale = await getLocale();
  const root = process.cwd().endsWith("/apps/web")
    ? resolve(process.cwd(), "../../packages/content/topics")
    : resolve(process.cwd(), "packages/content/topics");
  let topic: Topic;
  try {
    topic = await loadTopic(root, topicId, locale);
  } catch {
    try {
      topic = await loadTopic(root, topicId, "en");
    } catch {
      notFound();
    }
  }
  return <TopicPage topic={topic} rule={rule} />;
}
