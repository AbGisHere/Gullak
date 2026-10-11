import { describe, expect, it } from "vitest";
import { goalDraftIssue, localIsoDate, MAX_GOAL_INR, restoreQuizDraft } from "./form-safety";

const today = "2026-10-11";

describe("goalDraftIssue", () => {
  it("accepts an untouched (skipped) goal and a complete future goal", () => {
    expect(goalDraftIssue({ label: "", amountInr: "", date: "" }, today)).toBeNull();
    expect(goalDraftIssue({ label: "Bike", amountInr: "5000", date: "2027-01-01" }, today)).toBeNull();
    expect(goalDraftIssue({ label: "Book", amountInr: "200", date: today }, today)).toBeNull();
  });

  it("flags a half-filled goal", () => {
    expect(goalDraftIssue({ label: "Bike", amountInr: "", date: "" }, today)).toBe("incomplete");
    expect(goalDraftIssue({ label: "   ", amountInr: "100", date: "2027-01-01" }, today)).toBe("incomplete");
    expect(goalDraftIssue({ label: "Bike", amountInr: "12a", date: "2027-01-01" }, today)).toBe("incomplete");
  });

  it("flags a zero or oversized amount", () => {
    expect(goalDraftIssue({ label: "Bike", amountInr: "000", date: "2027-01-01" }, today)).toBe("amountZero");
    expect(goalDraftIssue({ label: "Bike", amountInr: String(MAX_GOAL_INR + 1), date: "2027-01-01" }, today)).toBe(
      "amountTooLarge",
    );
    expect(goalDraftIssue({ label: "Bike", amountInr: String(MAX_GOAL_INR), date: "2027-01-01" }, today)).toBeNull();
  });

  it("flags a malformed or past date", () => {
    expect(goalDraftIssue({ label: "Bike", amountInr: "100", date: "11/10/2026" }, today)).toBe("dateInvalid");
    expect(goalDraftIssue({ label: "Bike", amountInr: "100", date: "2026-10-10" }, today)).toBe("dateInPast");
  });
});

describe("localIsoDate", () => {
  it("formats a local date with zero padding", () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("restoreQuizDraft", () => {
  const questions = [
    { id: "q1", options: [{ id: "a" }, { id: "b" }] },
    { id: "q2", options: [{ id: "c" }] },
  ];

  it("keeps answers that match current questions and options", () => {
    expect(restoreQuizDraft(JSON.stringify({ q1: "b", q2: "c" }), questions)).toEqual({ q1: "b", q2: "c" });
  });

  it("drops stale questions, unknown options and non-string values", () => {
    expect(restoreQuizDraft(JSON.stringify({ q1: "z", q2: 3, q9: "a" }), questions)).toEqual({});
  });

  it("returns an empty draft for missing or malformed input", () => {
    expect(restoreQuizDraft(null, questions)).toEqual({});
    expect(restoreQuizDraft("{not json", questions)).toEqual({});
    expect(restoreQuizDraft("[1,2]", questions)).toEqual({});
    expect(restoreQuizDraft("null", questions)).toEqual({});
  });
});
