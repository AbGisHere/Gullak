"use client";

import { cn } from "@gullak/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

/**
 * Gullu: Nani's clay gullak, broken and brought back to life.
 * The gold repair lines are the story made visible. Authored SVG so eyes, arms and body
 * animate independently (CSS in app/game.css, transform/opacity only, reduced-motion safe).
 */
export type GulluState =
  | "idle"
  | "wave"
  | "curious"
  | "happy"
  | "concerned"
  | "surprised"
  | "thinking"
  | "encouraging"
  | "celebrate";

type Face = GulluState;
type Arms = "down" | "wave" | "cheer" | "think" | "thumbs" | "hold";
type Motion = "idle" | "hop" | "jump" | "sway" | "pop" | "tilt" | "thinking";

const STATE_MAP: Record<GulluState, { arms: Arms; motion: Motion; coin?: boolean }> = {
  idle: { arms: "down", motion: "idle" },
  wave: { arms: "wave", motion: "idle" },
  curious: { arms: "down", motion: "tilt" },
  happy: { arms: "cheer", motion: "hop", coin: true },
  concerned: { arms: "hold", motion: "sway" },
  surprised: { arms: "down", motion: "pop" },
  thinking: { arms: "think", motion: "thinking" },
  encouraging: { arms: "thumbs", motion: "pop" },
  celebrate: { arms: "cheer", motion: "jump", coin: true },
};

const INK = "#171717";
const CLAY = "#FF6847";
const CLAY_DARK = "#E9572F";
const GOLD = "#FFD84D";
const LILAC = "#CBB5FF";

interface GulluProps {
  state?: GulluState;
  /** Rendered width in px; height follows the 120×124 artboard. */
  size?: number;
  /** Change this number to replay the current state's reaction (hop, pop…). */
  reactionKey?: number;
  /** Accessible description; omit when the surrounding text already introduces Gullu. */
  label?: string;
  /** Makes Gullu a button: a tap always gets a giggle and a hop. */
  onTap?: () => void;
  tapLabel?: string;
  className?: string;
}

export function Gullu({ state = "idle", size = 120, reactionKey = 0, label, onTap, tapLabel, className }: GulluProps) {
  const [giggle, setGiggle] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const shown: GulluState = giggle > 0 ? "happy" : state;
  const art = (
    <GulluArt
      state={shown}
      size={size}
      animationKey={`${shown}-${reactionKey}-${giggle}`}
      label={onTap ? undefined : label}
    />
  );

  if (!onTap) return <span className={cn("inline-block shrink-0", className)}>{art}</span>;

  return (
    <button
      type="button"
      aria-label={tapLabel ?? label}
      onClick={() => {
        setGiggle((n) => n + 1);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setGiggle(0), 900);
        onTap();
      }}
      className={cn(
        "inline-block shrink-0 rounded-[40%] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring cursor-pointer [-webkit-tap-highlight-color:transparent]",
        className,
      )}
    >
      {art}
    </button>
  );
}

