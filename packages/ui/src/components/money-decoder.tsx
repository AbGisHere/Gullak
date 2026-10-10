import { AlertTriangle, BookOpen, Compass, HelpCircle, Lightbulb, X } from "lucide-react";
import * as React from "react";
import { defaultMoneyDecoderLabels, type MoneyDecoderLabels } from "../lib/labels";
import { cn } from "../lib/utils";

export type { MoneyDecoderLabels };

export type GradeGroup = "grade-6-7" | "grade-8-10" | "grade-11-12";

export interface MoneyTermData {
  /** The standard financial term (e.g. "Tenure", "Principal", "Liquidity") */
  term: string;
  /** Optional full name or context (e.g. "Fixed Deposit Tenure") */
  expandedName?: string;
  /** Clear plain-language definition suited for learners */
  plainMeaning: string;
  /** Real-life places the learner will encounter this */
  whereYouSeeIt: string[];
  /** Concrete, everyday example */
  example: string;
  /** Target grade group tag if adapted */
  gradeGroup?: GradeGroup;
  /** Contextual importance: "Why does it matter in this decision?" */
  whyItMattersHere?: string;
  /** Common trap, myth, or misconception to watch out for */
  misconception?: string;
  /** Associated curriculum topic slug (e.g. "fixed-deposit") */
  relatedTopicId?: string;
}

export interface MoneyDecoderProps {
  /** The financial term data object */
  termData: MoneyTermData;
  /** Target grade group tag */
  gradeGroup?: GradeGroup;
  /** Optional custom trigger content. Defaults to termData.term */
  children?: React.ReactNode;
  /** Visual variant of the inline trigger */
  triggerVariant?: "underline" | "badge" | "subtle";
  /** Optional localized labels */
  labels?: Partial<MoneyDecoderLabels>;
  /** Callback fired when decoder is opened */
  onTermOpen?: () => void;
  /** Optional container class */
  className?: string;
}

/**
 * MoneyDecoder: In-situ financial vocabulary decoder.
 * Mobile-first bottom sheet drawer, keyboard accessible, zero-network.
 */
