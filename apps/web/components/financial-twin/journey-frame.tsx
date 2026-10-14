"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export interface JourneyFrameProps {
  /** Stable scene ID from the parent's existing seven-stage flow. */
  stageId: string;
  stageIndex: number;
  stageCount: number;
  stageLabel: string;
  /** Fully formatted, localized progress, e.g. an ICU message from next-intl. */
  progressLabel: string;
  playMoneyLabel: string;
  backLabel: string;
  nextLabel?: string;
  nextDisabledReason?: string;
  onBack?: () => void;
  onNext?: () => void;
  children?: ReactNode;
}

/** Controlled navigation: the parent still owns decisions, evidence and rewind. */
export function JourneyFrame({
  stageId,
  stageIndex,
  stageCount,
  stageLabel,
  progressLabel,
  backLabel,
  nextLabel,
  nextDisabledReason,
  onBack,
  onNext,
  children,
}: JourneyFrameProps) {
  const scene = useRef<HTMLElement>(null);
  const previousStage = useRef(stageId);

  useEffect(() => {
    if (previousStage.current !== stageId) {
      scene.current?.focus({ preventScroll: true });
      scene.current?.scrollIntoView({ block: "start", behavior: "instant" });
      previousStage.current = stageId;
    }
  }, [stageId]);

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-5xl space-y-8 px-4 pt-5 pb-8 sm:px-6 sm:pt-6"
      data-testid="financial-twin-journey"
    >
      <header className="space-y-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold" role="status">
            {progressLabel}
          </p>
        </div>
        <progress
          className="block h-1.5 w-full overflow-hidden rounded-full bg-muted accent-foreground [&::-moz-progress-bar]:bg-foreground [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-foreground"
          value={stageIndex + 1}
          max={stageCount}
          aria-label={progressLabel}
        />
      </header>
      <section
        ref={scene}
        tabIndex={-1}
        aria-label={stageLabel}
        data-stage={stageId}
        className="min-w-0 scroll-mt-24 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {children}
      </section>
      <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-5 shrink-0" aria-hidden="true" />
            {backLabel}
          </button>
        )}
        {onNext && nextLabel && (
          <button
            type="button"
            onClick={onNext}
            disabled={Boolean(nextDisabledReason)}
            aria-describedby={nextDisabledReason ? "financial-twin-next-reason" : undefined}
            className="ml-auto inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextLabel}
            <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
          </button>
        )}
        {nextDisabledReason && (
          <p id="financial-twin-next-reason" className="basis-full text-base text-muted-foreground">
            {nextDisabledReason}
          </p>
        )}
      </footer>
    </div>
  );
}
