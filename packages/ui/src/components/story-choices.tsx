import { ArrowRight, CheckCircle2, Compass, MessageSquare, RotateCcw, Search, Sparkles } from "lucide-react";
import * as React from "react";
import { defaultStoryChoicesLabels, type StoryChoicesLabels } from "../lib/labels";
import { cn } from "../lib/utils";
import {
  Character,
  type CharacterAccent,
  type CharacterExpression,
  type CharacterPose,
  type CharacterVariant,
} from "./character";
import { MoneyDecoder, type MoneyTermData } from "./money-decoder";

export type { StoryChoicesLabels };

export interface StoryChoiceOption {
  id: string;
  text: string;
  consequence: {
    title: string;
    description: string;
    financialPrinciple: string;
    whatToCheckNext?: string;
    protagonistPose?: CharacterPose;
    protagonistExpression?: CharacterExpression;
    friendPose?: CharacterPose;
    friendExpression?: CharacterExpression;
  };
  reflection?: {
    prompt: string;
    options: string[];
  };
  outcomeTags?: string[];
  nextNodeId?: string | null;
}

export interface StoryCharacterState {
  name?: string;
  variant?: CharacterVariant;
  pose?: CharacterPose;
  expression?: CharacterExpression;
  accent?: CharacterAccent;
}

export interface StoryNode {
  id: string;
  dialogue: {
    speaker: "protagonist" | "friend" | "narrator";
    text: string;
    terms?: MoneyTermData[];
  };
  contextNote?: string;
  protagonistState?: StoryCharacterState;
  friendState?: StoryCharacterState;
  choices: StoryChoiceOption[];
}

export interface StoryScenario {
  id: string;
  title: string;
  topicIds: string[];
  initialNodeId: string;
  nodes: Record<string, StoryNode>;
  summaryTakeaway?: string;
}

export interface StoryResult {
  storyId: string;
  nodePath: string[];
  selectedChoices: Array<{
    nodeId: string;
    choiceId: string;
    choiceText: string;
    reflectionAnswer?: string;
  }>;
  topicIds: string[];
  outcomeTags: string[];
  retryCount: number;
  completedAt: string;
}

export interface StoryChoicesProps {
  scenario: StoryScenario;
  labels?: Partial<StoryChoicesLabels>;
  onComplete?: (result: StoryResult) => void;
  onChoiceSelect?: (nodeId: string, choiceId: string) => void;
  className?: string;
}

/**
 * StoryChoices: Pure UI renderer for branching financial decisions and consequences.
 * Content-agnostic, mobile-first, and evidence-emitting without assigning scores or mastery.
 */
