import type { GradeGroup, Topic } from "@gullak/types";
import type { TopicLessonData } from "@gullak/ui/components/topic-lesson";

const pillarMap = {
  "plan-and-budget": "plan-budget",
  "save-and-manage": "save-manage",
  "understand-investing": "understand-investing",
  "stay-safe": "stay-safe",
} as const;

export function topicToLesson(topic: Topic, gradeGroup: GradeGroup): TopicLessonData {
  const lessonText = topic.content.variants.find((variant) => variant.format !== "quiz");
  const body = lessonText?.format === "transcript" ? lessonText.markdown.replaceAll("**", "") : topic.content.summary;
  return {
    id: `${topic.meta.id}-lesson`,
    topicId: topic.meta.id,
    title: topic.content.title,
    pillar: pillarMap[topic.meta.pillar],
    gradeGroup,
    steps: [
      {
        id: "start",
        type: "intro",
        title: topic.content.title,
        hook: topic.content.summary,
        estimatedMinutes: 3,
        learningPointers: topic.meta.concepts.map(({ label }) => label),
      },
      {
        id: "learn",
        type: "explanation",
        title: topic.content.title,
        coreConcept: body,
        breakdownPoints: topic.meta.concepts.map(({ label }) => label),
      },
      {
        id: "recap",
        type: "recap",
        title: topic.content.title,
        summaryText: topic.content.summary,
        keyPrinciples: topic.meta.concepts.map(({ label }) => label),
      },
    ],
  };
}