export function MoneyDecoder({
  termData,
  gradeGroup,
  children,
  triggerVariant = "underline",
  labels,
  onTermOpen,
  className,
}: MoneyDecoderProps) {
  const l: MoneyDecoderLabels = { ...defaultMoneyDecoderLabels, ...labels };
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const termId = React.useId();
  const titleId = `money-decoder-title-${termId}`;
  const descId = `money-decoder-desc-${termId}`;

  // Keyboard navigation & accessibility handlers
  const handleOpen = () => {
    setIsOpen(true);
    onTermOpen?.();
  };

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger button
    triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Prevent background scrolling when open on mobile
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const triggerClasses = {
    underline:
      "inline-flex items-center gap-1 cursor-pointer font-medium decoration-brand-ink/40 hover:decoration-brand-ink underline underline-offset-4 decoration-dashed decoration-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm min-h-[44px] min-w-[44px] py-1 px-0.5",
    badge:
      "inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-muted hover:bg-brand-lilac/30 border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]",
    subtle:
      "inline-flex items-center gap-1 cursor-pointer font-medium hover:text-brand-coral transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm min-h-[44px] py-1",
  };

  return (
    <>
      {/* Inline interactive trigger with 44px comfortable touch target */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `money-decoder-dialog-${termId}` : undefined}
        aria-label={`${l.triggerAriaPrefix} ${termData.term}`}
        onClick={handleOpen}
        className={cn(triggerClasses[triggerVariant], className)}
        data-testid="money-decoder-trigger"
      >
        <span>{children ?? termData.term}</span>
        <HelpCircle aria-hidden="true" className="size-3.5 shrink-0 opacity-60 transition-opacity hover:opacity-100" />
      </button>

      {/* Accessible Backdrop + Bottom Drawer (mobile) / Modal (desktop) */}
      {isOpen && (
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close; keyboard users close with Escape or the close button
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={sheetRef}
            id={`money-decoder-dialog-${termId}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "relative flex max-h-[90svh] w-full max-w-lg flex-col overflow-hidden bg-card text-card-foreground shadow-2xl transition-all duration-300",
              // Mobile: bottom sheet with rounded top corners
              "rounded-t-2xl sm:rounded-2xl border-t sm:border border-border",
              // Mobile full-width, no horizontal overflow
              "max-w-full sm:max-w-lg",
            )}
            data-testid="money-decoder-sheet"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="flex w-full items-center justify-center pt-3 sm:hidden" aria-hidden="true">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header: Term, badge, and close button */}
            <div className="flex items-start justify-between gap-4 border-b border-border p-5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-brand-lime px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-ink">
                    <BookOpen aria-hidden="true" className="size-3" />
                    {l.badgeTitle}
                  </span>
                  {(gradeGroup ?? termData.gradeGroup) && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {gradeGroup ?? termData.gradeGroup}
                    </span>
                  )}
                </div>
                <h2 id={titleId} className="text-2xl font-bold tracking-tight text-foreground">
                  {termData.term}
                </h2>
                {termData.expandedName && (
                  <p className="text-sm font-medium text-muted-foreground">{termData.expandedName}</p>
                )}
              </div>

              {/* Close Button: 44px comfortable touch area */}
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={l.closeAria}
                onClick={handleClose}
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="money-decoder-close"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            {/* Content Body: Scrollable for small viewports (320px-430px) and long text */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm leading-relaxed">
              {/* Question 1: What does this term mean? */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Lightbulb aria-hidden="true" className="size-3.5 text-brand-coral" />
                  <span>{l.plainMeaning}</span>
                </div>
                <p id={descId} className="text-base font-normal text-foreground leading-relaxed">
                  {termData.plainMeaning}
                </p>
              </div>

              {/* Question 2: Why does it matter here? (Contextual trade-off) */}
              {termData.whyItMattersHere && (
                <div className="rounded-xl border border-brand-lime/50 bg-brand-lime/15 p-3.5 text-foreground">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-ink">
                    <Compass aria-hidden="true" className="size-3.5" />
                    <span>{l.whyItMatters}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{termData.whyItMattersHere}</p>
                </div>
              )}

              {/* Where you will see it */}
              {termData.whereYouSeeIt.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {l.whereYouSeeIt}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {termData.whereYouSeeIt.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Real life example */}
              <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {l.realLifeExample}
                </span>
                <p className="mt-1 font-mono text-xs text-foreground sm:text-sm leading-relaxed">
                  "{termData.example}"
                </p>
              </div>

              {/* Common Misconception / Watch Out */}
              {termData.misconception && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-foreground">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning">
                    <AlertTriangle aria-hidden="true" className="size-3.5" />
                    <span>{l.watchOut}</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed">{termData.misconception}</p>
                </div>
              )}
            </div>

            {/* Footer: Got It action */}
            <div className="border-t border-border bg-muted/20 p-4 sm:p-5">
              <button
                type="button"
                onClick={handleClose}
                className="flex min-h-[44px] h-auto w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-primary-foreground font-semibold text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {l.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Standalone Card variant of MoneyDecoder for glossary cards or lesson side-panels
 */
export function MoneyDecoderCard({
  termData,
  gradeGroup,
  labels,
  className,
}: {
  termData: MoneyTermData;
  gradeGroup?: GradeGroup;
  labels?: Partial<MoneyDecoderLabels>;
  className?: string;
}) {
  const l: MoneyDecoderLabels = { ...defaultMoneyDecoderLabels, ...labels };

  return (
    <div
      className={cn("rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}
      data-testid="money-decoder-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-brand-lime px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-ink">
          <BookOpen aria-hidden="true" className="size-3" />
          {l.badgeTitle}
        </span>
        {(gradeGroup ?? termData.gradeGroup) && (
          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {gradeGroup ?? termData.gradeGroup}
          </span>
        )}
      </div>

      <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">{termData.term}</h3>
      {termData.expandedName && <p className="text-xs font-medium text-muted-foreground">{termData.expandedName}</p>}

      <p className="mt-3 text-sm text-foreground leading-relaxed">{termData.plainMeaning}</p>

      {termData.whyItMattersHere && (
        <div className="mt-3 rounded-lg border border-brand-lime/40 bg-brand-lime/10 p-2.5 text-xs text-foreground">
          <span className="font-bold text-brand-ink">{l.whyItMatters}: </span>
          {termData.whyItMattersHere}
        </div>
      )}

      <div className="mt-3 rounded-lg bg-muted/50 p-2.5 font-mono text-xs text-foreground leading-relaxed">
        "{termData.example}"
      </div>
    </div>
  );
}
