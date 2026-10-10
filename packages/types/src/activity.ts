import { z } from "zod";
import { GradeGroup, Locale, Paise, Slug } from "./common";

/**
 * Learn-by-doing activities (docs/curriculum.md › Learn by doing). Each engine
 * is coded once; every round and story is data, stored one file per locale at
 * `packages/content/activities/<id>/<locale>.json`. Practice episodes for the
 * life + market sim live in `./episode`.
 */

const ActivityBase = z.object({
  id: Slug,
  locale: Locale,
  title: z.string().min(1),
  /** Topics this activity practises; its results report to knowledge tracing for them. */
  topicIds: z.array(Slug).min(1),
  /** Grade groups it suits; omitted means all. */
  gradeGroups: z.array(GradeGroup).optional(),
});

export const SpotSortItem = z.object({
  id: Slug,
  text: z.string().min(1),
  imageUrl: z.string().min(1).optional(),
  correctCategoryId: Slug,
  /** Shown after every answer, right or wrong. */
  explanation: z.string().min(1),
  /** Concept this item gives evidence for. */
  conceptId: Slug.optional(),
});
export type SpotSortItem = z.infer<typeof SpotSortItem>;

/** Quick swipe round: need or want, scam or real, riskier or safer. */
export const SpotSortActivity = ActivityBase.extend({
  kind: z.literal("spot-sort"),
  prompt: z.string().min(1),
  categories: z
    .array(z.object({ id: Slug, label: z.string().min(1) }))
    .min(2)
    .max(4),
  items: z.array(SpotSortItem).min(1),
}).superRefine((a, ctx) => {
  const categories = new Set(a.categories.map((c) => c.id));
  if (categories.size !== a.categories.length) ctx.addIssue({ code: "custom", message: "duplicate category id" });
  const items = new Set<string>();
  for (const [i, item] of a.items.entries()) {
    if (items.has(item.id)) ctx.addIssue({ code: "custom", message: `duplicate item id ${item.id}` });
    items.add(item.id);
    if (!categories.has(item.correctCategoryId)) {
      ctx.addIssue({
        code: "custom",
        message: `unknown category ${item.correctCategoryId}`,
        path: ["items", i, "correctCategoryId"],
      });
    }
  }
});
export type SpotSortActivity = z.infer<typeof SpotSortActivity>;

/** How a story choice should be judged in feedback and knowledge tracing. */
export const ChoiceVerdict = z.enum(["safe", "risky", "harmful"]);
export type ChoiceVerdict = z.infer<typeof ChoiceVerdict>;

export const StoryChoice = z.object({
  id: Slug,
  text: z.string().min(1),
  nextNodeId: Slug,
  /** What happened because of this choice, shown straight after it. */
  consequence: z.string().min(1),
  verdict: ChoiceVerdict,
  /** Change to the story's play-money balance (negative = money lost). */
  cashDeltaPaise: Paise.default(0),
  conceptId: Slug.optional(),
});
export type StoryChoice = z.infer<typeof StoryChoice>;

/** A node with no choices is an ending; every ending offers "try again". */
export const StoryNode = z.object({
  id: Slug,
  speaker: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  text: z.string().min(1),
  choices: z.array(StoryChoice).default([]),
});
export type StoryNode = z.infer<typeof StoryNode>;

/** Branching story: every choice shows its consequence, then try again. */
export const StoryActivity = ActivityBase.extend({
  kind: z.literal("story"),
  startNodeId: Slug,
  nodes: z.array(StoryNode).min(2),
}).superRefine((a, ctx) => {
  const byId = new Map(a.nodes.map((n) => [n.id, n]));
  if (byId.size !== a.nodes.length) ctx.addIssue({ code: "custom", message: "duplicate node id" });
  if (!byId.has(a.startNodeId))
    ctx.addIssue({ code: "custom", message: "startNodeId not found", path: ["startNodeId"] });
  for (const node of a.nodes) {
    for (const choice of node.choices) {
      if (!byId.has(choice.nextNodeId)) {
        ctx.addIssue({
          code: "custom",
          message: `${node.id}/${choice.id} points to unknown node ${choice.nextNodeId}`,
        });
      }
    }
  }
  // Every node must be reachable from the start, and every path must be able to end.
  const reachable = new Set<string>();
  const stack = [a.startNodeId];
  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const choice of byId.get(id)?.choices ?? []) stack.push(choice.nextNodeId);
  }
  for (const node of a.nodes) {
    if (!reachable.has(node.id)) ctx.addIssue({ code: "custom", message: `node ${node.id} is unreachable` });
  }
  if (!a.nodes.some((n) => n.choices.length === 0)) ctx.addIssue({ code: "custom", message: "story has no ending" });
});
export type StoryActivity = z.infer<typeof StoryActivity>;

export const Activity = z.discriminatedUnion("kind", [SpotSortActivity, StoryActivity]);
export type Activity = z.infer<typeof Activity>;
