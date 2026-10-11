"use client";

import { cn } from "@gullak/ui/lib/utils";
import { BookOpen, CircleUserRound, Compass, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// One navigation model for every screen: Home's tabs and the routed learner pages share these
// destinations, labels and the lg breakpoint (sidebar from lg, bottom bar below it).
const destinations = [
  { href: "/", key: "home", icon: Compass },
  { href: "/learn", key: "learn", icon: BookOpen },
  { href: "/practice", key: "practice", icon: Sparkles },
  { href: "/portfolio", key: "portfolio", icon: Layers3 },
  { href: "/me", key: "me", icon: CircleUserRound },
] as const;

export function isActiveDestination(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** `onHome` lets Home's tab view return to its first tab when Home is tapped on "/" itself. */
export function PrimaryNav({ variant, onHome }: { variant: "sidebar" | "bar"; onHome?: () => void }) {
  const tNav = useTranslations("nav");
  const tLearner = useTranslations("learner");
  const pathname = usePathname();
  const links = destinations.map(({ href, key, icon: Icon }) => {
    const active = isActiveDestination(href, pathname);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        onClick={href === "/" && pathname === "/" ? onHome : undefined}
        className={
          variant === "sidebar"
            ? cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            : cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                active ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground",
              )
        }
      >
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <span className="leading-none">{key === "home" ? tNav("home") : tLearner(key)}</span>
      </Link>
    );
  });
  if (variant === "sidebar") {
    return (
      <nav aria-label={tLearner("navigation")} className="flex flex-col gap-2">
        {links}
      </nav>
    );
  }
  return (
    <nav
      aria-label={tLearner("navigation")}
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background px-1 pt-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {links}
    </nav>
  );
}
