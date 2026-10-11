import { resolve } from "node:path";
import { allUnlockRules } from "@gullak/content";
import { loadTopic } from "@gullak/content/server";
import type { Topic } from "@gullak/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { TopicPage } from "@/components/topic-page";

const contentRoot = () =>
  process.cwd().endsWith("/apps/web")
    ? resolve(process.cwd(), "../../packages/content/topics")
    : resolve(process.cwd(), "packages/content/topics");

async function loadLocalizedTopic(topicId: string): Promise<Topic | null> {
  const locale = await getLocale();
  for (const candidate of [locale, "en"]) {
    try {
      return await loadTopic(contentRoot(), topicId, candidate);
    } catch {
      /* fall through to the English source */
    }
  }
  return null;
}

type Params = { params: Promise<{ topicId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { topicId } = await params;
  const topic = allUnlockRules.some((item) => item.topicId === topicId) ? await loadLocalizedTopic(topicId) : null;
  if (!topic) return {};
  return {
    title: topic.content.title,
    description: topic.content.summary,
    alternates: { canonical: `/learn/${topicId}` },
  };
}

export default async function TopicRoute({ params }: Params) {
  const { topicId } = await params;
  const rule = allUnlockRules.find((item) => item.topicId === topicId);
  if (!rule) notFound();
  const topic = await loadLocalizedTopic(topicId);
  if (!topic) notFound();
  return <TopicPage topic={topic} rule={rule} />;
}
