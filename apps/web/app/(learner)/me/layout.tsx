import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("learner");
  return { title: t("me"), alternates: { canonical: "/me" } };
}

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
