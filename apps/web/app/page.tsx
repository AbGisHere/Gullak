import { getLocale } from "next-intl/server";
import { LearnerApp } from "@/components/learner-app";
import { loadTopicSummaries } from "@/lib/topic-summaries";

export default async function Home() {
  return <LearnerApp topics={await loadTopicSummaries(await getLocale())} />;
}
