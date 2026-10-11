import { getLocale } from "next-intl/server";
import { LearnerApp } from "@/components/learner-app";
import { loadPlacementRounds } from "@/lib/placement-rounds";
import { loadTopicSummaries } from "@/lib/topic-summaries";

export default async function Home() {
  const locale = await getLocale();
  const [topics, placement] = await Promise.all([loadTopicSummaries(locale), loadPlacementRounds(locale)]);
  return <LearnerApp topics={topics} placement={placement} />;
}
