import type { SpotSortActivity, StoryActivity } from "@gullak/types";
import type {
  SpotAndSortActivity,
  SpotAndSortCategory,
  SpotAndSortExplanation,
  SpotAndSortItem,
} from "@gullak/ui/components/spot-and-sort";
import type { StoryChoiceOption, StoryNode, StoryScenario } from "@gullak/ui/components/story-choices";

const categoryAccentMap: Record<string, "lime" | "lilac" | "coral" | "yellow" | "ink" | "muted"> = {
  need: "lime",
  essential: "lime",
  safe: "lime",
  want: "lilac",
  discretionary: "lilac",
  luxury: "lilac",
  risky: "coral",
  scam: "coral",
  harmful: "coral",
  caution: "yellow",
};

/**
 * Maps content-layer SpotSortActivity (which uses prompt, text, correctCategoryId)
 * to the renderer-ready SpotAndSortActivity expected by @gullak/ui.
 */
export function normalizeSpotSortActivity(raw: SpotSortActivity): SpotAndSortActivity {
  const categories: SpotAndSortCategory[] = raw.categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    accent: categoryAccentMap[cat.id] ?? "lime",
  }));

  const items: SpotAndSortItem[] = raw.items.map((item) => {
    const explanation: SpotAndSortExplanation =
      typeof item.explanation === "string"
        ? {
            whyItFits: item.explanation,
            whatToNotice:
              item.correctCategoryId === "need"
                ? "Notice whether this expense directly sustains daily health, safety, or education."
                : "Notice whether this expense is a comfort or discretionary upgrade that can wait.",
            clueForNextTime: "Ask: 'What happens tomorrow if this purchase is postponed?'",
          }
        : item.explanation;

    return {
      id: item.id,
      prompt: item.text,
      expectedCategoryId: item.correctCategoryId,
      explanation,
      outcomeTags: item.conceptId ? [item.conceptId, item.correctCategoryId] : [item.correctCategoryId],
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    instruction: raw.prompt,
    topicIds: raw.topicIds,
    categories,
    items,
    allowRetry: true,
  };
}

/**
 * Maps content-layer StoryActivity (which uses startNodeId, nodes array with consequence strings)
 * to the renderer-ready StoryScenario expected by @gullak/ui.
 */
export function normalizeStoryActivity(raw: StoryActivity): StoryScenario {
  const nodes: Record<string, StoryNode> = {};

  for (const node of raw.nodes) {
    const speaker: "protagonist" | "friend" | "narrator" =
      node.speaker === "protagonist" || node.speaker === "friend" ? node.speaker : "narrator";

    const choices: StoryChoiceOption[] = node.choices.map((choice) => {
      const isSafe = choice.verdict === "safe";
      const isRisky = choice.verdict === "risky";

      return {
        id: choice.id,
        text: choice.text,
        consequence: {
          title: isSafe ? "Thoughtful Decision" : isRisky ? "Risky Trade-off" : "Costly Surprise",
          description: choice.consequence,
          financialPrinciple: isSafe
            ? "Prioritizing essential needs and verifying before paying protects your money."
            : "Impulsive spending or unverified promises reduce your available funds for true needs.",
          whatToCheckNext: "Check if essential expenses are covered before spending discretionary funds.",
          protagonistPose: isSafe ? "celebrating" : "cautious",
          protagonistExpression: isSafe ? "friendly" : "concerned",
        },
        nextNodeId: choice.nextNodeId,
        outcomeTags: choice.conceptId ? [choice.conceptId, choice.verdict] : [choice.verdict],
      };
    });

    nodes[node.id] = {
      id: node.id,
      dialogue: {
        speaker,
        text: node.text,
      },
      choices,
    };
  }

  return {
    id: raw.id,
    title: raw.title,
    topicIds: raw.topicIds,
    initialNodeId: raw.startNodeId,
    nodes,
    summaryTakeaway: "Review your choices carefully and evaluate the consequences before spending.",
  };
}
