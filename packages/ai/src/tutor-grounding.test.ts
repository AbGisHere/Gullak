import { TopicContent } from "@gullak/types";
import { describe, expect, it } from "vitest";
import * as grounding from "./tutor-grounding";

// Synthetic engineering content, never editorially approved learner content.
const syntheticContent = TopicContent.parse({
  topicId: "synthetic-topic",
  locale: "en",
  title: "Synthetic",
  summary: "Synthetic fixture",
  variants: [
    { id: "older", format: "transcript", audience: ["grade-11-12"], markdown: "Older-only debt vocabulary." },
    { id: "read", format: "transcript", markdown: "Pocket money comes in." },
    {
      id: "story",
      format: "story",
      audience: ["grade-8-10"],
      panels: [{ id: "panel-one", imageUrl: "/do-not-fetch.png", text: "Pocket money can go out." }],
    },
    { id: "listen", format: "audio", url: "https://example.invalid/do-not-fetch", ttsText: "Pocket money is virtual." },
    { id: "unsafe", format: "transcript", markdown: "You should buy this fund now." },
    {
      id: "visual",
      format: "visual",
      charts: [{ id: "chart", kind: "line", title: "Secret chart", dataRef: "secret" }],
    },
    {
      id: "check",
      format: "quiz",
      questions: [
        {
          id: "question",
          conceptId: "synthetic",
          prompt: "Secret question",
          options: [
            { id: "a", text: "Secret answer" },
            { id: "b", text: "Other" },
          ],
          correctOptionId: "a",
          explanation: "Secret key",
        },
      ],
    },
  ],
});

describe("synthetic tutor source filtering", () => {
  it("filters grade audiences and unsafe output while extracting teaching text only", () => {
    expect(grounding).toHaveProperty("collectTutorText", expect.any(Function));
    expect(grounding.collectTutorText(syntheticContent, "grade-8-10")).toEqual([
      { variantId: "read", field: "markdown", text: "Pocket money comes in." },
      { variantId: "story", field: "panels[0].text", text: "Pocket money can go out." },
      { variantId: "listen", field: "ttsText", text: "Pocket money is virtual." },
    ]);
  });

  it("leaves the caller's parsed content unchanged", () => {
    const before = structuredClone(syntheticContent);
    grounding.collectTutorText(syntheticContent, "grade-6-7");
    expect(syntheticContent).toEqual(before);
  });
});
