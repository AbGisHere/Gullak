import { describe, expect, it } from "vitest";
import { QuizAnswerEvent } from "./index";

const event = {
  event_id: "8f14e45f-ceea-467f-a0e6-1c2f1a3b4d5e",
  learner_id: "edc3179b-cdf3-4b76-8a95-17e89e5d4c0f",
  topic_id: "money-basics",
  concept_id: "money-in",
  question_id: "gift-question",
  correct: true,
  answered_at: "2026-10-11T10:00:00+05:30",
  attempt_no: 1,
  content_version: "0123456789abcdef".repeat(4),
};

describe("QuizAnswerEvent", () => {
  it("preserves the nine-field versioned quiz-answer record without mutation", () => {
    const before = structuredClone(event);
    expect(QuizAnswerEvent.parse(event)).toEqual(event);
    expect(event).toEqual(before);
  });

  it("accepts incorrect evidence rather than treating it as missing", () => {
    expect(QuizAnswerEvent.parse({ ...event, correct: false }).correct).toBe(false);
  });

  it.each(["2026-10-11T04:30:00Z", "2026-10-11T10:00:00.123+05:30", "2026-10-10T23:30:00-05:00"])(
    "preserves the timestamp and explicit timezone: %s",
    (answered_at) => {
      expect(QuizAnswerEvent.parse({ ...event, answered_at }).answered_at).toBe(answered_at);
    },
  );

  it.each(Object.keys(event))("requires the %s field", (field) => {
    const incomplete: Record<string, unknown> = { ...event };
    delete incomplete[field];
    expect(QuizAnswerEvent.safeParse(incomplete).success).toBe(false);
  });

  it.each([
    { event_id: "not-a-uuid" },
    { learner_id: "learner-1" },
    { topic_id: "Money Basics" },
    { concept_id: "money_in" },
    { question_id: "" },
    { correct: "true" },
    { correct: 1 },
    { correct: "safe" },
    { answered_at: "2026-10-11" },
    { answered_at: "2026-10-11T10:00:00" },
    { answered_at: "2026-02-30T10:00:00Z" },
    { answered_at: 1791691200000 },
    { attempt_no: 0 },
    { attempt_no: -1 },
    { attempt_no: 1.5 },
    { attempt_no: "1" },
    { attempt_no: Number.MAX_SAFE_INTEGER + 1 },
    { attempt_no: NaN },
    { content_version: "ABCDEF01".repeat(8) },
    { content_version: "g".repeat(64) },
    { content_version: "a".repeat(63) },
    { content_version: "a".repeat(65) },
    { content_version: `sha256:${"a".repeat(64)}` },
    { content_version: ` ${"a".repeat(64)}` },
  ])("rejects malformed fields without coercion: %j", (patch) => {
    expect(QuizAnswerEvent.safeParse({ ...event, ...patch }).success).toBe(false);
  });

  it.each([
    { question_index: 0 },
    { isSynthetic: true },
    { verdict: "safe" },
    { learner_email: "test@example.invalid" },
  ])("rejects extra columns: %j", (extra) => {
    expect(QuizAnswerEvent.safeParse({ ...event, ...extra }).success).toBe(false);
  });

  it.each([{ value: null }, { value: [] }, { value: "event" }])("rejects a non-record input: $value", ({ value }) => {
    expect(QuizAnswerEvent.safeParse(value).success).toBe(false);
  });
});
