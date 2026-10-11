import { getLocale } from "next-intl/server";
import { InstrumentTrade, type UnlockLessons } from "@/components/invest/instrument-trade";
import { unlockTopicId } from "@/lib/invest";
import { loadTopicSummaries } from "@/lib/topic-summaries";

// The lesson titles that unlock each kind of listing, in the learner's language.
async function unlockLessons(locale: string): Promise<UnlockLessons> {
  const topics = await loadTopicSummaries(locale);
  const lessons: UnlockLessons = {};
  for (const kind of ["stock", "etf", "mutual-fund"] as const) {
    const topicId = unlockTopicId(kind);
    const topic = topics.find((t) => t.id === topicId);
    if (topicId && topic) lessons[kind] = { topicId, title: topic.title };
  }
  return lessons;
}

export default async function InstrumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ side?: string }>;
}) {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  const side = (await searchParams).side === "sell" ? "sell" : "buy";
  return (
    <InstrumentTrade key={symbol} symbol={symbol} initialSide={side} lessons={await unlockLessons(await getLocale())} />
  );
}
