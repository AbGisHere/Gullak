import type * as React from "react";
import { cn } from "../lib/utils";

export type CharacterVariant = "blob" | "pillar" | "spark" | "arch";
export type CharacterPose = "neutral" | "pondering" | "celebrating" | "explaining" | "cautious" | "saving";
export type CharacterExpression = "friendly" | "curious" | "excited" | "thinking" | "concerned";
export type CharacterAccent = "lime" | "lilac" | "coral" | "yellow" | "ink" | "muted";
export type CharacterSize = "sm" | "md" | "lg" | "xl";

export interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  /** Silhouette shape archetype */
  variant?: CharacterVariant;
  /** Arm & body posture */
  pose?: CharacterPose;
  /** Facial feature expression */
  expression?: CharacterExpression;
  /** Primary accent highlight */
  accent?: CharacterAccent;
  /** Standard responsive size */
  size?: CharacterSize;
  /** Accessible description. If omitted, marked decorative aria-hidden="true" */
  label?: string;
  /** Optional custom CSS classes */
  className?: string;
}

const sizeDimensions: Record<CharacterSize, { width: number; height: number }> = {
  sm: { width: 36, height: 44 },
  md: { width: 64, height: 76 },
  lg: { width: 112, height: 132 },
  xl: { width: 180, height: 212 },
};

const accentFills: Record<CharacterAccent, string> = {
  lime: "var(--brand-lime, #DFFF3F)",
  lilac: "var(--brand-lilac, #CBB5FF)",
  coral: "var(--brand-coral, #FF6847)",
  yellow: "var(--brand-yellow, #FFD84D)",
  ink: "var(--brand-ink, #171717)",
  muted: "var(--brand-muted, #ECE8DF)",
};

/**
 * Reusable abstract humanoid character primitive.
 * Vector-based, lightweight, accessible, zero-raster.
 */
