"use client";

import { cn } from "@gullak/ui/lib/utils";
import { Lock, Play } from "lucide-react";
import { useState } from "react";
import { Gullu } from "./gullu";
import { SpeechBubble } from "./speech-bubble";
import { CURRICULUM_WORLDS, type WorldDef } from "./worlds";

interface WorldMapProps {
  onLaunchWorldMission: (world: WorldDef) => void;
  onLaunchTwin: () => void;
  learnerGradeGroup?: string;
  completedWorlds?: number[];
  learnerXp?: number;
}

export function WorldMap({
  onLaunchWorldMission,
  onLaunchTwin,
  learnerGradeGroup: _learnerGradeGroup = "grade-6-7",
  completedWorlds = [],
  learnerXp: _learnerXp = 0,
}: WorldMapProps) {
  const [selectedWorld, setSelectedWorld] = useState<WorldDef | null>(null);
  const [gulluReaction, setGulluReaction] = useState(0);

  const activeWorld = CURRICULUM_WORLDS[0]!;

  function handleWorldClick(world: WorldDef) {
    if (world.slug === "life-simulator") {
      onLaunchTwin();
      return;
    }

    if (world.isLocked) {
      setSelectedWorld(world);
      return;
    }

    onLaunchWorldMission(world);
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full pb-28 pt-2 px-3 sm:px-6 max-w-xl mx-auto flex flex-col items-center">
      {/* Top Map HUD: Active Mission Quick Banner */}
      <div className="w-full mb-5 flex items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Gullu
            state="wave"
            size={52}
            reactionKey={gulluReaction}
            onTap={() => setGulluReaction((r) => r + 1)}
            tapLabel="Gullu says hello"
          />
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Current Destination</span>
            <h2 className="text-base font-bold leading-tight text-foreground">{activeWorld.title} · Kirana</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLaunchWorldMission(activeWorld)}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Play className="size-3.5 fill-current" />
          <span>Play</span>
        </button>
      </div>

      {/* Floating Story Guide Speech Bubble */}
      <div className="w-full mb-4 max-w-md">
        <SpeechBubble speakerName="Gullu" variant="paper" tailPosition="bottom-left">
          &quot;Welcome to our lane! Nani gave us our first errand at the Kirana shop. Tap{" "}
          <strong>Candy Economy</strong> to begin!&quot;
        </SpeechBubble>
      </div>

      {/* The 8 Worlds Vertical Path */}
      <div className="relative w-full flex flex-col-reverse items-center gap-10 sm:gap-14 my-4">
        {/* Curving decorative pathway line SVG behind nodes */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none stroke-border"
          strokeWidth="3"
          strokeDasharray="6 8"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 180 80 Q 280 200 180 340 T 180 620 T 180 900 T 180 1180" />
        </svg>

        {CURRICULUM_WORLDS.map((world, index) => {
          const isCompleted = completedWorlds.includes(world.id);
          const isCurrent = world.id === activeWorld.id;

          // Zig-zag slight offsets for playful winding road feel
          const offsetClass =
            index % 3 === 0
              ? "translate-x-0"
              : index % 3 === 1
                ? "-translate-x-8 sm:-translate-x-14"
                : "translate-x-8 sm:translate-x-14";

          return (
            <div
              key={world.id}
              className={cn("relative flex flex-col items-center group transition-transform", offsetClass)}
            >
              {/* World Island / Node Button */}
              <button
                type="button"
                onClick={() => handleWorldClick(world)}
                aria-label={`${world.title}: ${world.tagline}`}
                className={cn(
                  "relative size-20 sm:size-24 rounded-2xl border flex flex-col items-center justify-center p-2 transition-colors",
                  world.isLocked
                    ? "border-transparent bg-muted text-muted-foreground"
                    : isCurrent
                      ? "border-2 border-foreground bg-brand-lime text-brand-ink dark:text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40",
                )}
              >
                {/* Active Ring Animation */}
                {isCurrent && (
                  <span className="g-node-ring absolute -inset-1.5 rounded-[1.25rem] border border-foreground/30 pointer-events-none" />
                )}

                {/* Node Icon */}
                <span className="text-2xl sm:text-3xl select-none mb-0.5">{world.icon}</span>

                {/* Node Number Badge */}
                <span className="text-xs font-semibold opacity-80">World {world.id}</span>

                {/* Padlock sticker if locked */}
                {world.isLocked && (
                  <span className="absolute -top-2 -right-2 rounded-full border border-border bg-background p-1 text-muted-foreground">
                    <Lock className="size-3" />
                  </span>
                )}

                {/* Completed checkmark if passed */}
                {isCompleted && (
                  <span className="absolute -top-2 -right-2 rounded-full border border-foreground bg-brand-lime p-1 text-brand-ink">
                    ✓
                  </span>
                )}
              </button>

              {/* Node Title & Description Callout */}
              <div className="mt-2 text-center max-w-[170px]">
                <p className="text-sm font-bold leading-tight text-foreground">{world.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{world.tagline}</p>

                {isCurrent && (
                  <span className="inline-block mt-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">
                    Play Now
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked World Explainer Modal */}
      {selectedWorld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedWorld.icon}</span>
                <div>
                  <h3 className="text-base font-bold leading-tight text-foreground">{selectedWorld.title}</h3>
                  <p className="text-xs font-bold text-muted-foreground">{selectedWorld.seasonLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorld(null)}
                className="size-8 rounded-xl border border-border grid place-items-center bg-background hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-muted p-3 text-sm space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Lock className="size-3.5" />
                <span>How to unlock this world:</span>
              </div>
              <p className="font-medium text-foreground leading-relaxed">
                {selectedWorld.unlockReason ?? "Complete prerequisite missions to enter this world."}
              </p>
            </div>

            <button type="button" onClick={() => setSelectedWorld(null)} className="g-btn w-full py-2.5 text-sm">
              Got it! Back to Map
            </button>
          </div>
        </div>
      )}

      {/* Persistent Floating Primary Action at Bottom of Screen (Phone-first) */}
      <div className="fixed bottom-20 left-4 right-4 z-20 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onLaunchWorldMission(activeWorld)}
          className="g-btn w-full text-base flex items-center justify-center gap-2"
        >
          <Play className="size-5 fill-current" />
          <span>PLAY: {activeWorld.missionTitle} (3m) →</span>
        </button>
      </div>
    </div>
  );
}
