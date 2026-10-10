import * as React from "react";
import { cn } from "../lib/utils";
import { Character, type CharacterPose, type CharacterExpression, type CharacterVariant, type CharacterAccent } from "./character";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";
import { ArrowRight, RotateCcw, CheckCircle2, Compass, Lightbulb, Sparkles, HelpCircle } from "lucide-react";
import { type SpotAndSortLabels, defaultSpotAndSortLabels } from "../lib/labels";

export type { SpotAndSortLabels };

export interface SpotAndSortCategory {
  id: string;
  label: string;
  shortHint?: string;
  accent?: "lime" | "lilac" | "coral" | "yellow" | "ink" | "muted";
}

export interface SpotAndSortExplanation {
  /** Detailed reason why this classification fits */
  whyItFits: string;
  /** Specific features, indicators, or clues to observe */
  whatToNotice: string;
  /** Forward-looking tip for future classification */
  clueForNextTime?: string;
}

export interface SpotAndSortItem {
  id: string;
  /** Primary item text / scenario / expense description */
  prompt: string;
  /** Optional secondary context */
  contextNote?: string;
  /** Expected matching category id */
  expectedCategoryId: string;
  /** Explanation revealed after learner categorizes the item */
  explanation: SpotAndSortExplanation;
  /** Optional embedded MoneyDecoder terms */
  terms?: MoneyTermData[];
  /** Optional character reaction overrides */
  characterReaction?: {
    matchPose?: CharacterPose;
    matchExpression?: CharacterExpression;
    retryPose?: CharacterPose;
    retryExpression?: CharacterExpression;
  };
  /** Outcome tags for adaptive knowledge tracing */
  outcomeTags?: string[];
}

export interface SpotAndSortActivity {
  id: string;
  title: string;
  instruction: string;
  topicIds: string[];
  categories: SpotAndSortCategory[];
  items: SpotAndSortItem[];
  allowRetry?: boolean;
}

export interface SpotAndSortItemResponse {
  itemId: string;
  selectedCategoryId: string;
  isMatch: boolean;
  attemptCount: number;
  outcomeTags: string[];
}

export interface SpotAndSortResult {
  activityId: string;
  responses: SpotAndSortItemResponse[];
  topicIds: string[];
  completedAt: string;
}

export interface SpotAndSortProps {
  activity: SpotAndSortActivity;
  labels?: Partial<SpotAndSortLabels>;
  onComplete?: (result: SpotAndSortResult) => void;
  onItemSelect?: (itemId: string, categoryId: string, isMatch: boolean) => void;
  className?: string;
}

/**
 * SpotAndSort: Fast, mobile-first reinforcement interaction for classification rounds.
 * Data-driven, accessible tap-based sorting with explanatory feedback.
 */
