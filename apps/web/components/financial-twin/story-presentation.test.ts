import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JourneyFrame } from "./journey-frame";
import { StoryScene } from "./story-scene";

describe("Financial Twin story presentation", () => {
  it("renders caller-supplied dialogue and names without adding character descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(StoryScene, {
        title: "A knock at the door",
        setting: "A fictional household in Hyderabad",
        speaker: "Amma",
        dialogue: "Let us look at our choices together.",
        character: { variant: "arch", expression: "concerned", pose: "cautious" },
      }),
    );
    expect(html).toContain("A knock at the door");
    expect(html).toContain("<figcaption");
    expect(html).toContain("Amma");
    expect(html).toContain("Let us look at our choices together.");
    expect(html).not.toContain("grid-cols-3");
  });

  it("accepts localized copy and seven parent-controlled stages", () => {
    for (let index = 0; index < 7; index++) {
      const html = renderToStaticMarkup(
        createElement(
          JourneyFrame,
          {
            stageId: `scene-${index}`,
            stageIndex: index,
            stageCount: 7,
            stageLabel: "కథ",
            progressLabel: `${index + 1} / 7`,
            playMoneyLabel: "ఆట డబ్బు",
            backLabel: "వెనుకకు",
            nextLabel: "కొనసాగించు",
            onBack: index > 0 ? () => {} : undefined,
            onNext: index < 6 ? () => {} : undefined,
          },
          "కలిసి ఆలోచిద్దాం",
        ),
      );
      expect(html).toContain(`value="${index + 1}" max="7"`);
      expect(html).toContain("ఆట డబ్బు");
      expect(html.includes("వెనుకకు")).toBe(index > 0);
      expect(html.includes("కొనసాగించు")).toBe(index < 6);
      expect(html).not.toContain("<nav");
    }
  });

  it("explains why progression is disabled instead of silently locking the learner", () => {
    const html = renderToStaticMarkup(
      createElement(
        JourneyFrame,
        {
          stageId: "decision",
          stageIndex: 4,
          stageCount: 7,
          stageLabel: "Decision",
          progressLabel: "5 of 7",
          playMoneyLabel: "Play money",
          backLabel: "Back",
          nextLabel: "Continue",
          nextDisabledReason: "Choose an option first.",
          onNext: () => {},
        },
        "Options supplied by the existing simulation",
      ),
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-describedby="financial-twin-next-reason"');
    expect(html).toContain("Choose an option first.");
  });
});
