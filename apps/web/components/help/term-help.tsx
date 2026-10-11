"use client";

import { cn } from "@gullak/ui/lib/utils";
import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import type { HelpTerm } from "@/lib/help-terms";

/**
 * A small "What's this?" button that opens a plain-language definition beside a term.
 * Disclosure pattern: the button names the term, toggles on click/tap/Enter/Space,
 * and closes on Escape (focus returns to the button) or a press outside.
 */
export function TermHelp({ term, className }: { term: HelpTerm; className?: string }) {
  const t = useTranslations("help");
  const panelId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // A click right after hover-open should keep the definition open, not toggle it shut.
  const openedByHover = useRef(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const name = t(`terms.${term}.name`);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (openedByHover.current) {
      openedByHover.current = false;
      setOpen(true);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!open && rect) setAlignEnd(rect.left > window.innerWidth / 2);
    setOpen((value) => !value);
  }

  return (
    <span
      ref={wrapperRef}
      className={cn("relative inline-flex align-middle", className)}
      // Mouse users can hover; touch and keyboard users tap or press the button.
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse" || open) return;
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) setAlignEnd(rect.left > window.innerWidth / 2);
        openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        openedByHover.current = false;
        setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("termButton", { term: name })}
        onClick={toggle}
        className="relative inline-grid size-6 place-items-center rounded-full text-current opacity-70 transition-opacity before:absolute before:-inset-2.5 before:content-[''] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-expanded:opacity-100"
      >
        <CircleHelp className="size-4" aria-hidden="true" />
      </button>
      <span
        id={panelId}
        hidden={!open}
        className={cn(
          "absolute top-full z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-3 text-left font-sans text-sm font-normal normal-case leading-relaxed tracking-normal text-popover-foreground shadow-[0_8px_24px_-8px_rgb(23_23_23/0.35)]",
          alignEnd ? "right-0" : "left-0",
        )}
      >
        <strong className="block font-bold">{name}</strong>
        <span className="mt-1 block">{t(`terms.${term}.definition`)}</span>
      </span>
    </span>
  );
}
