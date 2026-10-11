import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("learner");
  return { title: t("portfolio"), alternates: { canonical: "/portfolio" } };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