function GulluArt({
  state,
  size,
  animationKey,
  label,
}: {
  state: GulluState;
  size: number;
  animationKey: string;
  label?: string;
}) {
  const config = STATE_MAP[state];
  return (
    <svg
      key={animationKey}
      viewBox="0 0 120 124"
      width={size}
      height={(size * 124) / 120}
      className="gullu block select-none"
      data-motion={config.motion}
      data-arms={config.arms}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
    >
      <defs>
        <clipPath id="gullu-slot-clip">
          <rect x="0" y="0" width="120" height="40.5" />
        </clipPath>
      </defs>
      <ellipse className="gullu-shadow" cx="60" cy="117" rx="30" ry="4" fill={INK} opacity="0.18" />
      <g className="gullu-body">
        {/* feet */}
        <ellipse cx="45" cy="108" rx="9" ry="5.5" fill={CLAY_DARK} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="75" cy="108" rx="9" ry="5.5" fill={CLAY_DARK} stroke={INK} strokeWidth="2.5" />

        <Limb className="gullu-arm-l" d={armPath("l", config.arms)} />
        <Limb className="gullu-arm-r" d={armPath("r", config.arms)} />

        {/* neck + knob of the gullak */}
        <rect x="46" y="23" width="28" height="12" rx="4" fill={CLAY} stroke={INK} strokeWidth="3" />
        <circle cx="60" cy="18" r="5.5" fill={CLAY} stroke={INK} strokeWidth="3" />

        {/* pot */}
        <path
          d="M60 30 C86 30 103 48 103 70 C103 93 85 108 60 108 C35 108 17 93 17 70 C17 48 34 30 60 30 Z"
          fill={CLAY}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M21 80 C26 97 41 105.5 60 105.5 C79 105.5 94 97 99 80 C90 93 77 99 60 99 C43 99 30 93 21 80 Z"
          fill={CLAY_DARK}
          opacity="0.6"
        />
        <ellipse cx="35" cy="50" rx="5.5" ry="10" transform="rotate(32 35 50)" fill="#fff" opacity="0.38" />

        {/* kintsugi repair lines: the gullak that was broken and rebuilt */}
        <Seam d="M23 59 L32 64 L29 73 L38 79" />
        <Seam d="M97 55 L88 62 L93 70" />
        <Seam d="M58 105 L63 98 L70 101" />

        {/* coin slot + coin */}
        <rect x="49" y="37" width="22" height="4.5" rx="2.25" fill={INK} />
        {config.coin ? (
          <g clipPath="url(#gullu-slot-clip)">
            <g className="gullu-coin">
              <circle cx="60" cy="32" r="7" fill={GOLD} stroke={INK} strokeWidth="2.5" />
              <path
                d="M57.5 29.5 h5 M57.5 32 h5 M59 29.5 q3 0 3 2.5 t-3 2.5 l3.5 3"
                stroke={INK}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </g>
        ) : null}

        {/* cheeks */}
        <ellipse cx="36" cy="77" rx="6" ry="3.6" fill={LILAC} />
        <ellipse cx="84" cy="77" rx="6" ry="3.6" fill={LILAC} />

        <Face state={state} />
      </g>
    </svg>
  );
}

function Limb({ d, className }: { d: { path: string; hand: [number, number]; thumb?: boolean }; className: string }) {
  return (
    <g className={className}>
      <path d={d.path} stroke={INK} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d={d.path} stroke={CLAY} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx={d.hand[0]} cy={d.hand[1]} r="5" fill={CLAY} stroke={INK} strokeWidth="2.5" />
      {d.thumb ? (
        <path d={`M${d.hand[0]} ${d.hand[1] - 4} v-6`} stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      ) : null}
    </g>
  );
}

function armPath(side: "l" | "r", arms: Arms): { path: string; hand: [number, number]; thumb?: boolean } {
  const left = side === "l";
  switch (arms) {
    case "wave":
      return left
        ? { path: "M23 72 Q12 82 16 92", hand: [16, 92] }
        : { path: "M97 70 Q111 58 108 42", hand: [108, 42] };
    case "cheer":
      return left ? { path: "M23 70 Q9 57 13 41", hand: [13, 41] } : { path: "M97 70 Q111 57 107 41", hand: [107, 41] };
    case "think":
      return left ? { path: "M23 72 Q12 82 16 92", hand: [16, 92] } : { path: "M97 76 Q98 94 76 92", hand: [75, 91] };
    case "thumbs":
      return left
        ? { path: "M23 72 Q12 82 16 92", hand: [16, 92] }
        : { path: "M97 72 Q113 70 112 58", hand: [112, 58], thumb: true };
    case "hold":
      return left ? { path: "M23 74 Q27 90 42 92", hand: [43, 92] } : { path: "M97 74 Q93 90 78 92", hand: [77, 92] };
    default:
      return left
        ? { path: "M23 72 Q12 82 16 92", hand: [16, 92] }
        : { path: "M97 72 Q108 82 104 92", hand: [104, 92] };
  }
}

function Seam({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="4.6" />
      <path d={d} stroke={GOLD} strokeWidth="2.4" />
    </g>
  );
}

const stroke = { stroke: INK, strokeWidth: 2.8, strokeLinecap: "round" as const, fill: "none" };

