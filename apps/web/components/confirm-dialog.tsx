"use client";

import { cn } from "@gullak/ui/lib/utils";
import { useEffect, useId, useRef } from "react";
import { Gullu } from "./game/gullu";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  /** What will be lost, one short line each. */
  consequences?: readonly string[];
  confirmLabel: string;
  cancelLabel: string;
  /** "destructive" for anything that cannot be undone. */
  tone?: "destructive" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A modal confirm step for actions that lose work. Built on the native <dialog> so focus is
 * trapped, the page behind is inert and Esc cancels. The safe choice (cancel) gets focus first
 * and sits where a reflex tap lands on phones; the destructive choice is never the default.
 * Mount it only while open; focus returns to the control that opened it.
 */
export function ConfirmDialog({
  title,
  description,
  consequences,
  confirmLabel,
  cancelLabel,
  tone = "destructive",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    cancelRef.current?.focus();
    function handleCancel(event: Event) {
      // Esc: close through React state so the parent stays the source of truth.
      event.preventDefault();
      onCancelRef.current();
    }
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        // A tap on the dimmed backdrop counts as cancel, never as confirm.
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-2 border-foreground bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/55"
    >
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Gullu state="concerned" size={56} className="shrink-0" />
          <div className="min-w-0 space-y-2">
            <h2 id={titleId} className="font-display text-xl font-extrabold leading-tight text-balance">
              {title}
            </h2>
            <p id={descriptionId} className="text-base leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {consequences && consequences.length > 0 ? (
          <ul className="space-y-1.5 rounded-xl bg-muted px-4 py-3 text-sm leading-5">
            {consequences.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "min-h-12 rounded-xl border-2 px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              tone === "destructive"
                ? "border-destructive text-destructive hover:bg-destructive/10"
                : "border-border hover:bg-muted",
            )}
          >
            {confirmLabel}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-xl border-2 border-foreground bg-foreground px-5 text-sm font-bold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
