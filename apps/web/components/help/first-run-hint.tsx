"use client";

import { cn } from "@gullak/ui/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

export const MAP_HINT_STORAGE_KEY = "gullak-map-hint-seen";

/** One short, skippable orientation note on the learner's first visit to a map. Remembered per device. */
export function FirstRunHint({ className }: { className?: string }) {
  const t = useTranslations("help");
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(MAP_HINT_STORAGE_KEY) !== "1");
    } catch {
      // Storage blocked: still orient the learner; dismissing hides it for this visit.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(MAP_HINT_STORAGE_KEY, "1");
    } catch {
      // Ignore: the hint simply returns next visit.
    }
  }

  if (!visible) return null;
  return (
    <aside
      aria-labelledby={titleId}
      className={cn("w-full rounded-2xl border-2 border-brand-ink bg-brand-yellow p-4 text-brand-ink", className)}
    >
      <h2 id={titleId} className="font-display text-base font-black leading-tight">
        {t("hint.title")}
      </h2>
      <p className="mt-1 max-w-prose text-sm font-medium leading-relaxed">{t("hint.body")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-xl bg-brand-ink px-4 text-sm font-bold text-brand-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          {t("hint.dismiss")}
        </button>
        <Link
          href="/help"
          className="inline-flex min-h-11 items-center text-sm font-bold underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          {t("link")}
        </Link>
      </div>
    </aside>
  );
}
