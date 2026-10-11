import { getLocale } from "next-intl/server";
import { InstrumentTrade } from "@/components/invest/instrument-trade";
import { CATEGORY_IDS } from "@/lib/category-search";
import { loadTopicSummaries } from "@/lib/topic-summaries";

export default async function InstrumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ side?: string; category?: string }>;
}) {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  const { side, category } = await searchParams;
  // Lesson titles in the learner's language, for the unlock and "learn about this" links.
  const topicTitles = Object.fromEntries((await loadTopicSummaries(await getLocale())).map((t) => [t.id, t.title]));
  return (
    <InstrumentTrade
      key={symbol}
      symbol={symbol}
      initialSide={side === "sell" ? "sell" : "buy"}
      category={category && CATEGORY_IDS.has(category) ? category : undefined}
      topicTitles={topicTitles}
    />
  );
}
