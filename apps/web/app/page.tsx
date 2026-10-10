import { startingCapital } from "@gullak/content";
import { startingCash } from "@gullak/engine";
import { Button } from "@gullak/ui/components/button";
import { PlayMoneyBadge } from "@gullak/ui/components/play-money-badge";
import { formatInr } from "@gullak/ui/lib/format";
import { getTranslations } from "next-intl/server";

// Skeleton page: proves the packages are wired end to end (content → engine → ui → i18n).
export default async function Home() {
  const t = await getTranslations("app");
  const cash = startingCash(startingCapital, "college", "none");

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-8 px-4 py-10 md:px-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{t("name")}</h1>
        <PlayMoneyBadge label={t("playMoney")} />
      </header>
      <p className="max-w-xl text-lg text-muted-foreground md:text-xl">{t("tagline")}</p>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">{t("startingCash")}</p>
          <p className="mt-1 font-mono text-3xl tabular-nums" data-testid="starting-cash">
            {formatInr(cash)}
          </p>
        </div>
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{t("playMoneyNote")}</p>
      </section>
      <Button size="lg" className="w-full md:w-auto">
        {t("start")}
      </Button>
    </main>
  );
}