export function StoryChoices({ scenario, labels, onComplete, onChoiceSelect, className }: StoryChoicesProps) {
  const l: StoryChoicesLabels = { ...defaultStoryChoicesLabels, ...labels };
  const [currentNodeId, setCurrentNodeId] = React.useState(scenario.initialNodeId);
  const [selectedChoiceId, setSelectedChoiceId] = React.useState<string | null>(null);
  const [selectedReflection, setSelectedReflection] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<StoryResult["selectedChoices"]>([]);
  const [nodePath, setNodePath] = React.useState<string[]>([scenario.initialNodeId]);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  const currentNode = scenario.nodes[currentNodeId];

  if (!currentNode) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
        Error: Story node "{currentNodeId}" not found in scenario.
      </div>
    );
  }

  const selectedChoice = currentNode.choices.find((c) => c.id === selectedChoiceId);

  // Dynamic character states reacting to narrative progression
  const protagonistProps = {
    variant: currentNode.protagonistState?.variant ?? "blob",
    pose: selectedChoice?.consequence.protagonistPose ?? currentNode.protagonistState?.pose ?? "neutral",
    expression:
      selectedChoice?.consequence.protagonistExpression ?? currentNode.protagonistState?.expression ?? "friendly",
    accent: currentNode.protagonistState?.accent ?? "lime",
  };

  const friendProps = currentNode.friendState
    ? {
        name: currentNode.friendState.name ?? "Friend",
        variant: currentNode.friendState.variant ?? "pillar",
        pose: selectedChoice?.consequence.friendPose ?? currentNode.friendState.pose ?? "neutral",
        expression: selectedChoice?.consequence.friendExpression ?? currentNode.friendState.expression ?? "curious",
        accent: currentNode.friendState.accent ?? "lilac",
      }
    : null;

  const handleSelectChoice = (choice: StoryChoiceOption) => {
    setSelectedChoiceId(choice.id);
    setSelectedReflection(null);
    onChoiceSelect?.(currentNode.id, choice.id);
  };

  const handleContinue = () => {
    if (!selectedChoice) return;

    const newHistoryEntry = {
      nodeId: currentNode.id,
      choiceId: selectedChoice.id,
      choiceText: selectedChoice.text,
      reflectionAnswer: selectedReflection ?? undefined,
    };
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);

    if (selectedChoice.nextNodeId && scenario.nodes[selectedChoice.nextNodeId]) {
      const nextId = selectedChoice.nextNodeId;
      setCurrentNodeId(nextId);
      setNodePath((prev) => [...prev, nextId]);
      setSelectedChoiceId(null);
      setSelectedReflection(null);
    } else {
      setIsFinished(true);
      const allTags = Array.from(
        new Set(
          updatedHistory.flatMap((h) => {
            const node = scenario.nodes[h.nodeId];
            const ch = node?.choices.find((c) => c.id === h.choiceId);
            return ch?.outcomeTags ?? [];
          }),
        ),
      );

      onComplete?.({
        storyId: scenario.id,
        nodePath,
        selectedChoices: updatedHistory,
        topicIds: scenario.topicIds,
        outcomeTags: allTags,
        retryCount,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setSelectedChoiceId(null);
    setSelectedReflection(null);
  };

  const handleRestartEntireStory = () => {
    setRetryCount((prev) => prev + 1);
    setCurrentNodeId(scenario.initialNodeId);
    setNodePath([scenario.initialNodeId]);
    setSelectedChoiceId(null);
    setSelectedReflection(null);
    setHistory([]);
    setIsFinished(false);
  };

  const renderDialogueWithTerms = (text: string, terms?: MoneyTermData[]) => {
    if (!terms || terms.length === 0) {
      return text;
    }

    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    const regexPattern = new RegExp(`\\b(${sortedTerms.map((t) => t.term).join("|")})\\b`, "gi");

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    for (const match of text.matchAll(regexPattern)) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const matchedWord = match[0];
      const matchedData = sortedTerms.find((t) => t.term.toLowerCase() === matchedWord.toLowerCase());

      if (matchedData) {
        parts.push(
          <MoneyDecoder key={`term-${matchIndex}`} termData={matchedData} triggerVariant="underline">
            {matchedWord}
          </MoneyDecoder>,
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

  if (isFinished) {
    return (
      <div
        className={cn(
          "flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm",
          className,
        )}
        data-testid="story-choices-finished"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-lime text-brand-ink">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {l.scenarioCompleted}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{scenario.title}</h2>
          </div>
        </div>

        <div className="flex items-center justify-center py-2">
          <Character
            variant="blob"
            pose="celebrating"
            expression="excited"
            accent="lime"
            size="lg"
            label={l.scenarioCompleted}
          />
        </div>

        {scenario.summaryTakeaway && (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {l.summaryObservation}
            </span>
            <p className="mt-1 text-sm font-medium text-foreground leading-relaxed">{scenario.summaryTakeaway}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleRestartEntireStory}
            className="flex min-h-[44px] h-auto items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            <span>{l.replayStory}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6",
        className,
      )}
      data-testid="story-choices-container"
    >
      {/* Story Header & Context */}
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-brand-lilac/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
            <MessageSquare aria-hidden="true" className="size-3" />
            {l.storyChoiceBadge}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {l.stepPrefix} {nodePath.length}
          </span>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{scenario.title}</h2>
        {currentNode.contextNote && <p className="text-xs text-muted-foreground italic">{currentNode.contextNote}</p>}
      </div>

      {/* Characters Stage: Protagonist + Optional Friend */}
      <div className="flex items-end justify-between px-2 pt-1 pb-2">
        <div className="flex flex-col items-center gap-1">
          <Character
            variant={protagonistProps.variant}
            pose={protagonistProps.pose}
            expression={protagonistProps.expression}
            accent={protagonistProps.accent}
            size="md"
            label={l.speakerYou}
          />
          <span className="text-[11px] font-semibold text-muted-foreground">{l.speakerYou}</span>
        </div>

        {friendProps && (
          <div className="flex flex-col items-center gap-1">
            <Character
              variant={friendProps.variant}
              pose={friendProps.pose}
              expression={friendProps.expression}
              accent={friendProps.accent}
              size="md"
              label={friendProps.name}
            />
            <span className="text-[11px] font-semibold text-muted-foreground">{friendProps.name}</span>
          </div>
        )}
      </div>

      {/* Narrative Dialogue Speech Card */}
      <div
        className="relative rounded-2xl border border-border bg-muted/40 p-4 text-foreground sm:p-5"
        data-testid="story-dialogue-card"
      >
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {currentNode.dialogue.speaker === "protagonist"
            ? l.speakerYou
            : currentNode.dialogue.speaker === "friend"
              ? (friendProps?.name ?? "Friend")
              : l.speakerScene}
        </div>
        <div className="text-sm font-normal leading-relaxed sm:text-base">
          {renderDialogueWithTerms(currentNode.dialogue.text, currentNode.dialogue.terms)}
        </div>

        {currentNode.dialogue.terms && currentNode.dialogue.terms.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {l.keyTerms}
            </span>
            {currentNode.dialogue.terms.map((term) => (
              <MoneyDecoder key={term.term} termData={term} triggerVariant="badge" />
            ))}
          </div>
        )}
      </div>

      {/* Decision Choices or Consequence State */}
      {!selectedChoice ? (
        /* State 1: Active Decision Choices */
        <div className="space-y-3" data-testid="story-choices-list">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.whatWillYouDo}</div>
          <div className="grid gap-2.5">
            {currentNode.choices.map((choice, index) => {
              const letter = String.fromCharCode(65 + index);
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelectChoice(choice)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all",
                    "hover:border-foreground/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "min-h-[52px] active:scale-[0.99]",
                  )}
                  data-testid={`story-choice-${choice.id}`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground group-hover:bg-brand-lime group-hover:text-brand-ink">
                    {letter}
                  </span>
                  <span className="text-sm font-medium text-foreground leading-snug">{choice.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* State 2: Neutral Consequence & Educational Reflection */
        <div
          className="space-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
          data-testid="story-consequence-card"
        >
          {/* Section: What this choice changed */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Compass aria-hidden="true" className="size-3.5 text-brand-coral" />
              <span>{l.whatChanged}</span>
            </div>

            <h3 className="text-base font-bold text-foreground sm:text-lg leading-snug">
              {selectedChoice.consequence.title}
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{selectedChoice.consequence.description}</p>
          </div>

          {/* Section: Why this matters */}
          <div className="rounded-lg border border-brand-yellow/50 bg-brand-yellow/15 p-3 text-xs sm:text-sm text-foreground">
            <div className="mb-0.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
              <Sparkles aria-hidden="true" className="size-3.5 text-brand-ink" />
              <span>{l.whyThisMatters}</span>
            </div>
            <p className="leading-relaxed">{selectedChoice.consequence.financialPrinciple}</p>
          </div>

          {/* Section: What to check next (if specified) */}
          {selectedChoice.consequence.whatToCheckNext && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs sm:text-sm text-foreground">
              <div className="mb-0.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                <Search aria-hidden="true" className="size-3.5 text-brand-ink" />
                <span>{l.whatToCheckNext}</span>
              </div>
              <p className="leading-relaxed text-muted-foreground">{selectedChoice.consequence.whatToCheckNext}</p>
            </div>
          )}

          {/* Lightweight Reflection */}
          {selectedChoice.reflection && (
            <div className="space-y-2 border-t border-border pt-3">
              <span className="block text-xs font-semibold text-muted-foreground">
                {selectedChoice.reflection.prompt}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedChoice.reflection.options.map((opt) => {
                  const isSelected = selectedReflection === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedReflection(opt)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all min-h-[44px]",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-muted/50 text-foreground hover:bg-muted",
                      )}
                      data-testid="story-reflection-option"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row: Retry or Continue */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={handleRetry}
              className="flex min-h-[44px] h-auto items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="story-retry-btn"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              <span>{l.tryAnotherPath}</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex min-h-[44px] h-auto items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="story-continue-btn"
            >
              <span>{selectedChoice.nextNodeId ? l.nextScene : l.finishScenario}</span>
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
