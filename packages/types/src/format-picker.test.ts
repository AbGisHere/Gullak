import { describe, expect, it } from "vitest";
import { FormatPickerRequest, FormatSelection } from "./index";

describe("format picker contracts", () => {
  it("defaults skipped preferences and the stateless rotation index", () => {
    expect(FormatPickerRequest.parse({ gradeGroup: "grade-6-7", variants: [] })).toEqual({
      gradeGroup: "grade-6-7",
      variants: [],
      preferredFormats: [],
      selectionIndex: 0,
    });
  });
  it("rejects ambiguous duplicate variant identifiers", () => {
    const variant = { id: "read", format: "transcript", markdown: "Lesson" };
    expect(FormatPickerRequest.safeParse({ gradeGroup: "grade-6-7", variants: [variant, variant] }).success).toBe(
      false,
    );
  });
  it("accepts a selected lesson and an unavailable result", () => {
    expect(
      FormatSelection.safeParse({
        status: "selected",
        variantId: "read",
        format: "transcript",
        reason: "fallback-format",
      }).success,
    ).toBe(true);
    expect(FormatSelection.safeParse({ status: "unavailable", reason: "no-eligible-variant" }).success).toBe(true);
  });
  it("rejects assessments as recommended lessons", () => {
    expect(
      FormatSelection.safeParse({ status: "selected", variantId: "check", format: "quiz", reason: "preferred-format" })
        .success,
    ).toBe(false);
  });
  it("rejects selection metadata carrying lesson content or answers", () => {
    expect(
      FormatSelection.safeParse({
        status: "selected",
        variantId: "read",
        format: "transcript",
        reason: "fallback-format",
        correctOptionId: "a",
      }).success,
    ).toBe(false);
  });
});
