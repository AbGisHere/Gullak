import type { MlFixtureInput, QuizAnswerEvent } from "@gullak/types";

/** Test-only labelled data; never imported by app routes, components or the engine barrel. */
export function mlFixture(): MlFixtureInput {
  const learnerId = "11111111-1111-4111-8111-111111111111";
  const transition = { pLearn: 0.2, pForget: 0.05, pSlip: 0.1, pGuess: 0.2 };
  const questions = [
    { questionId: "income", conceptId: "money-in", position: 0 },
    { questionId: "gift", conceptId: "money-in", position: 1 },
  ];
  const event = (index: number): QuizAnswerEvent => ({
    event_id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    learner_id: learnerId,
    topic_id: "money-basics",
    concept_id: "money-in",
    question_id: questions[index]!.questionId,
    correct: index === 0,
    answered_at: "2026-10-11T00:00:00Z",
    attempt_no: 1,
    content_version: "a".repeat(64),
  });
  return {
    schemaVersion: 1,
    mode: "synthetic-fixture",
    learnerId,
    gradeGroup: "grade-8-10",
    experience: "some",
    modelVersion: "fixture-v1",
    topics: [
      {
        topicId: "money-basics",
        pillar: "plan-and-budget",
        gradeGroups: ["grade-8-10"],
        requiresTopicIds: [],
        passMark: 0.6,
        unlocksInstruments: [],
        unlocksActivityIds: [],
        conceptIds: ["money-in", "money-out"],
      },
      {
        topicId: "saving",
        pillar: "save-and-manage",
        gradeGroups: ["grade-8-10"],
        requiresTopicIds: ["money-basics"],
        passMark: 0.6,
        unlocksInstruments: [],
        unlocksActivityIds: [],
        conceptIds: ["save"],
      },
    ],
    progress: { "money-basics": 1 },
    parameters: {
      "money-basics": { "money-in": { ...transition }, "money-out": { ...transition } },
      saving: { save: { ...transition } },
    },
    registry: [{ topicId: "money-basics", contentVersion: "a".repeat(64), questions }],
    events: [event(0), event(1)],
  };
}
