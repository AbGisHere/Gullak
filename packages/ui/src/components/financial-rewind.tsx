import { ArrowLeft, ArrowRight, ChevronRight, GitCompare, HelpCircle, Lightbulb, RotateCcw } from "lucide-react";
import * as React from "react";
import { defaultFinancialRewindLabels, type FinancialRewindLabels } from "../lib/labels";
import { cn } from "../lib/utils";
import { Character } from "./character";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";
import { PortfolioSummary, type PortfolioViewModel } from "./paper-portfolio";
import type { CharacterState } from "./practice-simulation";

export type { FinancialRewindLabels };

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

export interface ComparisonMetric {
  id: string;
  label: string;
  chosenValue: string;
  alternativeValue: string;
  note?: string;
}

export interface AlternativeOutcomeData {
  id?: string;
  decisionId: string;
  decisionLabel: string;
  summary?: string;
  resultingSummary: string;
  stateDelta?: string;
  tradeoff?: string;
  tradeoffComparison?: string;
  whatWasUnknown?: string;
  portfolioAfter?: PortfolioViewModel;
  characterReaction?: CharacterState;
  comparisonMetrics?: ComparisonMetric[];
  termData?: MoneyTermData[];
}

export interface ChosenPathData {
  decisionId: string;
  decisionLabel: string;
  narrativeConsequence: string;
  stateDelta: string;
  tradeoff: string;
  whatWasUnknown?: string;
  portfolioAfter?: PortfolioViewModel;
  characterReaction?: CharacterState;
}

export interface RewindReflectionOption {
  id: string;
  label: string;
}

export interface RewindReflectionData {
  prompt: string;
  options: RewindReflectionOption[];
}