export function SpotAndSort({
  activity,
  labels,
  onComplete,
  onItemSelect,
  className,
}: SpotAndSortProps) {
  const l: SpotAndSortLabels = { ...defaultSpotAndSortLabels, ...labels };
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [attemptCount, setAttemptCount] = React.useState(1);
  const [responses, setResponses] = React.useState<SpotAndSortItemResponse[]>([]);
  const [isFinished, setIsFinished] = React.useState(false);

  const currentItem = activity.items[currentIndex];

  if (!currentItem) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
        No items available for this activity.
      </div>
    );
  }

  const isMatch = selectedCategoryId === currentItem.expectedCategoryId;

  // Determine character presentation based on state
  const characterPose: CharacterPose = selectedCategoryId
    ? isMatch
      ? currentItem.characterReaction?.matchPose ?? "celebrating"
      : currentItem.characterReaction?.retryPose ?? "pondering"
    : "neutral";

  const characterExpression: CharacterExpression = selectedCategoryId
    ? isMatch
      ? currentItem.characterReaction?.matchExpression ?? "excited"
      : currentItem.characterReaction?.retryExpression ?? "thinking"
    : "friendly";

  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategoryId) return; // already categorized, waiting for Next/Retry

    const match = categoryId === currentItem.expectedCategoryId;
    setSelectedCategoryId(categoryId);
    onItemSelect?.(currentItem.id, categoryId, match);
  };

  const handleRetryCurrentItem = () => {
    setAttemptCount((prev) => prev + 1);
    setSelectedCategoryId(null);
  };

  const handleNextItem = () => {
    if (!selectedCategoryId) return;

    const responseRecord: SpotAndSortItemResponse = {
      itemId: currentItem.id,
      selectedCategoryId,
      isMatch,
      attemptCount,
      outcomeTags: currentItem.outcomeTags ?? [],
    };

    const nextResponses = [...responses, responseRecord];
    setResponses(nextResponses);

    if (currentIndex + 1 < activity.items.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedCategoryId(null);
      setAttemptCount(1);
    } else {
      setIsFinished(true);
      onComplete?.({
        activityId: activity.id,
        responses: nextResponses,
        topicIds: activity.topicIds,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedCategoryId(null);
    setAttemptCount(1);
    setResponses([]);
    setIsFinished(false);
  };

  // Helper to highlight embedded MoneyDecoder terms in prompt
  const renderPromptWithTerms = (text: string, terms?: MoneyTermData[]) => {
    if (!terms || terms.length === 0) {
      return text;
    }

    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    const regexPattern = new RegExp(`\\b(${sortedTerms.map((t) => t.term).join("|")})\\b`, "gi");

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regexPattern.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const matchedWord = match[0];
      const matchedData = sortedTerms.find(
        (t) => t.term.toLowerCase() === matchedWord.toLowerCase()
      );

      if (matchedData) {
        parts.push(
          <MoneyDecoder key={`term-${matchIndex}`} termData={matchedData} triggerVariant="underline">
            {matchedWord}
          </MoneyDecoder>
        );
      } else {
        parts.push(matchedWord);
      }

      lastIndex = matchIndex + matchedWord.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Finished Round View
  if (isFinished) {
    const totalItems = activity.items.length;
    const matchedCount = responses.filter((r) => r.isMatch).length;

    return (
      <div
        className={cn(
          "flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm",
          className
        )}
        data-testid="spot-and-sort-finished"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-lime text-brand-ink">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.roundComplete}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {activity.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-center py-2">
          <Character
            variant="blob"
            pose="celebrating"
            expression="excited"
            accent="lime"
            size="lg"
            label="Learner completed round"
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {l.summaryPattern(matchedCount, totalItems)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="flex min-h-[44px] h-auto items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          <span>{l.replayRound}</span>
        </button>
      </div>
    );
  }

  const categoryAccentStyles: Record<string, string> = {
    lime: "hover:border-brand-lime hover:bg-brand-lime/10",
    lilac: "hover:border-brand-lilac hover:bg-brand-lilac/15",
    coral: "hover:border-brand-coral hover:bg-brand-coral/10",
    yellow: "hover:border-brand-yellow hover:bg-brand-yellow/15",
    ink: "hover:border-brand-ink hover:bg-brand-ink/5",
    muted: "hover:border-border hover:bg-muted/50",
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5",
        className
      )}
      data-testid="spot-and-sort-container"
    >
      {/* Activity Header & Progress Indicator */}
      <div className="space-y-2 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-brand-yellow/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
            <Sparkles aria-hidden="true" className="size-3 text-brand-ink" />
            {l.spotAndSortBadge}
          </span>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground" data-testid="round-progress">
            {currentIndex + 1} {l.progressOf} {activity.items.length}
          </span>
        </div>

        {/* Segmented Step Progress Bar */}
        <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted">
          {activity.items.map((_, idx) => (
            <div
              key={`prog-${idx}`}
              className={cn(
                "h-full flex-1 transition-colors duration-200",
                idx < currentIndex
                  ? "bg-foreground"
                  : idx === currentIndex
                  ? "bg-brand-lime"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg leading-snug">
            {activity.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activity.instruction}
          </p>
        </div>
      </div>

      {/* Main Item Prompt Card with Character Helper */}
      <div
        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
        data-testid="spot-and-sort-prompt-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            {currentItem.contextNote && (
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {currentItem.contextNote}
              </span>
            )}
            <p className="text-base font-semibold text-foreground sm:text-lg leading-snug">
              {renderPromptWithTerms(currentItem.prompt, currentItem.terms)}
            </p>
          </div>

          <Character
            variant="blob"
            pose={characterPose}
            expression={characterExpression}
            accent="lime"
            size="sm"
            label="Reaction character"
          />
        </div>

        {/* Embedded Terms Badges */}
        {currentItem.terms && currentItem.terms.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground">{l.terms}</span>
            {currentItem.terms.map((term) => (
              <MoneyDecoder key={term.term} termData={term} triggerVariant="badge" />
            ))}
          </div>
        )}
      </div>

      {/* Category Choices Buttons */}
      <div className="space-y-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {l.chooseCategory}
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {activity.categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const accentClass = categoryAccentStyles[cat.accent ?? "muted"];

            return (
              <button
                key={cat.id}
                type="button"
                disabled={Boolean(selectedCategoryId && !activity.allowRetry)}
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  "flex min-h-[48px] h-auto w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
                  isSelected
                    ? "border-foreground bg-foreground text-background font-bold shadow-sm"
                    : "border-border bg-card text-foreground hover:bg-muted/40",
                  !selectedCategoryId && accentClass
                )}
                data-testid={`category-btn-${cat.id}`}
              >
                <div className="space-y-0.5">
                  <span className="block text-sm font-bold leading-tight">
                    {cat.label}
                  </span>
                  {cat.shortHint && (
                    <span className={cn(
                      "block text-[11px] leading-tight",
                      isSelected ? "text-background/80" : "text-muted-foreground"
                    )}>
                      {cat.shortHint}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Immediate Educational Explanation */}
      {selectedCategoryId && (
        <div
          className="space-y-3.5 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
          data-testid="spot-and-sort-explanation"
        >
          {/* Header indicator */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold",
                isMatch
                  ? "bg-brand-lime text-brand-ink"
                  : "bg-brand-coral/15 text-brand-coral"
              )}
            >
              {isMatch ? (
                <>
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  <span>{l.categoryMatched}</span>
                </>
              ) : (
                <>
                  <Compass aria-hidden="true" className="size-3.5" />
                  <span>{l.alternativeCategory}</span>
                </>
              )}
            </span>
          </div>

          {/* Section: Why this fits */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Compass aria-hidden="true" className="size-3.5 text-brand-coral" />
              <span>{l.whyThisFits}</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {currentItem.explanation.whyItFits}
            </p>
          </div>

          {/* Section: What to notice */}
          <div className="rounded-lg border border-brand-yellow/50 bg-brand-yellow/15 p-3 text-xs sm:text-sm text-foreground">
            <div className="mb-0.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
              <Lightbulb aria-hidden="true" className="size-3.5 text-brand-ink" />
              <span>{l.whatToNotice}</span>
            </div>
            <p className="leading-relaxed">
              {currentItem.explanation.whatToNotice}
            </p>
          </div>

          {/* Section: Clue for next time (Optional) */}
          {currentItem.explanation.clueForNextTime && (
            <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{l.cluePrefix} </span>
              {currentItem.explanation.clueForNextTime}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            {activity.allowRetry && !isMatch ? (
              <button
                type="button"
                onClick={handleRetryCurrentItem}
                className="flex min-h-[44px] h-auto items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="spot-and-sort-retry-btn"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                <span>{l.tryAnother}</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNextItem}
              className="flex min-h-[44px] h-auto items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="spot-and-sort-next-btn"
            >
              <span>{currentIndex + 1 < activity.items.length ? l.nextItem : l.completeRound}</span>
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
