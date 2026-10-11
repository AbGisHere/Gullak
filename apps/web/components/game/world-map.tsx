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
  learnerXp: _learnerXp = 120,
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
      <div className="w-full mb-6 rounded-2xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-3.5 shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Gullu
            state="wave"
            size={52}
            reactionKey={gulluReaction}
            onTap={() => setGulluReaction((r) => r + 1)}
            tapLabel="Gullu says hello"
          />
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#FF6847]">
              Current Destination
            </span>
            <h2 className="font-display text-sm sm:text-base font-black leading-tight text-[#171717] dark:text-[#F8FAFC]">
              {activeWorld.title} · Kirana
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLaunchWorldMission(activeWorld)}
          className="g-btn g-btn--sm py-2 px-3.5 text-xs font-black shadow-[2px_2px_0_#171717]"
        >
          <Play className="size-3.5 fill-[#171717]" />
          <span>Play</span>
        </button>
      </div>

      {/* Floating Story Guide Speech Bubble */}
      <div className="w-full mb-6 max-w-md">
        <SpeechBubble speakerName="Gullu" variant="paper" tailPosition="bottom-left">
          &quot;Welcome to our lane! Nani gave us our first errand at the Kirana shop. Tap{" "}
          <strong>Candy Economy</strong> to begin!&quot;
        </SpeechBubble>
      </div>

      {/* The 8 Worlds Vertical Path */}
      <div className="relative w-full flex flex-col-reverse items-center gap-10 sm:gap-14 my-4">
        {/* Curving decorative pathway line SVG behind nodes */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none stroke-[#171717]/30 dark:stroke-[#94A3B8]/30"
          strokeWidth="6"
          strokeDasharray="10 8"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 180 80 Q 280 200 180 340 T 180 620 T 180 900 T 180 1180" />
        </svg>

        {CURRICULUM_WORLDS.map((world, index) => {
          const isCompleted = completedWorlds.includes(world.id);
          const isCurrent = world.id === activeWorld.id;
          const isTwin = world.slug === "life-simulator";

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
                  "relative size-20 sm:size-24 rounded-3xl border-3 border-[#171717] dark:border-[#334155] flex flex-col items-center justify-center p-2 transition-all active:scale-95",
                  world.isLocked
                    ? "bg-[#ECE8DF] dark:bg-[#162032] opacity-75 shadow-[2px_2px_0_#171717] dark:shadow-[2px_2px_0_#000000]"
                    : isCurrent
                      ? "bg-[#DFFF3F] text-[#171717] shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] scale-105"
                      : isTwin
                        ? "bg-[#FF6847] text-white shadow-[5px_5px_0_#171717] dark:shadow-[5px_5px_0_#000000]"
                        : "bg-[#FFFDF7] dark:bg-[#1E293B] text-[#171717] dark:text-[#F8FAFC] shadow-[4px_4px_0_#171717] dark:shadow-[4px_4px_0_#000000] hover:bg-[#DFFF3F]/40",
                )}
              >
                {/* Active Ring Animation */}
                {isCurrent && (
                  <span className="g-node-ring absolute -inset-2 rounded-3xl border-2 border-[#171717] dark:border-[#DFFF3F] pointer-events-none" />
                )}

                {/* Node Icon */}
                <span className="text-2xl sm:text-3xl select-none mb-0.5">{world.icon}</span>

                {/* Node Number Badge */}
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    isTwin ? "text-white/90" : "text-[#171717]/80 dark:text-[#F8FAFC]/80",
                  )}
                >
                  World {world.id}
                </span>

                {/* Padlock sticker if locked */}
                {world.isLocked && (
                  <span className="absolute -top-2 -right-2 rounded-full border-2 border-[#171717] dark:border-[#334155] bg-[#FF6847] p-1 text-white shadow-xs">
                    <Lock className="size-3" />
                  </span>
                )}

                {/* Completed checkmark if passed */}
                {isCompleted && (
                  <span className="absolute -top-2 -right-2 rounded-full border-2 border-[#171717] bg-[#DFFF3F] p-1 text-[#171717] shadow-xs">
                    ✓
                  </span>
                )}
              </button>

              {/* Node Title & Description Callout */}
              <div className="mt-2 text-center max-w-[170px]">
                <p className="font-display text-xs sm:text-sm font-black leading-tight text-[#171717] dark:text-[#F8FAFC]">
                  {world.title}
                </p>
                <p className="text-[10px] text-[#171717]/70 dark:text-[#94A3B8] font-semibold line-clamp-1">
                  {world.tagline}
                </p>

                {isCurrent && (
                  <span className="inline-block mt-1 rounded-full bg-[#171717] dark:bg-[#DFFF3F] text-[#DFFF3F] dark:text-[#0B1120] px-2 py-0.5 text-[9px] font-black uppercase">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border-2 border-[#171717] dark:border-[#334155] bg-[#FFFDF7] dark:bg-[#1E293B] p-5 shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717]/10 dark:border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedWorld.icon}</span>
                <div>
                  <h3 className="font-display text-base font-black leading-tight text-[#171717] dark:text-[#F8FAFC]">
                    {selectedWorld.title}
                  </h3>
                  <p className="text-[11px] font-bold text-[#171717]/70 dark:text-[#94A3B8]">
                    {selectedWorld.seasonLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorld(null)}
                className="size-8 rounded-xl border border-[#171717] dark:border-[#334155] grid place-items-center bg-[#ECE8DF] dark:bg-[#162032] hover:bg-[#FF6847] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-[#171717]/20 dark:border-[#334155] bg-[#ECE8DF]/40 dark:bg-[#162032]/60 p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#FF6847]">
                <Lock className="size-3.5" />
                <span>How to unlock this world:</span>
              </div>
              <p className="font-medium text-[#171717] dark:text-[#F8FAFC] leading-relaxed">
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
          className="g-btn w-full py-3.5 text-base sm:text-lg shadow-[6px_6px_0_#171717] dark:shadow-[6px_6px_0_#000000] flex items-center justify-center gap-2"
        >
          <Play className="size-5 fill-[#171717]" />
          <span>PLAY: {activeWorld.missionTitle} (3m) →</span>
        </button>
      </div>
    </div>
  );
}