export interface FinancialRewindProps {
  episodeId: string;
  chosenPath: ChosenPathData;
  alternatives: AlternativeOutcomeData[];
  uncertaintyMessage?: string;
  reflectionPrompt?: RewindReflectionData;
  gradeGroup?: "grade-6-7" | "grade-8-10" | "grade-11-12";
  labels?: Partial<FinancialRewindLabels>;
  onAlternativeView?: (payload: { episodeId: string; alternativeId: string }) => void;
  onComparisonComplete?: (payload: { episodeId: string; viewedAlternatives: string[] }) => void;
  onReflectionSelect?: (payload: { episodeId: string; reflectionId: string }) => void;
  onReturnToChosen?: () => void;
  onContinueToReflection?: () => void;
  onTermOpen?: (term: string) => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                       Financial Rewind Component                           */
/* -------------------------------------------------------------------------- */

/**
 * FinancialRewind: Counterfactual replay UI for Practice episodes.
 *
 * Strictly presentation-only: displays precomputed alternative outcomes and
 * comparison metrics supplied by the engine. Never computes market values,
 * penalty fees, portfolio balances, or hindsight judgments.
 */
export function FinancialRewind({
  episodeId,
  chosenPath,
  alternatives,
  uncertaintyMessage,
  reflectionPrompt,
  gradeGroup = "grade-8-10",
  labels,
  onAlternativeView,
  onComparisonComplete,
  onReflectionSelect,
  onReturnToChosen,
  onContinueToReflection,
  onTermOpen,
  className,
}: FinancialRewindProps) {
  const l: FinancialRewindLabels = { ...defaultFinancialRewindLabels, ...labels };
  const effectiveUncertaintyMessage = uncertaintyMessage ?? l.uncertaintyDefault;
  // Currently active alternative index
  const [selectedAltIndex, setSelectedAltIndex] = React.useState<number>(0);
  const [viewedAlternatives, setViewedAlternatives] = React.useState<string[]>([]);
  const [showCompareMode, setShowCompareMode] = React.useState<boolean>(false);

  const currentAlt = alternatives[selectedAltIndex];

  // Track alternative views for telemetry
  const handleSelectAlternative = (index: number) => {
    setSelectedAltIndex(index);
    const alt = alternatives[index];
    if (alt) {
      const altId = alt.id ?? alt.decisionId;
      if (!viewedAlternatives.includes(altId)) {
        const next = [...viewedAlternatives, altId];
        setViewedAlternatives(next);
        onComparisonComplete?.({ episodeId, viewedAlternatives: next });
      }
      onAlternativeView?.({ episodeId, alternativeId: altId });
    }
  };

  // On initial mount or change
  React.useEffect(() => {
    if (currentAlt) {
      const altId = currentAlt.id ?? currentAlt.decisionId;
      if (!viewedAlternatives.includes(altId)) {
        setViewedAlternatives((prev) => [...prev, altId]);
      }
    }
  }, [currentAlt, viewedAlternatives]);

  const activeReaction = currentAlt?.characterReaction ?? {
    variant: "blob",
    pose: "pondering",
    expression: "thinking",
    accent: "lilac",
    dialogue: "If we had taken this route instead, how would our flexibility have changed?",
  };

  return (
    <section
      data-testid="financial-rewind-container"
      aria-labelledby="rewind-main-heading"
      className={cn("w-full space-y-5 text-foreground", className)}
    >
      {/* Rewind Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-brand-lilac" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.rewindBadge}</span>
          </div>
          {onReturnToChosen && (
            <button
              type="button"
              onClick={onReturnToChosen}
              data-testid="rewind-return-chosen-btn"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{l.returnToYourPath}</span>
            </button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3">
          <Character
            variant={activeReaction.variant ?? "blob"}
            pose={activeReaction.pose ?? "pondering"}
            expression={activeReaction.expression ?? "thinking"}
            accent={activeReaction.accent ?? "lilac"}
            size="md"
            label={l.protagonistReviewingAlternatives}
          />
          <div className="flex-1">
            <h2 id="rewind-main-heading" className="text-lg font-bold text-foreground">
              {l.mainHeading}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{l.subtitle}</p>
            {activeReaction.dialogue && (
              <div className="mt-3 rounded-xl bg-muted/50 border border-border/50 px-3 py-2.5">
                <p className="text-sm text-foreground italic">"{activeReaction.dialogue}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Persistent Uncertainty Notice (No Hindsight Bias) */}
        {effectiveUncertaintyMessage && (
          <div
            data-testid="rewind-uncertainty-notice"
            className="mt-4 rounded-xl bg-muted/40 border border-border/50 p-3 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <span>{effectiveUncertaintyMessage}</span>
          </div>
        )}
      </div>

      {/* Alternative Selector Tabs */}
      {alternatives.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {l.selectAlternativeLabel}
          </span>
          <div role="tablist" aria-label={l.alternativePathsAria} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alternatives.map((alt, idx) => {
              const isSelected = idx === selectedAltIndex;
              const altId = alt.id ?? alt.decisionId;

              return (
                <button
                  type="button"
                  key={altId}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectAlternative(idx)}
                  data-testid={`rewind-tab-${alt.decisionId}`}
                  className={cn(
                    "min-h-[44px] rounded-xl border-2 p-3 text-left transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-ring flex items-center justify-between gap-2",
                    isSelected
                      ? "border-brand-lilac bg-brand-lilac/10 font-bold text-foreground shadow-xs"
                      : "border-border/70 bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{alt.decisionLabel}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isSelected ? "text-brand-lilac rotate-90" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle View: Side-by-Side Comparison vs Single View */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {showCompareMode ? l.comparingPaths : l.pathDetails}
        </span>
        <button
          type="button"
          onClick={() => setShowCompareMode(!showCompareMode)}
          data-testid="rewind-toggle-compare-btn"
          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <GitCompare className="h-3.5 w-3.5 text-brand-lime" aria-hidden="true" />
          <span>{showCompareMode ? l.viewSinglePath : l.compareWithYourChoice}</span>
        </button>
      </div>

      {/* Main Path Cards: Stacked on mobile, side-by-side on desktop if in compare mode */}
      <div className={cn("grid gap-4", showCompareMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {/* YOUR CHOSEN PATH */}
        <div
          data-testid="rewind-chosen-path-card"
          className={cn(
            "rounded-2xl border-2 border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3.5",
            !showCompareMode && "order-2 opacity-95",
          )}
        >
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-lime" aria-hidden="true" />
              {l.yourChoice}
            </span>
            <span className="text-xs font-semibold text-foreground font-mono">{chosenPath.decisionLabel}</span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.whatHappened}</span>
            <p className="mt-1 text-sm text-foreground leading-relaxed" data-testid="chosen-narrative">
              {chosenPath.narrativeConsequence}
            </p>
            {chosenPath.stateDelta && (
              <div
                className="mt-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs font-mono text-foreground"
                data-testid="chosen-state-delta"
              >
                {chosenPath.stateDelta}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/40">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.tradeoffMade}</span>
            <p className="mt-1 text-xs text-foreground leading-relaxed" data-testid="chosen-tradeoff">
              {chosenPath.tradeoff}
            </p>
          </div>

          {chosenPath.portfolioAfter && (
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {l.resultingPortfolio}
              </span>
              <PortfolioSummary portfolio={chosenPath.portfolioAfter} onTermOpen={onTermOpen} />
            </div>
          )}
        </div>

        {/* ALTERNATIVE PATH */}
        {currentAlt && (
          <div
            data-testid="rewind-alternative-path-card"
            className={cn(
              "rounded-2xl border-2 border-brand-lilac/70 bg-card p-4 sm:p-5 shadow-xs space-y-3.5",
              !showCompareMode && "order-1",
            )}
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-lilac flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                {l.alternativePath}
              </span>
              <span className="text-xs font-semibold text-foreground font-mono" data-testid="alt-decision-label">
                {currentAlt.decisionLabel}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {l.whatWouldHaveHappened}
              </span>
              <p className="mt-1 text-sm text-foreground leading-relaxed" data-testid="alt-narrative">
                {currentAlt.summary ?? currentAlt.resultingSummary}
              </p>
              {currentAlt.stateDelta && (
                <div
                  className="mt-2 rounded-lg bg-brand-lilac/10 border border-brand-lilac/30 px-2.5 py-1.5 text-xs font-mono text-foreground"
                  data-testid="alt-state-delta"
                >
                  {currentAlt.stateDelta}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {l.alternativeTradeoff}
              </span>
              <p className="mt-1 text-xs text-foreground leading-relaxed" data-testid="alt-tradeoff">
                {currentAlt.tradeoff ?? currentAlt.tradeoffComparison}
              </p>
            </div>

            {currentAlt.whatWasUnknown && (
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {l.whatWasStillUnknown}
                </span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed" data-testid="alt-unknown">
                  {currentAlt.whatWasUnknown}
                </p>
              </div>
            )}

            {currentAlt.portfolioAfter && (
              <div className="pt-2 border-t border-border/40 space-y-1.5" data-testid="alt-portfolio-section">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {l.alternativeResultingPortfolio}
                </span>
                <PortfolioSummary portfolio={currentAlt.portfolioAfter} onTermOpen={onTermOpen} />
              </div>
            )}

            {/* Contextual terms for alternative */}
            {currentAlt.termData && currentAlt.termData.length > 0 && (
              <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                {currentAlt.termData.map((td) => (
                  <MoneyDecoder
                    key={td.term}
                    termData={td}
                    gradeGroup={gradeGroup}
                    onTermOpen={() => onTermOpen?.(td.term)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Metrics Section (Supplied metrics only) */}
      {currentAlt?.comparisonMetrics && currentAlt.comparisonMetrics.length > 0 && (
        <section
          data-testid="rewind-metrics-comparison"
          aria-labelledby="metrics-comparison-heading"
          className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-brand-lime" aria-hidden="true" />
            <h3
              id="metrics-comparison-heading"
              className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
            >
              {l.dimensionComparisonHeading}
            </h3>
          </div>

          <div className="space-y-2.5">
            {currentAlt.comparisonMetrics.map((metric) => (
              <div
                key={metric.id}
                data-testid={`comparison-metric-${metric.id}`}
                className="rounded-xl bg-muted/40 border border-border/50 p-3 text-xs space-y-1.5"
              >
                <span className="font-bold text-foreground block text-xs">{metric.label}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground font-mono">
                  <div className="rounded-lg bg-card border border-border/40 px-2.5 py-1.5">
                    <span className="text-[10px] text-muted-foreground block font-sans">{l.yourChoice}</span>
                    <span>{metric.chosenValue}</span>
                  </div>
                  <div className="rounded-lg bg-brand-lilac/10 border border-brand-lilac/30 px-2.5 py-1.5">
                    <span className="text-[10px] text-brand-lilac block font-sans">{l.alternative}</span>
                    <span>{metric.alternativeValue}</span>
                  </div>
                </div>
                {metric.note && (
                  <p className="text-[11px] text-muted-foreground pt-1 italic font-sans">{metric.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reflection After Rewind */}
      {reflectionPrompt && (
        <section
          data-testid="rewind-reflection-section"
          aria-labelledby="rewind-reflection-heading"
          className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
            <h3 id="rewind-reflection-heading" className="text-sm font-bold text-foreground">
              {reflectionPrompt.prompt}
            </h3>
          </div>

          <fieldset className="space-y-2" aria-label={l.rewindReflectionAria}>
            {reflectionPrompt.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onReflectionSelect?.({ episodeId, reflectionId: opt.id })}
                data-testid={`rewind-reflection-${opt.id}`}
                className="w-full min-h-[44px] rounded-xl border border-border/70 bg-card px-4 py-2.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring active:scale-[0.99]"
              >
                {opt.label}
              </button>
            ))}
          </fieldset>
        </section>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onReturnToChosen && (
          <button
            type="button"
            onClick={onReturnToChosen}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{l.backToDecision}</span>
          </button>
        )}

        {onContinueToReflection && (
          <button
            type="button"
            onClick={onContinueToReflection}
            data-testid="rewind-continue-btn"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring ml-auto"
          >
            <span>{l.continueEpisode}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
