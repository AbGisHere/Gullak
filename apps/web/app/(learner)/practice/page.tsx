import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PracticePage } from "@/components/practice-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("learner");
  return { title: t("practice"), alternates: { canonical: "/practice" } };
}

export default function PracticeRoute() {
  return <PracticePage />;
}
