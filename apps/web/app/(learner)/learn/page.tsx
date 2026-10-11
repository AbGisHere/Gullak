import { getLocale } from "next-intl/server";
import { LearnMap } from "@/components/learn-map";
import { loadTopicSummaries } from "@/lib/topic-summaries";

export default async function LearnPage() {
  return <LearnMap topics={await loadTopicSummaries(await getLocale())} />;
}
