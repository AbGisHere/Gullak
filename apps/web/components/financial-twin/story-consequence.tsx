"use client";

import type { ResolvedOutcome } from "@gullak/ui/components/practice-simulation";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";

export interface StoryConsequenceProps {
  outcome: ResolvedOutcome;
  labels: { heading: string; changed: string; tradeoff: string; unknown: string };
}

export function StoryConsequence({ outcome, labels }: StoryConsequenceProps) {
  const result = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!outcome.decisionId) return;
    result.current?.focus({ preventScroll: true });
    result.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [outcome.decisionId]);
  return (
    <section
      ref={result}
      tabIndex={-1}
      className="min-w-0 scroll-mt-24 space-y-6 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      aria-labelledby="twin-consequence-heading"
      role="status"
    >
      <div className="space-y-3 rounded-2xl bg-brand-lime p-5 text-brand-ink sm:p-8">
        <CheckCircle2 className="size-8" aria-hidden="true" />
        <h3 id="twin-consequence-heading" className="text-2xl font-bold sm:text-3xl">
          {labels.heading}
        </h3>
        <p className="max-w-prose text-lg leading-relaxed">{outcome.narrativeConsequence}</p>
      </div>
      <dl className="space-y-6">
        <div className="space-y-2">
          <dt className="text-lg font-bold">{labels.changed}</dt>
          <dd className="text-base leading-relaxed tabular-nums">{outcome.stateDelta}</dd>
        </div>
        <div className="space-y-2">
          <dt className="text-lg font-bold">{labels.tradeoff}</dt>
          <dd className="max-w-prose text-base leading-relaxed">{outcome.tradeoff}</dd>
        </div>
        {outcome.whatWasUnknown && (
          <div className="space-y-2">
            <dt className="text-lg font-bold">{labels.unknown}</dt>
            <dd className="max-w-prose text-base leading-relaxed">{outcome.whatWasUnknown}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
