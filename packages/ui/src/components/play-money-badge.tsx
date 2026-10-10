import { cn } from "cn";

/**
 * Guardrail made visible: every screen that shows money shows this badge.
 * Text is passed in so it can be translated.
 */
function PlayMoneyBadge({ label = "Play money", className }: { label?: string; className?: string }) {
  return (
    <span
      data-slot="play-money-badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-current px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

export { PlayMoneyBadge };
