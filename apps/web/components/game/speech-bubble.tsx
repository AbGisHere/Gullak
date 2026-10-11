"use client";

import { cn } from "@gullak/ui/lib/utils";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  speakerName?: string;
  className?: string;
  tailPosition?: "bottom-left" | "left" | "top-left" | "bottom-center";
  variant?: "lime" | "paper" | "yellow" | "coral";
}

export function SpeechBubble({
  children,
  speakerName: speakerNameProp,
  className,
  tailPosition = "bottom-left",
  variant = "paper",
}: SpeechBubbleProps) {
  const t = useTranslations("help");
  const speakerName = speakerNameProp ?? t("gullu.name");
  const bgStyles = {
    paper: "bg-card text-foreground border-border",
    lime: "bg-brand-lime text-brand-ink dark:text-background border-border",
    yellow: "bg-brand-yellow text-brand-ink dark:text-background border-border",
    coral: "bg-brand-coral text-brand-ink dark:text-background border-border",
  }[variant];

  return (
    <section
      aria-label={t("gullu.says", { name: speakerName || t("gullu.name") })}
      aria-live="polite"
      className={cn(
        "g-bubble relative rounded-2xl border p-3 sm:p-4 text-sm sm:text-base leading-snug",
        bgStyles,
        className,
      )}
    >
      {speakerName && <span className="block text-xs font-semibold opacity-70 mb-0.5">{speakerName}</span>}
      <div className="font-medium">{children}</div>

      {/* Tail SVG pointing to character */}
      {tailPosition === "bottom-left" && (
        <svg
          className="absolute -bottom-2.5 left-5 h-3 w-4 overflow-visible"
          viewBox="0 0 16 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 L8 12 L16 0 Z"
            className={
              variant === "paper"
                ? "fill-card stroke-border"
                : variant === "lime"
                  ? "fill-brand-lime stroke-border"
                  : variant === "yellow"
                    ? "fill-brand-yellow stroke-border"
                    : "fill-brand-coral stroke-border"
            }
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {tailPosition === "left" && (
        <svg
          className="absolute -left-2.5 top-4 h-4 w-3 overflow-visible"
          viewBox="0 0 12 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 0 L0 8 L12 16 Z"
            className={
              variant === "paper"
                ? "fill-card stroke-border"
                : variant === "lime"
                  ? "fill-brand-lime stroke-border"
                  : variant === "yellow"
                    ? "fill-brand-yellow stroke-border"
                    : "fill-brand-coral stroke-border"
            }
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </section>
  );
}
