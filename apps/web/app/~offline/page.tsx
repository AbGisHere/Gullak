import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RecoveryBackButton } from "@/components/recovery-back-button";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Offline() {
  const t = await getTranslations("app");
  const tNav = await getTranslations("nav");
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-6 px-4 py-12">
      <p className="text-lg">{t("offline")}</p>
      <div className="flex flex-wrap gap-3">
        <RecoveryBackButton />
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-xl bg-foreground px-5 font-bold text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {tNav("home")}
        </Link>
      </div>
    </main>
  );
}
