import * as React from "react";
import { cn } from "../lib/utils";
import { Character, type CharacterVariant, type CharacterPose, type CharacterExpression, type CharacterAccent } from "./character";
import { MoneyDecoder, MoneyDecoderCard, type MoneyTermData, type GradeGroup } from "./money-decoder";
import { StoryChoices, type StoryScenario, type StoryResult } from "./story-choices";
import { SpotAndSort, type SpotAndSortActivity, type SpotAndSortResult } from "./spot-and-sort";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Lightbulb,
  Compass,
  RotateCcw,
  Check,
} from "lucide-react";
import { type TopicLessonLabels, defaultTopicLessonLabels } from "../lib/labels";

export type { TopicLessonLabels };

export type LessonStepType =
  | "intro"
  | "experience"
  | "notice"
  | "decoder"
  | "explanation"
  | "worked-example"
  | "spot-and-sort"
  | "story-choice"
  | "reflection"
  | "transfer"
  | "recap";

export interface BaseLessonStep {
  id: string;
  type: LessonStepType;
  sectionLabel?: string;
  title: string;
  character?: {
    variant?: CharacterVariant;
    pose?: CharacterPose;
    expression?: CharacterExpression;
    accent?: CharacterAccent;
    label?: string;
  };
}

export interface IntroStep extends BaseLessonStep {
  type: "intro";
  hook: string;
  estimatedMinutes?: number;
  learningPointers: string[];
}

export interface ExperienceStep extends BaseLessonStep {
  type: "experience";
  scenario: string;
  contextNote?: string;
  dilemmaPrompt: string;
  terms?: MoneyTermData[];
}

export interface NoticeStep extends BaseLessonStep {
  type: "notice";
  observationText: string;
  guidingQuestion: string;
  keyTakeaway: string;
  terms?: MoneyTermData[];
}

export interface DecoderStep extends BaseLessonStep {
  type: "decoder";
  introduction: string;
  terms: MoneyTermData[];
}

export interface ExplanationStep extends BaseLessonStep {
  type: "explanation";
  coreConcept: string;
  breakdownPoints: string[];
  visualCallout?: {
    title: string;
    description: string;
  };
  terms?: MoneyTermData[];
}

export interface WorkedExampleStep extends BaseLessonStep {
  type: "worked-example";
  scenarioDescription: string;
  comparisonItems: Array<{
    title: string;
    details: string[];
    highlight?: string;
  }>;
  lessonLearned: string;
  terms?: MoneyTermData[];
}

export interface SpotAndSortStep extends BaseLessonStep {
  type: "spot-and-sort";
  activity: SpotAndSortActivity;
}

export interface StoryChoiceStep extends BaseLessonStep {
  type: "story-choice";
  scenario: StoryScenario;
}

export interface ReflectionStep extends BaseLessonStep {
  type: "reflection";
  prompt: string;
  options: string[];
  explanationAfterSelection?: string;
}

export interface TransferStep extends BaseLessonStep {
  type: "transfer";
  newContextDescription: string;
  transferQuestion: string;
  options: string[];
  takeaway: string;
  terms?: MoneyTermData[];
}

export interface RecapStep extends BaseLessonStep {
  type: "recap";
  summaryText: string;
  keyPrinciples: string[];
  nextRecommendationNote?: string;
}

export type LessonStep =
  | IntroStep
  | ExperienceStep
  | NoticeStep
  | DecoderStep
  | ExplanationStep
  | WorkedExampleStep
  | SpotAndSortStep
  | StoryChoiceStep
  | ReflectionStep
  | TransferStep
  | RecapStep;

export interface TopicLessonData {
  id: string;
  topicId: string;
  title: string;
  pillar: "plan-budget" | "save-manage" | "understand-investing" | "stay-safe";
  gradeGroup: GradeGroup;
  steps: LessonStep[];
}

export interface LessonResult {
  lessonId: string;
  topicId: string;
  gradeGroup: GradeGroup;
  completedSteps: string[];
  activityResults: Record<string, unknown>;
  decoderTermsOpened: string[];
  retryCounts: number;
  startedAt: string;
  completedAt: string;
}

