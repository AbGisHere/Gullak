import { describe, expect, it } from "vitest";
import { getCandyEconomyLesson1 } from "./candy-economy-lesson";

describe("Candy Economy Lesson 1", () => {
  it("delivers the approved 9-step pedagogical sequence for World 1", () => {
    const lesson = getCandyEconomyLesson1("grade-6-7");

    expect(lesson.id).toBe("candy-economy-lesson-1");
    expect(lesson.topicId).toBe("money-basics");
    expect(lesson.pillar).toBe("plan-budget");
    expect(lesson.gradeGroup).toBe("grade-6-7");
    expect(lesson.steps).toHaveLength(9);

    const stepTypes = lesson.steps.map((s) => s.type);
    expect(stepTypes).toEqual([
      "intro",
      "experience",
      "story-choice",
      "notice",
      "explanation",
      "spot-and-sort",
      "transfer",
      "reflection",
      "recap",
    ]);
  });

  it("includes valid branching nodes in the story-choice step", () => {
    const lesson = getCandyEconomyLesson1("grade-6-7");
    const storyStep = lesson.steps.find((s) => s.type === "story-choice");
    expect(storyStep).toBeDefined();

    if (storyStep && storyStep.type === "story-choice") {
      const { scenario } = storyStep;
      expect(scenario.initialNodeId).toBe("node-marbles-trade");
      expect(scenario.nodes["node-marbles-trade"]).toBeDefined();
      expect(scenario.nodes["node-coins-success"]).toBeDefined();

      const initialChoices = scenario.nodes["node-marbles-trade"]?.choices;
      expect(initialChoices).toHaveLength(2);
      expect(initialChoices?.[0]?.consequence.financialPrinciple).toBeDefined();
    }
  });

  it("includes valid normalized categories and items in the spot-and-sort step", () => {
    const lesson = getCandyEconomyLesson1("grade-6-7");
    const sortStep = lesson.steps.find((s) => s.type === "spot-and-sort");
    expect(sortStep).toBeDefined();

    if (sortStep && sortStep.type === "spot-and-sort") {
      const { activity } = sortStep;
      expect(activity.categories).toHaveLength(2);
      expect(activity.items.length).toBeGreaterThanOrEqual(3);
      expect(activity.items[0]?.explanation.whyItFits).toBeDefined();
      expect(activity.items[0]?.expectedCategoryId).toBe("need");
    }
  });
});
