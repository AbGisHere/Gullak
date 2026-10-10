import * as React from "react";
import { cn } from "../lib/utils";
import { formatInr } from "../lib/format";
import { PlayMoneyBadge } from "./play-money-badge";
import { Character, type CharacterVariant, type CharacterPose, type CharacterExpression, type CharacterAccent } from "./character";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";
import {
  PortfolioSummary,
  LiquidityBreakdown,
  HoldingsList,
  type PortfolioViewModel,
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Info,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { FinancialRewind } from "./financial-rewind";
import { type PracticeSimulationLabels, defaultPracticeSimulationLabels } from "../lib/labels";

export type { PracticeSimulationLabels };

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

export type SimulationPhase =
  | "briefing"
  | "active"
  | "decision"
  | "resolving"
  | "consequence"
  | "reflection"
  | "complete";

export interface CharacterState {
  variant?: CharacterVariant;
  pose?: CharacterPose;
  expression?: CharacterExpression;
  accent?: CharacterAccent;
  label?: string;
  dialogue?: string;
}

export interface MarketContextData {
  label: string;
  description: string;
  changeLabel?: string;
}

export interface SimulationDecisionOption {
  id: string;
  label: string;
  description: string;
  financialDetail?: string;
  consequencePreview?: string;
  requiredTermIds?: string[];
  disabled?: boolean;
  disabledReason?: string;
}

export interface ComparisonMetric {
  id: string;
  label: string;
  chosenValue: string;
  alternativeValue: string;
  note?: string;
}

export interface AlternativeOutcome {
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

export interface ResolvedOutcome {
  decisionId: string;
  stateDelta: string;
  narrativeConsequence: string;
  financialConsequenceSummary: string;
  learningExplanation: string;
  tradeoff: string;
  whatWasUnknown?: string;
  alternativeOutcomes?: AlternativeOutcome[];
  nextEventId?: string;
  characterReaction?: CharacterState;
}

export interface SimulationEvent {
  id: string;
  title: string;
  description: string;
  urgencyLabel?: string;
  amountPaise?: number;
  character?: CharacterState;
  supportingCharacter?: CharacterState;
}

export interface ReflectionOption {
  id: string;
  label: string;
}

export interface ReflectionData {
  prompt: string;
  options: ReflectionOption[];
}

export interface EpisodeMetadata {
  episodeId: string;
  title: string;
  subtitle?: string;
  dateLabel: string;
  learningGoals: string[];
  gradeGroup?: "grade-6-7" | "grade-8-10" | "grade-11-12";
}

export interface SimulationState {
  phase: SimulationPhase;
  currentDateLabel: string;
  portfolio: PortfolioViewModel;
  currentEvent?: SimulationEvent;
  availableDecisions?: SimulationDecisionOption[];
  resolvedOutcome?: ResolvedOutcome;
  reflection?: ReflectionData;
  protagonist: CharacterState;
  marketContext?: MarketContextData;
  terms?: Record<string, MoneyTermData>;
}

export interface DecisionPayload {
  episodeId: string;
  eventId: string;
  decisionId: string;
}

export interface ReflectionPayload {
  episodeId: string;
  eventId: string;
  reflectionId: string;
}

export interface EpisodeCompletePayload {
  episodeId: string;
  decisions: string[];
  reflections: string[];
  completedAt: string;
}

export interface PracticeSimulationProps {
  episode: EpisodeMetadata;
  state: SimulationState;
  labels?: Partial<PracticeSimulationLabels>;
  onDecision?: (payload: DecisionPayload) => void;
  onReflection?: (payload: ReflectionPayload) => void;
  onEpisodeComplete?: (payload: EpisodeCompletePayload) => void;
  onRewindOpen?: (payload: { episodeId: string; decisionId: string }) => void;
  onAlternativeView?: (payload: { episodeId: string; alternativeId: string }) => void;
  onComparisonComplete?: (payload: { episodeId: string; viewedAlternatives: string[] }) => void;
  onTermOpen?: (term: string) => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                            Phase Sub-Renderers                             */
/* -------------------------------------------------------------------------- */

/**
 * Briefing Phase: Introduces the episode scenario, goals, and starting portfolio.
 */
function BriefingPhase({
  episode,
  state,
  labels: l,
  onContinue,
}: {
  episode: EpisodeMetadata;
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onContinue: () => void;
}) {
  return (
    <div data-testid="sim-phase-briefing" className="space-y-4">
      {/* Episode Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-lime" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.practiceEpisode}
            </span>
            <PlayMoneyBadge label={l.playMoney} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{episode.dateLabel}</span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <Character
            variant={state.protagonist.variant ?? "blob"}
            pose={state.protagonist.pose ?? "explaining"}
            expression={state.protagonist.expression ?? "friendly"}
            accent={state.protagonist.accent ?? "lime"}
            size="md"
            label={state.protagonist.label ?? l.protagonistLabel}
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground leading-snug">
              {episode.title}
            </h2>
            {episode.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{episode.subtitle}</p>
            )}
            {state.protagonist.dialogue && (
              <div className="mt-3 rounded-xl bg-muted/50 border border-border/50 px-3 py-2.5">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{state.protagonist.dialogue}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Learning goals */}
        {episode.learningGoals.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.whatYouWillExplore}
            </span>
            <ul className="mt-2 space-y-1.5">
              {episode.learningGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <Target className="h-3.5 w-3.5 mt-0.5 text-brand-coral shrink-0" aria-hidden="true" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Starting portfolio snapshot */}
      <PortfolioSummary portfolio={state.portfolio} />

      {/* Continue */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          data-testid="sim-briefing-continue"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <span>{l.beginScenario}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Active / Event Phase: Shows current portfolio and an arriving life event.
 */
function ActiveEventPhase({
  state,
  labels: l,
  onTermOpen,
  onAcknowledgeEvent,
}: {
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onTermOpen?: (term: string) => void;
  onAcknowledgeEvent: () => void;
}) {
  const event = state.currentEvent;

  return (
    <div data-testid="sim-phase-active" className="space-y-4">
      {/* Date & context header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Calendar className="h-4 w-4 text-brand-lime" aria-hidden="true" />
          <span data-testid="sim-current-date">{state.currentDateLabel}</span>
        </div>
        {state.marketContext && (
          <div className="text-xs text-muted-foreground" data-testid="sim-market-context">
            {state.marketContext.label}
            {state.marketContext.changeLabel && (
              <span className="ml-1.5 font-mono font-semibold">{state.marketContext.changeLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Current portfolio state */}
      <PortfolioSummary portfolio={state.portfolio} onTermOpen={onTermOpen} />

      {/* Life event card */}
      {event && (
        <section
          data-testid="sim-life-event"
          aria-labelledby="sim-event-title"
          className="rounded-2xl border-2 border-brand-coral/50 bg-brand-coral/5 p-4 sm:p-5 shadow-xs"
        >
          <div className="flex items-start gap-3">
            {event.supportingCharacter && (
              <Character
                variant={event.supportingCharacter.variant ?? "arch"}
                pose={event.supportingCharacter.pose ?? "cautious"}
                expression={event.supportingCharacter.expression ?? "concerned"}
                accent={event.supportingCharacter.accent ?? "coral"}
                size="sm"
                label={event.supportingCharacter.label ?? l.supportingCharacterLabel}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-coral shrink-0" aria-hidden="true" />
                <h3 id="sim-event-title" className="text-base font-bold text-foreground">
                  {event.title}
                </h3>
              </div>
              {event.urgencyLabel && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-coral/15 border border-brand-coral/30 px-2 py-0.5 text-[10px] font-bold text-foreground">
                  <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                  {event.urgencyLabel}
                </span>
              )}
              <p className="mt-2 text-sm text-foreground leading-relaxed">
                {event.description}
              </p>
              {event.amountPaise !== undefined && (
                <div className="mt-2.5 rounded-lg bg-card border border-border/60 px-3 py-2 inline-flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">{l.amountNeeded}</span>
                  <span className="text-base font-extrabold font-mono text-foreground">
                    {formatInr(event.amountPaise)}
                  </span>
                </div>
              )}
              {event.supportingCharacter?.dialogue && (
                <div className="mt-3 rounded-xl bg-card/80 border border-border/40 px-3 py-2">
                  <p className="text-sm text-foreground italic">
                    "{event.supportingCharacter.dialogue}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onAcknowledgeEvent}
              data-testid="sim-event-acknowledge"
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <span>{l.whatAreMyOptions}</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Decision Phase: Renders large tactile decision cards.
 */
function DecisionPhase({
  episode,
  state,
  labels: l,
  onDecision,
  onTermOpen,
}: {
  episode: EpisodeMetadata;
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onDecision: (decisionId: string) => void;
  onTermOpen?: (term: string) => void;
}) {
  const decisions = state.availableDecisions ?? [];
  const event = state.currentEvent;

  return (
    <div data-testid="sim-phase-decision" className="space-y-4">
      {/* Compact event reminder */}
      {event && (
        <div className="flex items-center gap-2.5 rounded-xl bg-brand-coral/5 border border-brand-coral/30 px-3.5 py-2.5">
          <AlertTriangle className="h-4 w-4 text-brand-coral shrink-0" aria-hidden="true" />
          <div className="flex-1 text-sm">
            <span className="font-bold text-foreground">{event.title}</span>
            {event.amountPaise !== undefined && (
              <span className="ml-2 font-mono font-semibold text-foreground">
                {formatInr(event.amountPaise)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Protagonist prompt */}
      <div className="flex items-start gap-2.5">
        <Character
          variant={state.protagonist.variant ?? "blob"}
          pose="pondering"
          expression="thinking"
          accent={state.protagonist.accent ?? "lime"}
          size="sm"
          label={state.protagonist.label ?? l.protagonistLabel}
        />
        <div className="rounded-xl bg-muted/50 border border-border/50 px-3 py-2.5 flex-1">
          <p className="text-sm text-foreground">
            {state.protagonist.dialogue ?? l.defaultProtagonistPrompt}
          </p>
        </div>
      </div>

      {/* Decision cards */}
      <div className="space-y-3" role="group" aria-label={l.whatAreMyOptions}>
        {decisions.map((decision) => {
          // Inline term decoders for required terms
          const termDecoders = (decision.requiredTermIds ?? [])
            .map((tid) => state.terms?.[tid])
            .filter(Boolean) as MoneyTermData[];

          return (
            <button
              key={decision.id}
              type="button"
              disabled={decision.disabled}
              onClick={() => onDecision(decision.id)}
              data-testid={`sim-decision-${decision.id}`}
              className={cn(
                "w-full min-h-[44px] rounded-2xl border-2 p-4 text-left transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-ring",
                decision.disabled
                  ? "border-border/40 bg-muted/30 opacity-60 cursor-not-allowed"
                  : "border-border/70 bg-card hover:border-foreground/40 hover:shadow-sm active:scale-[0.99] cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground">{decision.label}</h4>
                {!decision.disabled && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {decision.description}
              </p>
              {decision.financialDetail && (
                <div className="mt-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs font-mono text-foreground">
                  {decision.financialDetail}
                </div>
              )}
              {decision.consequencePreview && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {decision.consequencePreview}
                </p>
              )}
              {decision.disabled && decision.disabledReason && (
                <p className="mt-1.5 text-[11px] text-muted-foreground italic">
                  {decision.disabledReason}
                </p>
              )}
              {termDecoders.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {termDecoders.map((td) => (
                    <MoneyDecoder
                      key={td.term}
                      termData={td}
                      gradeGroup={episode.gradeGroup ?? "grade-8-10"}
                      onTermOpen={() => onTermOpen?.(td.term)}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Resolving Phase: Loading/thinking state while engine processes.
 */
function ResolvingPhase({
  state,
  labels: l,
}: {
  state: SimulationState;
  labels: PracticeSimulationLabels;
}) {
  return (
    <div data-testid="sim-phase-resolving" className="flex flex-col items-center justify-center gap-4 py-12">
      <Character
        variant={state.protagonist.variant ?? "blob"}
        pose="pondering"
        expression="thinking"
        accent={state.protagonist.accent ?? "lime"}
        size="lg"
        label={l.protagonistLabel}
      />
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{l.processingDecision}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {l.calculatingOutcome}
        </p>
      </div>
    </div>
  );
}

/**
 * Consequence Phase: Shows outcome of a decision without correctness labels.
 */
function ConsequencePhase({
  state,
  labels: l,
  onContinue,
  onOpenRewind,
  onTermOpen,
}: {
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onContinue: () => void;
  onOpenRewind?: () => void;
  onTermOpen?: (term: string) => void;
}) {
  const outcome = state.resolvedOutcome;
  if (!outcome) return null;

  const charReaction = outcome.characterReaction ?? state.protagonist;

  return (
    <div data-testid="sim-phase-consequence" className="space-y-4">
      {/* Protagonist reaction */}
      <div className="flex items-start gap-2.5">
        <Character
          variant={charReaction.variant ?? "blob"}
          pose={charReaction.pose ?? "explaining"}
          expression={charReaction.expression ?? "thinking"}
          accent={charReaction.accent ?? "lime"}
          size="sm"
          label={charReaction.label ?? l.protagonistLabel}
        />
        {charReaction.dialogue && (
          <div className="rounded-xl bg-muted/50 border border-border/50 px-3 py-2.5 flex-1">
            <p className="text-sm text-foreground italic">"{charReaction.dialogue}"</p>
          </div>
        )}
      </div>

      {/* Consequence sections */}
      <section
        className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground space-y-4"
        aria-labelledby="consequence-title"
      >
        {/* What Changed */}
        <div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-lime" aria-hidden="true" />
            <h3 id="consequence-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {l.whatChanged}
            </h3>
          </div>
          <p className="mt-1.5 text-sm text-foreground leading-relaxed" data-testid="sim-consequence-narrative">
            {outcome.narrativeConsequence}
          </p>
          <div className="mt-2 rounded-lg bg-muted/40 border border-border/50 px-3 py-2 text-xs font-mono text-foreground" data-testid="sim-consequence-delta">
            {outcome.stateDelta}
          </div>
        </div>

        {/* Why It Matters */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {l.whyItMatters}
            </h4>
          </div>
          <p className="mt-1.5 text-sm text-foreground leading-relaxed" data-testid="sim-consequence-explanation">
            {outcome.learningExplanation}
          </p>
        </div>

        {/* Trade-off */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-brand-lilac" aria-hidden="true" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {l.whatTradeoff}
            </h4>
          </div>
          <p className="mt-1.5 text-sm text-foreground leading-relaxed" data-testid="sim-consequence-tradeoff">
            {outcome.tradeoff}
          </p>
        </div>

        {/* What Was Unknown */}
        {outcome.whatWasUnknown && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {l.whatWasUnknown}
              </h4>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed" data-testid="sim-consequence-unknown">
              {outcome.whatWasUnknown}
            </p>
          </div>
        )}

        {/* Rewind / Explore Alternatives Trigger */}
        {outcome.alternativeOutcomes && outcome.alternativeOutcomes.length > 0 && (
          <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-brand-lilac" aria-hidden="true" />
                <span>{l.exploreAlternatives}</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {l.exploreAlternativesSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRewind}
              data-testid="sim-consequence-rewind"
              className="min-h-[44px] shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac/70 bg-brand-lilac/10 px-3.5 py-2 text-xs font-bold text-foreground hover:bg-brand-lilac/20 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-brand-lilac" aria-hidden="true" />
              <span>{l.rewindAndCompare}</span>
            </button>
          </div>
        )}
      </section>

      {/* Updated portfolio */}
      <PortfolioSummary portfolio={state.portfolio} onTermOpen={onTermOpen} />

      {/* Continue */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          data-testid="sim-consequence-continue"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <span>{l.continueAction}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Reflection Phase: Data-driven reflective prompt with selectable options.
 */
function ReflectionPhase({
  episode,
  state,
  labels: l,
  onReflection,
}: {
  episode: EpisodeMetadata;
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onReflection: (reflectionId: string) => void;
}) {
  const reflection = state.reflection;
  if (!reflection) return null;

  return (
    <div data-testid="sim-phase-reflection" className="space-y-4">
      <div className="flex items-start gap-2.5">
        <Character
          variant={state.protagonist.variant ?? "blob"}
          pose="pondering"
          expression="thinking"
          accent={state.protagonist.accent ?? "lime"}
          size="sm"
          label={l.protagonistLabel}
        />
        <div className="rounded-xl bg-muted/50 border border-border/50 px-3 py-2.5 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {reflection.prompt}
          </p>
        </div>
      </div>

      <div className="space-y-2.5" role="group" aria-label={l.yourReflection}>
        {reflection.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onReflection(opt.id)}
            data-testid={`sim-reflection-${opt.id}`}
            className="w-full min-h-[44px] rounded-xl border border-border/70 bg-card px-4 py-3 text-left text-sm text-foreground hover:border-foreground/30 hover:bg-muted/40 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-ring active:scale-[0.99]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Phase: Episode conclusion summary.
 */
function CompletePhase({
  episode,
  state,
  labels: l,
  onComplete,
}: {
  episode: EpisodeMetadata;
  state: SimulationState;
  labels: PracticeSimulationLabels;
  onComplete: () => void;
}) {
  return (
    <div data-testid="sim-phase-complete" className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground text-center">
        <Character
          variant={state.protagonist.variant ?? "blob"}
          pose="celebrating"
          expression="excited"
          accent={state.protagonist.accent ?? "lime"}
          size="lg"
          label={l.episodeComplete}
        />
        <h3 className="mt-4 text-lg font-bold text-foreground">{l.episodeComplete}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {l.episodeCompleteSubtitle}
        </p>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {l.episodeCompleteNote}
        </p>

        <div className="mt-4 pt-3 border-t border-border/50">
          <PlayMoneyBadge label={l.playMoney} />
        </div>
      </div>

      <PortfolioSummary portfolio={state.portfolio} />

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onComplete}
          data-testid="sim-complete-finish"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{l.finishEpisode}</span>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Main PracticeSimulation Component                    */
/* -------------------------------------------------------------------------- */

/**
 * PracticeSimulation: Orchestrator UI for historical practice episodes.
 *
 * This component is strictly presentation-focused. It renders simulation states
 * supplied by the parent/engine and emits structured decision/reflection callbacks.
 * It NEVER calculates financial outcomes, portfolio changes, mastery, or prices.
 */
export function PracticeSimulation({
  episode,
  state,
  labels,
  onDecision,
  onReflection,
  onEpisodeComplete,
  onRewindOpen,
  onAlternativeView,
  onComparisonComplete,
  onTermOpen,
  className,
}: PracticeSimulationProps) {
  const l: PracticeSimulationLabels = { ...defaultPracticeSimulationLabels, ...labels };
  const [decisions, setDecisions] = React.useState<string[]>([]);
  const [reflections, setReflections] = React.useState<string[]>([]);
  const [isRewinding, setIsRewinding] = React.useState<boolean>(false);

  const handleDecision = (decisionId: string) => {
    setDecisions((prev) => [...prev, decisionId]);
    onDecision?.({
      episodeId: episode.episodeId,
      eventId: state.currentEvent?.id ?? "",
      decisionId,
    });
  };

  const handleReflection = (reflectionId: string) => {
    setReflections((prev) => [...prev, reflectionId]);
    onReflection?.({
      episodeId: episode.episodeId,
      eventId: state.currentEvent?.id ?? "",
      reflectionId,
    });
  };

  const handleComplete = () => {
    onEpisodeComplete?.({
      episodeId: episode.episodeId,
      decisions,
      reflections,
      completedAt: new Date().toISOString(),
    });
  };

  // Briefing continue is a no-op for the UI — the parent controls phase transitions
  const handleBriefingContinue = () => {
    // Emit a decision-like signal so the parent knows to transition
    onDecision?.({
      episodeId: episode.episodeId,
      eventId: "__briefing",
      decisionId: "__continue",
    });
  };

  const handleEventAcknowledge = () => {
    onDecision?.({
      episodeId: episode.episodeId,
      eventId: state.currentEvent?.id ?? "",
      decisionId: "__acknowledge",
    });
  };

  const handleConsequenceContinue = () => {
    setIsRewinding(false);
    onDecision?.({
      episodeId: episode.episodeId,
      eventId: state.currentEvent?.id ?? "",
      decisionId: "__consequence_continue",
    });
  };

  const handleOpenRewind = () => {
    setIsRewinding(true);
    onRewindOpen?.({
      episodeId: episode.episodeId,
      decisionId: state.resolvedOutcome?.decisionId ?? "",
    });
  };

  return (
    <div
      data-testid="practice-simulation-container"
      className={cn("w-full space-y-4 text-foreground", className)}
    >
      {/* Phase Router */}
      {state.phase === "briefing" && (
        <BriefingPhase
          episode={episode}
          state={state}
          labels={l}
          onContinue={handleBriefingContinue}
        />
      )}

      {state.phase === "active" && (
        <ActiveEventPhase
          state={state}
          labels={l}
          onTermOpen={onTermOpen}
          onAcknowledgeEvent={handleEventAcknowledge}
        />
      )}

      {state.phase === "decision" && (
        <DecisionPhase
          episode={episode}
          state={state}
          labels={l}
          onDecision={handleDecision}
          onTermOpen={onTermOpen}
        />
      )}

      {state.phase === "resolving" && (
        <ResolvingPhase state={state} labels={l} />
      )}

      {state.phase === "consequence" && (
        isRewinding && state.resolvedOutcome?.alternativeOutcomes ? (
          <FinancialRewind
            episodeId={episode.episodeId}
            chosenPath={{
              decisionId: state.resolvedOutcome.decisionId,
              decisionLabel:
                state.availableDecisions?.find((d) => d.id === state.resolvedOutcome?.decisionId)?.label ??
                state.resolvedOutcome.decisionId,
              narrativeConsequence: state.resolvedOutcome.narrativeConsequence,
              stateDelta: state.resolvedOutcome.stateDelta,
              tradeoff: state.resolvedOutcome.tradeoff,
              whatWasUnknown: state.resolvedOutcome.whatWasUnknown,
              portfolioAfter: state.portfolio,
              characterReaction: state.resolvedOutcome.characterReaction,
            }}
            alternatives={state.resolvedOutcome.alternativeOutcomes}
            gradeGroup={episode.gradeGroup}
            onAlternativeView={onAlternativeView}
            onComparisonComplete={onComparisonComplete}
            onReturnToChosen={() => setIsRewinding(false)}
            onContinueToReflection={handleConsequenceContinue}
            onTermOpen={onTermOpen}
          />
        ) : (
          <ConsequencePhase
            state={state}
            labels={l}
            onContinue={handleConsequenceContinue}
            onOpenRewind={handleOpenRewind}
            onTermOpen={onTermOpen}
          />
        )
      )}

      {state.phase === "reflection" && (
        <ReflectionPhase
          episode={episode}
          state={state}
          labels={l}
          onReflection={handleReflection}
        />
      )}

      {state.phase === "complete" && (
        <CompletePhase
          episode={episode}
          state={state}
          labels={l}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
