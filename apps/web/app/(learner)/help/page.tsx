import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HELP_TERMS } from "@/lib/help-terms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("help");
  return { title: t("page.title"), description: t("page.intro"), alternates: { canonical: "/help" } };
}

const LOOP = [
  ["loopLearn", "loopLearnBody"],
  ["loopCheck", "loopCheckBody"],
  ["loopUnlock", "loopUnlockBody"],
] as const;

const SECTIONS = [
  ["moneyTitle", "moneyBody"],
  ["gulluTitle", "gulluBody"],
  ["languageTitle", "languageBody"],
  ["offlineTitle", "offlineBody"],
] as const;

export default async function HelpPage() {
  const t = await getTranslations("help");
  const tLearner = await getTranslations("learner");

  return (
    <article className="max-w-2xl space-y-12 pb-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{t("page.title")}</h1>
        <p className="max-w-prose text-lg leading-7 text-muted-foreground">{t("page.intro")}</p>
      </header>

      <section aria-labelledby="help-loop" className="space-y-5">
        <h2 id="help-loop" className="text-2xl font-extrabold tracking-tight">
          {t("page.loopTitle")}
        </h2>
        <ol className="space-y-4">
          {LOOP.map(([title, body], index) => (
            <li key={title} className="flex gap-4">
              <span
                aria-hidden="true"
                className={`grid size-9 shrink-0 place-items-center rounded-full border-2 border-foreground font-extrabold tabular-nums ${index === LOOP.length - 1 ? "bg-brand-lime text-brand-ink" : ""}`}
              >
                {index + 1}
              </span>
              <div className="space-y-1 pt-1">
                <h3 className="font-bold">{t(`page.${title}`)}</h3>
                <p className="max-w-prose leading-7 text-muted-foreground">{t(`page.${body}`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {SECTIONS.map(([title, body]) => (
        <section key={title} aria-labelledby={`help-${title}`} className="space-y-2">
          <h2 id={`help-${title}`} className="text-2xl font-extrabold tracking-tight">
            {t(`page.${title}`)}
          </h2>
          <p className="max-w-prose leading-7">{t(`page.${body}`)}</p>
        </section>
      ))}

      <section aria-labelledby="help-privacy" className="space-y-2">
        <h2 id="help-privacy" className="text-2xl font-extrabold tracking-tight">
          {t("page.privacyTitle")}
        </h2>
        <p className="max-w-prose leading-7">{t("page.privacyBody", { reset: tLearner("resetProfile") })}</p>
      </section>

      <section aria-labelledby="help-glossary" className="space-y-4">
        <div className="space-y-2">
          <h2 id="help-glossary" className="text-2xl font-extrabold tracking-tight">
            {t("page.glossaryTitle")}
          </h2>
          <p className="max-w-prose text-muted-foreground">{t("page.glossaryIntro")}</p>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          {HELP_TERMS.map((term) => (
            <div key={term} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-bold">{t(`terms.${term}.name`)}</dt>
              <dd className="max-w-prose leading-7 text-muted-foreground">{t(`terms.${term}.definition`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Link
        href="/learn"
        className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-foreground px-5 font-bold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t("page.backToMap")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
