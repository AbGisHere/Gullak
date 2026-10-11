"use client";

import type { PracticeSimulationProps } from "@gullak/ui/components/practice-simulation";

export interface StoryReflectionProps extends Pick<PracticeSimulationProps, "episode" | "state" | "onReflection"> {
  selectedReflectionId?: string;
  acknowledgement?: string;
}

export function StoryReflection({
  episode,
  state,
  onReflection,
  selectedReflectionId,
  acknowledgement,
}: StoryReflectionProps) {
  if (!state.reflection) return null;
  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="mb-5 max-w-prose text-2xl font-bold leading-snug">{state.reflection.prompt}</legend>
      {state.reflection.options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selectedReflectionId === option.id}
          disabled={!state.currentEvent || !onReflection}
          onClick={() => {
            if (!state.currentEvent) return;
            onReflection?.({ episodeId: episode.episodeId, eventId: state.currentEvent.id, reflectionId: option.id });
          }}
          className={`block min-h-14 w-full rounded-xl border p-4 text-left text-base leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${
            selectedReflectionId === option.id
              ? "border-foreground bg-primary font-semibold text-primary-foreground"
              : "border-border bg-card text-card-foreground hover:border-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
      {selectedReflectionId && acknowledgement && (
        <p role="status" className="pt-3 text-base leading-relaxed">
          {acknowledgement}
        </p>
      )}
    </fieldset>
  );
}