export interface TopicLessonProps {
  lesson: TopicLessonData;
  labels?: Partial<TopicLessonLabels>;
  onStepComplete?: (stepIndex: number, stepId: string) => void;
  onInteraction?: (type: string, details: unknown) => void;
  onLessonComplete?: (result: LessonResult) => void;
  className?: string;
}

/**
 * TopicLesson: Unified orchestrator for multi-step adaptive financial lessons.
 * Coordinates EXPERIENCE -> DECODE -> UNDERSTAND -> DECIDE -> TRANSFER flows.
 */
export function TopicLesson({
  lesson,
  labels,
  onStepComplete,
  onInteraction,
  onLessonComplete,
  className,
}: TopicLessonProps) {
  const l: TopicLessonLabels = { ...defaultTopicLessonLabels, ...labels };
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [completedStepIds, setCompletedStepIds] = React.useState<string[]>([]);
  const [activityResults, setActivityResults] = React.useState<Record<string, unknown>>({});
  const [decoderTermsOpened, setDecoderTermsOpened] = React.useState<string[]>([]);
  const [selectedReflectionOption, setSelectedReflectionOption] = React.useState<string | null>(null);
  const [selectedTransferOption, setSelectedTransferOption] = React.useState<string | null>(null);
  const [isLessonFinished, setIsLessonFinished] = React.useState(false);
  const [startedAt] = React.useState(() => new Date().toISOString());

  const currentStep = lesson.steps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
        {l.stepNotFound}
      </div>
    );
  }

  const handleNextStep = () => {
    const stepId = currentStep.id;
    if (!completedStepIds.includes(stepId)) {
      setCompletedStepIds((prev) => [...prev, stepId]);
    }

    onStepComplete?.(currentStepIndex, stepId);

    if (currentStepIndex + 1 < lesson.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedReflectionOption(null);
      setSelectedTransferOption(null);
    } else {
      // Lesson complete
      setIsLessonFinished(true);
      const allCompleted = Array.from(new Set([...completedStepIds, stepId]));
      onLessonComplete?.({
        lessonId: lesson.id,
        topicId: lesson.topicId,
        gradeGroup: lesson.gradeGroup,
        completedSteps: allCompleted,
        activityResults,
        decoderTermsOpened,
        retryCounts: 0,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setSelectedReflectionOption(null);
      setSelectedTransferOption(null);
    }
  };

  const handleRestartLesson = () => {
    setCurrentStepIndex(0);
    setCompletedStepIds([]);
    setActivityResults({});
    setSelectedReflectionOption(null);
    setSelectedTransferOption(null);
    setIsLessonFinished(false);
  };

  // Helper to replace embedded term keywords in text with inline MoneyDecoder
  const renderTextWithTerms = (text: string, terms?: MoneyTermData[]) => {
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
          <span
            key={`term-${matchIndex}`}
            onClick={() => {
              if (!decoderTermsOpened.includes(matchedData.term)) {
                setDecoderTermsOpened((prev) => [...prev, matchedData.term]);
                onInteraction?.("term_opened", { term: matchedData.term });
              }
            }}
          >
            <MoneyDecoder termData={matchedData} triggerVariant="underline">
              {matchedWord}
            </MoneyDecoder>
          </span>
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

  // Lesson Finished Summary View
  if (isLessonFinished) {
    return (
      <div
        className={cn(
          "flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm",
          className
        )}
        data-testid="topic-lesson-finished"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-lime text-brand-ink">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.lessonCompleted}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {lesson.title}
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
            label={l.lessonCompleted}
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{l.pillarLabelPrefix}{l.pillars[lesson.pillar]}</span>
            <span>{l.targetPrefix}{lesson.gradeGroup}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground leading-relaxed">
            {l.completedSummary(lesson.steps.length)}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleRestartLesson}
            className="flex min-h-[44px] h-auto py-2.5 items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            <span>{l.replayLesson}</span>
          </button>
        </div>
      </div>
    );
  }

  // Section Label Fallback
  const currentSectionLabel =
    currentStep.sectionLabel ??
    (currentStep.type === "intro"
      ? (l.sectionLabels?.start ?? "Start")
      : currentStep.type === "experience"
      ? (l.sectionLabels?.experience ?? "Experience")
      : currentStep.type === "notice"
      ? (l.sectionLabels?.notice ?? "Notice")
      : currentStep.type === "decoder"
      ? (l.sectionLabels?.decode ?? "Decode")
      : currentStep.type === "explanation"
      ? (l.sectionLabels?.understand ?? "Understand")
      : currentStep.type === "worked-example"
      ? (l.sectionLabels?.workedExample ?? "Worked Example")
      : currentStep.type === "spot-and-sort"
      ? (l.sectionLabels?.practiceSort ?? "Practice Sort")
      : currentStep.type === "story-choice"
      ? (l.sectionLabels?.decide ?? "Decide")
      : currentStep.type === "reflection"
      ? (l.sectionLabels?.reflect ?? "Reflect")
      : currentStep.type === "transfer"
      ? (l.sectionLabels?.transfer ?? "Transfer")
      : (l.sectionLabels?.recap ?? "Recap"));

  return (
    <div
      className={cn(
        "flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6",
        className
      )}
      data-testid="topic-lesson-container"
    >
      {/* Lesson Header with Segmented Progress Track */}
      <div className="space-y-2 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-brand-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {l.pillars[lesson.pillar]}
          </span>
          <span
            className="text-xs font-semibold tabular-nums text-muted-foreground"
            data-testid="lesson-step-counter"
          >
            {l.stepOf(currentStepIndex + 1, lesson.steps.length)} · {currentSectionLabel}
          </span>
        </div>

        {/* Segmented Step Progress Bar */}
        <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted">
          {lesson.steps.map((_, idx) => (
            <div
              key={`prog-${idx}`}
              className={cn(
                "h-full flex-1 transition-colors duration-200",
                idx < currentStepIndex
                  ? "bg-foreground"
                  : idx === currentStepIndex
                  ? "bg-brand-lime"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {lesson.title}
          </h1>
          <p className="text-xs font-semibold text-muted-foreground">
            {currentStep.title}
          </p>
        </div>
      </div>

      {/* Main Step Content Renderers */}
      <div className="space-y-4" data-testid={`lesson-step-${currentStep.type}`}>
        {renderStepContent()}
      </div>

      {/* Navigation Controls Row (Hidden when child activities manage progression internally) */}
      {currentStep.type !== "story-choice" && currentStep.type !== "spot-and-sort" && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex min-h-[44px] h-auto py-2 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="lesson-prev-btn"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            <span>{l.previous}</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="flex min-h-[44px] h-auto py-2 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="lesson-continue-btn"
          >
            <span>
              {currentStepIndex + 1 < lesson.steps.length ? l.continueAction : l.finishLesson}
            </span>
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  function renderStepContent() {
    switch (currentStep.type) {
      case "intro":
        return renderIntro(currentStep);
      case "experience":
        return renderExperience(currentStep);
      case "notice":
        return renderNotice(currentStep);
      case "decoder":
        return renderDecoder(currentStep);
      case "explanation":
        return renderExplanation(currentStep);
      case "worked-example":
        return renderWorkedExample(currentStep);
      case "spot-and-sort":
        return renderSpotAndSort(currentStep);
      case "story-choice":
        return renderStoryChoice(currentStep);
      case "reflection":
        return renderReflection(currentStep);
      case "transfer":
        return renderTransfer(currentStep);
      case "recap":
        return renderRecap(currentStep);
    }
  }

  function renderIntro(step: IntroStep) {
    return (
      <div className="space-y-4">
        {step.character && (
          <div className="flex justify-center py-1">
            <Character
              variant={step.character.variant ?? "blob"}
              pose={step.character.pose ?? "neutral"}
              expression={step.character.expression ?? "friendly"}
              accent={step.character.accent ?? "lime"}
              size="md"
              label={step.character.label}
            />
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles aria-hidden="true" className="size-3.5 text-brand-ink" />
            <span>{l.theHook}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground leading-relaxed">
            {step.hook}
          </p>
        </div>

        {step.learningPointers.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.whatYoullExplore}
            </span>
            <ul className="space-y-1.5 text-xs sm:text-sm text-foreground">
              {step.learningPointers.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-lime text-[10px] font-bold text-brand-ink">
                    ✓
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.estimatedMinutes && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            <span>{l.estimatedTime(step.estimatedMinutes)}</span>
          </div>
        )}
      </div>
    );
  }

  function renderExperience(step: ExperienceStep) {
    return (
      <div className="space-y-4">
        {step.character && (
          <div className="flex justify-center py-1">
            <Character
              variant={step.character.variant ?? "blob"}
              pose={step.character.pose ?? "pondering"}
              expression={step.character.expression ?? "curious"}
              accent={step.character.accent ?? "lime"}
              size="md"
              label={step.character.label}
            />
          </div>
        )}

        {step.contextNote && (
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {step.contextNote}
          </span>
        )}

        <div className="rounded-xl border border-border bg-card p-4 leading-relaxed text-sm sm:text-base text-foreground shadow-sm">
          {renderTextWithTerms(step.scenario, step.terms)}
        </div>

        <div className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Compass aria-hidden="true" className="size-3.5" />
            <span>{l.theDilemma}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {renderTextWithTerms(step.dilemmaPrompt, step.terms)}
          </p>
        </div>
      </div>
    );
  }

  function renderNotice(step: NoticeStep) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Lightbulb aria-hidden="true" className="size-3.5 text-brand-coral" />
            <span>{l.noticePattern}</span>
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {renderTextWithTerms(step.observationText, step.terms)}
          </p>
        </div>

        <div className="rounded-xl border border-brand-lime/40 bg-brand-lime/10 p-4 text-foreground">
          <span className="block text-xs font-bold uppercase tracking-wider text-brand-ink">
            {l.guidingQuestion}
          </span>
          <p className="mt-1 text-sm sm:text-base font-semibold leading-snug">
            {step.guidingQuestion}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 text-xs sm:text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{l.keyTakeawayPrefix}</span>
          {renderTextWithTerms(step.keyTakeaway, step.terms)}
        </div>
      </div>
    );
  }

  function renderDecoder(step: DecoderStep) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">
          {step.introduction}
        </p>

        <div className="space-y-3">
          {step.terms.map((term) => (
            <MoneyDecoderCard key={term.term} termData={term} />
          ))}
        </div>
      </div>
    );
  }

  function renderExplanation(step: ExplanationStep) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
            {renderTextWithTerms(step.coreConcept, step.terms)}
          </p>
        </div>

        {step.breakdownPoints.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.keyRelationships}
            </span>
            <div className="grid gap-2">
              {step.breakdownPoints.map((pt, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/30 p-3 text-xs sm:text-sm">
                  {renderTextWithTerms(pt, step.terms)}
                </div>
              ))}
            </div>
          </div>
        )}

        {step.visualCallout && (
          <div className="rounded-xl border border-brand-lilac/50 bg-brand-lilac/15 p-3.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
              {step.visualCallout.title}
            </span>
            <p className="mt-1 text-xs sm:text-sm text-foreground leading-relaxed">
              {step.visualCallout.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderWorkedExample(step: WorkedExampleStep) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">
          {renderTextWithTerms(step.scenarioDescription, step.terms)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {step.comparisonItems.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl border p-3.5 text-xs sm:text-sm",
                item.highlight
                  ? "border-brand-lime bg-brand-lime/10"
                  : "border-border bg-card"
              )}
            >
              <h3 className="font-bold text-foreground">{item.title}</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {item.details.map((d, dIdx) => (
                  <li key={dIdx} className="leading-snug">• {d}</li>
                ))}
              </ul>
              {item.highlight && (
                <div className="mt-2 rounded bg-brand-lime/30 px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                  {item.highlight}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs sm:text-sm text-foreground">
          <span className="font-bold">{l.whatThisDemonstratesPrefix}</span>
          {renderTextWithTerms(step.lessonLearned, step.terms)}
        </div>
      </div>
    );
  }

  function renderSpotAndSort(step: SpotAndSortStep) {
    return (
      <div className="space-y-2">
        <SpotAndSort
          activity={step.activity}
          onComplete={(result: SpotAndSortResult) => {
            setActivityResults((prev) => ({ ...prev, [step.id]: result }));
            onInteraction?.("spot_and_sort_complete", result);
            handleNextStep();
          }}
        />
      </div>
    );
  }

  function renderStoryChoice(step: StoryChoiceStep) {
    return (
      <div className="space-y-2">
        <StoryChoices
          scenario={step.scenario}
          onComplete={(result: StoryResult) => {
            setActivityResults((prev) => ({ ...prev, [step.id]: result }));
            onInteraction?.("story_choice_complete", result);
            handleNextStep();
          }}
        />
      </div>
    );
  }

  function renderReflection(step: ReflectionStep) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {l.reflectOnTradeoff}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            {step.prompt}
          </h3>
        </div>

        <div className="grid gap-2">
          {step.options.map((opt) => {
            const isSelected = selectedReflectionOption === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedReflectionOption(opt);
                  onInteraction?.("reflection_selected", { stepId: step.id, option: opt });
                }}
                className={cn(
                  "flex min-h-[44px] h-auto w-full items-center justify-between rounded-xl border p-3 text-left text-xs sm:text-sm transition-all",
                  isSelected
                    ? "border-foreground bg-foreground text-background font-semibold"
                    : "border-border bg-card text-foreground hover:bg-muted/40"
                )}
                data-testid="lesson-reflection-option"
              >
                <span>{opt}</span>
                {isSelected && <Check aria-hidden="true" className="size-4" />}
              </button>
            );
          })}
        </div>

        {selectedReflectionOption && step.explanationAfterSelection && (
          <div className="rounded-xl border border-brand-lime/40 bg-brand-lime/10 p-3 text-xs sm:text-sm text-foreground">
            <span className="font-bold text-brand-ink">{l.perspectivePrefix}</span>
            {step.explanationAfterSelection}
          </div>
        )}
      </div>
    );
  }

  function renderTransfer(step: TransferStep) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {l.newContext}
          </span>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {renderTextWithTerms(step.newContextDescription, step.terms)}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {step.transferQuestion}
          </h3>
          <div className="grid gap-2">
            {step.options.map((opt) => {
              const isSelected = selectedTransferOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedTransferOption(opt);
                    onInteraction?.("transfer_selected", { stepId: step.id, option: opt });
                  }}
                  className={cn(
                    "flex min-h-[44px] h-auto w-full items-center justify-between rounded-xl border p-3 text-left text-xs sm:text-sm transition-all",
                    isSelected
                      ? "border-foreground bg-foreground text-background font-semibold"
                      : "border-border bg-card text-foreground hover:bg-muted/40"
                  )}
                  data-testid="lesson-transfer-option"
                >
                  <span>{opt}</span>
                  {isSelected && <Check aria-hidden="true" className="size-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTransferOption && (
          <div className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-3 text-xs sm:text-sm text-foreground">
            <span className="font-bold text-foreground">{l.transferPrinciplePrefix}</span>
            {renderTextWithTerms(step.takeaway, step.terms)}
          </div>
        )}
      </div>
    );
  }

  function renderRecap(step: RecapStep) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {step.summaryText}
          </p>
        </div>

        {step.keyPrinciples.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.summaryPrinciples}
            </span>
            <div className="space-y-1.5">
              {step.keyPrinciples.map((principle, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-lime text-[10px] font-bold text-brand-ink">
                    ✓
                  </span>
                  <span>{principle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step.nextRecommendationNote && (
          <div className="rounded-xl border border-brand-lilac/40 bg-brand-lilac/10 p-3 text-xs sm:text-sm text-foreground">
            <span className="font-bold">{l.nextRecommendedActivityPrefix}</span>
            {step.nextRecommendationNote}
          </div>
        )}
      </div>
    );
  }
}
