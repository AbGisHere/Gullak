import { MlFixtureInput, MlFixtureResult, type QuizAnswerEvent, RecommendationRequest } from "@gullak/types";
import { bktStep } from "./bkt";
import { initialMastery } from "./mastery-prior";
import { recommendNext } from "./recommend-next";

/** Full, stateless synthetic replay; deliberately not a production evidence importer. */
export function replayQuizFixture(input: unknown): MlFixtureResult {
  const fixture = MlFixtureInput.parse(input);
  const prior = initialMastery(fixture.experience);
  const byId = new Map(fixture.topics.map((topic) => [topic.topicId, topic]));
  const mastery: Record<string, Record<string, number>> = Object.fromEntries(
    fixture.topics.map((topic) => [topic.topicId, Object.fromEntries(topic.conceptIds.map((id) => [id, prior]))]),
  );
  const evidenceCounts: Record<string, Record<string, number>> = Object.fromEntries(
    fixture.topics.map((topic) => [topic.topicId, Object.fromEntries(topic.conceptIds.map((id) => [id, 0]))]),
  );
  // Checks graph identity, cycles, prerequisite grades and trusted progress independently of evidence.
  const request = RecommendationRequest.parse({
    gradeGroup: fixture.gradeGroup,
    topics: fixture.topics,
    progress: fixture.progress,
    mastery,
  });
  if (Object.keys(fixture.parameters).some((id) => !byId.has(id))) throw new Error("unknown parameter topic");
  for (const topic of fixture.topics) {
    if (!Object.hasOwn(fixture.parameters, topic.topicId)) throw new Error("missing topic parameters");
    const params = fixture.parameters[topic.topicId]!;
    if (topic.conceptIds.some((id) => !Object.hasOwn(params, id))) throw new Error("missing concept parameters");
    if (Object.keys(params).some((id) => !topic.conceptIds.includes(id))) throw new Error("unknown parameter concept");
  }

  const registry = new Map<string, Map<string, { conceptId: string; position: number }>>();
  for (const definition of fixture.registry) {
    const key = `${definition.topicId}:${definition.contentVersion}`;
    const topic = byId.get(definition.topicId);
    if (!topic) throw new Error("unknown registry topic");
    if (registry.has(key)) throw new Error("duplicate registry definition");
    const questions = new Map<string, { conceptId: string; position: number }>();
    const positions = new Set<number>();
    for (const question of definition.questions) {
      if (!topic.conceptIds.includes(question.conceptId)) throw new Error("unknown registry concept");
      if (questions.has(question.questionId) || positions.has(question.position))
        throw new Error("ambiguous registry question order");
      questions.set(question.questionId, question);
      positions.add(question.position);
    }
    registry.set(key, questions);
  }

  const eventIds = new Set<string>();
  const submissions = new Map<
    string,
    {
      topicId: string;
      attempt: number;
      version: string;
      time: number;
      events: QuizAnswerEvent[];
      questions: Set<string>;
    }
  >();
  for (const event of fixture.events) {
    if (event.learner_id.toLowerCase() !== fixture.learnerId.toLowerCase()) throw new Error("fixture learner mismatch");
    const eventId = event.event_id.toLowerCase();
    if (eventIds.has(eventId)) throw new Error("duplicate event id");
    eventIds.add(eventId);
    const topic = byId.get(event.topic_id);
    if (!topic?.gradeGroups.includes(fixture.gradeGroup)) throw new Error("ineligible evidence topic");
    const question = registry.get(`${event.topic_id}:${event.content_version}`)?.get(event.question_id);
    if (!question || question.conceptId !== event.concept_id) throw new Error("unknown or mismatched pinned question");
    const key = `${event.topic_id}:${event.attempt_no}`;
    const time = Date.parse(event.answered_at);
    const submission = submissions.get(key) ?? {
      topicId: event.topic_id,
      attempt: event.attempt_no,
      version: event.content_version,
      time,
      events: [],
      questions: new Set<string>(),
    };
    if (submission.version !== event.content_version || submission.time !== time)
      throw new Error("inconsistent submission version or timestamp");
    if (submission.questions.has(event.question_id)) throw new Error("duplicate submission question");
    submission.questions.add(event.question_id);
    submission.events.push(event);
    submissions.set(key, submission);
  }

  // Topic-scoped state means timestamps/attempt numbers across topics need no arbitrary global order.
  const ordered = fixture.topics.flatMap((topic) => {
    const attempts = [...submissions.values()]
      .filter((submission) => submission.topicId === topic.topicId)
      .sort((a, b) => a.attempt - b.attempt);
    for (let index = 1; index < attempts.length; index++) {
      if (attempts[index]!.time < attempts[index - 1]!.time)
        throw new Error("submission chronology conflicts with attempt order");
    }
    return attempts.flatMap((submission) => {
      const positions = registry.get(`${topic.topicId}:${submission.version}`)!;
      return submission.events.sort(
        (a, b) => positions.get(a.question_id)!.position - positions.get(b.question_id)!.position,
      );
    });
  });
  // All identity/version/order validation happens before inference. Invalid observations return no partial result.
  for (const event of ordered) {
    const values = request.mastery[event.topic_id]!;
    values[event.concept_id] = bktStep({
      parameters: { ...fixture.parameters[event.topic_id]![event.concept_id]!, pInit: prior },
      pKnown: values[event.concept_id]!,
      correct: event.correct,
    }).pKnown;
    evidenceCounts[event.topic_id]![event.concept_id]! += 1;
  }
  return MlFixtureResult.parse({
    schemaVersion: 1,
    mode: "synthetic-fixture",
    activation: "disabled",
    modelVersion: fixture.modelVersion,
    gradeGroup: fixture.gradeGroup,
    mastery: request.mastery,
    evidenceCounts,
    next: recommendNext(request),
  });
}
