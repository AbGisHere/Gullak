import { allUnlockRules } from "@gullak/content";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/practice`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/portfolio`, changeFrequency: "monthly", priority: 0.6 },
  ];
  const topics = allUnlockRules.map((rule) => ({
    url: `${SITE_URL}/learn/${rule.topicId}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...pages, ...topics];
}