function Face({ state }: { state: Face }) {
  const happyEyes = state === "happy" || state === "celebrate";
  const pupil =
    state === "concerned"
      ? { dx: 0, dy: 2, r: 3.4 }
      : state === "surprised"
        ? { dx: 0, dy: 0, r: 2.6 }
        : state === "thinking"
          ? { dx: -2, dy: -3, r: 3.4 }
          : { dx: 0, dy: 1, r: 3.7 };

  return (
    <g>
      {happyEyes ? (
        <g {...stroke} strokeWidth={3.2}>
          <path d="M40.5 64 Q48 55 55.5 64" />
          <path d="M64.5 64 Q72 55 79.5 64" />
        </g>
      ) : (
        <g className="gullu-eyes">
          {state === "encouraging" ? (
            <path d="M40.5 63 Q48 56 55.5 63" {...stroke} strokeWidth={3.2} />
          ) : (
            <>
              <ellipse
                cx="48"
                cy="62"
                rx="8.5"
                ry={state === "surprised" ? 10.5 : 9.5}
                fill="#fff"
                stroke={INK}
                strokeWidth="2.5"
              />
              <circle
                cx={48 + pupil.dx + (state === "curious" ? 0 : 0)}
                cy={62 + pupil.dy}
                r={state === "curious" ? 3 : pupil.r}
                fill={INK}
              />
              <circle cx={49.5 + pupil.dx} cy={60 + pupil.dy} r="1.1" fill="#fff" />
            </>
          )}
          <ellipse
            cx="72"
            cy="62"
            rx="8.5"
            ry={state === "surprised" ? 10.5 : 9.5}
            fill="#fff"
            stroke={INK}
            strokeWidth="2.5"
          />
          <circle
            cx={72 + pupil.dx + (state === "curious" ? 1 : 0)}
            cy={62 + pupil.dy + (state === "curious" ? -1 : 0)}
            r={state === "curious" ? 4.3 : pupil.r}
            fill={INK}
          />
          <circle cx={73.5 + pupil.dx} cy={60 + pupil.dy} r="1.1" fill="#fff" />
        </g>
      )}

      {/* brows */}
      {state === "curious" ? (
        <g {...stroke}>
          <path d="M41 49.5 Q48 47.5 54 49.5" />
          <path d="M65 45.5 Q72 41 79 45.5" />
        </g>
      ) : state === "concerned" ? (
        <g {...stroke}>
          <path d="M41 51.5 L54 47.5" />
          <path d="M66 47.5 L79 51.5" />
        </g>
      ) : state === "surprised" ? (
        <g {...stroke}>
          <path d="M41 46.5 Q48 42 55 46.5" />
          <path d="M65 46.5 Q72 42 79 46.5" />
        </g>
      ) : state === "thinking" ? (
        <g {...stroke}>
          <path d="M42 50 L54 51" />
          <path d="M66 50.5 L78 47.5" />
        </g>
      ) : null}

      {/* mouth */}
      {state === "wave" || state === "happy" ? (
        <path d="M51 78 Q60 90 69 78 Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      ) : state === "celebrate" ? (
        <g>
          <path d="M49.5 76.5 Q60 94 70.5 76.5 Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M54.5 85 Q60 82 65.5 85 Q60 90.5 54.5 85 Z" fill={CLAY_DARK} />
        </g>
      ) : state === "concerned" ? (
        <path d="M52 85 Q56 81 60 85 Q64 89 68 85" {...stroke} />
      ) : state === "surprised" ? (
        <ellipse cx="60" cy="85" rx="4.5" ry="5.5" fill={INK} />
      ) : state === "thinking" ? (
        <path d="M54 84 L65 82.5" {...stroke} />
      ) : state === "curious" ? (
        <path d="M54.5 82 Q61 85.5 66.5 80.5" {...stroke} />
      ) : state === "encouraging" ? (
        <path d="M51.5 78.5 Q60 88 68.5 78.5" {...stroke} strokeWidth={3} />
      ) : (
        <path d="M52.5 79 Q60 86 67.5 79" {...stroke} />
      )}
    </g>
  );
}
