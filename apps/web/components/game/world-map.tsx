"use client";

import { cn } from "@gullak/ui/lib/utils";
import { Check, Clock, Lock, MapPin, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
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

type WorldDialogState = { world: WorldDef; variant: "locked" | "soon" };

export function WorldMap({
  onLaunchWorldMission,
  onLaunchTwin,
  learnerGradeGroup: _learnerGradeGroup = "grade-6-7",
  completedWorlds = [],
  learnerXp: _learnerXp = 0,
}: WorldMapProps) {
  const t = useTranslations("home.map");
  const tWorld = useTranslations("learner.world");
  const [dialog, setDialog] = useState<WorldDialogState | null>(null);
  const [gulluReaction, setGulluReaction] = useState(0);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const activeWorld = CURRICULUM_WORLDS[0]!;
  const minutes = (world: WorldDef) => Number.parseInt(world.missionDuration, 10);

  // The path is drawn bottom-up (flex-col-reverse), so the learner's current world sits at the
  // far end of the page. Bring it into view on load instead of opening on the locked worlds.
  useEffect(() => {
    currentNodeRef.current?.scrollIntoView?.({ block: "center" });
  }, []);

  function handleWorldClick(world: WorldDef) {
    if (world.slug === "life-simulator") {
      onLaunchTwin();
      return;
    }

    if (world.isLocked) {
      setDialog({ world, variant: "locked" });
      return;
    }

    if (!world.hasMission) {
      setDialog({ world, variant: "soon" });
      return;
    }

    onLaunchWorldMission(world);
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full pb-28 pt-2 px-3 sm:px-6 max-w-xl mx-auto flex flex-col items-center">
      {/* Top Map HUD: where the learner is in the story */}
      <div className="w-full mb-6 rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
        <Gullu
          state="wave"
          size={52}
          reactionKey={gulluReaction}
          onTap={() => setGulluReaction((r) => r + 1)}
          tapLabel={t("gulluHello")}
        />
        <div>
          <span className="block text-xs font-bold text-muted-foreground">{t("currentDestination")}</span>
          <h1 className="text-sm sm:text-base font-bold leading-tight text-foreground">{tWorld(activeWorld.slug)}</h1>
        </div>
      </div>

      {/* Floating Story Guide Speech Bubble */}
      <div className="w-full mb-4 max-w-md">
        <SpeechBubble speakerName="Gullu" variant="paper" tailPosition="bottom-left">
          {t.rich("welcome", {
            name: tWorld(activeWorld.slug),
            world: (chunks) => <strong>{chunks}</strong>,
          })}
        </SpeechBubble>
      </div>

      {/* The 8 Worlds Vertical Path */}
      <div className="relative w-full flex flex-col-reverse items-center gap-10 sm:gap-14 my-4">
        {/* Dashed trail behind the nodes; labels sit on a paper chip so it never runs through text */}
        <svg
          className="absolute inset-y-6 left-1/2 h-[calc(100%-3rem)] w-2 -translate-x-1/2 pointer-events-none stroke-border"
          strokeWidth="6"
          strokeDasharray="10 8"
          fill="none"
          aria-hidden="true"
        >
          <line x1="4" y1="0" x2="4" y2="100%" />
        </svg>

        {CURRICULUM_WORLDS.map((world, index) => {
          const isCompleted = completedWorlds.includes(world.id);
          const isCurrent = world.id === activeWorld.id;
          const isTwin = world.slug === "life-simulator";
          const isSoon = !world.isLocked && !world.hasMission;
          const title = tWorld(world.slug);
          const tagline = t(`worlds.${world.slug}.tagline`);
          const status = world.isLocked
            ? t("statusLocked")
            : isSoon
              ? t("statusSoon")
              : isCompleted
                ? t("statusDone")
                : isCurrent
                  ? t("youAreHere")
                  : t("statusOpen");

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
              ref={isCurrent ? currentNodeRef : undefined}
              className={cn("relative flex flex-col items-center group transition-transform", offsetClass)}
            >
              {/* World Island / Node Button */}
              <button
                type="button"
                onClick={() => handleWorldClick(world)}
                aria-label={t("nodeLabel", { number: world.id, title, tagline, status })}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "relative size-20 sm:size-24 rounded-2xl border flex flex-col items-center justify-center p-2 transition-colors",
                  world.isLocked
                    ? "border-transparent bg-muted text-muted-foreground"
                    : isCurrent
                      ? "bg-brand-lime text-foreground scale-105"
                      : isTwin
                        ? "bg-brand-coral text-foreground"
                        : isSoon
                          ? "border-dashed bg-card text-foreground"
                          : "bg-card text-foreground hover:bg-brand-lime/40",
                )}
              >
                {/* Active Ring Animation */}
                {isCurrent && (
                  <span className="g-node-ring absolute -inset-1.5 rounded-[1.25rem] border border-foreground/30 pointer-events-none" />
                )}

                {/* Node Icon */}
                <span aria-hidden="true" className="text-2xl sm:text-3xl select-none mb-0.5">
                  {world.icon}
                </span>

                {/* Node Number Badge */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-xs font-bold leading-none",
                    isTwin || isCurrent ? "text-foreground" : "text-foreground/80 dark:text-[#F8FAFC]/80",
                  )}
                >
                  {t("worldNumber", { number: world.id })}
                </span>

                {/* Padlock sticker if locked */}
                {world.isLocked && (
                  <span className="absolute -top-2 -right-2 rounded-full border border-border bg-brand-coral p-1 text-foreground shadow-xs">
                    <Lock className="size-3" aria-hidden="true" />
                  </span>
                )}

                {/* Clock sticker if open but its mission is not written yet */}
                {isSoon && (
                  <span className="absolute -top-2 -right-2 rounded-full border border-border bg-[#FFD84D] p-1 text-foreground shadow-xs">
                    <Clock className="size-3" aria-hidden="true" />
                  </span>
                )}

                {/* Completed checkmark if passed */}
                {isCompleted && (
                  <span className="absolute -top-2 -right-2 rounded-full border-2 border-foreground bg-brand-lime p-1 text-foreground shadow-xs">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
              </button>

              {/* Node Title & Description Callout (paper chip keeps the trail out of the text) */}
              <div
                aria-hidden="true"
                className="relative mt-2 max-w-[180px] rounded-xl bg-brand-paper/95 px-2 py-1 text-center"
              >
                <p className="text-xs sm:text-sm font-bold leading-tight text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground font-semibold line-clamp-1">{tagline}</p>

                {isCurrent && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-foreground dark:text-[#DFFF3F]">
                    <MapPin className="size-3" aria-hidden="true" />
                    {t("youAreHere")}
                  </span>
                )}
                {isSoon && (
                  <span className="mt-1 inline-block text-xs font-bold text-muted-foreground">{t("statusSoon")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked / coming-soon world explainer */}
      {dialog && (
        <WorldDialog dialog={dialog} currentWorldTitle={tWorld(activeWorld.slug)} onClose={() => setDialog(null)} />
      )}

      {/* The one primary action: play the current mission (thumb-reachable on phones) */}
      <div className="fixed bottom-20 left-4 right-4 z-20 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onLaunchWorldMission(activeWorld)}
          className="g-btn w-full text-base flex items-center justify-center gap-2"
        >
          <Play className="size-5 fill-[#171717]" aria-hidden="true" />
          <span>
            {t("play", {
              mission: t(`worlds.${activeWorld.slug}.mission`),
              minutes: minutes(activeWorld),
            })}
          </span>
        </button>
      </div>
    </div>
  );
}

function WorldDialog({
  dialog,
  currentWorldTitle,
  onClose,
}: {
  dialog: WorldDialogState;
  currentWorldTitle: string;
  onClose: () => void;
}) {
  const t = useTranslations("home.map");
  const tWorld = useTranslations("learner.world");
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { world, variant } = dialog;
  const title = tWorld(world.slug);

  // Move focus in, trap Tab, close on Escape, and hand focus back to the world node on close.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 cursor-default border-0 bg-black/60 p-0"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5  space-y-4"
      >
        <div className="flex items-center justify-between border-b border-foreground/10 dark:border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl">
              {world.icon}
            </span>
            <div>
              <h2 id={titleId} className="text-base font-bold leading-tight text-foreground">
                {title}
              </h2>
              <p className="text-xs font-bold text-muted-foreground">{t("worldNumber", { number: world.id })}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="size-11 rounded-xl border border-foreground dark:border-[#334155] grid place-items-center bg-[#ECE8DF] dark:bg-[#162032] text-foreground hover:bg-brand-lime hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div
          id={descriptionId}
          className="rounded-2xl border border-foreground/20 dark:border-[#334155] bg-[#ECE8DF]/40 dark:bg-[#162032]/60 p-3 text-sm space-y-2"
        >
          <p className="flex items-center gap-1.5 font-bold text-foreground">
            {variant === "locked" ? (
              <Lock className="size-4 text-brand-coral-ink" aria-hidden="true" />
            ) : (
              <Clock className="size-4" aria-hidden="true" />
            )}
            <span>{variant === "locked" ? t("lockedHeading") : t("soonHeading")}</span>
          </p>
          {variant === "locked" ? (
            <p className="font-medium text-foreground leading-relaxed">
              {world.unlockReason ? t(`worlds.${world.slug}.unlock`) : t("lockedFallback")}
            </p>
          ) : (
            <>
              <p className="font-medium text-foreground leading-relaxed">
                {t("soonBody", { world: title, mission: t(`worlds.${world.slug}.mission`) })}
              </p>
              <p className="font-medium text-muted-foreground leading-relaxed">
                {t("soonNext", { current: currentWorldTitle })}
              </p>
            </>
          )}
        </div>

        <button type="button" onClick={onClose} className="g-btn g-btn--paper w-full py-2.5 text-sm">
          {t("backToMap")}
        </button>
      </div>
    </div>
  );
}
