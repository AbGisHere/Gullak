"use client";

import { locales } from "@gullak/content";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { Gullu } from "@/components/game/gullu";
import { PrimaryNav } from "@/components/primary-nav";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { readProfile } from "@/lib/learner-state";
import { useLearnerProgress } from "@/lib/use-progress-summary";

/**
 * The one page frame for Home and every routed learner page: header, desktop sidebar,
 * content column and phone tab bar sit in the same place on every tab, so nothing jumps.
 * The header ends with the learner's XP; Home swaps in `headerEnd`, its XP button with the learner menu.
 */
export function ShellFrame({
  children,
  headerEnd,
  onHome,
}: {
  children: ReactNode;
  headerEnd?: ReactNode;
  onHome?: () => void;
}) {
  const t = useTranslations("learner");
  const tHelp = useTranslations("help");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  function changeLocale(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b bg-background px-4 md:px-6 lg:pl-70">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={pathname === "/" ? onHome : undefined}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight lg:hidden"
          >
            <Gullu state="wave" size={32} />
            <span className="max-[380px]:sr-only">Gullak</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/help"
            aria-label={tHelp("link")}
            aria-current={pathname === "/help" ? "page" : undefined}
            className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:text-foreground"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </Link>
          <label className="sr-only" htmlFor="shell-language">
            {t("language")}
          </label>
          <select
            id="shell-language"
            value={locale}
            onChange={(event) => changeLocale(event.target.value)}
            className="min-h-11 rounded-lg border bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {locales.locales.map((item) => (
              <option key={item.code} value={item.code}>
                {item.nativeName}
              </option>
            ))}
          </select>
          {headerEnd ?? <XpLink />}
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-background px-4 py-5 pt-6 lg:block">
        <Link
          href="/"
          onClick={pathname === "/" ? onHome : undefined}
          className="mb-10 flex items-center gap-2 px-3 text-xl font-extrabold tracking-tight"
        >
          <Gullu state="wave" size={36} />
          Gullak
        </Link>
        <PrimaryNav variant="sidebar" onHome={onHome} />
      </aside>
      <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:ml-60 lg:w-[calc(100%-15rem)] lg:px-10 lg:pb-10">
        {children}
      </main>
      <PrimaryNav variant="bar" onHome={onHome} />
    </div>
  );
}

/** XP on every routed page, linking Home, where the Living Gullak shows progress. */
function XpLink() {
  const t = useTranslations("learner");
  const tProgress = useTranslations("progressData");
  const [grade, setGrade] = useState<Parameters<typeof useLearnerProgress>[0]>("grade-6-7");
  useEffect(() => {
    const profile = readProfile();
    if (profile) setGrade(profile.gradeGroup);
  }, []);
  const { xp } = useLearnerProgress(grade);
  return (
    <Link
      href="/"
      aria-label={t("xpLink", { xp })}
      className="flex min-h-11 items-center rounded-xl border bg-card px-3 text-sm font-semibold tabular-nums hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {tProgress("xpShort", { xp })}
    </Link>
  );
}
