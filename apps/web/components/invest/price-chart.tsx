"use client";

import type { ChartRange, InstrumentChart } from "@gullak/types";
import { useLocale, useTranslations } from "next-intl";
import { type PointerEvent, useEffect, useId, useState } from "react";
import { fetchChart } from "@/lib/invest";

const RANGES: ChartRange[] = ["1d", "1w", "1m", "1y"];
const WIDTH = 600;
const HEIGHT = 200;

type ChartState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; chart: InstrumentChart };

/**
 * A listing's price over one day, week, month or 52 weeks, from Yahoo Finance.
 * Hover or drag across it to read the price at any point; colour shows up or down over the period.
 */
export function PriceChart({ symbol, format }: { symbol: string; format: (value: number) => string }) {
  const t = useTranslations("invest.chart");
  const locale = useLocale();
  const titleId = useId();
  const [range, setRange] = useState<ChartRange>("1d");
  const [state, setState] = useState<ChartState>({ status: "loading" });
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    setActive(null);
    fetchChart(symbol, range, controller.signal).then((chart) => {
      if (controller.signal.aborted) return;
      setState(chart && chart.points.length >= 2 ? { status: "ready", chart } : { status: "unavailable" });
    });
    return () => controller.abort();
  }, [symbol, range]);

  const points = state.status === "ready" ? state.chart.points : [];
  const prices = points.map((p) => p.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const span = high - low || 1;
  const x = (i: number) => (i / Math.max(points.length - 1, 1)) * WIDTH;
  const y = (price: number) => HEIGHT - 8 - ((price - low) / span) * (HEIGHT - 16);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join("");
  const first = points[0]?.price ?? 0;
  const last = points.at(-1)?.price ?? 0;
  // A day compares with yesterday's close; longer periods with their first price.
  const base = range === "1d" && state.status === "ready" ? (state.chart.previousClose ?? first) : first;
  const change = base ? (last - base) / base : 0;
  const tone = change > 0 ? "text-success-ink" : change < 0 ? "text-destructive" : "text-foreground";
  const shown = active === null ? points.at(-1) : points[active];

  const time = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "Asia/Kolkata",
      ...(range === "1d"
        ? { hour: "numeric", minute: "2-digit" }
        : range === "1w"
          ? { weekday: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
          : { day: "numeric", month: "short", year: range === "1y" ? "numeric" : undefined }),
    }).format(new Date(iso));
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(change);

  function track(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    setActive(Math.round(ratio * (points.length - 1)));
  }

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-xl font-bold">
          {t("title")}
        </h2>
        <fieldset className="inline-flex rounded-xl border border-border p-1">
          <legend className="sr-only">{t("rangeLabel")}</legend>
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={range === option}
              aria-label={t(`rangeName.${option}`)}
              onClick={() => setRange(option)}
              className="min-h-11 min-w-12 rounded-lg px-3 text-sm font-bold text-muted-foreground hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t(`range.${option}`)}
            </button>
          ))}
        </fieldset>
      </div>

      {state.status === "ready" && shown ? (
        <>
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums" aria-live="polite">
            <span className="text-lg font-bold">{format(shown.price)}</span>
            <span className="text-sm text-muted-foreground">{time(shown.t)}</span>
            {active === null ? (
              <span className={`text-sm font-semibold ${tone}`}>{t(`change.${range}`, { percent })}</span>
            ) : null}
          </p>
          <div className={`relative ${tone}`}>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={t("summary", {
                range: t(`rangeName.${range}`),
                low: format(low),
                high: format(high),
                percent,
              })}
              className="block h-48 w-full touch-pan-y sm:h-56"
              onPointerMove={track}
              onPointerDown={track}
              onPointerLeave={() => setActive(null)}
            >
              <path d={`${line}L${WIDTH},${HEIGHT}L0,${HEIGHT}Z`} fill="currentColor" opacity={0.08} />
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
              {active !== null && points[active] ? (
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={0}
                  y2={HEIGHT}
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </svg>
            {shown ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-current"
                style={{
                  left: `${(x(active ?? points.length - 1) / WIDTH) * 100}%`,
                  top: `${(y(shown.price) / HEIGHT) * 100}%`,
                }}
              />
            ) : null}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
            <span>{time(points[0]?.t ?? shown.t)}</span>
            <span>{t("lowHigh", { low: format(low), high: format(high) })}</span>
          </div>
        </>
      ) : (
        <div className="grid h-48 place-items-center rounded-xl bg-muted text-muted-foreground sm:h-56">
          <p role="status">{state.status === "loading" ? t("loading") : t("unavailable")}</p>
        </div>
      )}
    </section>
  );
}
