import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SpotSortActivity, StoryActivity } from "@gullak/types";
import { describe, expect, it } from "vitest";
import { normalizeSpotSortActivity, normalizeStoryActivity } from "./activity-adapter";

const needsOrWantsJson = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../packages/content/activities/needs-or-wants/en.json", import.meta.url)),
    "utf8",
  ),
);

const doublingSchemeJson = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../packages/content/activities/the-doubling-scheme/en.json", import.meta.url)),
    "utf8",
  ),
);

describe("activity-adapter", () => {
  describe("normalizeSpotSortActivity", () => {
    it("maps content activity JSON to UI component contract", () => {
      const raw = SpotSortActivity.parse(needsOrWantsJson);
      const normalized = normalizeSpotSortActivity(raw);

      expect(normalized.id).toBe("needs-or-wants");
      expect(normalized.title).toBe("Need or want?");
      expect(normalized.instruction).toBe("Sort each thing: is it a need or a want?");
      expect(normalized.allowRetry).toBe(true);
      expect(normalized.categories).toHaveLength(2);
      expect(normalized.categories[0]).toMatchObject({ id: "need", label: "Need", accent: "lime" });
      expect(normalized.categories[1]).toMatchObject({ id: "want", label: "Want", accent: "lilac" });

      expect(normalized.items).toHaveLength(raw.items.length);
      const firstItem = normalized.items[0];
      expect(firstItem?.id).toBe("rice-and-dal");
      expect(firstItem?.prompt).toBe("Rice and dal for the week");
      expect(firstItem?.expectedCategoryId).toBe("need");
      expect(firstItem?.explanation).toMatchObject({
        whyItFits: "Food you need to stay healthy is a need.",
      });
      expect(firstItem?.explanation.whatToNotice).toBeDefined();
      expect(firstItem?.explanation.clueForNextTime).toBeDefined();
    });
  });

  describe("normalizeStoryActivity", () => {
    it("maps story activity JSON to UI component contract with node map and consequence cards", () => {
      const raw = StoryActivity.parse(doublingSchemeJson);
      const normalized = normalizeStoryActivity(raw);

      expect(normalized.id).toBe("the-doubling-scheme");
      expect(normalized.title).toBe(raw.title);
      expect(normalized.initialNodeId).toBe("the-offer");
      expect(Object.keys(normalized.nodes).length).toBe(raw.nodes.length);

      const startNode = normalized.nodes["the-offer"];
      expect(startNode).toBeDefined();
      expect(startNode?.id).toBe("the-offer");
      expect(startNode?.dialogue.text).toContain("Put in ₹500 today");
      expect(startNode?.choices).toHaveLength(3);

      const firstChoice = startNode?.choices[0];
      expect(firstChoice?.id).toBe("send-500");
      expect(firstChoice?.consequence.title).toBe("Costly Surprise");
      expect(firstChoice?.consequence.description).toBe("You sent ₹500 to an app you'd never heard of.");
      expect(firstChoice?.consequence.financialPrinciple).toBeDefined();
      expect(firstChoice?.consequence.whatToCheckNext).toBeDefined();
      expect(firstChoice?.nextNodeId).toBe("money-gone");
    });
  });
});
