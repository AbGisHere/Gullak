import { cn } from "cn";

/**
 * Legacy label primitive, still used for the Candy Coins mechanic.
 * Learner money screens omit decorative Play money badges.
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