export function Character({
  variant = "blob",
  pose = "neutral",
  expression = "friendly",
  accent = "lime",
  size = "md",
  label,
  className,
  ...rest
}: CharacterProps) {
  const dims = sizeDimensions[size];
  const accentColor = accentFills[accent];
  const isDecorative = !label;

  return (
    <svg
      viewBox="0 0 100 120"
      width={dims.width}
      height={dims.height}
      role={isDecorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={isDecorative ? "true" : undefined}
      className={cn("inline-block shrink-0 select-none overflow-visible", className)}
      {...rest}
    >
      {/* Soft ground shadow for grounded tactile feel */}
      <ellipse
        cx="50"
        cy="114"
        rx={variant === "pillar" ? "18" : variant === "arch" ? "28" : "24"}
        ry="4"
        fill="currentColor"
        opacity="0.12"
      />

      {/* Legs */}
      {renderLegs(pose)}

      {/* Body Silhouette */}
      {renderBody(variant, accentColor)}

      {/* Accent badge / emblem on chest or shoulder */}
      {renderAccentBadge(variant, accentColor)}

      {/* Facial Features (eyes, brow, mouth) */}
      {renderFace(expression)}

      {/* Arms & Hands */}
      {renderArms(pose, accentColor)}
    </svg>
  );
}

function renderBody(variant: CharacterVariant, _accentColor: string) {
  switch (variant) {
    case "pillar":
      // Slender, taller pill-like silhouette
      return (
        <path
          d="M32 30 C32 15 68 15 68 30 L68 85 C68 98 32 98 32 85 Z"
          fill="var(--card, #FFFFFF)"
          stroke="var(--foreground, #171717)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      );
    case "spark":
      // Angled, dynamic geometry with friendly rounded edges
      return (
        <path
          d="M30 36 C30 18 70 20 72 36 L76 80 C78 96 28 98 26 82 Z"
          fill="var(--card, #FFFFFF)"
          stroke="var(--foreground, #171717)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      );
    case "arch":
      // Sturdy, rounded dome/arch shape
      return (
        <path
          d="M22 45 C22 18 78 18 78 45 L80 86 C80 97 20 97 20 86 Z"
          fill="var(--card, #FFFFFF)"
          stroke="var(--foreground, #171717)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      );
    default:
      // Organic rounded friendly teardrop-blob
      return (
        <path
          d="M24 45 C24 20 76 20 76 45 C76 65 82 86 68 94 C54 100 32 98 26 86 C20 74 24 58 24 45 Z"
          fill="var(--card, #FFFFFF)"
          stroke="var(--foreground, #171717)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      );
  }
}

function renderAccentBadge(variant: CharacterVariant, accentColor: string) {
  // A clean graphic accent spot (pocket, badge, or pattern)
  return (
    <g>
      <circle
        cx={variant === "pillar" ? "50" : "58"}
        cy="68"
        r="7.5"
        fill={accentColor}
        stroke="var(--foreground, #171717)"
        strokeWidth="2"
      />
      <circle cx={variant === "pillar" ? "50" : "58"} cy="68" r="2" fill="var(--foreground, #171717)" />
    </g>
  );
}

function renderFace(expression: CharacterExpression) {
  switch (expression) {
    case "excited":
      return (
        <g stroke="var(--foreground, #171717)" strokeWidth="2.5" strokeLinecap="round">
          {/* Spark wide eyes */}
          <circle cx="42" cy="40" r="3" fill="var(--foreground, #171717)" />
          <circle cx="58" cy="40" r="3" fill="var(--foreground, #171717)" />
          {/* Happy raised brows */}
          <path d="M38 33 Q42 30 46 32" fill="none" />
          <path d="M54 32 Q58 30 62 33" fill="none" />
          {/* Big open smile */}
          <path d="M44 48 Q50 56 56 48 Z" fill="var(--foreground, #171717)" />
        </g>
      );
    case "curious":
      return (
        <g stroke="var(--foreground, #171717)" strokeWidth="2.5" strokeLinecap="round">
          {/* One eye wider */}
          <circle cx="41" cy="40" r="2.5" fill="var(--foreground, #171717)" />
          <circle cx="59" cy="38" r="3.5" fill="var(--foreground, #171717)" />
          {/* Raised arch brow on right */}
          <path d="M37 34 Q41 33 45 35" fill="none" />
          <path d="M55 29 Q60 27 65 31" fill="none" />
          {/* Subtle curious wry smile */}
          <path d="M46 49 Q51 52 56 48" fill="none" />
        </g>
      );
    case "thinking":
      return (
        <g stroke="var(--foreground, #171717)" strokeWidth="2.5" strokeLinecap="round">
          {/* Eyes glancing upward */}
          <ellipse cx="44" cy="37" rx="2" ry="2.5" fill="var(--foreground, #171717)" />
          <ellipse cx="60" cy="37" rx="2" ry="2.5" fill="var(--foreground, #171717)" />
          {/* Thoughtful brows */}
          <path d="M40 33 L47 34" fill="none" />
          <path d="M56 34 L63 33" fill="none" />
          {/* Small straight pondering mouth */}
          <line x1="47" y1="48" x2="55" y2="48" />
        </g>
      );
    case "concerned":
      return (
        <g stroke="var(--foreground, #171717)" strokeWidth="2.5" strokeLinecap="round">
          {/* Wide concerned eyes */}
          <circle cx="43" cy="40" r="2.5" fill="var(--foreground, #171717)" />
          <circle cx="57" cy="40" r="2.5" fill="var(--foreground, #171717)" />
          {/* Slanted concerned brows */}
          <path d="M39 33 L46 36" fill="none" />
          <path d="M61 33 L54 36" fill="none" />
          {/* Gentle wavy mouth */}
          <path d="M45 50 Q50 47 55 50" fill="none" />
        </g>
      );
    default:
      return (
        <g stroke="var(--foreground, #171717)" strokeWidth="2.5" strokeLinecap="round">
          {/* Warm calm eyes */}
          <circle cx="43" cy="39" r="2.5" fill="var(--foreground, #171717)" />
          <circle cx="57" cy="39" r="2.5" fill="var(--foreground, #171717)" />
          {/* Gentle smile */}
          <path d="M44 48 Q50 54 56 48" fill="none" />
        </g>
      );
  }
}

function renderLegs(pose: CharacterPose) {
  const strokeProps = {
    stroke: "var(--foreground, #171717)",
    strokeWidth: "3.5",
    strokeLinecap: "round" as const,
    fill: "none",
  };

  switch (pose) {
    case "celebrating":
      // Slight jump / dynamic stance
      return (
        <g {...strokeProps}>
          <path d="M38 94 L34 110 L28 111" />
          <path d="M62 94 L66 110 L72 111" />
        </g>
      );
    case "cautious":
      // Close, grounded stance
      return (
        <g {...strokeProps}>
          <path d="M42 94 L42 110 L37 111" />
          <path d="M58 94 L58 110 L63 111" />
        </g>
      );
    default:
      // Neutral standing legs
      return (
        <g {...strokeProps}>
          <path d="M38 94 L36 110 L30 111" />
          <path d="M62 94 L64 110 L70 111" />
        </g>
      );
  }
}

function renderArms(pose: CharacterPose, accentColor: string) {
  const strokeProps = {
    stroke: "var(--foreground, #171717)",
    strokeWidth: "3.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (pose) {
    case "celebrating":
      // Both arms raised triumphantly
      return (
        <g {...strokeProps}>
          <path d="M26 55 Q16 40 18 24" />
          <path d="M74 55 Q84 40 82 24" />
        </g>
      );
    case "pondering":
      // Left hand on hip, right hand to chin
      return (
        <g {...strokeProps}>
          <path d="M26 56 Q16 66 22 76" />
          <path d="M74 58 Q78 46 63 48" />
        </g>
      );
    case "explaining":
      // Right arm outstretched presenting a concept
      return (
        <g {...strokeProps}>
          <path d="M26 56 Q18 68 24 76" />
          <path d="M74 56 Q85 54 94 48" />
        </g>
      );
    case "cautious":
      // Hands held inward defensively / inspecting
      return (
        <g {...strokeProps}>
          <path d="M25 56 Q34 62 38 52" />
          <path d="M75 56 Q66 62 62 52" />
        </g>
      );
    case "saving":
      // Holding up a little Gullak coin
      return (
        <g>
          <path {...strokeProps} d="M26 58 Q34 68 44 64" />
          <path {...strokeProps} d="M74 58 Q66 68 56 64" />
          {/* Shiny coin between hands */}
          <circle cx="50" cy="64" r="6" fill={accentColor} stroke="var(--foreground, #171717)" strokeWidth="2" />
          <text x="50" y="67" textAnchor="middle" fontSize="7" fontWeight="bold" fill="var(--foreground, #171717)">
            ₹
          </text>
        </g>
      );
    default:
      // Calm, rested arms by side
      return (
        <g {...strokeProps}>
          <path d="M25 54 Q18 68 22 78" />
          <path d="M75 54 Q82 68 78 78" />
        </g>
      );
  }
}
