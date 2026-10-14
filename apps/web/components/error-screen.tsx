"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Gullu } from "./game/gullu";
import { RecoveryBackButton } from "./recovery-back-button";

/**
 * Plain-language recovery screen for crashes and missing pages: Gullu, what happened,
 * that saved progress is safe, and a way back. Mentions being offline when it applies,
 * since many learners use Gullak on phones with little or no data.
 */
export function ErrorScreen({
  kind,
  onRetry,
  fullPage = false,
}: {
  kind: "error" | "notFound";
  onRetry?: () => void;
  fullPage?: boolean;
}) {
  const t = useTranslations("safety");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const copy = kind === "error" ? "error" : "notFound";
  const Wrapper = fullPage ? "main" : "section";
  return (
    <Wrapper
      className={`mx-auto flex w-full max-w-xl flex-col items-start gap-6 px-4 py-12 sm:py-16 ${fullPage ? "min-h-svh justify-center" : ""}`}
    >
      <Gullu state={kind === "error" ? "concerned" : "curious"} size={104} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {t(`${copy}.title`)}
        </h1>
        <p className="max-w-prose text-lg leading-7 text-muted-foreground">{t(`${copy}.description`)}</p>
        {offline ? (
          <p role="status" className="rounded-xl bg-muted px-4 py-3 text-base">
            {t("error.offline")}
          </p>
        ) : null}
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <RecoveryBackButton />
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-12 rounded-xl border-2 border-foreground bg-foreground px-5 font-bold text-background hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("error.retry")}
          </button>
        ) : null}
        <Link
          href="/"
          className={`inline-flex min-h-12 items-center justify-center rounded-xl border-2 px-5 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${onRetry ? "border-border hover:bg-muted" : "border-foreground bg-foreground text-background hover:bg-foreground/90"}`}
        >
          {t(`${copy}.home`)}
        </Link>
      </div>
    </Wrapper>
  );
}
