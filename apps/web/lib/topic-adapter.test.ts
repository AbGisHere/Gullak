import { loadTopic } from "@gullak/content/server";
import { describe, expect, it } from "vitest";
import { topicToLesson } from "./topic-adapter";

describe("topicToLesson", () => {
  it("maps authored content into the existing lesson component contract", async () => {
    const topic = await loadTopic(
      fileURLToPath(new URL("../../../packages/content/topics", import.meta.url)),
      "money-basics",
      "en",
    );
    const lesson = topicToLesson(topic, "grade-8-10");
    expect(lesson).toMatchObject({ topicId: "money-basics", gradeGroup: "grade-8-10" });
    expect(lesson.steps[0]?.type).toBe("intro");
    expect(lesson.steps).toHaveLength(3);
  });
});

import { fileURLToPath } from "node:url";
