"use client";

import { cn } from "@gullak/ui/lib/utils";
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
  speakerName = "Gullu",
  className,
  tailPosition = "bottom-left",
  variant = "paper",
}: SpeechBubbleProps) {
  const bgStyles = {
    paper:
      "bg-[#FFFDF7] dark:bg-[#1E293B] text-[#171717] dark:text-[#F8FAFC] border-[#171717] dark:border-[#334155] shadow-[3px_3px_0px_#171717] dark:shadow-[3px_3px_0px_#000000]",
    lime: "bg-[#DFFF3F] text-[#171717] border-[#171717] shadow-[3px_3px_0px_#171717] dark:shadow-[3px_3px_0px_#000000]",
    yellow:
      "bg-[#FFD84D] text-[#171717] border-[#171717] shadow-[3px_3px_0px_#171717] dark:shadow-[3px_3px_0px_#000000]",
    coral: "bg-[#FF6847] text-white border-[#171717] shadow-[3px_3px_0px_#171717] dark:shadow-[3px_3px_0px_#000000]",
  }[variant];

  return (
    <section
      aria-label={`${speakerName} says`}
      aria-live="polite"
      className={cn(
        "g-bubble relative rounded-2xl border-2 p-3 sm:p-4 font-display text-sm sm:text-base leading-snug",
        bgStyles,
        className,
      )}
    >
      {speakerName && (
        <span className="block text-[11px] font-black uppercase tracking-wider text-[#171717]/70 dark:text-[#94A3B8] mb-0.5">
          {speakerName}
        </span>
      )}
      <div className="font-medium text-[#171717] dark:text-[#F8FAFC]">{children}</div>

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
                ? "fill-[#FFFDF7] dark:fill-[#1E293B] stroke-[#171717] dark:stroke-[#334155]"
                : variant === "lime"
                  ? "fill-[#DFFF3F] stroke-[#171717]"
                  : variant === "yellow"
                    ? "fill-[#FFD84D] stroke-[#171717]"
                    : "fill-[#FF6847] stroke-[#171717]"
            }
            strokeWidth="2"
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
                ? "fill-[#FFFDF7] dark:fill-[#1E293B] stroke-[#171717] dark:stroke-[#334155]"
                : variant === "lime"
                  ? "fill-[#DFFF3F] stroke-[#171717]"
                  : variant === "yellow"
                    ? "fill-[#FFD84D] stroke-[#171717]"
                    : "fill-[#FF6847] stroke-[#171717]"
            }
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </section>
  );
}
